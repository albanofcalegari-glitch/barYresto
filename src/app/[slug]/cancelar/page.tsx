import { getPublicRestaurantBySlug } from "@/lib/tenant";
import { CancelForm } from "./cancel-form";
import { cancelByToken } from "@/modules/reservations/actions";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const restaurant = await getPublicRestaurantBySlug(params.slug);
  return { title: `Cancelar reserva · ${restaurant.name}` };
}

export default async function CancelPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { token?: string };
}) {
  const restaurant = await getPublicRestaurantBySlug(params.slug);

  async function handleCancel(token: string): Promise<void> {
    "use server";
    await cancelByToken(token);
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-light">
          {restaurant.name}
        </span>
        <h1 className="font-serif text-3xl md:text-4xl mt-4 mb-3">Cancelar reserva</h1>
        <div className="w-12 h-px bg-gold/40 mx-auto mb-4" />
        <p className="text-zinc-500 font-light text-sm">
          Ingresá el código que recibiste al reservar.
        </p>
      </div>

      <CancelForm action={handleCancel} defaultToken={searchParams.token} />
    </div>
  );
}
