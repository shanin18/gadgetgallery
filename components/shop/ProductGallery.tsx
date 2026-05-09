"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const uniqueImages = Array.from(new Set(images)).filter(Boolean);
  const galleryImages = uniqueImages.length ? uniqueImages : [];
  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  if (!activeImage) {
    return <div className="aspect-square rounded-lg bg-muted" />;
  }

  const hasThumbnails = galleryImages.length > 1;

  const thumbnails = hasThumbnails ? (
    <div className="flex gap-3 overflow-x-auto pb-1 md:max-h-[520px] md:flex-col md:overflow-y-auto md:overflow-x-hidden md:pb-0">
      {galleryImages.map((image, index) => {
        const selected = image === activeImage;

        return (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(image)}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted transition md:h-[88px] md:w-[88px] ${
              selected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/60"
            }`}
            aria-label={`Show ${name} image ${index + 1}`}
          >
            <Image src={image} alt={name} fill sizes="88px" className="object-cover" />
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div className={hasThumbnails ? "grid gap-3 md:grid-cols-[88px_minmax(0,1fr)]" : "block"}>
      <div className="hidden md:block">{thumbnails}</div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image src={activeImage} alt={name} fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
      </div>
      <div className="md:hidden">{thumbnails}</div>
    </div>
  );
}
