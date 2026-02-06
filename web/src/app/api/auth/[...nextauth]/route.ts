import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { upsertUserFromGoogle, initDatabase } from "@/lib/db";

// Initialize database on first load
let dbInitialized = false;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile) {
        try {
          // Initialize database if not done
          if (!dbInitialized) {
            await initDatabase();
            dbInitialized = true;
          }

          // Create or update user in MySQL
          await upsertUserFromGoogle({
            sub: profile.sub as string,
            email: profile.email as string,
            name: profile.name,
            picture: (profile as { picture?: string }).picture,
          });
          return true;
        } catch (error) {
          console.error("Error saving user to database:", error);
          return true; // Still allow sign in even if DB fails
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.googleId = profile.sub;
        token.picture = (profile as { picture?: string }).picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.googleId as string;
        (session.user as { image?: string }).image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Use homepage for sign in
    error: "/", // Redirect errors to homepage
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
