"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DynamicForm } from "@/components/quote/dynamic-form"
import { DebugResultCard } from "@/components/dev/debug-result-card"
import {
  createDebugSession,
  fetchSectorQuestions,
  fetchQuoteResults,
  runEngine,
} from "@/app/actions"
import type { Sector } from "@/lib/data/catalog"
import type { SectorQuestion, QuoteResult } from "@/lib/types"

export function DebugPanel({ sectors }: { sectors: Sector[] }) {
  const [sectorId, setSectorId] = React.useState("")
  const [age, setAge] = React.useState<number | "">("")
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [questions, setQuestions] = React.useState<SectorQuestion[]>([])

  const [running, setRunning] = React.useState(false)
  const [engineErr, setEngineErr] = React.useState<string | null>(null)
  const [results, setResults] = React.useState<QuoteResult[] | null>(null)
  const [userScore, setUserScore] = React.useState<number | null>(null)

  async function startSession() {
    if (!sectorId || age === "") return
    setLoading(true)
    setErr(null)
    setSessionId(null)
    setQuestions([])
    setResults(null)
    setEngineErr(null)
    try {
      const [res, qs] = await Promise.all([
        createDebugSession(sectorId, age as number),
        fetchSectorQuestions(sectorId),
      ])
      if (!res.ok) { setErr(res.error); return }
      setSessionId(res.sessionId)
      setQuestions(qs)
    } finally {
      setLoading(false)
    }
  }

  async function handleFormSuccess(sid: string) {
    setRunning(true)
    setEngineErr(null)
    setResults(null)
    try {
      const engine = await runEngine(sid)
      if (!engine.ok) { setEngineErr(engine.error); return }
      setUserScore(engine.userScore)
      const rows = await fetchQuoteResults(sid)
      setResults(rows)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium">1. Seleziona settore</h2>
        <div className="flex gap-2">
          <Select value={sectorId} onValueChange={(v) => { setSectorId(v ?? ""); setSessionId(null); setResults(null) }}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Settore…" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Età"
            min={18}
            max={99}
            className="w-20"
            value={age}
            onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <Button onClick={startSession} disabled={!sectorId || age === "" || loading}>
            {loading ? "Caricamento…" : "Avvia"}
          </Button>
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        {sessionId && (
          <p className="text-xs text-muted-foreground">
            Session: <code>{sessionId}</code> — {questions.length} domande
          </p>
        )}
      </section>

      {sessionId && questions.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-medium">2. Questionario</h2>
          <DynamicForm
            sessionId={sessionId}
            sectorQuestions={questions}
            savedAnswers={{}}
            onSuccess={handleFormSuccess}
            splitRequiredOptional
          />
        </section>
      )}

      {running && <p className="text-sm text-muted-foreground">Motore in esecuzione…</p>}
      {engineErr && <p className="text-sm text-destructive">Motore: {engineErr}</p>}

      {results && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-medium">
            3. Risultati
            {userScore !== null && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">(score: {userScore})</span>
            )}
          </h2>
          <div className="flex flex-col gap-4">
            {results.map((r) => <DebugResultCard key={r.id} result={r} />)}
          </div>
        </section>
      )}
    </div>
  )
}
