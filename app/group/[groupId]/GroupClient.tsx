"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HistoryItem, HistorySplit } from "@/lib/queries/group";
import { ArrowLeft, Plus, HandCoins, Receipt, ArrowRight, Check, CheckCircle2 } from "lucide-react";

type Member = {
  _id: string;
  role: string;
  name: string;
  email: string;
  userId: string;
  balance: number;
};

type SettlementItem = {
  from: string;
  to: string;
  amount: number;
};

type Props = {
  group: { _id: string; name: string };
  currentUserId: string;
  members: Member[];
  history: HistoryItem[];
  settlements: SettlementItem[];
};

export default function GroupClient({
  group,
  currentUserId,
  members,
  history,
  settlements,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [splitType, setSplitType] = useState<"equal" | "exact">("equal");
  const [notification, setNotification] = useState("");

  const [selectedMembers, setSelectedMembers] = useState(
    members.map((m) => m.userId)
  );

  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});

  // Settle-up state
  const [settleToUserId, setSettleToUserId] = useState("");
  const [settleAmount, setSettleAmount] = useState("");
  const [settleNote, setSettleNote] = useState("");

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleCreateExpense = async () => {
    if (!amount || selectedMembers.length === 0) return;

    try {
      setLoading(true);

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group._id,
          amount: Number(amount) * 100,
          description,
          splitType,
          involvedMembers: selectedMembers,
          exactAmounts,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        showNotification(errorText || "Failed to create expense");
        return;
      }

      setOpen(false);
      setAmount("");
      setDescription("");
      setExactAmounts({});
      showNotification("Expense added successfully 🎉");
      router.refresh();
    } catch {
      showNotification("Failed to create expense");
    } finally {
      setLoading(false);
    }
  };

  const handleSettleUp = async () => {
    if (!settleToUserId || !settleAmount) return;

    try {
      setLoading(true);

      const res = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group._id,
          toUserId: settleToUserId,
          amount: Number(settleAmount),
          note: settleNote,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        showNotification(errorText || "Failed to settle up");
        return;
      }

      setSettleOpen(false);
      setSettleToUserId("");
      setSettleAmount("");
      setSettleNote("");
      showNotification("Settlement recorded ✅");
      router.refresh();
    } catch {
      showNotification("Failed to settle up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-zinc-800 selection:text-white pb-16">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-[-250px] left-[-100px] w-[500px] h-[500px] rounded-full bg-zinc-800/20 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl text-xs sm:text-sm font-medium text-white animate-in fade-in slide-in-from-top-2 duration-300">
            {notification}
          </div>
        )}

        {/* Header - Mobile Phone Friendly */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="dev-btn-dark w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer shrink-0"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-zinc-400 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bef264]" />
                GROUP LEDGER
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                {group.name}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:justify-end sm:gap-3">
            <button
              onClick={() => setSettleOpen(true)}
              className="dev-btn-dark flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-medium cursor-pointer"
            >
              <HandCoins className="w-4 h-4 text-zinc-400" />
              Settle Up
            </button>
            <button
              onClick={() => {
                setOpen(true);
                setAmount("");
                setDescription("");
                setExactAmounts({});
                setSelectedMembers(members.map((m) => m.userId));
              }}
              className="dev-btn-white flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Members & Balances Box */}
        <div className="dev-box p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#bef264]" />
              MEMBERS & BALANCES
            </div>
            <span className="text-xs font-mono text-zinc-500">{members.length} members</span>
          </div>

          <div className="space-y-2">
            {members.map((member) => {
              const isPositive = member.balance > 0;
              const isNegative = member.balance < 0;
              const formattedAmt = (Math.abs(member.balance) / 100).toFixed(2);

              return (
                <div
                  key={member._id}
                  className="dev-surface flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl transition-all"
                >
                  {/* Clean Initial Avatar */}
                  <div className="dev-icon-box w-10 h-10 font-mono font-bold text-white text-sm shrink-0">
                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-white truncate max-w-[140px] sm:max-w-[200px]">
                        {member.name}
                      </span>
                      {member.userId === currentUserId && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          you
                        </span>
                      )}
                      {member.role === "admin" && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-mono truncate mt-0.5">{member.email}</p>
                  </div>

                  {/* Clean Balance Tag */}
                  <div className="text-right shrink-0">
                    {isPositive && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-[#bef264] bg-[#bef264]/10 border border-[#bef264]/20">
                        +₹{formattedAmt}
                      </span>
                    )}
                    {isNegative && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20">
                        -₹{formattedAmt}
                      </span>
                    )}
                    {!isPositive && !isNegative && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-500 bg-zinc-800/40 border border-zinc-800">
                        settled
                      </span>
                    )}
                    <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                      {isPositive ? "gets back" : isNegative ? "owes" : "even"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggested Payments (Who Pays Whom) */}
        <div className="dev-box p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-zinc-400 pb-2 border-b border-zinc-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bef264]" />
            SUGGESTED TRANSFERS
          </div>

          <div className="space-y-2">
            {settlements.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-7 h-7 mx-auto text-[#bef264] mb-2" />
                <p className="text-zinc-200 text-sm font-semibold">All debts settled</p>
                <p className="text-xs font-mono text-zinc-500 mt-0.5">No pending transfers needed</p>
              </div>
            ) : (
              settlements.map((s, i) => (
                <div
                  key={i}
                  className="dev-surface flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl"
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 min-w-0">
                    <span className="font-semibold text-white truncate max-w-[100px] sm:max-w-none">{s.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#bef264] shrink-0" />
                    <span className="font-semibold text-white truncate max-w-[100px] sm:max-w-none">{s.to}</span>
                  </div>
                  <div className="font-mono font-bold text-xs sm:text-sm text-[#bef264] bg-[#bef264]/10 border border-[#bef264]/20 px-2.5 py-1 rounded-lg shrink-0">
                    ₹ {(s.amount / 100).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity History */}
        <div className="dev-box p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-zinc-400 pb-2 border-b border-zinc-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bef264]" />
            ACTIVITY LOG
          </div>

          <div className="space-y-2.5">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="w-7 h-7 mx-auto text-zinc-600 mb-2" />
                <p className="text-zinc-400 text-sm font-medium">No activity yet</p>
                <p className="text-xs font-mono text-zinc-600 mt-0.5">Expenses added will appear here</p>
              </div>
            ) : (
              history.map((item, i) => (
                <div
                  key={item.id || i}
                  className="dev-surface p-3.5 sm:p-4 rounded-xl space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Clean Type Icon */}
                      <div className="dev-icon-box w-9 h-9 text-[#bef264] shrink-0 mt-0.5">
                        {item.type === "expense" ? (
                          <Receipt className="w-4 h-4" />
                        ) : (
                          <HandCoins className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-white truncate">
                          {item.type === "expense"
                            ? item.title || "Untitled expense"
                            : item.title}
                        </div>
                        <div className="text-xs font-mono text-zinc-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-zinc-400">
                            {item.type === "expense" ? `Paid by ${item.user}` : item.user}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(item.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="font-mono font-bold text-sm sm:text-base text-white shrink-0">
                      ₹ {(item.amount / 100).toFixed(2)}
                    </div>
                  </div>

                  {/* Split Breakdown */}
                  {item.type === "expense" && item.splits && item.splits.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                          {item.splitType === "exact" ? "exact" : "equal"} ({item.splits.length}):
                        </span>
                        {item.splits.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300"
                          >
                            <span className="text-zinc-500">{s.name}:</span>
                            <span className="font-semibold text-zinc-200">
                              ₹{(s.amount / 100).toFixed(2)}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Settlement Note */}
                  {item.type === "settlement" && item.note && (
                    <div className="pt-1.5 border-t border-zinc-800/80 text-xs font-mono text-zinc-400 italic">
                      note: "{item.note}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* EXPENSE DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="dev-box border-zinc-800 rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-[calc(100vw-2rem)] max-h-[88vh] overflow-y-auto p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full bg-[#bef264]" />
              Add Expense
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 mb-1.5 block uppercase">Amount (₹)</label>
              <Input
                className="bg-[#141418] border-zinc-800 text-white rounded-xl h-11 text-base font-mono placeholder:text-zinc-600 focus:border-zinc-500"
                placeholder="0.00"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 mb-1.5 block uppercase">Description</label>
              <Input
                className="bg-[#141418] border-zinc-800 text-white rounded-xl h-11 text-sm placeholder:text-zinc-600 focus:border-zinc-500"
                placeholder="e.g. Dinner, Uber, Groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 mb-1.5 block uppercase">Split Method</label>
              <div className="grid grid-cols-2 gap-2 dev-surface p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSplitType("equal")}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    splitType === "equal"
                      ? "dev-btn-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType("exact")}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    splitType === "exact"
                      ? "dev-btn-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Exact Amounts
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 mb-1.5 block uppercase">Participating Members</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="dev-surface flex items-center justify-between p-2.5 rounded-xl"
                  >
                    <label className="flex items-center gap-2.5 text-xs sm:text-sm cursor-pointer select-none flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.userId)}
                        onChange={() => toggleMember(member.userId)}
                        className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-[#bef264] accent-[#bef264] cursor-pointer"
                      />
                      <span className="font-semibold text-zinc-200 truncate">{member.name}</span>
                      {member.userId === currentUserId && (
                        <span className="text-[10px] font-mono text-zinc-500">(you)</span>
                      )}
                    </label>

                    {splitType === "exact" && selectedMembers.includes(member.userId) && (
                      <Input
                        type="number"
                        placeholder="₹"
                        value={exactAmounts[member.userId] || ""}
                        onChange={(e) =>
                          setExactAmounts((prev) => ({
                            ...prev,
                            [member.userId]: e.target.value,
                          }))
                        }
                        className="w-20 bg-[#0e0e11] border-zinc-700 rounded-lg text-right h-8 text-xs font-mono text-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateExpense}
              disabled={loading || !amount || selectedMembers.length === 0}
              className="dev-btn-white w-full py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Adding Expense..." : "Add Expense"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SETTLE-UP DIALOG */}
      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent className="dev-box border-zinc-800 rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-[calc(100vw-2rem)] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full bg-[#bef264]" />
              Record Settlement
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 mb-1.5 block uppercase">Pay To</label>
              <select
                className="w-full h-11 rounded-xl bg-[#141418] border border-zinc-800 px-3 text-sm text-white focus:border-zinc-500 focus:outline-none cursor-pointer"
                value={settleToUserId}
                onChange={(e) => setSettleToUserId(e.target.value)}
              >
                <option value="">Select a member</option>
                {members
                  .filter((m) => m.userId !== currentUserId)
                  .map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.email})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 mb-1.5 block uppercase">Amount (₹)</label>
              <Input
                className="bg-[#141418] border-zinc-800 text-white rounded-xl h-11 text-base font-mono placeholder:text-zinc-600 focus:border-zinc-500"
                placeholder="0.00"
                type="number"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 mb-1.5 block uppercase">Note (optional)</label>
              <Input
                className="bg-[#141418] border-zinc-800 text-white rounded-xl h-11 text-sm placeholder:text-zinc-600 focus:border-zinc-500"
                placeholder="e.g. UPI payment, Cash"
                value={settleNote}
                onChange={(e) => setSettleNote(e.target.value)}
              />
            </div>

            <button
              onClick={handleSettleUp}
              disabled={loading || !settleToUserId || !settleAmount}
              className="dev-btn-white w-full py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Recording..." : "Confirm Settlement"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
