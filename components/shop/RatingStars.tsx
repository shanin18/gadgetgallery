import { Star } from "lucide-react";

export function RatingStars({ rating, size = 15 }: { rating: number; size?: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          className={value <= rounded ? "fill-accent text-accent" : "fill-muted text-muted-foreground/35"}
        />
      ))}
    </span>
  );
}
