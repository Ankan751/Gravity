import "@/models";
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";

/**
 * Fetches and merges expense + settlement history for a group,
 * sorted newest-first.
 *
 * [CHANGE] Added `as const` assertions on the `type` field so TypeScript
 * narrows them to the literal union "expense" | "settlement" instead of `string`.
 */
export async function getGroupHistory(groupId: string) {
  await connectToDatabase();

  const Expense = mongoose.models.Expense;
  const Settlement = mongoose.models.Settlement;

  const objectId = new Types.ObjectId(groupId);

  // 1️⃣ Fetch expenses
  const expenses = await Expense.find({ groupId: objectId })
    .populate("paidBy", "name email")
    .lean();

  // 2️⃣ Fetch settlements
  const settlements = await Settlement.find({ groupId: objectId })
    .populate("from to", "name email")
    .lean();

  // 3️⃣ Normalize into a common shape
  const expenseHistory = expenses.map((e: any) => ({
    type: "expense" as const,
    createdAt: e.createdAt,
    amount: e.amount,
    title: e.description,
    user: e.paidBy?.name,
  }));

  const settlementHistory = settlements.map((s: any) => ({
    type: "settlement" as const,
    createdAt: s.createdAt,
    amount: s.amount,
    title: `${s.from?.name} paid ${s.to?.name}`,
    user: s.from?.name,
  }));

  // 4️⃣ Merge + Sort newest first
  return [...expenseHistory, ...settlementHistory].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}
