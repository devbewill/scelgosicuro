"use client"

import * as React from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { saveAnswers } from "@/app/actions"
import { evalCondition } from "@/lib/engine/operators"
import type { SectorQuestion } from "@/lib/types"

export function DynamicForm({
  sessionId,
  sectorQuestions,
  savedAnswers,
  onSuccess,
  splitRequiredOptional = false,
}: {
  sessionId: string
  sectorQuestions: SectorQuestion[]
  savedAnswers: Record<string, unknown>
  onSuccess?: (sessionId: string) => void
  splitRequiredOptional?: boolean
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const defaultValues = React.useMemo(() => {
    const d: Record<string, unknown> = {}
    for (const sq of sectorQuestions) {
      d[sq.key] = savedAnswers[sq.key] ?? ""
    }
    return d
  }, [sectorQuestions, savedAnswers])

  const { control, handleSubmit, getValues } = useForm({ defaultValues })
  const watchedValues = useWatch({ control })

  function isVisible(sq: SectorQuestion): boolean {
    if (!sq.visibleIf) return true
    const answers = { ...savedAnswers, ...getValues() as Record<string, unknown> }
    return evalCondition(sq.visibleIf, answers)
  }

  const sections = React.useMemo(() => {
    const map = new Map<string, SectorQuestion[]>()
    for (const sq of sectorQuestions) {
      const key = sq.section ?? ""
      const list = map.get(key) ?? []
      list.push(sq)
      map.set(key, list)
    }
    return map
  }, [sectorQuestions])

  async function onSubmit(values: Record<string, unknown>) {
    const answers: Record<string, unknown> = {}
    for (const sq of sectorQuestions) {
      if (!isVisible(sq)) continue
      const v = values[sq.key]
      if (v !== "" && v !== null && v !== undefined) {
        answers[sq.key] = v
      }
    }

    setSubmitting(true)
    setErrorMsg(null)
    try {
      const res = await saveAnswers({ sessionId, answers })
      if (res.ok) {
        if (onSuccess) {
          onSuccess(sessionId)
        } else {
          router.push(`/preventivo/${sessionId}/risultati`)
        }
      } else {
        setErrorMsg(res.error)
        setSubmitting(false)
      }
    } catch {
      setErrorMsg("Errore imprevisto, riprova.")
      setSubmitting(false)
    }
  }

  void watchedValues

  const required = sectorQuestions.filter((sq) => sq.isRequired)
  const optional = sectorQuestions.filter((sq) => !sq.isRequired)

  function renderQuestions(qs: SectorQuestion[]) {
    return qs.map((sq) => {
      if (!isVisible(sq)) return null
      return <QuestionField key={sq.key} sq={sq} control={control} />
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-8">
      {splitRequiredOptional ? (
        <>
          <div className="space-y-4">{renderQuestions(required)}</div>
          {optional.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground select-none list-none flex items-center gap-1">
                <span className="group-open:hidden">▶</span>
                <span className="hidden group-open:inline">▼</span>
                Domande opzionali ({optional.length})
              </summary>
              <div className="mt-4 space-y-4 border-l pl-4">
                {renderQuestions(optional)}
              </div>
            </details>
          )}
        </>
      ) : (
        [...sections.entries()].map(([section, qs]) => (
          <div key={section} className="space-y-4">
            {section && (
              <h2 className="text-base font-medium text-muted-foreground border-b pb-1">
                {section}
              </h2>
            )}
            {renderQuestions(qs)}
          </div>
        ))
      )}

      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Calcolo preventivi…" : "Vedi le proposte"}
      </Button>
    </form>
  )
}

function QuestionField({
  sq,
  control,
}: {
  sq: SectorQuestion
  control: ReturnType<typeof useForm>["control"]
}) {
  return (
    <Controller
      control={control}
      name={sq.key}
      render={({ field, fieldState }) => (
        <div className="space-y-1.5">
          <Label htmlFor={sq.key}>{sq.label}</Label>
          {sq.helpText && (
            <p className="text-xs text-muted-foreground">{sq.helpText}</p>
          )}

          {sq.type === "dropdown" && sq.options ? (
            <Select
              onValueChange={field.onChange}
              value={String(field.value ?? "")}
            >
              <SelectTrigger id={sq.key}>
                <span className="truncate">
                  {(() => {
                    const val = String(field.value ?? "")
                    if (!val) return <span className="text-muted-foreground">Seleziona…</span>
                    const opt = sq.options!.find((o) => String(o.value) === val)
                    return opt?.label ?? val
                  })()}
                </span>
              </SelectTrigger>
              <SelectContent>
                {sq.options.map((opt) => (
                  <SelectItem key={String(opt.value)} value={String(opt.value)}>
                    {opt.label ?? String(opt.value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : sq.type === "number" ? (
            <Input
              id={sq.key}
              type="number"
              min={sq.validation?.min}
              max={sq.validation?.max}
              step={sq.validation?.step ?? 1}
              value={String(field.value ?? "")}
              onChange={(e) => {
                const n = e.target.value === "" ? "" : Number(e.target.value)
                field.onChange(n)
              }}
            />
          ) : sq.type === "boolean" ? (
            <Select
              onValueChange={(v) => field.onChange(v === "true")}
              value={field.value === true ? "true" : field.value === false ? "false" : ""}
            >
              <SelectTrigger id={sq.key}>
                <span className="truncate">
                  {field.value === true ? "Sì" : field.value === false ? "No" : <span className="text-muted-foreground">Seleziona…</span>}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sì</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={sq.key}
              type="text"
              value={String(field.value ?? "")}
              onChange={field.onChange}
            />
          )}

          {fieldState.error && (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}
