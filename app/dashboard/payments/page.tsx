import { requireRole } from "@/lib/authHelper"
import { PaymentsList } from "@/components/dashboard/payments-list"

export const metadata = { title: "Payments" }

export default async function PaymentsPage() {
  await requireRole(["student", "tutor", "admin"])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Payments
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your payment and subscription history.
        </p>
      </header>

      <PaymentsList />
    </div>
  )
}