import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/db/client";
import type { PermissionCode } from "@/lib/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPlatformAdmin: boolean;
      restaurantId: string | null;
      restaurantSlug: string | null;
      role: string | null;
      permissions: PermissionCode[];
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function loadUserContext(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      restaurants: {
        include: {
          restaurant: { select: { id: true, slug: true, status: true } },
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!user) return null;

  const membership = user.restaurants[0];
  const permissions = (membership?.role.permissions.map(
    (rp) => rp.permission.code,
  ) ?? []) as PermissionCode[];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isPlatformAdmin: user.isPlatformAdmin,
    restaurantId: membership?.restaurant.id ?? null,
    restaurantSlug: membership?.restaurant.slug ?? null,
    role: membership?.role.code ?? null,
    permissions,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        const ctx = await loadUserContext(user.id);
        if (ctx) Object.assign(token, ctx);
      } else if (trigger === "update" && token.sub) {
        const ctx = await loadUserContext(token.sub);
        if (ctx) Object.assign(token, ctx);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? session.user.id;
        session.user.isPlatformAdmin = Boolean(token.isPlatformAdmin);
        session.user.restaurantId = (token.restaurantId as string | null) ?? null;
        session.user.restaurantSlug = (token.restaurantSlug as string | null) ?? null;
        session.user.role = (token.role as string | null) ?? null;
        session.user.permissions = (token.permissions as PermissionCode[]) ?? [];
      }
      return session;
    },
  },
});
