import { requireRole } from "@/lib/authHelper"
import { PaymentsList } from "@/components/dashboard/payments-list"
import { AdminPaymentsList } from "@/components/dashboard/admin-payments-list"

export const metadata = { title: "Payments" }

export default async function PaymentsPage() {
  const session = await requireRole(["student", "tutor", "admin"])
  const isAdmin = session.user.role === "admin"

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {isAdmin ? "Payments & Revenue" : "Payments"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isAdmin
            ? "All payment records and revenue across the platform."
            : "Your payment and subscription history."}
        </p>
      </header>

      {isAdmin ? <AdminPaymentsList /> : <PaymentsList />}
    </div>
  )
}
