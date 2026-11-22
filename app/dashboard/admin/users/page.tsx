import { requireRole } from "@/lib/authHelper"
import { UsersList } from "@/components/dashboard/users-list"

export const metadata = { title: "Users" }

export default async function AdminUsersPage() {
  await requireRole("admin")

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          User Management
        </h1>
        <p className="mt-1 text-muted-foreground">
          View all users and change their roles. Admins cannot demote
          themselves.
        </p>
      </header>

      <UsersList />
    </div>
  )
}