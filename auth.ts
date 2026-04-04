import Google from "next-auth/providers/google";
import NextAuth from "next-auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? process.env.GoogleClientID;
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ?? process.env.GoogleClientSecret;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing Google OAuth env vars. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    /**
     * [CHANGE] signIn callback — upserts the user into MongoDB on every login.
     * If the user already exists, we update their name/image only if they changed
     * on the Google side. This keeps the DB in sync with the OAuth provider.
     */
    async signIn({ user }) {
      try {
        if (!user?.email) {
          return false;
        }

        await connectToDatabase();
        const existingUser = await User.findOne({ email: user.email });
        const resolvedName = user.name?.trim() || user.email.split("@")[0];

        if (!existingUser) {
          const newUser = new User({
            email: user.email,
            name: resolvedName,
            image: user.image ?? undefined,
          });
          await newUser.save();
        } else {
          const nextName = user.name?.trim();
          const nextImage = user.image ?? undefined;

          if (
            (nextName && existingUser.name !== nextName) ||
            existingUser.image !== nextImage
          ) {
            existingUser.name = nextName || existingUser.name;
            existingUser.image = nextImage;
            await existingUser.save();
          }
        }

        return true;
      } catch (error) {
        console.error("Error during sign-in callback:", error);
        return false;
      }
    },

    /**
     * [ADDED] session callback — attaches the MongoDB _id to the session object.
     * This eliminates the need for User.findOne({ email }) in every API route,
     * as session.user.id will now contain the MongoDB ObjectId string.
     */
    async session({ session }) {
      if (session?.user?.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: session.user.email }).lean() as any;
        if (dbUser) {
          session.user.id = dbUser._id.toString();
        }
      }
      return session;
    },

    /**
     * [ADDED] redirect callback — after sign-in, always redirect to /dashboard
     * instead of the default home page.
     */
    async redirect({ url, baseUrl }) {
      // If the URL is a relative callback or the signin page, go to dashboard
      if (url === baseUrl || url === `${baseUrl}/` || url.includes("/api/auth")) {
        return `${baseUrl}/dashboard`;
      }
      // For other URLs (e.g., callbackUrl from a protected page), respect them
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
});
