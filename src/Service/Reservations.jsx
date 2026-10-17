import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Shared look for the text, email, date, and number inputs.
const inputClass =
  "h-auto w-full max-w-[420px] rounded-lg border-[#d7cbb8] bg-[#fffaf3] px-2.5 py-2.5 font-[inherit] text-base shadow-none"

// Checked on submit. An empty required field blocks onSubmit.
const formSchema = z.object({
  fullName: z.string().min(1, "Enter your full name."),
  email: z.email("Enter a valid email so we can confirm."),
  password: z.string().min(1, "Enter a password to view this booking later."),
  visitDate: z.string().min(1, "Choose a date."),
  // The number input sends a string. coerce turns "2" into 2 before min and max.
  guests: z.coerce
    .number()
    .int()
    .min(1, "At least 1 guest.")
    .max(8, "Parties larger than 8 should email us first."),
  time: z.enum(["18:00", "19:30", "21:00"], { error: "Choose a time." }),
  seating: z.enum(["indoor", "terrace"], { error: "Choose a seating option." }),
  birthday: z.boolean(),
})

const times = [
  { id: "time-6", value: "18:00", label: "6:00 PM" },
  { id: "time-730", value: "19:30", label: "7:30 PM" },
  { id: "time-9", value: "21:00", label: "9:00 PM" },
]

const seating = [
  { id: "indoor", value: "indoor", label: "Indoor" },
  { id: "terrace", value: "terrace", label: "Terrace" },
]

// The form stores "18:00". The confirmation sentence shows "6:00 PM".
function formatTime(value) {
  return times.find((time) => time.value === value)?.label ?? value
}

export default function Reservations() {
  // Filled after a valid submit. null hides the confirmation sentence.
  const [confirmation, setConfirmation] = useState(null)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      visitDate: "",
      guests: 1,
      time: "",
      seating: "",
      birthday: false,
    },
  })

  function onSubmit(data) {
    setConfirmation(data)
    form.reset() // clear the fields; confirmation keeps the submitted copy
  }

  return (
    <main className="min-h-[calc(100dvh-3.75rem)] w-full bg-[#f3eadc] text-left font-[Georgia,'Times_New_Roman',serif] text-[#1b2430]">
      <div className="mx-auto w-full max-w-[1000px] px-5 py-8">
        <section id="reservation">
          <h1 className="my-[0.67em] text-[2em] font-bold">Reserve a table</h1>
          <h2 className="mt-0 mb-[0.83em] text-[1.5em] font-bold">
            Reservation details
          </h2>
          <p className="my-[1em]">
            Choose a date, a time, and the number of guests. We confirm by
            email.
          </p>

          {/* handleSubmit calls onSubmit only after every field passes the schema. */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            <FieldGroup>
              {/* field wires value and onChange. fieldState carries the Zod error. */}
              <Controller
                name="fullName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="full-name">Full name</FieldLabel>
                    <Input
                      {...field}
                      id="full-name"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      className={inputClass}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      className={inputClass}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">
                      Password to view this booking later
                    </FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      className={inputClass}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="visitDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="visit-date">Date</FieldLabel>
                    <Input
                      {...field}
                      id="visit-date"
                      type="date"
                      aria-invalid={fieldState.invalid}
                      className={inputClass}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="guests"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="guests">Number of guests</FieldLabel>
                    <Input
                      {...field}
                      id="guests"
                      type="number"
                      min="1"
                      max="8"
                      value={field.value}
                      aria-invalid={fieldState.invalid}
                      className={inputClass}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="time"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FieldSet data-invalid={fieldState.invalid}>
                    <FieldLegend>Time</FieldLegend>
                    <RadioGroup
                      name={field.name}
                      value={field.value}
                      // Reports the chosen value, not a native change event.
                      onValueChange={field.onChange}
                      className="flex flex-row flex-wrap gap-4"
                    >
                      {times.map((time) => (
                        <Field key={time.id} orientation="horizontal">
                          <RadioGroupItem
                            id={time.id}
                            value={time.value}
                            aria-invalid={fieldState.invalid}
                          />
                          <FieldLabel htmlFor={time.id}>{time.label}</FieldLabel>
                        </Field>
                      ))}
                    </RadioGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldSet>
                )}
              />

              <Controller
                name="seating"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FieldSet data-invalid={fieldState.invalid}>
                    <FieldLegend>Seating</FieldLegend>
                    <RadioGroup
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-row flex-wrap gap-4"
                    >
                      {seating.map((option) => (
                        <Field key={option.id} orientation="horizontal">
                          <RadioGroupItem
                            id={option.id}
                            value={option.value}
                            aria-invalid={fieldState.invalid}
                          />
                          <FieldLabel htmlFor={option.id}>
                            {option.label}
                          </FieldLabel>
                        </Field>
                      ))}
                    </RadioGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldSet>
                )}
              />

              <Controller
                name="birthday"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="birthday"
                      name={field.name}
                      checked={field.value}
                      // Radix may pass "indeterminate". Store only true or false.
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                    <FieldLabel htmlFor="birthday">
                      This reservation is for a birthday
                    </FieldLabel>
                  </Field>
                )}
              />

              <Button type="submit" className="w-fit">
                Request reservation
              </Button>
            </FieldGroup>
          </form>

          {confirmation && (
            <p className="my-[1em]">
              Request received for {confirmation.fullName},{" "}
              {confirmation.guests}{" "}
              {confirmation.guests === 1 ? "guest" : "guests"}, on{" "}
              {confirmation.visitDate} at {formatTime(confirmation.time)} (
              {confirmation.seating}
              {confirmation.birthday ? ", birthday" : ""}). We will confirm at{" "}
              {confirmation.email}.
            </p>
          )}
        </section>

        <aside className="mt-6 border-l-4 border-[#8a6232] bg-[#fffaf3] p-4">
          <h2 className="my-[0.83em] text-[1.5em] font-bold">Before you book</h2>
          <p className="my-[1em]">
            We keep each table for 90 minutes. Parties larger than 8 should
            email us first.
          </p>
        </aside>
      </div>
    </main>
  )
}
