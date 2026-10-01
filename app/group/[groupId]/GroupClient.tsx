"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

type HistorySplit = {
  name: string;
  amount: number;
};

type HistoryItem = {
  type: "expense" | "settlement";
  id?: string;
  createdAt: string;
  amount: number;
  title: string;
  user: string;
  splitType?: string;
  splits?: HistorySplit[];
  note?: string;
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

  // Color helpers
  const getInitialColor = (index: number) =>
    index % 2 === 0 ? "gradient-emerald" : "gradient-violet";

  const getBalanceColor = (balance: number) =>
    balance > 0
      ? "text-emerald-400"
      : balance < 0
        ? "text-red-400"
        : "text-zinc-400";

  const getBalanceLabel = (balance: number) => {
    if (balance > 0) return "gets back";
    if (balance < 0) return "owes";
    return "settled";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-[-300px] left-[-100px] w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-100px] w-[400px] h-[400px] rounded-full bg-violet-500/8 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-emerald-600/90 backdrop-blur-md shadow-2xl shadow-emerald-500/20 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            {notification}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-10 h-10 rounded-xl border border-zinc-800 hover:border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{group.name}</h1>
              <p className="text-sm text-zinc-500">{members.length} members</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setSettleOpen(true)}
              className="rounded-xl gradient-violet hover:opacity-90 font-semibold text-white border-0"
            >
              🤝 Settle Up
            </Button>
            <Button
              onClick={() => {
                setOpen(true);
                setAmount("");
                setDescription("");
                setExactAmounts({});
                setSelectedMembers(members.map((m) => m.userId));
              }}
              className="rounded-xl gradient-emerald hover:opacity-90 font-semibold text-white border-0"
            >
              ＋ Add Expense
            </Button>
          </div>
        </div>

        {/* Members & Balances */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-emerald-500" />
              Members & Balances
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {members.map((member, index) => (
              <div
                key={member._id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                {/* Avatar */}
                <div
                  className={`w-11 h-11 rounded-xl ${getInitialColor(index)} flex items-center justify-center font-bold text-white text-lg shrink-0`}
                >
                  {member.name?.charAt(0)?.toUpperCase() || "?"}
                </div>

                {/* Name + Email */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {member.name}
                    {member.userId === currentUserId && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        You
                      </span>
                    )}
                    {member.role === "admin" && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{member.email}</p>
                </div>

                {/* Balance */}
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold ${getBalanceColor(member.balance)}`}>
                    ₹ {Math.abs(member.balance / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-zinc-500">{getBalanceLabel(member.balance)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settlements (Who Pays Whom) */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-violet-500" />
              Who Pays Whom
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {settlements.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-zinc-400 font-medium">All settled up!</p>
                <p className="text-xs text-zinc-600 mt-1">No pending payments</p>
              </div>
            ) : (
              settlements.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02]"
                >
                  <div className="w-9 h-9 rounded-lg gradient-violet flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {s.from.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-sm">
                    <span className="font-semibold">{s.from}</span>
                    <span className="text-zinc-500"> pays </span>
                    <span className="font-semibold">{s.to}</span>
                  </div>
                  <div className="text-emerald-400 font-bold">
                    ₹ {(s.amount / 100).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* History */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-emerald-500" />
              Activity History
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-zinc-400 font-medium">No activity yet</p>
                <p className="text-xs text-zinc-600 mt-1">Add an expense to get started</p>
              </div>
            ) : (
              history.map((item, i) => (
                <div
                  key={item.id || i}
                  className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Type icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5 ${item.type === "expense"
                            ? "bg-emerald-500/10 border border-emerald-500/20"
                            : "bg-violet-500/10 border border-violet-500/20"
                          }`}
                      >
                        {item.type === "expense" ? "💰" : "🤝"}
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
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-500">
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

                    <div
                      className={`font-bold text-sm sm:text-base shrink-0 ${item.type === "expense"
                          ? "text-emerald-400"
                          : "text-violet-400"
                        }`}
                    >
                      ₹ {(item.amount / 100).toFixed(2)}
                    </div>
                  </div>

                  {/* Split Breakdown */}
                  {item.type === "expense" && item.splits && item.splits.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.04]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          {item.splitType === "exact" ? "Exact split" : "Split equally"} ({item.splits.length}):
                        </span>
                        {item.splits.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] bg-white/[0.04] border border-white/5 px-2 py-0.5 rounded-md text-zinc-300"
                          >
                            <span className="text-zinc-400">{s.name}:</span>
                            <span className="font-medium text-emerald-300/90">
                              ₹{(s.amount / 100).toFixed(2)}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Settlement Note */}
                  {item.type === "settlement" && item.note && (
                    <div className="pt-1.5 border-t border-white/[0.04] text-xs text-zinc-400 italic">
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
        <DialogContent className="bg-[#12121a] border-zinc-800/50 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center text-sm">💰</span>
              Add Expense
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Amount (₹)</label>
              <Input
                className="bg-[#1e1e2e] border-zinc-800 rounded-xl h-12 text-lg focus:border-emerald-500/50"
                placeholder="0.00"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Description</label>
              <Input
                className="bg-[#1e1e2e] border-zinc-800 rounded-xl h-12 focus:border-emerald-500/50"
                placeholder="e.g. Dinner, Uber, Groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Split Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSplitType("equal")}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${splitType === "equal"
                      ? "gradient-emerald text-white"
                      : "bg-[#1e1e2e] text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                >
                  Equal Split
                </button>
                <button
                  onClick={() => setSplitType("exact")}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${splitType === "exact"
                      ? "gradient-violet text-white"
                      : "bg-[#1e1e2e] text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                >
                  Exact Amounts
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Split Between</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#1e1e2e] border border-zinc-800/50"
                  >
                    <label className="flex items-center gap-3 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.userId)}
                        onChange={() => toggleMember(member.userId)}
                        className="w-4 h-4 rounded accent-emerald-500"
                      />
                      <span className="font-medium">{member.name}</span>
                      {member.userId === currentUserId && (
                        <span className="text-xs text-emerald-400">(You)</span>
                      )}
                    </label>

                    {splitType === "exact" &&
                      selectedMembers.includes(member.userId) && (
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
                          className="w-24 bg-[#12121a] border-zinc-700 rounded-lg text-right"
                        />
                      )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full rounded-xl h-12 gradient-emerald hover:opacity-90 font-semibold text-white border-0"
              onClick={handleCreateExpense}
              disabled={loading || !amount || selectedMembers.length === 0}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Adding...
                </span>
              ) : (
                "Add Expense"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SETTLE-UP DIALOG */}
      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent className="bg-[#12121a] border-zinc-800/50 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg gradient-violet flex items-center justify-center text-sm">🤝</span>
              Settle Up
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Pay To</label>
              <select
                className="w-full h-12 rounded-xl bg-[#1e1e2e] border border-zinc-800 px-4 text-sm focus:border-violet-500/50 focus:outline-none appearance-none cursor-pointer"
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
              <label className="text-xs text-zinc-500 mb-1.5 block">Amount (₹)</label>
              <Input
                className="bg-[#1e1e2e] border-zinc-800 rounded-xl h-12 text-lg focus:border-violet-500/50"
                placeholder="0.00"
                type="number"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Note (optional)</label>
              <Input
                className="bg-[#1e1e2e] border-zinc-800 rounded-xl h-12 focus:border-violet-500/50"
                placeholder="e.g. UPI payment, Cash"
                value={settleNote}
                onChange={(e) => setSettleNote(e.target.value)}
              />
            </div>

            <Button
              className="w-full rounded-xl h-12 gradient-violet hover:opacity-90 font-semibold text-white border-0"
              onClick={handleSettleUp}
              disabled={loading || !settleToUserId || !settleAmount}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Recording...
                </span>
              ) : (
                "Record Settlement"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
