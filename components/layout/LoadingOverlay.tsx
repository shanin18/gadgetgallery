export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-background/60 backdrop-blur-md">
      <div className="relative grid h-20 w-20 place-items-center sm:h-22 sm:w-22 lg:h-24 lg:w-24">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
        <div className="g-loader-mark" aria-label="Loading GadgetGallery" role="img">G</div>
      </div>
    </div>
  );
}
