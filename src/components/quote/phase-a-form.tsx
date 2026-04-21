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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { createQuoteSession, fetchProfessions } from "@/app/actions"
import type { Sector } from "@/lib/data/catalog"
import type { Profession } from "@/lib/types"
import { phaseASchema, type PhaseAInput } from "@/lib/schemas/quote-session"

const DEFAULTS: Partial<PhaseAInput> = {
  sectorId: "",
  professionSlug: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
}

export function PhaseAForm({ sectors }: { sectors: Sector[] }) {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [professions, setProfessions] = React.useState<Profession[]>([])
  const [professionQuery, setProfessionQuery] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const autocompleteRef = React.useRef<HTMLDivElement>(null)

  const form = useForm<PhaseAInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(phaseASchema) as any,
    mode: "onTouched",
    defaultValues: DEFAULTS,
  })

  const sectorId = form.watch("sectorId")

  React.useEffect(() => {
    if (!sectorId) {
      setProfessions([])
      form.setValue("professionSlug", "")
      setProfessionQuery("")
      return
    }
    fetchProfessions(sectorId).then(setProfessions).catch(() => setProfessions([]))
    form.setValue("professionSlug", "")
    setProfessionQuery("")
  }, [sectorId, form])

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredProfessions = professionQuery.trim()
    ? professions.filter((p) => p.name.toLowerCase().includes(professionQuery.toLowerCase()))
    : professions

  function selectProfession(p: Profession) {
    form.setValue("professionSlug", p.slug, { shouldValidate: true })
    setProfessionQuery(p.name)
    setShowSuggestions(false)
  }

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
                    <span className="truncate">
                      {field.value
                        ? (sectors.find((s) => String(s.id) === field.value)?.name ?? field.value)
                        : <span className="text-muted-foreground">Seleziona il tuo settore</span>
                      }
                    </span>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {professions.length > 0 && (
          <div className="space-y-2">
            <Label>Specializzazione</Label>
            <div ref={autocompleteRef} className="relative">
              <Input
                placeholder="Cerca la tua specializzazione…"
                value={professionQuery}
                onChange={(e) => {
                  setProfessionQuery(e.target.value)
                  form.setValue("professionSlug", "", { shouldValidate: false })
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              {showSuggestions && filteredProfessions.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-sm shadow-md">
                  {filteredProfessions.map((p) => (
                    <li
                      key={p.slug}
                      className="cursor-pointer px-3 py-1.5 hover:bg-accent"
                      onMouseDown={() => selectProfession(p)}
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {form.formState.errors.professionSlug && (
              <p className="text-sm text-destructive">
                {form.formState.errors.professionSlug.message}
              </p>
            )}
          </div>
        )}

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
