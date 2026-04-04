import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import "@/models"; // 🔥 register all models
import mongoose from "mongoose";
import DashboardClient from "./DashboardClient";
import Hyperspeed from "@/components/Hyperspeed";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  await connectToDatabase();

  // models from mongoose registry
  const User = mongoose.models.User;
  const GroupMember = mongoose.models.GroupMember;

  const user = await User.findOne({
    email: session.user.email,
  }).lean();

  if (!user) {
    redirect("/api/auth/signin");
  }

  const memberships = await GroupMember.find({
    userId: user._id,
  })
    .populate("groupId", "name")
    .lean();

  const groups = memberships.map((m: any) => ({
    _id: m.groupId?._id?.toString(),
    name: m.groupId?.name,
  }));

  return (
  <>
    {/* Background Animation */}
    <div className="fixed inset-0 -z-10">
      <Hyperspeed
        effectOptions={{
          distortion: "turbulentDistortion",
          length: 400,
          roadWidth: 10,
          islandWidth: 2,
          lanesPerRoad: 3,
          fov: 90,
          fovSpeedUp: 150,
          speedUp: 2,
          carLightsFade: 0.4,
          totalSideLightSticks: 20,
          lightPairsPerRoadWay: 40,
          shoulderLinesWidthPercentage: 0.05,
          brokenLinesWidthPercentage: 0.1,
          brokenLinesLengthPercentage: 0.5,
          lightStickWidth: [0.12, 0.5],
          lightStickHeight: [1.3, 1.7],
          movingAwaySpeed: [60, 80],
          movingCloserSpeed: [-120, -160],
          carLightsLength: [12, 80],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.8, 0.8],
          carFloorSeparation: [0, 5],
          colors: {
            roadColor: 526344,
            islandColor: 657930,
            background: 0,
            shoulderLines: 1250072,
            brokenLines: 1250072,
            leftCars: [14177983, 6770850, 12732332],
            rightCars: [242627, 941733, 3294549],
            sticks: 242627,
          },
        }}
      />
    </div>

    {/* UI */}
    <div className="relative z-10">
      <DashboardClient
        user={{
          name: session.user.name,
          email: session.user.email,
        }}
        groups={groups}
      />
    </div>
  </>
);
}
