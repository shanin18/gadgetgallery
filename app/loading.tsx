export default function Loading() {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-background/60 backdrop-blur-md">
      <div className="relative grid h-16 w-16 place-items-center">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-md" />
        <div className="h-14 w-14 animate-spin rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_80deg,hsl(var(--primary))_150deg,hsl(var(--primary))_230deg,transparent_310deg)] shadow-soft">
          <div className="m-[5px] h-[calc(100%-10px)] w-[calc(100%-10px)] rounded-full bg-background" />
        </div>
      </div>
    </div>
  );
}
