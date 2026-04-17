"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createQuoteSession } from "@/app/actions"
import type { Activity, Sector } from "@/lib/data/catalog"
import { phaseASchema } from "@/lib/schemas/quote-session"

type FormValues = {
  sectorId: string
  activityId: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

const DEFAULTS: FormValues = {
  sectorId: "",
  activityId: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
}

export function PhaseAForm({
  sectors,
  activities,
}: {
  sectors: Sector[]
  activities: Activity[]
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)
  const [result, setResult] = React.useState<
    | { kind: "idle" }
    | { kind: "error"; message: string }
  >({ kind: "idle" })

  const form = useForm<FormValues>({
    resolver: zodResolver(phaseASchema),
    mode: "onTouched",
    defaultValues: DEFAULTS,
  })

  const selectedSector = useWatch({ control: form.control, name: "sectorId" })
  const availableActivities = React.useMemo(
    () =>
      selectedSector
        ? activities.filter((a) => a.sectorId === selectedSector)
        : [],
    [selectedSector, activities]
  )

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    setResult({ kind: "idle" })
    try {
      const res = await createQuoteSession(values)
      if (res.ok) {
        router.push(`/preventivo/${res.sessionId}/domande`)
      } else {
        setResult({ kind: "error", message: res.error })
        setSubmitting(false)
      }
    } catch (err) {
      setResult({
        kind: "error",
        message: err instanceof Error ? err.message : "Errore sconosciuto",
      })
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        <FormField
          control={form.control}
          name="sectorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Settore</FormLabel>
              <FormControl>
                <Select
                  value={field.value || null}
                  onValueChange={(value) => {
                    field.onChange(value ?? "")
                    if (form.getValues("activityId")) {
                      form.setValue("activityId", "", {
                        shouldValidate: false,
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un settore" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attività</FormLabel>
              <FormControl>
                <Select
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  disabled={!selectedSector}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedSector
                          ? "Seleziona un'attività"
                          : "Seleziona prima un settore"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableActivities.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome e cognome</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cellulare</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? "Invio in corso..." : "Continua"}
        </Button>

        {result.kind === "error" ? (
          <p role="alert" className="text-destructive text-sm">
            {result.message}
          </p>
        ) : null}
      </form>
    </Form>
  )
}
