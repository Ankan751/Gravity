import { connectToDatabase } from "@/lib/db";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import User from "@/models/User";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/cache";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectToDatabase();

  const { token } = await request.json();
  if (!token?.trim()) {
    return new Response("Token required", { status: 400 });
  }

  const group = await Group.findOne({ token: token.trim() });
  if (!group) return new Response("Invalid invite link", { status: 404 });

  try {
    await GroupMember.create({
      groupId: group._id,
      userId: session.user.id,
      role: "member",
    });
  } catch (err: any) {
    if (err.code !== 11000) throw err;
  }

  invalidateCache(`group:${group._id}`);
  revalidatePath("/dashboard");
  revalidatePath(`/group/${group._id}`);

  return Response.json({
    groupId: group._id.toString(),
  });
}
