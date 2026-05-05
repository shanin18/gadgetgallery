import { Button } from "@/components/ui/Button";

export default function AddressesPage() {
  return (
    <form className="rounded-lg border bg-card p-5">
      <h2 className="font-display text-2xl font-extrabold">Addresses</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {["Street", "City", "State", "Postal code", "Country"].map((label) => (
          <label key={label} className="block text-sm font-semibold">
            {label}
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" defaultValue={label === "Country" ? "Bangladesh" : ""} />
          </label>
        ))}
      </div>
      <Button className="mt-5">Save address</Button>
    </form>
  );
}
