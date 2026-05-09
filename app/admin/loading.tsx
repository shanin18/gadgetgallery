export default function AdminLoading() {
  return (
    <div className="grid gap-4 sm:gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-8 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="hidden h-10 w-28 animate-pulse rounded-md bg-muted sm:block" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-card p-3 sm:p-5">
            <div className="h-5 w-5 animate-pulse rounded bg-muted" />
            <div className="mt-5 h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-7 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-card p-3 sm:p-5">
            <div className="h-6 w-36 animate-pulse rounded bg-muted" />
            <div className="mt-5 grid gap-3">
              {Array.from({ length: 3 }).map((__, row) => (
                <div key={row} className="h-14 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
