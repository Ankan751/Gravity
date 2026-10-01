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
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days persistent cookie
  },
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    /**
     * signIn callback — upserts the user into MongoDB on login.
     * Sets user.id to the MongoDB _id so it can be saved into the JWT cookie.
     */
    async signIn({ user }) {
      try {
        if (!user?.email) {
          return false;
        }

        await connectToDatabase();
        const existingUser = await User.findOne({ email: user.email });
        const resolvedName = user.name?.trim() || user.email.split("@")[0];

        let dbId: string;
        if (!existingUser) {
          const newUser = new User({
            email: user.email,
            name: resolvedName,
            image: user.image ?? undefined,
          });
          await newUser.save();
          dbId = newUser._id.toString();
        } else {
          dbId = existingUser._id.toString();
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

        // Attach DB ID to user object so jwt callback receives it
        user.id = dbId;
        return true;
      } catch (error) {
        console.error("Error during sign-in callback:", error);
        return false;
      }
    },

    /**
     * jwt callback — persists the MongoDB user ID directly inside the encrypted JWT cookie.
     * Only runs once on sign-in or token refresh, avoiding repeated DB lookups.
     */
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },

    /**
     * session callback — reads the user ID directly from the decrypted JWT cookie.
     * Zero database calls are made here, maximizing speed on every request.
     */
    async session({ session, token }) {
      if (token) {
        if (token.id) {
          session.user.id = token.id as string;
        } else if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },

    /**
     * redirect callback — after sign-in, redirect to /dashboard
     */
    async redirect({ url, baseUrl }) {
      if (url === baseUrl || url === `${baseUrl}/` || url.includes("/api/auth")) {
        return `${baseUrl}/dashboard`;
      }
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
});
