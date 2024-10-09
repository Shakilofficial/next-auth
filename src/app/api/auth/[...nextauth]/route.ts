import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          await connectDB();

          // For GitHub, ensure we have an email
          if (account.provider === "github" && !user.email) {
            if (profile?.email) {
              user.email = profile.email;
            } else {
              // If no email is provided, generate a temporary one
              user.email = `${user.id}@github.temporary.com`;
            }
          }

          // Check if user already exists
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user from OAuth data
            const newUser = await User.create({
              email: user.email,
              username:
                user.name || profile?.login || user.email?.split("@")[0], // Use GitHub username if available
              avatar: user.image,
              password: await bcrypt.hash(
                Math.random().toString(36).slice(-8),
                10
              ),
              role: "user",
              provider: account.provider, // Store the provider information
            });

            user.id = newUser._id.toString();
            user.username = newUser.username;
            user.role = newUser.role;
          } else {
            // Update existing user's information if needed
            if (existingUser.avatar !== user.image) {
              await User.findByIdAndUpdate(existingUser._id, {
                avatar: user.image,
              });
            }

            user.id = existingUser._id.toString();
            user.username = existingUser.username;
            user.role = existingUser.role;
            user.avatar = existingUser.avatar;
          }
        } catch (error) {
          console.error("SignIn error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.avatar = user.avatar;
      }

      if (trigger === "update") {
        const updatedUser = await User.findById(token.id).select("-password");
        if (updatedUser) {
          token.username = updatedUser.username;
          token.avatar = updatedUser.avatar;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
