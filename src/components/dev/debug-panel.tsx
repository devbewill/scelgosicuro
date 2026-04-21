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
  fetchProfessions,
  runEngine,
} from "@/app/actions"
import type { Sector } from "@/lib/data/catalog"
import type { SectorQuestion, QuoteResult, Profession } from "@/lib/types"

export function DebugPanel({ sectors }: { sectors: Sector[] }) {
  const [sectorId, setSectorId] = React.useState("")
  const [professionSlug, setProfessionSlug] = React.useState("")
  const [professionQuery, setProfessionQuery] = React.useState("")
  const [professions, setProfessions] = React.useState<Profession[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [questions, setQuestions] = React.useState<SectorQuestion[]>([])

  const [running, setRunning] = React.useState(false)
  const [engineErr, setEngineErr] = React.useState<string | null>(null)
  const [results, setResults] = React.useState<QuoteResult[] | null>(null)
  const [userScore, setUserScore] = React.useState<number | null>(null)

  const autocompleteRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!sectorId) { setProfessions([]); setProfessionSlug(""); setProfessionQuery(""); return }
    fetchProfessions(sectorId).then((ps) => {
      setProfessions(ps)
      setProfessionSlug("")
      setProfessionQuery("")
    })
  }, [sectorId])

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = professionQuery.trim()
    ? professions.filter((p) =>
        p.name.toLowerCase().includes(professionQuery.toLowerCase())
      )
    : professions

  function selectProfession(p: Profession) {
    setProfessionSlug(p.slug)
    setProfessionQuery(p.name)
    setShowSuggestions(false)
  }

  async function startSession() {
    if (!sectorId) return
    setLoading(true)
    setErr(null)
    setSessionId(null)
    setQuestions([])
    setResults(null)
    setEngineErr(null)
    try {
      const [res, qs] = await Promise.all([
        createDebugSession(sectorId, professionSlug || undefined),
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
        <div className="flex flex-wrap gap-2 items-start">
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

          {professions.length > 0 && (
            <div ref={autocompleteRef} className="relative">
              <Input
                placeholder="Cerca professione…"
                className="w-64"
                value={professionQuery}
                onChange={(e) => {
                  setProfessionQuery(e.target.value)
                  setProfessionSlug("")
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              {showSuggestions && filtered.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-sm shadow-md">
                  {filtered.map((p) => (
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
          )}

          <Button onClick={startSession} disabled={!sectorId || loading}>
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
