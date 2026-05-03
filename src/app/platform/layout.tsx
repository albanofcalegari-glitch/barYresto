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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/platform" className="font-bold text-brand-500">
            baryresto · plataforma
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/platform/restaurants" className="hover:underline">
              Restaurantes
            </Link>
            <Link href="/admin" className="hover:underline">
              Volver al admin
            </Link>
            <span className="text-zinc-500">· {session.user.email}</span>
            <form action={logoutAction}>
              <button className="text-zinc-300 hover:text-white">salir</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
