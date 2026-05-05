export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/45 backdrop-blur-sm">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/60 border-t-primary shadow-soft" />
    </div>
  );
}
