import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import "@/models";
import mongoose from "mongoose";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  await connectToDatabase();

  const GroupMember = mongoose.models.GroupMember;

  // Directly query memberships using user id stored in the JWT cookie (0 redundant user lookups)
  const memberships = await GroupMember.find({
    userId: session.user.id,
  })
    .populate("groupId", "name")
    .lean();

  const groups = memberships.map((m: any) => ({
    _id: m.groupId?._id?.toString(),
    name: m.groupId?.name,
  }));

  return (
    <div className="relative z-10">
      <DashboardClient
        user={{
          name: session.user.name || "User",
          email: session.user.email || "",
        }}
        groups={groups}
      />
    </div>
  );
}
