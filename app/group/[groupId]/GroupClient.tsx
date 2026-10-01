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
              className="metallic-btn-steel w-10 h-10 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                {group.name}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">{members.length} members</p>
            </div>
          </div>

          {/* Action Buttons: Full-width 2-column grid on phones, flex on desktop */}
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:justify-end sm:gap-3">
            <button
              onClick={() => setSettleOpen(true)}
              className="metallic-btn-steel flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <HandCoins className="w-4 h-4 text-zinc-300" />
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
              className="metallic-btn-platinum flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Members & Balances Card */}
        <div className="metallic-card rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800/80 flex items-center justify-between">
            <h2 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-white via-zinc-400 to-zinc-600" />
              Members & Balances
            </h2>
            <span className="metallic-badge text-[11px] px-2.5 py-0.5 rounded-full font-medium">Live Ledger</span>
          </div>

          <div className="p-3 sm:p-4 space-y-2">
            {members.map((member) => {
              const isPositive = member.balance > 0;
              const isNegative = member.balance < 0;
              const formattedAmt = (Math.abs(member.balance) / 100).toFixed(2);

              return (
                <div
                  key={member._id}
                  className="metallic-surface flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl transition-all"
                >
                  {/* Clean Initial Avatar */}
                  <div className="metallic-medallion w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm">
                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-white truncate max-w-[140px] sm:max-w-[200px]">
                        {member.name}
                      </span>
                      {member.userId === currentUserId && (
                        <span className="metallic-badge text-[10px] px-2 py-0.5 rounded-md font-semibold text-zinc-200">
                          You
                        </span>
                      )}
                      {member.role === "admin" && (
                        <span className="metallic-badge text-[10px] px-2 py-0.5 rounded-md text-zinc-300">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{member.email}</p>
                  </div>

                  {/* Clean Balance Tag */}
                  <div className="text-right shrink-0">
                    {isPositive && (
                      <span className="metallic-badge-positive inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold">
                        +₹{formattedAmt}
                      </span>
                    )}
                    {isNegative && (
                      <span className="metallic-badge-negative inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold">
                        -₹{formattedAmt}
                      </span>
                    )}
                    {!isPositive && !isNegative && (
                      <span className="metallic-badge inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium text-zinc-400">
                        Settled
                      </span>
                    )}
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {isPositive ? "gets back" : isNegative ? "owes" : "even"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simplified Settlements (Who Pays Whom) */}
        <div className="metallic-card rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800/80">
            <h2 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-white via-zinc-400 to-zinc-600" />
              Suggested Payments
            </h2>
          </div>

          <div className="p-3 sm:p-4 space-y-2">
            {settlements.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                <p className="text-zinc-200 text-sm font-semibold">All debts settled</p>
                <p className="text-xs text-zinc-400 mt-0.5">No pending transfers needed</p>
              </div>
            ) : (
              settlements.map((s, i) => (
                <div
                  key={i}
                  className="metallic-surface flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl"
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 min-w-0">
                    <span className="font-semibold text-white truncate max-w-[100px] sm:max-w-none">{s.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="font-semibold text-white truncate max-w-[100px] sm:max-w-none">{s.to}</span>
                  </div>
                  <div className="metallic-badge-gold font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg shrink-0 shadow-sm">
                    ₹ {(s.amount / 100).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity History */}
        <div className="metallic-card rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800/80">
            <h2 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-white via-zinc-400 to-zinc-600" />
              Activity History
            </h2>
          </div>

          <div className="p-3 sm:p-4 space-y-2.5">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="w-8 h-8 mx-auto text-zinc-500 mb-2" />
                <p className="text-zinc-300 text-sm font-medium">No activity yet</p>
                <p className="text-xs text-zinc-500 mt-0.5">Expenses added will appear here</p>
              </div>
            ) : (
              history.map((item, i) => (
                <div
                  key={item.id || i}
                  className="metallic-surface p-3.5 sm:p-4 rounded-xl transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Clean Type Icon */}
                      <div className="metallic-medallion w-9 h-9 rounded-xl flex items-center justify-center text-zinc-200 shrink-0 mt-0.5 shadow-sm">
                        {item.type === "expense" ? (
                          <Receipt className="w-4 h-4 text-zinc-300" />
                        ) : (
                          <HandCoins className="w-4 h-4 text-zinc-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-white truncate">
                          {item.type === "expense"
                            ? item.title || "Untitled expense"
                            : item.title}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-zinc-300 font-medium">
                            {item.type === "expense" ? `Paid by ${item.user}` : item.user}
                          </span>
                          <span className="text-zinc-500">•</span>
                          <span className="text-zinc-400">
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

                    <div className="font-extrabold text-sm sm:text-base metallic-silver-text shrink-0">
                      ₹ {(item.amount / 100).toFixed(2)}
                    </div>
                  </div>

                  {/* Split Breakdown */}
                  {item.type === "expense" && item.splits && item.splits.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="metallic-badge text-[11px] font-semibold px-2 py-0.5 rounded-md">
                          {item.splitType === "exact" ? "Exact split" : "Split equally"} ({item.splits.length}):
                        </span>
                        {item.splits.map((s, idx) => (
                          <span
                            key={idx}
                            className="metallic-surface inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md text-zinc-300"
                          >
                            <span className="text-zinc-400">{s.name}:</span>
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
                    <div className="pt-1.5 border-t border-zinc-800/80 text-xs text-zinc-400 italic">
                      Note: "{item.note}"
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
        <DialogContent className="metallic-card border-zinc-700/60 rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-[calc(100vw-2rem)] max-h-[88vh] overflow-y-auto p-5 sm:p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2.5 text-white">
              <span className="metallic-medallion w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm">💰</span>
              Add Expense
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Amount (₹)</label>
              <Input
                className="bg-zinc-900/90 border-zinc-700/70 text-white rounded-xl h-11 text-base placeholder:text-zinc-500 focus:border-zinc-400"
                placeholder="0.00"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Description</label>
              <Input
                className="bg-zinc-900/90 border-zinc-700/70 text-white rounded-xl h-11 text-base placeholder:text-zinc-500 focus:border-zinc-400"
                placeholder="e.g. Dinner, Uber, Groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Split Method</label>
              <div className="grid grid-cols-2 gap-2 metallic-surface p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSplitType("equal")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    splitType === "equal"
                      ? "metallic-btn-platinum shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType("exact")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    splitType === "exact"
                      ? "metallic-btn-platinum shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Exact Amounts
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Participating Members</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="metallic-surface flex items-center justify-between p-2.5 rounded-xl"
                  >
                    <label className="flex items-center gap-2.5 text-xs sm:text-sm cursor-pointer select-none flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.userId)}
                        onChange={() => toggleMember(member.userId)}
                        className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-white accent-white cursor-pointer"
                      />
                      <span className="font-semibold text-zinc-200 truncate">{member.name}</span>
                      {member.userId === currentUserId && (
                        <span className="metallic-badge text-[10px] px-1.5 py-0.5 rounded text-zinc-300">(You)</span>
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
                        className="w-20 bg-zinc-950/90 border-zinc-700/80 rounded-lg text-right h-8 text-xs text-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateExpense}
              disabled={loading || !amount || selectedMembers.length === 0}
              className="metallic-btn-platinum w-full py-3 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Adding Expense..." : "Add Expense"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SETTLE-UP DIALOG */}
      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent className="metallic-card border-zinc-700/60 rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-[calc(100vw-2rem)] p-5 sm:p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2.5 text-white">
              <span className="metallic-medallion w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm">🤝</span>
              Record Settlement
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Pay To</label>
              <select
                className="w-full h-11 rounded-xl bg-zinc-900/90 border border-zinc-700/70 px-3 text-sm text-white focus:border-zinc-400 focus:outline-none cursor-pointer"
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
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Amount (₹)</label>
              <Input
                className="bg-zinc-900/90 border-zinc-700/70 text-white rounded-xl h-11 text-base placeholder:text-zinc-500 focus:border-zinc-400"
                placeholder="0.00"
                type="number"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Note (optional)</label>
              <Input
                className="bg-zinc-900/90 border-zinc-700/70 text-white rounded-xl h-11 text-base placeholder:text-zinc-500 focus:border-zinc-400"
                placeholder="e.g. UPI payment, Cash"
                value={settleNote}
                onChange={(e) => setSettleNote(e.target.value)}
              />
            </div>

            <button
              onClick={handleSettleUp}
              disabled={loading || !settleToUserId || !settleAmount}
              className="metallic-btn-platinum w-full py-3 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Recording..." : "Confirm Settlement"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
