"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, Users } from "lucide-react"
import { toast } from "sonner"

import { apiFetch, ApiError } from "@/lib/api-client"
import type { UserProfile, Role } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const roleBadgeClass: Record<Role, string> = {
  student:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  tutor:
    "border-burgundy-500/30 bg-burgundy-500/10 text-burgundy-700 dark:text-burgundy-400",
  admin:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
}

const ROLES: Role[] = ["student", "tutor", "admin"]

export function UsersList() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ users: UserProfile[] }>(
        "/api/admin/users"
      )
      setUsers(data.users)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not load users."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const changeRole = async (user: UserProfile, role: Role) => {
    setBusyId(user._id)
    try {
      await apiFetch("/api/admin/users", {
        method: "PATCH",
        body: { userId: user._id, role },
      })
      toast.success(`${user.name} is now a ${role}.`)
      await load()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not change role."
      )
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Loading users…
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-12 text-center">
        <Users className="size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No users yet</h3>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card key={user._id} className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{user.name}</h3>
                <Badge variant="outline" className={roleBadgeClass[user.role]}>
                  {user.role}
                </Badge>
                {user.emailVerified ? (
                  <span className="text-xs text-green-600">✓ verified</span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    unverified
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-1.5">
              {ROLES.map((r) => (
                <button
                  key={r}
                  disabled={busyId === user._id || user.role === r}
                  onClick={() => changeRole(user, r)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    user.role === r
                      ? "border-burgundy-600 bg-burgundy-600 text-white"
                      : "border-input hover:bg-muted",
                    busyId === user._id && "opacity-50"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}