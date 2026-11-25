/** Placeholders shown while a page streams in. Shapes mirror the real layout so nothing jumps. */
function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-card bg-surface-2 motion-reduce:animate-none ${className}`} />;
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <Block className="aspect-[2/3] w-full" />
          <Block className="mt-2.5 h-4 w-3/4 !rounded" />
          <Block className="mt-1.5 h-3 w-1/2 !rounded" />
        </li>
      ))}
    </ul>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="page pt-8 sm:pt-12" role="status" aria-label="Ачаалж байна">
      <Block className="h-9 w-40 !rounded-lg" />
      <Block className="mt-4 h-4 w-full max-w-xl !rounded" />
      <div className="mt-8 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Block key={i} className="h-10 w-28 !rounded-full" />
        ))}
      </div>
      <div className="mt-10">
        <GridSkeleton />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="page grid gap-8 pb-10 pt-10 sm:pt-16 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] lg:gap-12" role="status" aria-label="Ачаалж байна">
      <Block className="mx-auto aspect-[2/3] w-44 md:mx-0 md:w-full" />
      <div className="self-end">
        <Block className="h-3 w-32 !rounded" />
        <Block className="mt-4 h-10 w-full max-w-md !rounded-lg" />
        <div className="mt-5 flex gap-2">
          {[0, 1, 2].map((i) => (
            <Block key={i} className="h-6 w-16 !rounded-full" />
          ))}
        </div>
        <Block className="mt-6 h-4 w-full max-w-2xl !rounded" />
        <Block className="mt-2 h-4 w-full max-w-xl !rounded" />
        <Block className="mt-2 h-4 w-2/3 max-w-lg !rounded" />
        <Block className="mt-7 h-12 w-48 !rounded-full" />
      </div>
    </div>
  );
}
