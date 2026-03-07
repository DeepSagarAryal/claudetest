import { NextAuthOptions } from "next-auth";
import HubspotProvider from "next-auth/providers/hubspot";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    HubspotProvider({
      clientId: process.env.HUBSPOT_CLIENT_ID!,
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          hubspotId: account?.providerAccountId,
        },
        create: {
          email: user.email,
          name: user.name,
          role: Role.REP,
          hubspotId: account?.providerAccountId,
        },
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
