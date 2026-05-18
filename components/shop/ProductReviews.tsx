"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, ImageUp, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { RatingStars } from "@/components/shop/RatingStars";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  createdAt: string | Date;
  user: { id?: string | null; name: string | null; image: string | null };
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read image file."));
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

export function ProductReviews({ productId, initialReviews }: { productId: string; initialReviews: Review[] }) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted]);

  function openReviewModal() {
    if (status === "unauthenticated") {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setEditingReviewId(null);
    setRating(5);
    setComment("");
    setImageUrls([]);
    setMounted(true);
    window.requestAnimationFrame(() => setOpen(true));
  }

  function openEditModal(review: Review) {
    setMenuOpenId(null);
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment ?? "");
    setImageUrls(Array.isArray(review.images) ? review.images : []);
    setMounted(true);
    window.requestAnimationFrame(() => setOpen(true));
  }

  function closeReviewModal() {
    setOpen(false);
    window.setTimeout(() => {
      setMounted(false);
      setEditingReviewId(null);
      setMessage("");
    }, 180);
  }

  function showPreviousImage() {
    setLightbox((current) => current ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length } : current);
  }

  function showNextImage() {
    setLightbox((current) => current ? { ...current, index: (current.index + 1) % current.images.length } : current);
  }

  function handleLightboxTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX == null || !lightbox || lightbox.images.length < 2) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);

    if (Math.abs(delta) < 45) return;
    if (delta > 0) showPreviousImage();
    else showNextImage();
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    setMessage("");
    setIsUploading(true);

    try {
      const remainingSlots = Math.max(6 - imageUrls.length, 0);
      const selectedFiles = Array.from(files).slice(0, remainingSlots);
      const uploadedUrls = await Promise.all(selectedFiles.map(async (file) => {
        const dataUrl = await fileToDataUrl(file);
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: dataUrl })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.url) {
          throw new Error(data.error ?? "Image upload failed.");
        }

        return data.url as string;
      }));

      setImageUrls((current) => [...current, ...uploadedUrls]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function refreshReviews() {
    const listResponse = await fetch(`/api/reviews?productId=${productId}`);
    const listData = await listResponse.json();
    setReviews(listData.reviews ?? []);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment, images: imageUrls })
      });
      const responseText = await response.text();
      let data: { error?: string } = {};
      try {
        data = responseText ? JSON.parse(responseText) as { error?: string } : {};
      } catch {
        data = { error: responseText || "Could not save review." };
      }

      if (response.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      if (!response.ok) {
        setMessage(data.error ?? "Could not save review.");
        return;
      }

      await refreshReviews();
      setComment("");
      setImageUrls([]);
      setMessage(editingReviewId ? "Review updated." : "Review saved.");
      closeReviewModal();
    });
  }

  function deleteReview(reviewId: string) {
    setMenuOpenId(null);
    setMessage("");

    startTransition(async () => {
      const response = await fetch("/api/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, productId })
      });

      if (response.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.error ?? "Could not delete review.");
        return;
      }

      await refreshReviews();
    });
  }

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Reviews</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold">Customer reviews</h2>
        </div>
        <button type="button" onClick={openReviewModal} className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95">
          Add review
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {reviews.length ? reviews.map((review) => {
          const isOwner = Boolean(session?.user?.id && review.user.id === session.user.id);

          return (
          <article key={review.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-extrabold">{review.user.name ?? "Customer"}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-bold">
                  <RatingStars rating={review.rating} />
                  {review.rating}
                </span>
              </div>
              {isOwner ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpenId((current) => current === review.id ? null : review.id)}
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Review actions"
                    aria-expanded={menuOpenId === review.id}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {menuOpenId === review.id ? (
                    <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-md border bg-card p-1 shadow-soft">
                      <button type="button" onClick={() => openEditModal(review)} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-bold hover:bg-muted">
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteReview(review.id)} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-bold text-destructive hover:bg-destructive/10">
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            {review.comment ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.comment}</p> : null}
            {Array.isArray(review.images) && review.images.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {review.images.map((url, index) => (
                  <button
                    key={`${review.id}-${url}`}
                    type="button"
                    onClick={() => setLightbox({ images: review.images ?? [], index })}
                    className="relative h-16 w-16 overflow-hidden rounded-md bg-muted ring-1 ring-black/5 transition hover:opacity-90 sm:h-20 sm:w-20"
                    aria-label={`Open review image ${index + 1}`}
                  >
                    <Image src={url} alt={`Review image ${index + 1}`} fill sizes="160px" className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </article>
          );
        }) : <p className="rounded-lg border bg-card p-5 text-sm font-semibold text-muted-foreground">No reviews yet.</p>}
      </div>

      {mounted ? (
        <div className={`fixed inset-0 z-[100] grid place-items-end bg-foreground/30 p-0 backdrop-blur-sm transition-opacity duration-200 sm:place-items-center sm:p-4 ${open ? "opacity-100" : "opacity-0"}`} onMouseDown={closeReviewModal}>
          <div
            className={`max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl border bg-card shadow-soft transition duration-200 ease-out sm:rounded-lg ${open ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b p-4">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">{editingReviewId ? "Edit review" : "Add review"}</p>
                <h3 className="font-display text-xl font-extrabold">{editingReviewId ? "Update your experience" : "Share your experience"}</h3>
              </div>
              <button type="button" onClick={closeReviewModal} className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Close review form">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submit} className="grid gap-4 p-4">
              <label className="block text-sm font-semibold">
                Rating
                <select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary">
                  {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Comment
                <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} className="mt-2 min-h-28 w-full rounded-md border bg-background p-3 outline-none focus:border-primary" placeholder="What should other customers know?" />
              </label>
              <div>
                <label className="block text-sm font-semibold">
                  Photos
                  <span className="mt-2 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-bold hover:bg-muted">
                    <ImageUp size={16} />
                    {isUploading ? "Uploading..." : "Upload review photos"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={isUploading || imageUrls.length >= 6}
                    onChange={(event) => {
                      uploadImages(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
                {imageUrls.length ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imageUrls.map((url, index) => (
                      <div key={url} className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                        <Image src={url} alt={`Review upload ${index + 1}`} fill sizes="120px" className="object-cover" />
                        <button type="button" onClick={() => setImageUrls((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-background/90 text-destructive shadow-sm" aria-label="Remove review photo">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <button disabled={isPending || isUploading} className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {isPending ? "Saving..." : editingReviewId ? "Update review" : "Submit review"}
              </button>
              {message ? <p className="text-sm font-semibold text-destructive">{message}</p> : null}
            </form>
          </div>
        </div>
      ) : null}

      {lightbox ? (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onMouseDown={() => setLightbox(null)}>
          <div
            className="relative flex h-[min(78vh,720px)] w-full max-w-5xl items-center justify-center"
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
            onTouchEnd={handleLightboxTouchEnd}
          >
            <button type="button" onClick={() => setLightbox(null)} className="absolute right-0 top-0 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20" aria-label="Close image slider">
              <X size={20} />
            </button>
            {lightbox.images.length > 1 ? (
              <button type="button" onClick={showPreviousImage} className="absolute left-0 z-20 hidden h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 sm:grid" aria-label="Previous image">
                <ChevronLeft size={24} />
              </button>
            ) : null}
            <div className="relative h-full w-full select-none">
              <Image src={lightbox.images[lightbox.index]} alt={`Review image ${lightbox.index + 1}`} fill sizes="90vw" className="object-contain" priority />
            </div>
            {lightbox.images.length > 1 ? (
              <button type="button" onClick={showNextImage} className="absolute right-0 z-20 hidden h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 sm:grid" aria-label="Next image">
                <ChevronRight size={24} />
              </button>
            ) : null}
            {lightbox.images.length > 1 ? (
              <div className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                {lightbox.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setLightbox((current) => current ? { ...current, index } : current)}
                    className={`h-1.5 rounded-full transition-all ${index === lightbox.index ? "w-6 bg-white" : "w-1.5 bg-white/45"}`}
                    aria-label={`Show image ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
