import mongoose, { Types } from "mongoose";
import crypto from "crypto";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { auth } from "@/auth";
import { headers } from "next/headers";

/**
 * POST /api/groups
 *
 * Creates a new group and adds the creator as an admin member.
 *
 * [CHANGES MADE]:
 * 1. Return the full absolute join URL (with origin) instead of a relative
 *    path, so the link works correctly when copied and shared externally.
 * 2. Added comments documenting the transaction logic.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectToDatabase();

  const { groupName } = await request.json();
  if (!groupName?.trim()) {
    return new Response("Group name required", { status: 400 });
  }

  const userId = new Types.ObjectId(session.user.id);

  // Use a MongoDB session/transaction to ensure both the group and the
  // admin membership are created atomically — if one fails, both roll back.
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const token = crypto.randomBytes(8).toString("hex");

    const [group] = await Group.create(
      [
        {
          name: groupName.trim(),
          token,
          createdBy: userId,
        },
      ],
      { session: dbSession }
    );

    await GroupMember.create(
      [
        {
          groupId: group._id,
          userId: userId,
          role: "admin",
        },
      ],
      { session: dbSession }
    );

    await dbSession.commitTransaction();
    dbSession.endSession();

    // [CHANGED] Build the full absolute URL so it works when shared externally
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;

    return Response.json(
      {
        groupId: group._id.toString(),
        joinLink: `${origin}/join/${token}`,
      },
      { status: 201 }
    );
  } catch (err) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    return new Response("Failed to create group", { status: 500 });
  }
}
