import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const rawUsername = credentials?.username;
        const password = credentials?.password;
        if (typeof rawUsername !== "string" || typeof password !== "string") {
          return null;
        }
        const username = rawUsername.trim();

        const admin = await prisma.admin.findFirst({
          where: { username: { equals: username, mode: "insensitive" } },
        });
        if (!admin) return null;

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) return null;

        return {
          id: admin.id,
          name: admin.username,
          isSuperAdmin: admin.isSuperAdmin,
          canManageWiki: admin.canManageWiki,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isSuperAdmin = (user as { isSuperAdmin: boolean }).isSuperAdmin;
        token.canManageWiki = (user as { canManageWiki: boolean }).canManageWiki;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
        session.user.canManageWiki = token.canManageWiki as boolean;
      }
      return session;
    },
  },
});
