import { useState } from "react";

export default function HoursAndLocations() {
  // Dinner hours. Monday is closed; the kitchen opens at 6:00 PM on other days.
  const [times] = useState([
    {
      id: "hours",
      title: "Hours",
      time: [
        { id: "monday", day: "Monday", hours: "Closed" },
        {
          id: "tuesday-thursday",
          day: "Tuesday – Thursday",
          hours: "6:00 PM – 11:00 PM",
        },
        {
          id: "friday-saturday",
          day: "Friday – Saturday",
          hours: "6:00 PM – 12:00 AM",
        },
        { id: "sunday", day: "Sunday", hours: "6:00 PM – 10:30 PM" },
      ],
    },
  ]);

  const [location] = useState({
    id: "location",
    title: "Location",
    address: "18 El Malek El Afdal, Zamalek, Cairo",
    email: "reservations@lalunabistro.example",
  });

  const [note] = useState({
    title: "Before you come",
    text: "Tables are limited. Reserve before you come, and email us first for parties larger than 8.",
  });

  return (
    <main className="mx-auto h-[calc(100dvh-3.75rem)] w-full overflow-hidden bg-[#f3eadc] px-5 py-6 text-left font-[Georgia,'Times_New_Roman',serif] text-[#1b2430]">
      <section id="hours" className="mx-auto w-full max-w-[1000px]">
        <h1 className="mb-2 text-4xl font-bold">Hours & Location</h1>
        <p className="mb-4">Dinner only. The kitchen opens at 6:00 PM.</p>

        {times.map((section) => (
          <div key={section.id}>
            <h2 className="mb-2 text-xl font-bold">{section.title}</h2>
            <table className="w-full max-w-[520px] border-collapse bg-[#fffaf3]">
              <thead>
                <tr>
                  <th className="border border-[#d7cbb8] bg-[#14233c] px-3 py-2.5 text-left font-normal text-[#f4e1b5]">
                    Day
                  </th>
                  <th className="border border-[#d7cbb8] bg-[#14233c] px-3 py-2.5 text-left font-normal text-[#f4e1b5]">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody>
                {section.time.map((row) => (
                  <tr key={row.id}>
                    <td className="border border-[#d7cbb8] px-3 py-2.5 text-left">
                      {row.day}
                    </td>
                    <td className="border border-[#d7cbb8] px-3 py-2.5 text-left">
                      {row.hours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <h2 className="mb-2 mt-5 text-xl font-bold">{location.title}</h2>
        <p>{location.address}</p>
        <p>
          <a
            // mailto opens the visitor's email app with this address filled in.
            href={`mailto:${location.email}`}
            className="text-[#14233c] underline"
          >
            {location.email}
          </a>
        </p>

        <aside className="mt-6 border-l-4 border-[#8a6232] bg-[#fffaf3] p-4">
          <h2 className="mb-2 text-xl font-bold">{note.title}</h2>
          <p>{note.text}</p>
        </aside>
      </section>
    </main>
  );
}
