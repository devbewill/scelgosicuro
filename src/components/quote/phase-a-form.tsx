"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
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
import type { Sector } from "@/lib/data/catalog"
import { phaseASchema, type PhaseAInput } from "@/lib/schemas/quote-session"

// age omitted from defaults — rendered as empty; coerced to number by zod on submit
const DEFAULTS: Partial<PhaseAInput> = {
  sectorId: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
}

export function PhaseAForm({ sectors }: { sectors: Sector[] }) {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const form = useForm<PhaseAInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(phaseASchema) as any,
    mode: "onTouched",
    defaultValues: DEFAULTS,
  })

  async function onSubmit(values: PhaseAInput) {
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const res = await createQuoteSession(values)
      if (res.ok) {
        router.push(`/preventivo/${res.sessionId}/domande`)
      } else {
        setErrorMsg(res.error)
        setSubmitting(false)
      }
    } catch {
      setErrorMsg("Errore imprevisto, riprova.")
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Ottieni il tuo preventivo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confrontiamo le migliori offerte per la tua professione.
          </p>
        </div>

        <FormField
          control={form.control}
          name="sectorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Settore professionale</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona il tuo settore" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Età</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="35"
                  min={18}
                  max={99}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                />
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
                <Input placeholder="Mario Rossi" {...field} />
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
                <Input type="email" placeholder="mario@studio.it" {...field} />
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
              <FormLabel>Telefono</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+39 333 1234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {errorMsg && (
          <p className="text-sm text-destructive">{errorMsg}</p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creazione sessione…" : "Continua"}
        </Button>
      </form>
    </Form>
  )
}
