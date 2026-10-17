import React from "react";

export default function Home() {
  return (
    // Cream page with the dining-room photo and the booking note.
    <main className="w-full bg-[#f3eadc] text-[#1b2430]">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:px-16">
        <section className="grid items-center gap-10 md:grid-cols-5">
          <div className="md:col-span-3">
            <h1 className="pb-6 text-4xl font-medium text-[#14233c] md:text-5xl">
              Dinner in a quiet room
            </h1>
            <p className="max-w-xl text-lg leading-relaxed">
              La Luna Bistro is a small evening restaurant. Seasonal plates,
              fresh bread, and dessert after dark. Tables are limited, so
              reserve before you come.
            </p>
          </div>
          <div className="md:col-span-2">
            <img
              src="../../images/dining-room.jpg"
              alt="dining room"
              className="h-72 w-full rounded-xl bg-[#14233c]/10 object-cover md:h-80"
            />
          </div>
        </section>

        <section className="mt-16 grid gap-8 rounded-xl bg-amber-600 p-8 text-[#14233c] md:grid-cols-3 md:p-10">
          <div className="md:col-span-2">
            <h2 className="pb-4 text-3xl font-bold md:text-4xl">About</h2>
            <p className="leading-relaxed">
              La Luna Bistro is a small room in Zamalek. We cook a short
              evening menu from what is good that week: vegetables, bread,
              fish, and a few desserts. The room stays quiet so dinner can
              take its time.
            </p>
          </div>
          <aside className="border-l-4 border-[#14233c] bg-[#fffaf3] p-6">
            <h2 className="pb-3 text-2xl font-semibold">Before you book</h2>
            <p className="leading-relaxed">
              We keep each table for 90 minutes. Parties larger than 8 should
              email us first.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
