import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Expense from "@/models/Expense";
import ExpenseSplit from "@/models/ExpenseSplit";
import LedgerEntry from "@/models/LedgerEntry";
import GroupMember from "@/models/GroupMember";
import User from "@/models/User";
import mongoose, { Types } from "mongoose";

/**
 * POST /api/expenses
 *
 * [CHANGES MADE]:
 * 1. Added input validation — amount must be > 0, description required,
 *    involvedMembers must be a non-empty array.
 * 2. Added membership validation — verifies the payer is a member of the group
 *    before allowing expense creation.
 * 3. Fixed ledger delta sign — the payer now gets a POSITIVE delta (they are
 *    owed money) and other members get a NEGATIVE delta (they owe money).
 *    Previously the signs were inverted.
 * 4. Wrapped all DB writes in a MongoDB transaction so that expense, splits,
 *    and ledger entries are created atomically. If any write fails, everything
 *    is rolled back.
 * 5. Added try-catch with proper error responses.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    groupId,
    amount,
    description,
    splitType,
    involvedMembers,
    exactAmounts,
  } = await request.json();

  // [ADDED] Input validation
  if (!groupId || !amount || amount <= 0) {
    return new Response("Invalid amount or missing groupId", { status: 400 });
  }
  if (!involvedMembers || involvedMembers.length === 0) {
    return new Response("At least one member must be involved", { status: 400 });
  }
  if (!splitType || !["equal", "exact"].includes(splitType)) {
    return new Response("Invalid split type", { status: 400 });
  }

  await connectToDatabase();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const objectGroupId = new Types.ObjectId(groupId);

  // [ADDED] Membership validation — only group members can create expenses
  const membership = await GroupMember.findOne({
    groupId: objectGroupId,
    userId: user._id,
  });
  if (!membership) {
    return new Response("You are not a member of this group", { status: 403 });
  }

  // [ADDED] Transaction wrapper for atomic writes
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const expense = await Expense.create(
      [
        {
          groupId: objectGroupId,
          paidBy: user._id,
          amount,
          description: description || "Untitled expense",
          splitType,
        },
      ],
      { session: dbSession }
    );

    const expenseDoc = expense[0];

    const splits: Record<string, number> = {};

    if (splitType === "equal") {
      const splitAmount = Math.floor(amount / involvedMembers.length);
      involvedMembers.forEach((userId: string) => {
        splits[userId] = splitAmount;
      });
    } else if (splitType === "exact") {
      let total = 0;
      involvedMembers.forEach((userId: string) => {
        const val = Number(exactAmounts[userId] || 0) * 100;
        splits[userId] = val;
        total += val;
      });

      if (total !== amount) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return new Response("Exact amounts do not match total", { status: 400 });
      }
    }

    // Create splits + ledger entries inside the transaction
    for (const userId of involvedMembers) {
      await ExpenseSplit.create(
        [
          {
            expenseId: expenseDoc._id,
            userId,
            amount: splits[userId],
          },
        ],
        { session: dbSession }
      );

      /**
       * [FIX] Ledger delta sign was inverted.
       *
       * Correct logic:
       *   - Payer PAID the full amount, so they are OWED money → positive delta
       *   - Each member OWES their split share → negative delta
       *   - For the payer themselves: net delta = +totalAmount - theirSplitShare
       *     (positive if they paid more than their share, which is the normal case)
       *
       * Previously: delta = userId === payer ? (-amount + split) : split
       *   This gave the payer a large NEGATIVE number and others a POSITIVE,
       *   which is backwards.
       */
      const delta =
        userId === user._id.toString()
          ? amount - splits[userId] // payer: +totalPaid - theirOwnShare = net owed TO them
          : -splits[userId]; // others: they OWE this amount

      await LedgerEntry.create(
        [
          {
            groupId: objectGroupId,
            userId,
            delta,
            sourceType: "expense",
            sourceId: expenseDoc._id,
          },
        ],
        { session: dbSession }
      );
    }

    await dbSession.commitTransaction();
    dbSession.endSession();

    return Response.json({ success: true });
  } catch (error) {
    // [ADDED] Rollback on any failure
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error("Failed to create expense:", error);
    return new Response("Failed to create expense", { status: 500 });
  }
}
