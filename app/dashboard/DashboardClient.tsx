"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Link2, Copy, Check, ChevronRight, LogOut, Users, Zap, Coins } from "lucide-react";

type User = {
  name?: string | null;
  email?: string | null;
};

type GroupType = {
  _id: string;
  name: string;
};

type DashboardProps = {
  user?: User | null;
  groups: GroupType[];
};

export default function DashboardClient({ user, groups }: DashboardProps) {
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [token, setToken] = useState("");
  const [groupName, setGroupName] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const confirmGroupCreation = async () => {
    if (!groupName.trim()) return;

    try {
      setLoading(true);
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setJoinLink(data.joinLink);
      setNotification("Group created successfully 🎉");
      setTimeout(() => setNotification(""), 4000);
      router.refresh();
    } catch {
      setNotification("Failed to create group");
      setTimeout(() => setNotification(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinLink);
    setCopied(true);
    setNotification("Invite link copied!");
    setTimeout(() => {
      setNotification("");
      setCopied(false);
    }, 2000);
  };

  const joinGroup = async () => {
    if (!token.trim()) return;

    try {
      setLoading(true);
      const res = await fetch("/api/groups/join-by-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok || !data?.groupId) throw new Error();

      setJoinOpen(false);
      router.push(`/group/${data.groupId}`);
    } catch {
      setNotification("Invalid token or failed to join");
      setTimeout(() => setNotification(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    window.location.href = "/api/auth/signout";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
          <p className="text-zinc-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-zinc-800 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-[-250px] right-[-100px] w-[500px] h-[500px] rounded-full bg-zinc-800/20 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl text-xs sm:text-sm font-medium text-white animate-in fade-in slide-in-from-top-2 duration-300">
            {notification}
          </div>
        )}

        {/* Navbar */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            <div className="dev-icon-box w-8 h-8 rounded-lg text-white font-mono text-sm font-bold">
              S
            </div>
            <span className="font-semibold text-base tracking-tight text-white">
              splitease<span className="font-mono text-xs text-zinc-500">.app</span>
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="dev-btn-dark flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* User Welcome Header */}
        <div className="dev-box p-6 sm:p-7 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141418] border border-zinc-800 text-[11px] font-mono tracking-widest uppercase text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-[#bef264]" />
            {user.email}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome, <span className="text-[#bef264]">{user.name ?? "User"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
            Select a group to log new shared expenses, view member balances, or record settlements.
          </p>
        </div>

        {/* Action Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => {
              setCreateOpen(true);
              setGroupName("");
              setJoinLink("");
            }}
            className="dev-box p-5 text-left hover:border-zinc-700 transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="font-semibold text-sm sm:text-base text-white group-hover:text-[#bef264] transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#bef264]" />
                Create Group
              </div>
              <p className="text-xs font-mono text-zinc-500">Start a new shared ledger</p>
            </div>
            <span className="dev-btn-white px-3 py-1.5 text-xs font-semibold">New +</span>
          </button>

          <button
            onClick={() => {
              setJoinOpen(true);
              setToken("");
            }}
            className="dev-box p-5 text-left hover:border-zinc-700 transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="font-semibold text-sm sm:text-base text-white group-hover:text-[#bef264] transition-colors flex items-center gap-2">
                <Link2 className="w-4 h-4 text-zinc-400 group-hover:text-[#bef264]" />
                Join Group
              </div>
              <p className="text-xs font-mono text-zinc-500">Enter an invite token</p>
            </div>
            <span className="dev-btn-dark px-3 py-1.5 text-xs font-mono">Token ↗</span>
          </button>
        </div>

        {/* Groups List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#bef264]" />
              ACTIVE GROUPS
            </div>
            <span className="text-xs font-mono text-[#bef264] bg-[#bef264]/10 border border-[#bef264]/20 px-2.5 py-0.5 rounded-full">
              {groups.length} active
            </span>
          </div>

          {groups.length === 0 ? (
            <div className="dev-box p-8 sm:p-12 text-center space-y-3">
              <div className="dev-icon-box w-12 h-12 mx-auto text-zinc-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">No groups active yet</h3>
              <p className="text-zinc-500 text-xs font-mono max-w-xs mx-auto">
                Create a group or use an invite token to begin tracking shared expenses.
              </p>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {groups.map((group) => (
                <Link
                  key={group._id}
                  href={`/group/${group._id}`}
                  prefetch={true}
                  className="dev-surface p-4 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition group rounded-xl block"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="dev-icon-box w-10 h-10 font-mono font-bold text-sm text-white shrink-0">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base text-white truncate group-hover:text-[#bef264] transition-colors">
                        {group.name}
                      </div>
                      <p className="text-xs font-mono text-zinc-500 mt-0.5">open ledger →</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#bef264] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="dev-box border-zinc-800 rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-[calc(100vw-2rem)] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#bef264]" />
              Create Group
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1.5 uppercase">Group Name</label>
              <Input
                placeholder="e.g. Goa Trip, Flat 402, Friday Dinner"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-[#141418] border-zinc-800 text-white rounded-xl h-11 text-sm placeholder:text-zinc-600 focus:border-zinc-500"
              />
            </div>

            <button
              onClick={confirmGroupCreation}
              disabled={loading || !groupName.trim()}
              className="dev-btn-white w-full py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>

            {joinLink && (
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <label className="text-xs font-mono text-zinc-400">Invite Link</label>
                <div className="flex items-center gap-2 bg-[#141418] border border-zinc-800 p-2 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={joinLink}
                    className="bg-transparent text-xs font-mono text-zinc-300 flex-1 outline-none truncate"
                  />
                  <button
                    onClick={copyLink}
                    className="dev-btn-dark px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#bef264]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* JOIN DIALOG */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="dev-box border-zinc-800 rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-[calc(100vw-2rem)] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#bef264]" />
              Join Group
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1.5 uppercase">Invite Token</label>
              <Input
                placeholder="Paste token or link suffix"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-[#141418] border-zinc-800 text-white rounded-xl h-11 text-sm font-mono placeholder:text-zinc-600 focus:border-zinc-500"
              />
            </div>

            <button
              onClick={joinGroup}
              disabled={loading || !token.trim()}
              className="dev-btn-white w-full py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Joining..." : "Join Group"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
