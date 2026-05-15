"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { useState } from "react";
import { BrandLogo } from "@/components/brand";
import { safeRegisterRestaurant } from "@/modules/registration/safe-actions";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export default function RegistroPage() {
  const [state, formAction] = useFormState(safeRegisterRestaurant, {});
  const [slug, setSlug] = useState("");
  const [nameValue, setNameValue] = useState("");

  function handleNameChange(value: string) {
    setNameValue(value);
    if (!slug || slug === slugify(nameValue)) {
      setSlug(slugify(value));
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-brand-300/[0.06] blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center">
            <BrandLogo size="lg" />
          </Link>
          <p className="mt-3 text-sm text-zinc-500 font-light">
            Registra tu restaurante y empeza a recibir reservas
          </p>
        </div>

        {state.error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <form
          action={formAction}
          className="rounded-xl bg-surface-card border border-th-border p-6 space-y-5 backdrop-blur-sm"
        >
          <fieldset className="space-y-4">
            <legend className="text-xs uppercase tracking-widest text-brand-400 font-semibold mb-2">
              Tu restaurante
            </legend>

            <div>
              <label
                className="block text-xs uppercase tracking-widest text-th-text-muted mb-2"
                htmlFor="restaurantName"
              >
                Nombre del negocio
              </label>
              <input
                id="restaurantName"
                name="restaurantName"
                type="text"
                required
                className="input py-3"
                placeholder="La Parrilla de Juan"
                value={nameValue}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div>
              <label
                className="block text-xs uppercase tracking-widest text-th-text-muted mb-2"
                htmlFor="slug"
              >
                URL de tu sitio
              </label>
              <div className="flex items-stretch">
                <span className="inline-flex items-center text-xs text-th-text-muted bg-surface-elevated border border-th-border border-r-0 rounded-l-lg px-3 whitespace-nowrap">
                  baryresto.com/
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  className="input py-3 rounded-l-none border-l-0 flex-1"
                  placeholder="mi-resto"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                />
              </div>
              <p className="mt-1 text-xs text-zinc-600">
                Solo minusculas, numeros y guiones
              </p>
            </div>

            <div>
              <label
                className="block text-xs uppercase tracking-widest text-th-text-muted mb-2"
                htmlFor="phone"
              >
                Telefono (opcional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input py-3"
                placeholder="+54 11 1234-5678"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4 pt-2">
            <legend className="text-xs uppercase tracking-widest text-brand-400 font-semibold mb-2">
              Tu cuenta
            </legend>

            <div>
              <label
                className="block text-xs uppercase tracking-widest text-th-text-muted mb-2"
                htmlFor="ownerName"
              >
                Tu nombre
              </label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                required
                className="input py-3"
                placeholder="Juan García"
              />
            </div>

            <div>
              <label
                className="block text-xs uppercase tracking-widest text-th-text-muted mb-2"
                htmlFor="email"
              >
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
              <label
                className="block text-xs uppercase tracking-widest text-th-text-muted mb-2"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="input py-3"
                placeholder="Minimo 6 caracteres"
              />
            </div>
          </fieldset>

          <button type="submit" className="btn-primary w-full py-3">
            Crear mi restaurante
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Ya tenes cuenta?{" "}
          <Link href="/login" className="text-brand-400 hover:underline">
            Ingresar
          </Link>
        </p>
      </div>
    </main>
  );
}
