import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ingresar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  if (session?.user) {
    const dest = session.user.isPlatformAdmin ? "/platform" : "/admin";
    redirect(searchParams.callbackUrl ?? dest);
  }

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    await signIn("credentials", { email, password, redirectTo: "/login-redirect" });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-brand-300/[0.06] blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="font-heading text-3xl bg-gradient-to-r from-brand-500 to-brand-300 bg-clip-text text-transparent tracking-wide">
            baryresto
          </Link>
          <p className="mt-3 text-sm text-zinc-500 font-light">Ingresa a tu cuenta</p>
        </div>

        {searchParams.error === "CredentialsSignin" && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            Email o contrasena incorrectos.
          </div>
        )}

        <form action={loginAction} className="rounded-xl bg-surface-card border border-white/[0.08] p-6 space-y-5 backdrop-blur-sm">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input py-3"
              placeholder="vos@restaurante.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2" htmlFor="password">
              Contrasena
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input py-3"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3">
            Ingresar
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-600">
          No tenes cuenta? Contactanos en{" "}
          <a href="mailto:hola@baryresto.app" className="text-brand-400 hover:underline">
            hola@baryresto.app
          </a>
          .
        </p>
      </div>
    </main>
  );
}
