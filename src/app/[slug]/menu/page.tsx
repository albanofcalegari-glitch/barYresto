import { prisma } from "@/db/client";
import { getPublicRestaurantBySlug } from "@/lib/tenant";
import { formatMoneyArs } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const restaurant = await getPublicRestaurantBySlug(params.slug);
  return { title: `Carta · ${restaurant.name}` };
}

export default async function PublicMenuPage({
  params,
}: {
  params: { slug: string };
}) {
  const restaurant = await getPublicRestaurantBySlug(params.slug);

  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId: restaurant.id, visible: true },
    orderBy: { orderIndex: "asc" },
    include: {
      items: {
        where: { available: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  const nonEmpty = categories.filter((c) => c.items.length > 0);

  if (nonEmpty.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-4xl mb-4">Carta</h1>
        <p className="text-zinc-500 font-light">
          Estamos actualizando la carta. Volvé pronto.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-light">
          Nuestra carta
        </span>
        <h1 className="font-serif text-4xl md:text-5xl mt-4 mb-3">Carta</h1>
        <div className="w-12 h-px bg-gold/40 mx-auto mb-4" />
        <p className="text-sm text-zinc-500 font-light">
          Precios en pesos argentinos. Valores sujetos a cambio.
        </p>
      </div>

      {/* Category nav */}
      <nav className="mb-12 flex flex-wrap gap-2 justify-center sticky top-16 bg-zinc-950/90 backdrop-blur-sm py-4 z-10 border-b border-th-border">
        {nonEmpty.map((c) => (
          <a
            key={c.id}
            href={`#cat-${c.id}`}
            className="text-xs uppercase tracking-widest px-4 py-2 border border-th-border hover:border-gold hover:text-gold transition-colors duration-300"
          >
            {c.name}
          </a>
        ))}
      </nav>

      {/* Categories */}
      <div className="space-y-16">
        {nonEmpty.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-32">
            <div className="mb-6">
              <h2 className="font-serif text-2xl md:text-3xl">{cat.name}</h2>
              {cat.description && (
                <p className="text-sm text-zinc-500 font-light mt-1">{cat.description}</p>
              )}
              <div className="w-8 h-px bg-gold/40 mt-3" />
            </div>

            <div className="divide-y divide-th-border">
              {cat.items.map((it) => (
                <article key={it.id} className="py-5 flex gap-4 items-start group">
                  {it.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.imageUrl}
                      alt={it.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover border border-th-border flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-lg group-hover:text-gold transition-colors">
                        {it.name}
                        {it.featured && (
                          <span className="ml-2 text-gold text-sm">★</span>
                        )}
                      </h3>
                      <div className="text-gold font-medium whitespace-nowrap">
                        {formatMoneyArs(it.priceCents)}
                      </div>
                    </div>
                    {it.description && (
                      <p className="text-sm text-zinc-500 mt-1 font-light">
                        {it.description}
                      </p>
                    )}
                    {it.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {it.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] uppercase tracking-wide text-zinc-500 border border-th-border px-2 py-0.5"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
