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
  if (session?.user) redirect(searchParams.callbackUrl ?? "/admin");

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const callbackUrl = String(formData.get("callbackUrl") ?? "/admin");

    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-3xl text-gold tracking-wide">
            baryresto
          </Link>
          <p className="mt-3 text-sm text-zinc-500 font-light">Ingresá a tu cuenta</p>
        </div>

        {searchParams.error === "CredentialsSignin" && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            Email o contraseña incorrectos.
          </div>
        )}

        <form action={loginAction} className="bg-white/5 border border-white/10 p-6 space-y-5">
          <input
            type="hidden"
            name="callbackUrl"
            value={searchParams.callbackUrl ?? "/admin"}
          />
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
              className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold transition-colors"
              placeholder="vos@restaurante.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <button type="submit" className="pub-btn-gold w-full py-3">
            Ingresar
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-600">
          ¿No tenés cuenta? Contactanos en{" "}
          <a href="mailto:hola@baryresto.app" className="text-gold hover:underline">
            hola@baryresto.app
          </a>
          .
        </p>
      </div>
    </main>
  );
}
