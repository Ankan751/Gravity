"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700/60 flex items-center justify-center font-bold text-sm sm:text-base text-white shadow-sm">
              S
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Split<span className="text-zinc-400">Ease</span>
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Welcome Card */}
        <div className="glass-card rounded-2xl p-5 sm:p-7 border border-zinc-800">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                Welcome, {user.name ?? "User"}
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-0.5 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="glass-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-center border border-zinc-800/80">
            <div className="text-xl sm:text-2xl font-bold text-white">{groups.length}</div>
            <div className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 flex items-center justify-center gap-1">
              <Users className="w-3 h-3 hidden sm:inline" />
              Groups
            </div>
          </div>
          <div className="glass-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-center border border-zinc-800/80">
            <div className="text-xl sm:text-2xl font-bold text-white">Instant</div>
            <div className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 hidden sm:inline" />
              Sync
            </div>
          </div>
          <div className="glass-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-center border border-zinc-800/80">
            <div className="text-xl sm:text-2xl font-bold text-white">INR (₹)</div>
            <div className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 flex items-center justify-center gap-1">
              <Coins className="w-3 h-3 hidden sm:inline" />
              Currency
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => {
              setCreateOpen(true);
              setGroupName("");
              setJoinLink("");
            }}
            className="glass-card rounded-2xl p-4 sm:p-6 text-center hover:border-zinc-700 transition-all duration-200 cursor-pointer active:scale-98 group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-white text-zinc-950 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform shadow-md">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="font-bold text-sm sm:text-base text-white">Create Group</div>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Start fresh expense pool</p>
          </button>

          <button
            onClick={() => {
              setJoinOpen(true);
              setToken("");
            }}
            className="glass-card rounded-2xl p-4 sm:p-6 text-center hover:border-zinc-700 transition-all duration-200 cursor-pointer active:scale-98 group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform shadow-sm">
              <Link2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </div>
            <div className="font-bold text-sm sm:text-base text-white">Join Group</div>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Enter an invite token</p>
          </button>
        </div>

        {/* Groups List */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-zinc-400" />
              Your Groups
            </h2>
            <span className="text-xs text-zinc-500 font-medium">{groups.length} active</span>
          </div>

          {groups.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 sm:p-12 text-center border border-zinc-800/80">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">No groups yet</h3>
              <p className="text-zinc-400 text-xs sm:text-sm max-w-xs mx-auto">
                Create your first group or enter an invite token to start sharing bills.
              </p>
            </div>
          ) : (
            <div className="grid gap-2.5 sm:gap-3">
              {groups.map((group) => (
                <div
                  key={group._id}
                  onClick={() => router.push(`/group/${group._id}`)}
                  className="glass-card rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 cursor-pointer hover:border-zinc-700 transition-all duration-200 active:scale-99 group border border-zinc-800/70"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-sm sm:text-base font-bold text-white shrink-0 shadow-sm">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-white truncate group-hover:text-zinc-200 transition-colors">
                      {group.name}
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">Tap to view expenses & settlements</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-[calc(100vw-2rem)] p-5 sm:p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-white">Create a New Group</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1.5">Group Name</label>
              <Input
                placeholder="e.g. Goa Trip, Flat 402, Friday Dinner"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-11 text-base placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </div>

            <button
              onClick={confirmGroupCreation}
              disabled={loading || !groupName.trim()}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-98"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>

            {joinLink && (
              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <label className="text-xs text-zinc-400 font-medium">Invite Link</label>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={joinLink}
                    className="bg-transparent text-xs text-zinc-300 flex-1 outline-none truncate"
                  />
                  <button
                    onClick={copyLink}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
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
        <DialogContent className="bg-zinc-950 border-zinc-800 rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-[calc(100vw-2rem)] p-5 sm:p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-white">Join a Group</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1.5">Invite Token</label>
              <Input
                placeholder="Paste token or link suffix"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-11 text-base placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </div>

            <button
              onClick={joinGroup}
              disabled={loading || !token.trim()}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-98"
            >
              {loading ? "Joining..." : "Join Group"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
