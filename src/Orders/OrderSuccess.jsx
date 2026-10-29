import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { api, getAccessToken } from "@/lib/api"

function formatPrice(cents) {
  return `${cents / 100} EGP`
}

export default function OrderSuccess() {
  const [params] = useSearchParams()
  const orderId = params.get("order_id")
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!orderId) {
      setChecking(false)
      setError("This page needs an order.")
      return
    }
    const token = getAccessToken()
    if (!token) {
      setChecking(false)
      setError("Sign in to see this order.")
      return
    }

    let stopped = false
    let attempts = 0
    let timer

    async function load() {
      try {
        const data = await api(`/orders/${orderId}`, { token })
        if (stopped) return
        setOrder(data)
        setError(null)
        attempts += 1
        // The webhook can land a moment after Stripe sends the guest back.
        if (data.paymentStatus !== "paid" && attempts < 5) {
          timer = setTimeout(load, 2000)
          return
        }
        setChecking(false)
      } catch (err) {
        if (stopped) return
        setChecking(false)
        setError(err instanceof Error ? err.message : "Something went wrong.")
      }
    }

    load()
    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [orderId])

  const paid = order?.paymentStatus === "paid"

  return (
    <main className="min-h-[calc(100dvh-3.75rem)] w-full bg-[#f3eadc] px-5 py-8 text-left font-[Georgia,'Times_New_Roman',serif] text-[#1b2430]">
      <div className="mx-auto w-full max-w-[720px]">
        <h1 className="mb-2 text-4xl font-bold">Order</h1>
        {error && <p className="my-[1em]">{error}</p>}
        {order && (
          <>
            <p className="my-[1em] text-xl">
              {paid
                ? "This order is paid."
                : checking
                  ? "Confirming the payment with Stripe."
                  : "Stripe has not confirmed this payment yet."}
            </p>
            <ul className="my-[1em] list-disc pl-5">
              {order.items.map((item) => (
                <li key={`${item.name}-${item.unitAmount}`}>
                  {item.name} × {item.quantity} — {formatPrice(item.unitAmount)} each
                </li>
              ))}
            </ul>
            <p className="my-[1em]">Total {formatPrice(order.totalAmount)}.</p>
            <p className="my-[1em]">Status: {order.paymentStatus}.</p>
          </>
        )}
        <Link to="/menu" className="font-bold text-[#8a6232] underline">
          Back to the menu
        </Link>
      </div>
    </main>
  )
}
