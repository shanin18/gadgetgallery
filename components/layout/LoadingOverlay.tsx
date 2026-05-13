"use client";

import Image from "next/image";
import { CSSProperties, useEffect, useState } from "react";

export function LoadingOverlay() {
  const [progress, setProgress] = useState(0);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference + (progress / 100) * circumference;

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(94, 100 * (1 - Math.exp(-elapsed / 1600)));
      setProgress(nextProgress);
    }, 80);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-background/70 backdrop-blur-md">
      <div className="g-loader" aria-label="Loading GadgetGallery" role="status">
        <span className="sr-only">Loading</span>
        <svg className="g-loader-svg" viewBox="0 0 112 112" fill="none" aria-hidden="true">
          <circle className="g-loader-track" cx="56" cy="56" r={radius} fill="none" />
          <circle
            className="g-loader-progress"
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            style={
              {
                "--loader-offset": progressOffset
              } as CSSProperties
            }
          />
        </svg>
        <span className="relative z-10 block h-6 w-6 sm:h-7 sm:w-7">
          <Image src="/brand/gadget-gallery-logo.png" alt="" fill sizes="28px" className="object-contain" priority />
        </span>
      </div>
    </div>
  );
}
