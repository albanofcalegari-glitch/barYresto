"use client";

import { useState, useTransition } from "react";

export function ReservationForm({
  action,
  restaurantName,
  waLink,
  cancelBaseUrl,
}: {
  action: (formData: FormData) => Promise<string>;
  restaurantName: string;
  waLink: string | null;
  cancelBaseUrl: string;
}) {
  const [pending, startTransition] = useTransition();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const t = await action(formData);
        setToken(t);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al reservar");
      }
    });
  }

  if (token) {
    return (
      <div className="text-center space-y-5 max-w-xl mx-auto bg-white/5 border border-white/10 p-8 md:p-10">
        <div className="text-gold text-5xl font-serif">✓</div>
        <h2 className="font-serif text-2xl md:text-3xl">Reserva recibida</h2>
        <p className="text-zinc-400 font-light">
          Te contactamos pronto para confirmar. Guardá este código por si necesitás cancelar:
        </p>
        <div className="font-mono bg-white/10 border border-white/10 px-4 py-2 inline-block text-sm text-gold">
          {token}
        </div>
        <div className="flex flex-col gap-2">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gold hover:underline"
            >
              Confirmá más rápido por WhatsApp →
            </a>
          )}
          <a
            href={`${cancelBaseUrl}?token=${token}`}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ¿Necesitás cancelar?
          </a>
        </div>
      </div>
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <form action={handleSubmit} className="space-y-5 max-w-xl mx-auto bg-white/5 border border-white/10 p-6 md:p-8">
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Nombre *</label>
          <input
            name="contactName"
            required
            minLength={2}
            maxLength={80}
            className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-gold transition-colors"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Teléfono *</label>
          <input
            name="contactPhone"
            required
            type="tel"
            className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-gold transition-colors"
            placeholder="11 2345-6789"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Email (opcional)</label>
        <input
          name="contactEmail"
          type="email"
          className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-gold transition-colors"
          placeholder="tu@email.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Fecha *</label>
          <input
            name="date"
            type="date"
            required
            min={minDate}
            className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Hora *</label>
          <input
            name="time"
            type="time"
            required
            className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Personas *</label>
          <input
            name="pax"
            type="number"
            required
            min={1}
            max={50}
            defaultValue={2}
            className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Notas (opcional)</label>
        <textarea
          name="notes"
          maxLength={500}
          rows={2}
          className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-gold transition-colors"
          placeholder="Cumpleaños, alergias, silla para bebé..."
        />
      </div>

      <button
        disabled={pending}
        className="pub-btn-gold w-full py-4 disabled:opacity-50"
      >
        {pending ? "Enviando..." : `Reservar en ${restaurantName}`}
      </button>

      <p className="text-xs text-zinc-600 text-center font-light">
        Al enviar, aceptás que te contactemos para confirmar la reserva.
      </p>
    </form>
  );
}
