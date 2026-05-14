import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/rbac";
import { signOut } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePlatformAdmin();

  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-surface text-zinc-100">
      <header className="border-b border-white/[0.06] bg-surface-card">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/platform" className="font-bold bg-gradient-to-r from-brand-500 to-brand-300 bg-clip-text text-transparent">
            baryresto · plataforma
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/platform/restaurants" className="text-zinc-400 hover:bg-brand-500/10 hover:text-brand-300 px-2 py-1 rounded">
              Restaurantes
            </Link>
            <Link href="/platform/users" className="text-zinc-400 hover:bg-brand-500/10 hover:text-brand-300 px-2 py-1 rounded">
              Usuarios
            </Link>
            <span className="text-zinc-500">· {session.user.email}</span>
            <form action={logoutAction}>
              <button className="text-zinc-400 hover:text-zinc-100">salir</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
