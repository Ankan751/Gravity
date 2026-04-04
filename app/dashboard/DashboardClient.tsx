"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    } catch {
      setNotification("Failed to create group");
      setTimeout(() => setNotification(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinLink);
    setNotification("Invite link copied!");
    setTimeout(() => setNotification(""), 2000);
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-zinc-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-[-300px] right-[-200px] w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-violet-500/8 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-emerald-600/90 backdrop-blur-md shadow-2xl shadow-emerald-500/20 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            {notification}
          </div>
        )}

        {/* Navbar */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center font-bold text-lg text-white">
              S
            </div>
            <span className="text-xl font-bold tracking-tight">
              Split<span className="text-emerald-400">Ease</span>
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-all"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome Card */}
        <div className="glass-card rounded-2xl p-8 glow-emerald">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl gradient-emerald flex items-center justify-center text-3xl font-bold text-white shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {user.name ?? "User"} 👋
              </h1>
              <p className="text-zinc-400 text-sm mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-gradient-emerald">{groups.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Active Groups</div>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-gradient-violet">∞</div>
            <div className="text-xs text-zinc-500 mt-1">Unlimited Splits</div>
          </div>
          <div className="hidden sm:block glass-card rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-emerald-400">₹</div>
            <div className="text-xs text-zinc-500 mt-1">Currency</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setCreateOpen(true);
              setGroupName("");
              setJoinLink("");
            }}
            className="glass-card rounded-2xl p-6 text-center group hover:border-emerald-500/30 transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 mx-auto rounded-2xl gradient-emerald flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
              ＋
            </div>
            <div className="font-bold text-lg">Create Group</div>
            <p className="text-xs text-zinc-500 mt-1">Start a new expense group</p>
          </button>

          <button
            onClick={() => {
              setJoinOpen(true);
              setToken("");
            }}
            className="glass-card rounded-2xl p-6 text-center group hover:border-violet-500/30 transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 mx-auto rounded-2xl gradient-violet flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
              🔗
            </div>
            <div className="font-bold text-lg">Join Group</div>
            <p className="text-xs text-zinc-500 mt-1">Enter an invite token</p>
          </button>
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-emerald-500" />
            Your Groups
          </h2>

          {groups.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                Create your first group or join one using an invite token to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {groups.map((group, index) => (
                <div
                  key={group._id}
                  onClick={() => router.push(`/group/${group._id}`)}
                  className="glass-card rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-emerald-500/20 transition-all duration-300 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0 ${index % 2 === 0 ? "gradient-emerald" : "gradient-violet"
                      }`}
                  >
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg truncate group-hover:text-emerald-400 transition-colors">
                      {group.name}
                    </div>
                    <p className="text-xs text-zinc-500">Tap to view details</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-colors shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#12121a] border-zinc-800/50 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center text-sm">＋</span>
              Create New Group
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <Input
              className="bg-[#1e1e2e] border-zinc-800 rounded-xl h-12 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              placeholder="e.g. Goa Trip, Apartment Bills"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmGroupCreation()}
            />

            <Button
              className="w-full rounded-xl h-12 gradient-emerald hover:opacity-90 font-semibold text-white border-0"
              onClick={confirmGroupCreation}
              disabled={loading || !groupName.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Group"
              )}
            </Button>

            {joinLink && (
              <div className="space-y-3 pt-2">
                <p className="text-sm text-zinc-400">Share this invite link:</p>
                <div className="p-3 bg-[#1e1e2e] rounded-xl text-sm break-all text-emerald-400 border border-emerald-500/20">
                  {joinLink}
                </div>
                <Button
                  variant="secondary"
                  className="w-full rounded-xl bg-[#1e1e2e] hover:bg-zinc-800 border border-zinc-800"
                  onClick={copyLink}
                >
                  📋 Copy Invite Link
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* JOIN DIALOG */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="bg-[#12121a] border-zinc-800/50 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg gradient-violet flex items-center justify-center text-sm">🔗</span>
              Join a Group
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <Input
              className="bg-[#1e1e2e] border-zinc-800 rounded-xl h-12 focus:border-violet-500/50 focus:ring-violet-500/20"
              placeholder="Paste the invite token here"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinGroup()}
            />
            <Button
              className="w-full rounded-xl h-12 gradient-violet hover:opacity-90 font-semibold text-white border-0"
              onClick={joinGroup}
              disabled={loading || !token.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Joining...
                </span>
              ) : (
                "Join Group"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
