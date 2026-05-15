"use client";

import { useState, useTransition } from "react";

export function CancelForm({
  action,
  defaultToken,
}: {
  action: (token: string) => Promise<void>;
  defaultToken?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    const token = String(formData.get("token") ?? "").trim();
    if (!token) return;

    setError(null);
    startTransition(async () => {
      try {
        await action(token);
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cancelar");
      }
    });
  }

  if (done) {
    return (
      <div className="text-center space-y-4 bg-surface-elevated border border-th-border p-8">
        <div className="text-gold text-4xl font-serif">✓</div>
        <h2 className="font-serif text-2xl">Reserva cancelada</h2>
        <p className="text-th-text-muted font-light text-sm">
          Tu reserva fue cancelada correctamente.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="bg-surface-elevated border border-th-border p-6 space-y-5">
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs uppercase tracking-widest text-th-text-muted mb-2">
          Código de reserva
        </label>
        <input
          name="token"
          required
          defaultValue={defaultToken ?? ""}
          className="w-full bg-surface-elevated border border-th-border px-4 py-3 text-sm text-th-text-primary placeholder:text-zinc-600 focus:outline-none focus:border-gold transition-colors font-mono"
          placeholder="ABC123XY"
        />
      </div>

      <button
        disabled={pending}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm uppercase tracking-widest font-medium transition-colors disabled:opacity-50"
      >
        {pending ? "Cancelando..." : "Cancelar reserva"}
      </button>

      <p className="text-xs text-zinc-600 text-center font-light">
        Esta acción no se puede deshacer.
      </p>
    </form>
  );
}
