import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { api, getAccessToken } from "@/lib/api"

function formatPrice(cents) {
  return `${cents / 100} EGP`
}

export default function Menu() {
  const [params] = useSearchParams()
  const [sections, setSections] = useState([])
  const [error, setError] = useState(null)
  const [orderingId, setOrderingId] = useState(null)
  const cancelled = params.get("cancelled") === "1"

  useEffect(() => {
    let ignore = false
    api("/products")
      .then((dishes) => {
        if (ignore) return
        const grouped = []
        for (const dish of dishes ?? []) {
          let section = grouped.find((item) => item.title === dish.section)
          if (!section) {
            section = { title: dish.section, dishes: [] }
            grouped.push(section)
          }
          section.dishes.push(dish)
        }
        setSections(grouped)
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Something went wrong.")
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  async function orderDish(dish) {
    setError(null)
    const token = getAccessToken()
    if (!token) {
      setError("Sign in to order a dish.")
      return
    }
    setOrderingId(dish.id)
    try {
      const data = await api("/orders/checkout", {
        method: "POST",
        token,
        body: { dishId: dish.id },
      })
      if (!data?.url) {
        setError("Stripe did not return a checkout page.")
        setOrderingId(null)
        return
      }
      window.location.assign(data.url)
    } catch (err) {
      setOrderingId(null)
      setError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  return (
    <main className="min-h-[calc(100dvh-3.75rem)] w-full overflow-auto bg-[#f3eadc] px-5 py-6 text-left font-[Georgia,'Times_New_Roman',serif] text-[#1b2430]">
      <section id="menu" className="mx-auto w-full max-w-[1000px]">
        <h1 className="mb-2 text-4xl font-bold">Menu</h1>
        <p className="mb-4">A short evening menu. Dishes change with the week.</p>
        {cancelled && (
          <p className="mb-4">Payment was not completed. You can order again.</p>
        )}
        {error && <p className="mb-4">{error}</p>}
        {sections.map((section, index) => (
          <div key={section.title}>
            <h2
              className={
                index === 0
                  ? "mb-2 text-xl font-bold"
                  : "mb-2 mt-5 text-xl font-bold"
              }
            >
              {section.title}
            </h2>
            <table className="w-full max-w-[720px] border-collapse bg-[#fffaf3]">
              <thead>
                <tr>
                  <th className="border border-[#d7cbb8] bg-[#14233c] px-3 py-2.5 text-left font-normal text-[#f4e1b5]">
                    Dish
                  </th>
                  <th className="border border-[#d7cbb8] bg-[#14233c] px-3 py-2.5 text-left font-normal text-[#f4e1b5]">
                    Price
                  </th>
                  <th className="border border-[#d7cbb8] bg-[#14233c] px-3 py-2.5 text-left font-normal text-[#f4e1b5]">
                    Order
                  </th>
                </tr>
              </thead>
              <tbody>
                {section.dishes.map((dish) => (
                  <tr key={dish.id}>
                    <td className="border border-[#d7cbb8] px-3 py-2.5 text-left">
                      {dish.name}
                    </td>
                    <td className="border border-[#d7cbb8] px-3 py-2.5 text-left">
                      {formatPrice(dish.priceInCents)}
                    </td>
                    <td className="border border-[#d7cbb8] px-3 py-2.5 text-left">
                      <button
                        type="button"
                        className="rounded-lg bg-[#14233c] px-3 py-1.5 text-sm text-[#f4e1b5] disabled:opacity-50"
                        disabled={orderingId === dish.id}
                        onClick={() => orderDish(dish)}
                      >
                        {orderingId === dish.id ? "Sending..." : "Order now"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>
    </main>
  )
}
