import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import User from "@/models/User";

/**
 * Join Page — handles group invite links (/join/[token])
 *
 * [CHANGES MADE]:
 * 1. Fixed bare `catch {}` that silently swallowed all errors.
 *    Now properly checks for duplicate-key error (code 11000) and only
 *    ignores that case (user already in group). All other errors are re-thrown.
 * 2. Added null check for the `user` lookup — previously could crash if
 *    the user document wasn't found in MongoDB.
 * 3. Added a visible error message for invalid invite links instead of a
 *    bare, unstyled <div>.
 */
export default async function JoinPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;

  const session = await auth();
  if (!session?.user?.email) redirect("/");

  await connectToDatabase();

  const user = await User.findOne({ email: session.user.email });

  // [ADDED] Null check — user must exist in DB
  if (!user) {
    redirect("/");
  }

  const group = await Group.findOne({ token });

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Invalid Invite Link</h1>
          <p className="text-zinc-400">
            This invite link is invalid or has expired.
          </p>
          <a href="/dashboard" className="inline-block px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  try {
    await GroupMember.create({
      groupId: group._id,
      userId: user._id,
      role: "member",
    });
  } catch (err: any) {
    // [FIX] Only ignore duplicate-key errors (user already in group).
    // All other errors are re-thrown so they surface properly.
    if (err.code !== 11000) {
      throw err;
    }
  }

  redirect(`/group/${group._id}`);
}
