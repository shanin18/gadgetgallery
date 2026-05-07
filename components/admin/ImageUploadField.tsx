"use client";

import { useRef, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";

function shortenFileName(name?: string) {
  if (!name) return "";
  return name.length > 28 ? `${name.slice(0, 28)}...` : name;
}

export function ImageUploadField({ label, value, fileName, onChange }: { label: string; value: string; fileName?: string; onChange: (url: string, fileName: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const displayName = shortenFileName(fileName);

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

        onChange(data.url, file.name);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="block min-w-0 text-sm font-semibold">
      {label}
      <button
        type="button"
        className="mt-2 flex h-10 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md border bg-background px-3 text-left outline-none transition hover:bg-muted"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? <Loader2 className="shrink-0 animate-spin text-primary" size={17} /> : <ImageUp className="shrink-0 text-primary" size={17} />}
        <span className="block min-w-0 flex-1 truncate text-sm font-semibold text-muted-foreground">
          {isUploading ? "Uploading..." : value ? displayName || "Selected image" : "Upload image"}
        </span>
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
