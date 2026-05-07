"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { Camera, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
      setPhone(session.user.phone ?? "");
      setAvatarUrl(session.user.image ?? "");
    }
  }, [session]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // preview locally
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        // upload to Cloudinary via backend API
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64 })
        });
        const { url } = await res.json();
        setAvatarUrl(url);
        setPreview(url);
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, avatarUrl })
      });
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="rounded-lg border bg-card p-5" onSubmit={handleSubmit}>
      <h2 className="font-display text-2xl font-extrabold">Profile</h2>
      <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-muted bg-muted ring-offset-background transition-all group-hover:ring-2 group-hover:ring-primary/20">
            {isUploading ? (
              <div className="flex h-full w-full items-center justify-center bg-background/50">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (preview || avatarUrl) ? (
              <img src={preview || avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Camera size={32} />
              </div>
            )}
          </div>
          {!isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="text-white" size={24} />
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <p className="font-semibold">Profile Photo</p>
          <p className="text-sm text-muted-foreground">Click the image to upload a new one.<br />Recommended size: 256x256px.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Name
          <input value={name} onChange={e => setName(e.target.value)} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Email
          <input value={email} disabled className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary opacity-60" />
        </label>
        <label className="block text-sm font-semibold">
          Phone
          <input value={phone} onChange={e => setPhone(e.target.value)} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
      </div>
      <Button className="mt-8 min-w-32" type="submit" disabled={isSaving || isUploading}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 animate-spin" size={18} />
            Saving...
          </>
        ) : "Save Changes"}
      </Button>
    </form>
  );
}



