import { Bell, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MarkAllReadButton, MarkReadButton } from "@/components/account/NotificationActions";

function formatNotificationType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase text-primary">Account updates</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold">Notifications</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.` : "All caught up."}
          </p>
        </div>
        <MarkAllReadButton disabled={unreadCount === 0} />
      </div>

      {notifications.length ? (
        <div className="mt-5 grid gap-3">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-lg border p-4 transition ${notification.read ? "bg-background" : "border-primary/30 bg-primary/5"}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <span className={`mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full ${notification.read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}>
                    {notification.read ? <CheckCircle2 size={18} /> : <Bell size={18} />}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-extrabold uppercase text-muted-foreground">{formatNotificationType(notification.type)}</p>
                      {!notification.read ? <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase text-primary-foreground">New</span> : null}
                    </div>
                    <p className="mt-1 text-sm font-semibold leading-6 text-foreground">{notification.message}</p>
                    <time className="mt-2 block text-xs font-semibold text-muted-foreground" dateTime={notification.createdAt.toISOString()}>
                      {notification.createdAt.toLocaleString("en-BD", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </time>
                  </div>
                </div>
                {!notification.read ? <MarkReadButton id={notification.id} /> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed p-6 text-center">
          <Bell className="mx-auto text-primary" size={28} />
          <p className="mt-3 font-display text-xl font-extrabold">No notifications yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Order confirmations, shipping updates, delivery updates and account messages will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
