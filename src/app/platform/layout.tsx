import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/rbac";
import { signOut } from "@/lib/auth";
import { BrandIcon } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <div className="min-h-screen bg-surface text-th-text-primary">
      <header className="border-b border-th-border bg-surface-card">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/platform" className="inline-flex items-center gap-2">
            <BrandIcon size={28} />
            <span className="font-heading font-semibold text-base tracking-tight">
              bary<span className="text-brand-400">resto</span>
              <span className="text-th-text-muted font-normal"> · plataforma</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/platform/restaurants" className="text-th-text-muted hover:bg-brand-500/10 hover:text-brand-300 px-2 py-1 rounded">
              Restaurantes
            </Link>
            <Link href="/platform/users" className="text-th-text-muted hover:bg-brand-500/10 hover:text-brand-300 px-2 py-1 rounded">
              Usuarios
            </Link>
            <ThemeToggle />
            <span className="text-th-text-muted">· {session.user.email}</span>
            <form action={logoutAction}>
              <button className="text-th-text-muted hover:text-red-400 transition-colors">salir</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
