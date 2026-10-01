import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import "@/models";
import mongoose, { Types } from "mongoose";
import GroupClient from "../[groupId]/GroupClient";
import { getGroupHistory } from "@/lib/queries/group";
import { simplifyDebts } from "@/lib/services/balance";

export default async function GroupPage(props: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await props.params;

  const session = await auth();
  if (!session?.user?.id) redirect("/");

  if (!Types.ObjectId.isValid(groupId)) {
    return <div className="p-8 text-white">Invalid group</div>;
  }

  await connectToDatabase();

  const Group = mongoose.models.Group;
  const GroupMember = mongoose.models.GroupMember;
  const LedgerEntry = mongoose.models.LedgerEntry;

  const objectId = new Types.ObjectId(groupId);
  const currentUserId = session.user.id;

  // 1️⃣ Validate membership using session.user.id directly (0 redundant user DB queries)
  const membership = await GroupMember.findOne({
    groupId: objectId,
    userId: new Types.ObjectId(currentUserId),
  }).lean();

  if (!membership) {
    return <div className="p-8 text-white">Not allowed</div>;
  }

  // 2️⃣ Execute all data queries in parallel with Promise.all to eliminate sequential DB waterfalls
  const [group, members, balancesAgg, history] = await Promise.all([
    Group.findById(objectId).lean(),
    GroupMember.find({ groupId: objectId })
      .populate("userId", "name email")
      .lean(),
    LedgerEntry.aggregate([
      { $match: { groupId: objectId } },
      {
        $group: {
          _id: "$userId",
          balance: { $sum: "$delta" },
        },
      },
    ]),
    getGroupHistory(groupId),
  ]);

  const balancesMap: Record<string, number> = {};
  balancesAgg.forEach((b: any) => {
    balancesMap[b._id.toString()] = b.balance;
  });

  const formattedMembers = members.map((m: any) => ({
    _id: m._id.toString(),
    role: m.role,
    name: m.userId?.name || m.userId?.email?.split("@")[0] || "Member",
    email: m.userId?.email || "",
    userId: m.userId?._id?.toString(),
    balance: balancesMap[m.userId?._id?.toString()] || 0,
  }));

  const settlementsToShow = simplifyDebts(
    formattedMembers.map((m) => ({
      name: m.name,
      balance: m.balance,
    }))
  );

  return (
    <GroupClient
      group={{
        _id: group?._id?.toString(),
        name: group?.name || "Group",
      }}
      currentUserId={currentUserId}
      members={formattedMembers}
      history={history}
      settlements={settlementsToShow}
    />
  );
}
