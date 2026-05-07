"use client";

import { useRef, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";

export function ImageUploadField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  function uploadFile(file: File) {
    setIsUploading(true);
    setError("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: reader.result })
        });
        const data = await res.json();

        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "Upload failed.");
        }

        onChange(data.url);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="block text-sm font-semibold">
      {label}
      <button
        type="button"
        className="mt-2 flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-md border bg-background px-3 py-4 text-center outline-none transition hover:bg-muted"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? <Loader2 className="animate-spin text-primary" size={22} /> : <ImageUp className="text-primary" size={22} />}
        <span className="text-sm font-extrabold">{value ? "Image uploaded" : "Upload image"}</span>
        <span className="max-w-full truncate text-xs font-medium text-muted-foreground">{value || "Choose a file from your device"}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) uploadFile(file);
          event.target.value = "";
        }}
      />
      {error ? <p className="mt-2 text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}
