const notifications = [
  "Your FrostPad Laptop Cooler order is processing.",
  "WELCOME10 coupon is available for your next accessory bundle."
];

export default function NotificationsPage() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="font-display text-2xl font-extrabold">Notifications</h2>
      <div className="mt-5 grid gap-3">
        {notifications.map((message) => <p key={message} className="rounded-md bg-muted p-4 text-sm font-semibold">{message}</p>)}
      </div>
    </div>
  );
}
