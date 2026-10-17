import { useState } from "react";

export default function Menu() {
  // Evening sections. Held in state so the list can be replaced without rewriting the tables.
  const [menu] = useState([
    {
      id: "starters",
      title: "Starters",
      dishes: [
        {
          id: "warm-olives",
          name: "Warm olives, lemon, and chili",
          price: "90 EGP",
        },
        {
          id: "bread-butter",
          name: "Bread and cultured butter",
          price: "70 EGP",
        },
        {
          id: "tomato-salad",
          name: "Tomato salad with herbs",
          price: "120 EGP",
        },
      ],
    },
    {
      id: "mains",
      title: "Mains",
      dishes: [
        {
          id: "grilled-catch",
          name: "Grilled catch of the day",
          price: "340 EGP",
        },
        { id: "roast-chicken", name: "Slow roast chicken", price: "280 EGP" },
        { id: "mushroom-pasta", name: "Mushroom pasta", price: "240 EGP" },
      ],
    },
    {
      id: "desserts",
      title: "Desserts",
      dishes: [
        { id: "chocolate-tart", name: "Dark chocolate tart", price: "140 EGP" },
        {
          id: "olive-oil-cake",
          name: "Orange olive oil cake",
          price: "130 EGP",
        },
      ],
    },
  ]);

  return (
    <>
      <main className="mx-auto h-[calc(100dvh-3.75rem)] w-full overflow-hidden bg-[#f3eadc] px-5 py-6 text-left font-[Georgia,'Times_New_Roman',serif] text-[#1b2430]">
        <section id="menu" className="mx-auto w-full max-w-[1000px]">
          <h1 className="mb-2 text-4xl font-bold">Menu</h1>
          <p className="mb-4">A short evening menu. Dishes change with the week.</p>
          {menu.map((section, index) => (
            <div key={section.id}>
              <h2
                className={
                  // The first heading sits under the intro, so it does not need a top gap.
                  index === 0
                    ? "mb-2 text-xl font-bold"
                    : "mb-2 mt-5 text-xl font-bold"
                }
              >
                {section.title}
              </h2>
              <table className="w-full max-w-[520px] border-collapse bg-[#fffaf3]">
                <thead>
                  <tr>
                    <th className="border border-[#d7cbb8] bg-[#14233c] px-3 py-2.5 text-left font-normal text-[#f4e1b5]">
                      Dish
                    </th>
                    <th className="border border-[#d7cbb8] bg-[#14233c] px-3 py-2.5 text-left font-normal text-[#f4e1b5]">
                      Price
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
                        {dish.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
