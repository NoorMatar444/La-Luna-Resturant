import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"

import { api, saveSession } from "@/lib/api"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const inputClass =
  "h-auto w-full max-w-[420px] rounded-lg border-[#d7cbb8] bg-[#fffaf3] px-2.5 py-2.5 font-[inherit] text-base shadow-none"

const formSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
})

const fields = [
  { name: "email", id: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", id: "password", label: "Password", type: "password", autoComplete: "current-password" },
]

export default function SignIn() {
  // Filled after a valid submit. null hides the welcome sentence.
  const [signedInEmail, setSignedInEmail] = useState(null)
  const [error, setError] = useState(null)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data) {
    setError(null)
    try {
      const email = data.email.trim().toLowerCase()
      const session = await api("/auth/signin", {
        method: "POST",
        body: { email, password: data.password },
      })
      saveSession(session)
      setSignedInEmail(session.email)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  return (
    <main className="min-h-[calc(100dvh-3.75rem)] w-full bg-[#f3eadc] text-left font-[Georgia,'Times_New_Roman',serif] text-[#1b2430]">
      <div className="mx-auto w-full max-w-[1000px] px-5 py-8">
        <section id="sign-in">
          <h1 className="my-[0.67em] text-[2em] font-bold">Sign in</h1>
          <p className="my-[1em]">Welcome back. Sign in to see your bookings.</p>

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
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </FieldGroup>
          </form>

          {signedInEmail && (
            <p className="my-[1em]">Signed in as {signedInEmail}.</p>
          )}

          <p className="my-[1em]">
            New to La Luna?{" "}
            <Link to="/signup" className="font-bold text-[#8a6232] underline">
              Create an account
            </Link>
            {" · "}
            <Link to="/confirm-email" className="font-bold text-[#8a6232] underline">
              Confirm your email
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
