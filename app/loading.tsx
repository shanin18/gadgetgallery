export default function Loading() {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-background/60 backdrop-blur-md">
      <div className="relative h-14 w-14">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-primary/20"></div>

        {/* Spinning Ring */}
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-primary border-r-primary"></div>

        {/* Glow */}
        <div className="absolute inset-2 rounded-full bg-primary/10 blur-md"></div>
      </div>
    </div>
  );
}
