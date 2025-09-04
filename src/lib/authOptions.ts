/* eslint-disable @typescript-eslint/no-explicit-any */
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { UserService } from "@services/user.service";
import { cookies } from "next/headers";
import { sanitizeUsername } from "@utils/sanitizeUsername";
import logger from "./utils/logger";

const userService = new UserService();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000,
      },
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, ...message) {
      logger.error(`NextAuth error ${code}: ${message}`);
    },
    warn(code, ...message) {
      logger.warn(`NextAuth warning ${code}: ${message}`);
    },
    debug(code, ...message) {
      if (process.env.NODE_ENV === "development") {
        logger.debug(`NextAuth debug ${code}:`, { message });
      }
    },
  },
  callbacks: {
    async signIn({ user, profile }: { user: any; profile?: any }) {
      if (!user?.email) return false;

      console.log("Profile:", profile);

      const currentUser = await userService.findUser({ email: user.email });
      if (currentUser) {
        return true;
      }

      const sanitizedUsername = sanitizeUsername(user.email);

      let cookieStore, refUsername;
      try {
        cookieStore = await cookies();
        refUsername = cookieStore.get("ref")?.value;
      } catch (err) {
        console.error("Error accessing cookies:", err);
      }

      let invitedById: string | undefined;
      if (refUsername) {
        const refUser = await userService.findUser({ username: refUsername });
        if (refUser) {
          invitedById = refUser.id;
        } else {
          console.warn(`Referrer user not found: ${refUsername}`);
        }
      }

      const newUser = await userService.createUser({
        email: user.email,
        name: user.name,
        username: sanitizedUsername,
        avatarUrl: user.image,
        invitedBy: invitedById ? { connect: { id: invitedById } } : undefined,
      });

      user.id = newUser.id;
      user.username = newUser.username;

      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.username = user.username || user.email.split("@")[0];
      } else {
        try {
          const updatedUser = await userService.findUser({
            email: token.email,
          });

          if (updatedUser) {
            token.id = updatedUser.id;
            token.username = updatedUser.username;
          }
        } catch (error) {
          console.error("Error fetching updated user:", error);
        }
      }

      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.picture;
      session.user.username = token.username;
      return session;
    },
  },
};
