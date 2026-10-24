import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Link, useLocation } from "react-router-dom"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

const inputClass =
  "h-auto w-full max-w-[420px] rounded-lg border-[#d7cbb8] bg-[#fffaf3] px-2.5 py-2.5 font-[inherit] text-base shadow-none"

const formSchema = z.object({
  email: z.email("Enter a valid email."),
  otp: z.string().min(1, "Enter the code from your email."),
})

const fields = [
  { name: "email", id: "confirm-email", label: "Email", type: "email", autoComplete: "email" },
  { name: "otp", id: "otp", label: "Code", type: "text", autoComplete: "one-time-code" },
]

export default function ConfirmEmail() {
  const location = useLocation()
  const [confirmedEmail, setConfirmedEmail] = useState(null)
  const [error, setError] = useState(null)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: location.state?.email ?? "",
      otp: "",
    },
  })

  async function onSubmit(data) {
    setError(null)
    try {
      const email = data.email.trim().toLowerCase()
      await api("/auth/confirm-email", {
        method: "POST",
        body: { email, otp: data.otp.trim() },
      })
      setConfirmedEmail(email)
      form.reset({ email, otp: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  return (
    <main className="min-h-[calc(100dvh-3.75rem)] w-full bg-[#f3eadc] text-left font-[Georgia,'Times_New_Roman',serif] text-[#1b2430]">
      <div className="mx-auto w-full max-w-[1000px] px-5 py-8">
        <section id="confirm-email">
          <h1 className="my-[0.67em] text-[2em] font-bold">Confirm your email</h1>
          <p className="my-[1em]">
            Enter the code we sent to your email. After that, you can sign in.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            <FieldGroup>
              {fields.map((input) => (
                <Controller
                  key={input.name}
                  name={input.name}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={input.id}>{input.label}</FieldLabel>
                      <Input
                        {...field}
                        id={input.id}
                        type={input.type}
                        autoComplete={input.autoComplete}
                        inputMode={input.name === "otp" ? "numeric" : undefined}
                        aria-invalid={fieldState.invalid}
                        className={inputClass}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              ))}

              {error && <p className="my-[1em]">{error}</p>}

              <Button
                type="submit"
                className="w-fit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Checking code..." : "Confirm email"}
              </Button>
            </FieldGroup>
          </form>

          {confirmedEmail && (
            <p className="my-[1em]">
              {confirmedEmail} is confirmed. You can sign in.
            </p>
          )}

          <p className="my-[1em]">
            <Link to="/signin" className="font-bold text-[#8a6232] underline">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
