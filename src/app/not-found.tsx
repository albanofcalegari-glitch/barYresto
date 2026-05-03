import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">
      <div className="text-center">
        <div className="font-serif text-6xl text-gold mb-4">404</div>
        <h1 className="font-serif text-2xl mb-2">Página no encontrada</h1>
        <p className="text-zinc-500 font-light mb-8">
          La página que buscás no existe o fue movida.
        </p>
        <Link href="/" className="pub-btn-outline">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
