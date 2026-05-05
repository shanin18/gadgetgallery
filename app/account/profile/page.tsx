import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  return (
    <form className="rounded-lg border bg-card p-5">
      <h2 className="font-display text-2xl font-extrabold">Profile</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {["Name", "Email", "Phone", "Avatar URL"].map((label) => (
          <label key={label} className="block text-sm font-semibold">
            {label}
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
          </label>
        ))}
      </div>
      <Button className="mt-5">Save profile</Button>
    </form>
  );
}
