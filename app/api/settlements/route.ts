import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Settlement from "@/models/Settlement";
import LedgerEntry from "@/models/LedgerEntry";
import GroupMember from "@/models/GroupMember";
import User from "@/models/User";
import mongoose, { Types } from "mongoose";

/**
 * POST /api/settlements
 *
 * [NEW] Settle-up endpoint — records a payment between two group members.
 *
 * Request body:
 *   - groupId: string  — the group this settlement belongs to
 *   - toUserId: string — the user being paid (the creditor)
 *   - amount: number   — amount in rupees (converted to paise internally)
 *   - note?: string    — optional note for the settlement
 *
 * Logic:
 *   1. Validates that both the payer and recipient are members of the group
 *   2. Creates a Settlement document
 *   3. Creates two LedgerEntry records:
 *      - Positive delta for the payer (they paid cash, reducing their debt → balance goes up)
 *      - Negative delta for the receiver (they received cash, reducing their credit → balance goes down)
 *   4. All writes are wrapped in a transaction for atomicity
 */
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { groupId, toUserId, amount, note } = await request.json();

    // Input validation
    if (!groupId || !toUserId || !amount || amount <= 0) {
        return new Response("Missing or invalid fields", { status: 400 });
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    if (amountInPaise <= 0) {
        return new Response("Amount must be positive", { status: 400 });
    }

    await connectToDatabase();
    
    const payer = await User.findOne({ email: session.user.email });
    if (!payer) {
        return new Response("User not found", { status: 404 });
    }

    if (payer._id.toString() === toUserId) {
        return new Response("Cannot settle with yourself", { status: 400 });
    }

    const objectGroupId = new Types.ObjectId(groupId);

    // Verify both users are members of the group
    const [payerMembership, receiverMembership] = await Promise.all([
        GroupMember.findOne({ groupId: objectGroupId, userId: payer._id }),
        GroupMember.findOne({ groupId: objectGroupId, userId: new Types.ObjectId(toUserId) }),
    ]);

    if (!payerMembership || !receiverMembership) {
        return new Response("Both users must be members of the group", { status: 403 });
    }

    // Atomic transaction for settlement + ledger entries
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
        const [settlement] = await Settlement.create(
            [
                {
                    groupId: objectGroupId,
                    from: payer._id,
                    to: new Types.ObjectId(toUserId),
                    amount: amountInPaise,
                    note: note || undefined,
                    status: "completed",
                },
            ],
            { session: dbSession }
        );

        // [FIX] Payer's balance INCREASES — they paid cash to reduce their debt.
        // Example: A owes B ₹500 (A has -500 balance). A pays B ₹500 cash.
        // A's ledger gets +500 → balance becomes 0. Debt cleared.
        await LedgerEntry.create(
            [
                {
                    groupId: objectGroupId,
                    userId: payer._id,
                    delta: +amountInPaise,
                    sourceType: "settlement",
                    sourceId: settlement._id,
                },
            ],
            { session: dbSession }
        );

        // [FIX] Receiver's balance DECREASES — they received cash, reducing their credit.
        // Example: B was owed ₹500 (B has +500 balance). B receives ₹500 cash.
        // B's ledger gets -500 → balance becomes 0. Credit collected.
        await LedgerEntry.create(
            [
                {
                    groupId: objectGroupId,
                    userId: new Types.ObjectId(toUserId),
                    delta: -amountInPaise,
                    sourceType: "settlement",
                    sourceId: settlement._id,
                },
            ],
            { session: dbSession }
        );

        await dbSession.commitTransaction();
        dbSession.endSession();

        return Response.json({ success: true, settlementId: settlement._id.toString() });
    } catch (error) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        console.error("Failed to create settlement:", error);
        return new Response("Failed to create settlement", { status: 500 });
    }
}
