"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Home, Loader2, Mail, MapPin, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();

  if (status === "loading") {
    return (
      <div className="rounded-lg border bg-card p-5">
        <h2 className="font-display text-2xl font-extrabold">Profile</h2>
        <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" size={18} />
          Loading profile...
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return <ProfileForm key={session.user.id} updateSession={update} user={session.user} />;
}

type ProfileUser = NonNullable<ReturnType<typeof useSession>["data"]>["user"];
type UpdateSession = ReturnType<typeof useSession>["update"];
type AddressForm = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

function ProfileForm({ user, updateSession }: { user: ProfileUser; updateSession: UpdateSession }) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.image ?? "");
  const [address, setAddress] = useState<AddressForm>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Bangladesh"
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const res = await fetch("/api/account/profile");
        const data = await res.json();

        if (!active) return;
        if (!res.ok) {
          throw new Error(data.error ?? "Could not load profile details.");
        }

        if (data.address) {
          setAddress({
            street: data.address.street ?? "",
            city: data.address.city ?? "",
            state: data.address.state ?? "",
            postalCode: data.address.postalCode ?? "",
            country: data.address.country ?? "Bangladesh"
          });
        }
      } catch (error) {
        console.error("Profile load failed", error);
        if (active) {
          setMessage(error instanceof Error ? error.message : "Could not load profile details.");
        }
      } finally {
        if (active) {
          setIsLoadingAddress(false);
        }
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  function updateAddress(field: keyof AddressForm, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64 })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Upload failed.");
        }
        if (!data.url) {
          throw new Error("Upload did not return an image URL.");
        }

        setAvatarUrl(data.url);
        setPreview(data.url);
      } catch (error) {
        console.error("Upload failed", error);
        setMessage(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, avatarUrl, address })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save profile.");
      }

      setName(data.user.name ?? "");
      setEmail(data.user.email ?? "");
      setPhone(data.user.phone ?? "");
      setAvatarUrl(data.user.image ?? "");
      if (data.address) {
        setAddress({
          street: data.address.street ?? "",
          city: data.address.city ?? "",
          state: data.address.state ?? "",
          postalCode: data.address.postalCode ?? "",
          country: data.address.country ?? "Bangladesh"
        });
      }
      setPreview(null);
      await updateSession({
        user: {
          name: data.user.name,
          image: data.user.image,
          phone: data.user.phone
        }
      });
      setMessage("Profile saved.");
    } catch (error) {
      console.error("Save failed", error);
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="overflow-hidden rounded-lg border bg-card shadow-sm" onSubmit={handleSubmit}>
      <div className="border-b bg-[linear-gradient(135deg,rgba(20,184,166,0.14),rgba(255,255,255,0)_48%,rgba(245,158,11,0.13))] px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="group relative w-fit">
              <button
                type="button"
                className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm ring-1 ring-border transition group-hover:ring-primary/40"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile photo"
              >
                {isUploading ? (
                  <span className="flex h-full w-full items-center justify-center bg-background/70">
                    <Loader2 className="animate-spin text-primary" size={34} />
                  </span>
                ) : preview || avatarUrl ? (
                  <Image
                    src={preview || avatarUrl}
                    alt="Avatar"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <UserRound size={40} />
                  </span>
                )}
                {!isUploading ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/42 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="text-white" size={26} />
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-sm transition hover:brightness-95"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Choose profile photo"
              >
                <Camera size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-md border bg-background/80 px-2.5 py-1 text-xs font-bold text-primary">
                <ShieldCheck size={14} />
                Verified account
              </div>
              <h2 className="mt-3 truncate font-display text-3xl font-extrabold">{name || "Your profile"}</h2>
              <p className="mt-1 truncate text-sm font-medium text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-72">
            <div className="rounded-md border bg-background/78 px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground">Profile photo</p>
              <p className="mt-1 font-extrabold">{avatarUrl ? "Uploaded" : "Not set"}</p>
            </div>
            <div className="rounded-md border bg-background/78 px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground">Contact</p>
              <p className="mt-1 font-extrabold">{phone ? "Added" : "Missing"}</p>
            </div>
            <div className="col-span-2 rounded-md border bg-background/78 px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground">Default address</p>
              <p className="mt-1 truncate font-extrabold">
                {address.street && address.city ? `${address.street}, ${address.city}` : "Not set"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Field label="Name" icon={UserRound}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </Field>
          <Field label="Email" icon={Mail}>
            <input
              value={email}
              disabled
              className="h-11 w-full rounded-md border bg-muted/60 px-3 text-sm font-semibold text-muted-foreground outline-none"
            />
          </Field>
          <Field label="Phone" icon={Phone}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </Field>
        </div>

        <section className="mt-8 border-t pt-7">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-extrabold">
                <MapPin className="text-primary" size={20} />
                Address
              </h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Your default shipping address lives with your profile.
              </p>
            </div>
            {isLoadingAddress ? (
              <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Loader2 className="animate-spin" size={16} />
                Loading address
              </span>
            ) : null}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Street address" icon={Home}>
              <input
                value={address.street}
                onChange={(e) => updateAddress("street", e.target.value)}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </Field>
            <Field label="City" icon={MapPin}>
              <input
                value={address.city}
                onChange={(e) => updateAddress("city", e.target.value)}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </Field>
            <Field label="State" icon={MapPin}>
              <input
                value={address.state}
                onChange={(e) => updateAddress("state", e.target.value)}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </Field>
            <Field label="Postal code" icon={MapPin}>
              <input
                value={address.postalCode}
                onChange={(e) => updateAddress("postalCode", e.target.value)}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </Field>
            <Field label="Country" icon={MapPin}>
              <input
                value={address.country}
                onChange={(e) => updateAddress("country", e.target.value)}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </Field>
          </div>
        </section>

        <div className="mt-7 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5">
            {message ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                {message === "Profile saved." ? <CheckCircle2 className="text-primary" size={17} /> : null}
                {message}
              </p>
            ) : null}
          </div>
          <Button className="min-w-40" type="submit" disabled={isSaving || isUploading}>
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof UserRound; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-extrabold">
        <Icon className="text-primary" size={16} />
        {label}
      </span>
      {children}
    </label>
  );
}
