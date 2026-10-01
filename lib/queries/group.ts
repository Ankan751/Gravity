import "@/models";
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getCached, setCached } from "@/lib/cache";

export type HistorySplit = {
  name: string;
  amount: number;
};

export type HistoryItem = {
  type: "expense" | "settlement";
  id: string;
  createdAt: string;
  amount: number;
  title: string;
  user: string;
  splitType?: string;
  splits?: HistorySplit[];
  note?: string;
};

/**
 * Fetches and merges expense + settlement history for a group,
 * including split breakdown with involved members and amounts, sorted newest-first.
 * Cached in-memory with automatic invalidation on new expenses/settlements.
 */
export async function getGroupHistory(groupId: string): Promise<HistoryItem[]> {
  const cacheKey = `group-history-${groupId}`;
  const cachedData = getCached<HistoryItem[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  await connectToDatabase();

  const Expense = mongoose.models.Expense;
  const ExpenseSplit = mongoose.models.ExpenseSplit;
  const Settlement = mongoose.models.Settlement;

  const objectId = new Types.ObjectId(groupId);

  // 1️⃣ Fetch expenses and settlements in parallel
  const [expenses, settlements] = await Promise.all([
    Expense.find({ groupId: objectId })
      .populate("paidBy", "name email")
      .sort({ createdAt: -1 })
      .lean(),
    Settlement.find({ groupId: objectId })
      .populate("from to", "name email")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  // 2️⃣ Fetch splits only if expenses exist
  const expenseIds = expenses.map((e: any) => e._id);
  const splits = expenseIds.length > 0
    ? await ExpenseSplit.find({ expenseId: { $in: expenseIds } })
        .populate("userId", "name email")
        .lean()
    : [];

  const splitsByExpenseId: Record<string, HistorySplit[]> = {};
  for (const s of splits as any[]) {
    const expId = s.expenseId?.toString();
    if (!expId) continue;
    if (!splitsByExpenseId[expId]) splitsByExpenseId[expId] = [];
    splitsByExpenseId[expId].push({
      name: s.userId?.name?.trim() || s.userId?.email?.split("@")[0] || "Unknown",
      amount: s.amount,
    });
  }

  // 4️⃣ Normalize into common shape
  const expenseHistory = expenses.map((e: any) => ({
    type: "expense" as const,
    id: e._id.toString(),
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
    amount: e.amount,
    title: e.description || "Untitled expense",
    user: e.paidBy?.name?.trim() || e.paidBy?.email?.split("@")[0] || "Unknown",
    splitType: e.splitType || "equal",
    splits: splitsByExpenseId[e._id.toString()] || [],
  }));

  const settlementHistory = settlements.map((s: any) => ({
    type: "settlement" as const,
    id: s._id.toString(),
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
    amount: s.amount,
    title: `${s.from?.name?.trim() || "Someone"} paid ${s.to?.name?.trim() || "Someone"}`,
    user: s.from?.name?.trim() || "Someone",
    note: s.note,
  }));

  // 5️⃣ Merge + Sort newest first
  const result: HistoryItem[] = [...expenseHistory, ...settlementHistory].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  setCached(cacheKey, result, 60); // Cache for 60 seconds
  return result;
}

