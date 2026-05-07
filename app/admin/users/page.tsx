import { AdminSearch } from "@/components/admin/AdminSearch";
import { db } from "@/lib/db";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date);
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const queryValue = params.q;
  const query = (Array.isArray(queryValue) ? queryValue[0] : queryValue)?.trim() ?? "";
  const users = await db.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true, reviews: true } }
    }
  });

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <p className="text-sm font-bold uppercase text-primary">Customers</p>
      <h2 className="font-display text-2xl font-extrabold">Users</h2>
      <div className="mt-5">
        <AdminSearch initialValue={query} placeholder="Search users" />
      </div>

      <div className="mt-5 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-3">User</th>
              <th>Role</th>
              <th>Email status</th>
              <th>Orders</th>
              <th>Reviews</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="py-4">
                  <p className="font-extrabold">{user.name ?? "Unnamed user"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td><span className="rounded-md bg-muted px-2 py-1 text-xs font-extrabold">{user.role}</span></td>
                <td>{user.emailVerified ? "Verified" : "Pending"}</td>
                <td>{user._count.orders}</td>
                <td>{user._count.reviews}</td>
                <td>{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 md:hidden">
        {users.map((user) => (
          <div key={user.id} className="rounded-lg border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-extrabold">{user.name ?? "Unnamed user"}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-extrabold">{user.role}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-md bg-muted p-2"><p className="font-extrabold">{user._count.orders}</p><p className="text-xs text-muted-foreground">Orders</p></div>
              <div className="rounded-md bg-muted p-2"><p className="font-extrabold">{user._count.reviews}</p><p className="text-xs text-muted-foreground">Reviews</p></div>
              <div className="rounded-md bg-muted p-2"><p className="font-extrabold">{user.emailVerified ? "Yes" : "No"}</p><p className="text-xs text-muted-foreground">Verified</p></div>
            </div>
          </div>
        ))}
        {!users.length ? <p className="rounded-md bg-muted p-4 text-sm font-semibold text-muted-foreground">No users found.</p> : null}
      </div>
    </div>
  );
}
