import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"

import { api } from "@/lib/api"

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

const formSchema = z
  .object({
    fullName: z.string().min(1, "Enter your full name."),
    email: z.email("Enter a valid email."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  // Runs after each field passes. path puts the error under confirmPassword.
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

const fields = [
  { name: "fullName", id: "full-name", label: "Full name", type: "text", autoComplete: "name" },
  { name: "email", id: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", id: "password", label: "Password", type: "password", autoComplete: "new-password" },
  { name: "confirmPassword", id: "confirm-password", label: "Confirm password", type: "password", autoComplete: "new-password" },
]

export default function SignUp() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data) {
    setError(null)
    try {
      const email = data.email.trim().toLowerCase()
      await api("/auth/signup", {
        method: "POST",
        body: {
          fullName: data.fullName,
          email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
      })
      navigate("/confirm-email", { state: { email } })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  return (
    <main className="min-h-[calc(100dvh-3.75rem)] w-full bg-[#f3eadc] text-left font-[Georgia,'Times_New_Roman',serif] text-[#1b2430]">
      <div className="mx-auto w-full max-w-[1000px] px-5 py-8">
        <section id="sign-up">
          <h1 className="my-[0.67em] text-[2em] font-bold">Create an account</h1>
          <p className="my-[1em]">
            Sign up to manage your reservations in one place.
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
                {form.formState.isSubmitting ? "Creating account..." : "Sign up"}
              </Button>
            </FieldGroup>
          </form>

          <p className="my-[1em]">
            Already have an account?{" "}
            <Link to="/signin" className="font-bold text-[#8a6232] underline">
              Sign in
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
