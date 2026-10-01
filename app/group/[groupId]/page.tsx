import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import "@/models";
import mongoose, { Types } from "mongoose";
import GroupClient from "../[groupId]/GroupClient";
import { getGroupHistory, HistoryItem } from "@/lib/queries/group";
import { simplifyDebts } from "@/lib/services/balance";
import { getCached, setCached } from "@/lib/cache";

type GroupPagePayload = {
  group: {
    _id: string;
    name: string;
  };
  members: Array<{
    _id: string;
    role: string;
    name: string;
    email: string;
    userId: string;
    balance: number;
  }>;
  history: HistoryItem[];
  settlements: Array<{
    from: string;
    to: string;
    amount: number;
  }>;
};

/**
 * Cached group data loader: serves cached group payload in 0ms on repeat visits
 */
async function getGroupPagePayload(groupId: string): Promise<GroupPagePayload | null> {
  const cacheKey = `group:${groupId}:data`;
  const cached = getCached<GroupPagePayload>(cacheKey);
  if (cached) {
    return cached;
  }

  await connectToDatabase();

  const Group = mongoose.models.Group;
  const GroupMember = mongoose.models.GroupMember;
  const LedgerEntry = mongoose.models.LedgerEntry;
  const objectId = new Types.ObjectId(groupId);

  // Execute all group data queries in parallel
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

  if (!group) return null;

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

  const payload: GroupPagePayload = {
    group: {
      _id: group._id.toString(),
      name: group.name || "Group",
    },
    members: formattedMembers,
    history,
    settlements: settlementsToShow,
  };

  // Cache for 60 seconds (invalidated automatically on new expenses/settlements)
  setCached(cacheKey, payload, 60);

  return payload;
}

export default async function GroupPage(props: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await props.params;

  const session = await auth();
  if (!session?.user?.id) redirect("/");

  if (!Types.ObjectId.isValid(groupId)) {
    return <div className="p-8 text-white">Invalid group</div>;
  }

  const currentUserId = session.user.id;
  const objectId = new Types.ObjectId(groupId);

  // 1️⃣ Membership check with 5-minute memory cache
  const memberCacheKey = `group:${groupId}:member:${currentUserId}`;
  let isMember = getCached<boolean>(memberCacheKey);

  if (isMember === null) {
    await connectToDatabase();
    const GroupMember = mongoose.models.GroupMember;
    const membership = await GroupMember.findOne({
      groupId: objectId,
      userId: new Types.ObjectId(currentUserId),
    }).lean();

    isMember = !!membership;
    if (isMember) {
      setCached(memberCacheKey, true, 300); // Cache membership for 5 minutes
    }
  }

  if (!isMember) {
    return <div className="p-8 text-white">Not allowed</div>;
  }

  // 2️⃣ Load cached group payload (0ms on cache hit)
  const data = await getGroupPagePayload(groupId);

  if (!data) {
    return <div className="p-8 text-white">Group not found</div>;
  }

  return (
    <GroupClient
      group={data.group}
      currentUserId={currentUserId}
      members={data.members}
      history={data.history}
      settlements={data.settlements}
    />
  );
}
