"use client"

import { useState, useEffect, useRef } from "react"
import type { Sector } from "@/lib/data/catalog"
import type { QuoteResult, Profession, SectorQuestion } from "@/lib/types"
import {
  createQuoteSession,
  saveAnswers,
  fetchProfessions,
  runEngine,
  fetchQuoteResults,
  fetchSectorQuestions,
  tuneQuote,
} from "@/app/actions"

// ─── FAKE COMPANIES (other options, prices relative to real AmTrust) ──────────

const FAKE_COMPANIES = [
  { id: "axa", name: "AXA", product: "RC Pro Smart", mult: 1.08, tag: null, features: ["Liquidazione in 72h", "Assistenza legale inclusa", "App mobile"] },
  { id: "generali", name: "Generali", product: "Libero Professionista", mult: 1.14, tag: null, features: ["Rete 400 agenzie", "Consulente dedicato", "App sinistri"] },
  { id: "unipol", name: "Unipol", product: "RC Pro Base", mult: 0.95, tag: "PIÙ ECONOMICO", features: ["Prezzo contenuto", "Copertura essenziale", "Gestione online"] },
  { id: "allianz", name: "Allianz", product: "Professionale Plus", mult: 1.21, tag: "COPERTURA COMPLETA", features: ["Premium 360°", "Cyber risk incluso", "Supporto internazionale"] },
]

const FAQ = [
  { q: "Quanto tempo serve per ottenere un preventivo?", a: "In molti casi bastano pochi minuti. Ti chiediamo solo le informazioni che contano davvero: professione, attività, responsabilità e rischi. Niente moduli infiniti." },
  { q: "Come viene scelta la polizza consigliata?", a: "Il sistema analizza il tuo profilo professionale, i rischi tipici della tua attività e le coperture disponibili per individuare la soluzione più coerente — non solo la più economica." },
  { q: "Posso vedere anche altre opzioni oltre a quella consigliata?", a: "Sì. La piattaforma ti propone una soluzione consigliata, ma mantiene visibili anche le alternative disponibili. Trasparenza totale." },
  { q: "Il preventivo è gratuito e senza impegno?", a: "Sempre. Nessun costo nascosto, nessun obbligo di acquisto. Puoi calcolare il preventivo, confrontare le opzioni e decidere con calma." },
  { q: "Posso parlare con un consulente?", a: "Sì. Se necessario puoi ricevere supporto da un consulente dedicato. Tecnologia e presenza umana lavorano insieme." },
  { q: "Cosa sono massimali, franchigie e retroattività?", a: "Sono i parametri chiave di una RC professionale. Ti spieghiamo cosa significano in modo chiaro, senza linguaggio tecnico, così sai esattamente cosa stai acquistando." },
]

// ─── UTILS ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)
}

function validatePhone(v: string) {
  return /^(\+?\d[\d\s.\-]{6,}\d)$/.test(v.trim())
}

function formatAnswerValue(q: SectorQuestion, val: unknown): string {
  if (val === undefined || val === null || val === "") return ""
  if (typeof val === "boolean") return val ? "Sì" : "No"
  if (q.type === "boolean") return val === true || val === "true" ? "Sì" : "No"
  if (q.type === "dropdown" && q.options) {
    const opt = q.options.find((o) => String(o.value) === String(val))
    return opt?.label ?? String(val)
  }
  return String(val)
}

function checkVisible(visibleIf: Record<string, unknown> | null, answers: Record<string, unknown>): boolean {
  if (!visibleIf) return true
  if ("key" in visibleIf && "op" in visibleIf) {
    const k = visibleIf.key as string
    const v = visibleIf.value
    const op = visibleIf.op as string
    const ans = answers[k]
    if (op === "equals") return ans === v
    if (op === "not_equals") return ans !== v
    if (op === "in") return Array.isArray(v) && v.includes(ans)
    if (op === "not_in") return Array.isArray(v) && !v.includes(ans)
    return true
  }
  if ("all" in visibleIf && Array.isArray(visibleIf.all)) {
    return (visibleIf.all as Record<string, unknown>[]).every((c) => checkVisible(c, answers))
  }
  if ("any" in visibleIf && Array.isArray(visibleIf.any)) {
    return (visibleIf.any as Record<string, unknown>[]).some((c) => checkVisible(c, answers))
  }
  for (const [key, val] of Object.entries(visibleIf)) {
    if (answers[key] !== val) return false
  }
  return true
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const inputCls = "w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium focus:outline-none focus:border-green-500 transition-colors appearance-none"
const labelCls = "block text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-black"

function Btn({ children, onClick, disabled, type = "button" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="w-full bg-green-400 text-black border-2 border-black font-black uppercase tracking-wider py-3.5 text-sm hover:bg-black hover:text-green-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
      {children}
    </button>
  )
}

function BtnOutline({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="border-2 border-black font-black uppercase tracking-wider px-5 py-3.5 text-sm hover:bg-black hover:text-white transition-all cursor-pointer flex-shrink-0">
      {children}
    </button>
  )
}

// ─── QUOTE FORM ───────────────────────────────────────────────────────────────

type FormFields = {
  sectorId: string
  professionSlug: string
  professionName: string
  sectorAnswers: Record<string, unknown>
  nome: string
  email: string
  telefono: string
}

function SectorField({
  question,
  value,
  answers,
  onChange,
}: {
  question: SectorQuestion
  value: unknown
  answers: Record<string, unknown>
  onChange: (v: unknown) => void
}) {
  if (!checkVisible(question.visibleIf, answers)) return null

  if (question.type === "boolean") {
    return (
      <div>
        <label className={labelCls}>{question.label}</label>
        <div className="flex gap-2">
          {[{ v: true, label: "Sì" }, { v: false, label: "No" }].map((opt) => (
            <button key={String(opt.v)} type="button" onClick={() => onChange(opt.v)}
              className={`flex-1 py-2.5 border-2 text-xs font-black uppercase tracking-wider transition-all ${value === opt.v ? "border-black bg-green-400 text-black" : "border-black bg-white hover:border-green-500"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }
  if (question.type === "dropdown" && question.options?.length) {
    return (
      <div>
        <label className={labelCls}>{question.label}</label>
        <select className={inputCls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Seleziona —</option>
          {question.options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>{o.label ?? String(o.value)}</option>
          ))}
        </select>
      </div>
    )
  }
  if (question.type === "number") {
    const vl = question.validation
    return (
      <div>
        <label className={labelCls}>{question.label}{vl?.min !== undefined && vl?.max !== undefined ? ` (${vl.min}–${vl.max})` : ""}</label>
        <input type="number" className={inputCls} value={String(value ?? "")}
          min={vl?.min} max={vl?.max} step={vl?.step ?? 1}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />
      </div>
    )
  }
  return (
    <div>
      <label className={labelCls}>{question.label}</label>
      <input type="text" className={inputCls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function QuoteFormComp({
  sectors,
  onSubmit,
  error,
}: {
  sectors: Sector[]
  onSubmit: (d: FormFields) => void
  error: string | null
}) {
  const [step, setStep] = useState(1)
  const [professions, setProfessions] = useState<Profession[]>([])
  const [requiredQuestions, setRequiredQuestions] = useState<SectorQuestion[]>([])
  const [loadingProfs, setLoadingProfs] = useState(false)
  const [loadingQs, setLoadingQs] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [base, setBase] = useState({ sectorId: "", professionSlug: "", professionName: "", nome: "", email: "", telefono: "" })
  const [sectorAnswers, setSectorAnswers] = useState<Record<string, unknown>>({})
  const setB = (k: keyof typeof base, v: string) => setBase((p) => ({ ...p, [k]: v }))
  const setA = (k: string, v: unknown) => setSectorAnswers((p) => ({ ...p, [k]: v }))

  // Current answers for visible_if evaluation
  const currentAnswers = { q_professione: base.professionSlug, ...sectorAnswers }

  // Visible required questions considering current answers
  const visibleReq = requiredQuestions.filter((q) => checkVisible(q.visibleIf, currentAnswers))

  // Max steps: 1 = profession, 2 = sector questions (if any), 3 = contacts
  const totalSteps = requiredQuestions.length > 0 ? 3 : 2
  const stepLabels = totalSteps === 3
    ? ["Professione", "Dettagli", "Contatti"]
    : ["Professione", "Contatti"]

  useEffect(() => {
    if (!base.sectorId) { setProfessions([]); setB("professionSlug", ""); return }
    setLoadingProfs(true)
    fetchProfessions(base.sectorId)
      .then((p) => { setProfessions(p); setLoadingProfs(false) })
      .catch(() => setLoadingProfs(false))
    setB("professionSlug", "")
    setRequiredQuestions([])
    setSectorAnswers({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base.sectorId])

  async function handleStep1Continue() {
    if (!base.sectorId) { setLocalError("Seleziona il settore"); return }
    if (!base.professionSlug) { setLocalError("Seleziona la specializzazione"); return }
    setLocalError(null)
    setLoadingQs(true)
    const allQs = await fetchSectorQuestions(base.sectorId)
    const reqQs = allQs.filter((q) => q.isRequired)
    setRequiredQuestions(reqQs)
    setLoadingQs(false)
    setStep(reqQs.length > 0 ? 2 : totalSteps)
  }

  function validateStep2() {
    for (const q of visibleReq) {
      const v = sectorAnswers[q.key]
      if (v === undefined || v === "" || v === null) {
        setLocalError(`Rispondi a: "${q.label}"`)
        return false
      }
    }
    setLocalError(null); return true
  }

  function validateContacts() {
    if (base.nome.trim().length < 2) { setLocalError("Nome troppo corto"); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(base.email)) { setLocalError("Email non valida"); return false }
    if (!validatePhone(base.telefono)) { setLocalError("Telefono non valido (es. +39 333 1234567)"); return false }
    setLocalError(null); return true
  }

  const contactStep = totalSteps

  return (
    <div className="border-2 border-black">
      {/* header */}
      <div className="bg-black px-6 py-4 border-b-2 border-black">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-green-400 mb-0.5">PREVENTIVO GRATUITO · SENZA IMPEGNO</p>
        <p className="text-base font-black text-white">Calcola il tuo preventivo personalizzato.</p>
      </div>

      {/* step bar */}
      <div className="flex border-b-2 border-black">
        {stepLabels.map((label, i) => {
          const n = i + 1; const done = n < step; const active = n === step
          return (
            <div key={n} className={`flex-1 py-2.5 flex flex-col items-center justify-center border-r-2 last:border-r-0 border-black text-[10px] font-black uppercase tracking-wider select-none transition-colors ${done ? "bg-green-400 text-black" : active ? "bg-black text-white" : "bg-white text-black/30"}`}>
              <span>{done ? "✓" : `0${n}`}</span>
              <span className="text-[9px] mt-0.5">{label}</span>
            </div>
          )
        })}
      </div>

      <div className="p-6 space-y-4">
        {/* STEP 1 — settore + professione */}
        {step === 1 && (
          <>
            <div>
              <label className={labelCls}>Settore professionale</label>
              <select className={inputCls} value={base.sectorId} onChange={(e) => setB("sectorId", e.target.value)}>
                <option value="">— Seleziona —</option>
                {sectors.map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
              </select>
            </div>
            {base.sectorId && (
              <div>
                <label className={labelCls}>Specializzazione</label>
                <select className={inputCls} value={base.professionSlug}
                  onChange={(e) => {
                    setB("professionSlug", e.target.value)
                    setB("professionName", professions.find(p => p.slug === e.target.value)?.name ?? "")
                  }}
                  disabled={loadingProfs}>
                  <option value="">{loadingProfs ? "Caricamento…" : "— Seleziona —"}</option>
                  {professions.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            {localError && <p className="text-xs text-red-600 font-semibold">{localError}</p>}
            <Btn onClick={handleStep1Continue} disabled={loadingQs}>
              {loadingQs ? "Caricamento…" : "Continua →"}
            </Btn>
          </>
        )}

        {/* STEP 2 — required sector questions */}
        {step === 2 && totalSteps === 3 && (
          <>
            {visibleReq.map((q) => (
              <SectorField key={q.key} question={q} value={sectorAnswers[q.key]} answers={currentAnswers} onChange={(v) => setA(q.key, v)} />
            ))}
            {localError && <p className="text-xs text-red-600 font-semibold">{localError}</p>}
            <div className="flex gap-3">
              <BtnOutline onClick={() => { setLocalError(null); setStep(1) }}>← Indietro</BtnOutline>
              <Btn onClick={() => validateStep2() && setStep(3)}>Continua →</Btn>
            </div>
          </>
        )}

        {/* CONTACTS step */}
        {step === contactStep && (
          <>
            <div>
              <label className={labelCls}>Nome e cognome</label>
              <input type="text" className={inputCls} placeholder="Mario Rossi" value={base.nome} onChange={(e) => setB("nome", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} placeholder="mario@studio.it" value={base.email} onChange={(e) => setB("email", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Telefono</label>
              <input type="tel" className={inputCls} placeholder="+39 333 1234567" value={base.telefono} onChange={(e) => setB("telefono", e.target.value)} />
            </div>
            {(localError || error) && <p className="text-xs text-red-600 font-semibold">{localError ?? error}</p>}
            <div className="flex gap-3">
              <BtnOutline onClick={() => { setLocalError(null); setStep(step - 1) }}>← Indietro</BtnOutline>
              <Btn onClick={() => validateContacts() && onSubmit({ sectorId: base.sectorId, professionSlug: base.professionSlug, professionName: base.professionName, sectorAnswers, nome: base.nome, email: base.email, telefono: base.telefono })}>
                Calcola preventivo →
              </Btn>
            </div>
            <p className="text-[10px] text-gray-400 text-center pt-1">🔒 Dati al sicuro. Nessuno spam.</p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── LOADING ─────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
      <div className="border-2 border-black p-10 flex flex-col items-center gap-6">
        <div className="flex items-end gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-2.5 bg-green-400 border border-black" style={{ height: "24px", animation: `bar 0.9s ease-in-out ${i * 0.12}s infinite` }} />
          ))}
        </div>
        <div className="text-center">
          <p className="font-black text-sm uppercase tracking-[0.2em]">Analizzando il mercato</p>
          <p className="text-xs text-gray-400 mt-1">Confronto le migliori compagnie per te</p>
        </div>
      </div>
      <style>{`@keyframes bar{0%,100%{transform:scaleY(.4);opacity:.4}50%{transform:scaleY(1.6);opacity:1}}`}</style>
    </div>
  )
}

// ─── REFINEMENT FIELD ─────────────────────────────────────────────────────────

function RefinementField({
  question,
  value,
  onChange,
}: {
  question: SectorQuestion
  value: unknown
  onChange: (v: unknown) => void
}) {
  if (question.type === "boolean") {
    return (
      <div>
        <label className={labelCls}>{question.label}</label>
        <div className="flex gap-2">
          {[{ v: true, label: "Sì" }, { v: false, label: "No" }].map((opt) => (
            <button key={String(opt.v)} type="button" onClick={() => onChange(opt.v)}
              className={`flex-1 py-2.5 border-2 text-xs font-black uppercase tracking-wider transition-all ${value === opt.v ? "border-black bg-green-400 text-black" : "border-black bg-white text-black hover:border-green-500"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (question.type === "dropdown" && question.options?.length) {
    return (
      <div>
        <label className={labelCls}>{question.label}</label>
        <select className={inputCls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Seleziona —</option>
          {question.options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>{o.label ?? String(o.value)}</option>
          ))}
        </select>
      </div>
    )
  }

  if (question.type === "number") {
    const v = question.validation
    return (
      <div>
        <label className={labelCls}>{question.label}</label>
        <input type="number" className={inputCls} value={String(value ?? "")}
          min={v?.min} max={v?.max} step={v?.step ?? 1}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />
      </div>
    )
  }

  return (
    <div>
      <label className={labelCls}>{question.label}</label>
      <input type="text" className={inputCls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

// ─── RESULTS PAGE ─────────────────────────────────────────────────────────────

function ResultsPage({
  nome,
  sectorName,
  professionName,
  featured,
  allResults,
  sectorQuestions,
  answers,
  sessionId,
  refinementOpen,
  priceUpdated,
  isRefining,
  onToggleRefinement,
  onRefinementChange,
  onBack,
}: {
  nome: string
  sectorName: string
  professionName: string
  featured: QuoteResult | null
  allResults: QuoteResult[]
  sectorQuestions: SectorQuestion[]
  answers: Record<string, unknown>
  sessionId: string
  refinementOpen: boolean
  priceUpdated: boolean
  isRefining: boolean
  onToggleRefinement: () => void
  onRefinementChange: (key: string, value: unknown) => void
  onBack: () => void
}) {
  const firstName = nome.trim().split(" ")[0]
  const realPrice = featured?.premiumTotal ?? null
  const isEstimate = featured?.isEstimate ?? true

  const visibleQuestions = sectorQuestions.filter(
    (q) => !q.isRequired && checkVisible(q.visibleIf, answers)
  )

  // Build recap: sector/profession + required question answers
  const recapItems: { label: string; value: string }[] = [
    ...(sectorName ? [{ label: "Settore", value: sectorName }] : []),
    ...(professionName ? [{ label: "Specializzazione", value: professionName }] : []),
    ...sectorQuestions
      .filter((q) => q.isRequired)
      .map((q) => ({ label: q.label, value: formatAnswerValue(q, answers[q.key]) }))
      .filter((item) => item.value !== ""),
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* header */}
      <div className="bg-black text-white border-b-4 border-green-400 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <span className="font-black text-lg tracking-tighter">SCELGOSICURO<span className="text-green-400">.</span></span>
          <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-green-400 border border-green-400 px-4 py-2 hover:bg-green-400 hover:text-black transition-all">
            ← Nuovo preventivo
          </button>
        </div>
      </div>

      {/* result heading */}
      <div className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-2">PREVENTIVO PERSONALIZZATO</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {firstName ? `Ciao ${firstName}, abbiamo trovato` : "Abbiamo trovato"} la polizza giusta per te.
          </h1>
          {isEstimate && (
            <p className="text-xs text-amber-600 font-semibold mt-2 border border-amber-300 bg-amber-50 inline-block px-3 py-1">
              ⚡ Preventivo stimato — completa le domande per il prezzo definitivo
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── FEATURED CARD ── */}
          <div className="lg:col-span-2 border-2 border-black">
            <div className="bg-black px-6 py-3 flex items-center justify-between border-b-2 border-black">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">⭐ LA NOSTRA SCELTA PER TE</p>
              {priceUpdated && <span className="bg-green-400 text-black text-[10px] font-black px-2 py-0.5 uppercase tracking-wide animate-pulse">↑ Aggiornato</span>}
            </div>

            {featured ? (
              <>
                <div className={`bg-green-400 p-6 sm:p-8 transition-opacity duration-300 ${isRefining ? "opacity-60" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    <div>
                      <p className="text-4xl sm:text-5xl font-black tracking-tighter">{featured.insurerName}</p>
                      <p className="text-sm font-bold text-black/60 mt-1">{featured.productName}</p>
                    </div>
                    <div className="text-right">
                      {realPrice !== null ? (
                        <>
                          <p className="text-5xl sm:text-6xl font-black font-mono tracking-tighter">{fmt(realPrice)}</p>
                          <p className="text-xs font-bold text-black/60 mt-1">/ anno · IVA inclusa</p>
                          <p className="text-xs font-bold text-black/50">{fmt(Math.round(realPrice / 12))} / mese</p>
                        </>
                      ) : (
                        <p className="text-2xl font-black text-black/50">Su richiesta</p>
                      )}
                    </div>
                  </div>
                  {isRefining && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-1.5 h-1.5 bg-black rounded-full" style={{ animation: `dot 0.6s ease-in-out ${i * 0.15}s infinite` }} />
                        ))}
                      </div>
                      <span className="text-xs font-bold">Ricalcolo in corso…</span>
                    </div>
                  )}
                </div>
                {/* RECAP SCELTE */}
                {recapItems.length > 0 && (
                  <div className="border-t-2 border-black bg-white px-6 py-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/30 mb-3">RIEPILOGO SCELTE</p>
                    <div className="flex flex-wrap gap-2">
                      {recapItems.map((item) => (
                        <span key={item.label} className="inline-flex items-center gap-2 border-2 border-black/20 bg-black/[0.03] px-3 py-2">
                          <span className="text-xs font-bold uppercase tracking-wide text-black/40">{item.label}</span>
                          <span className="text-xs font-black text-black">{item.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="p-5 flex flex-col sm:flex-row gap-3 border-t-2 border-black">
                  <button className="flex-1 bg-black text-white border-2 border-black font-black uppercase tracking-wider py-4 text-sm hover:bg-green-400 hover:text-black transition-all">
                    Acquista questa polizza →
                  </button>
                  <button className="border-2 border-black font-black uppercase tracking-wider px-5 py-4 text-xs hover:bg-black hover:text-white transition-all">
                    Dettagli DIP
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p className="font-black text-lg">Preventivo su richiesta</p>
                <p className="text-sm mt-2">Compila le domande nel pannello a fianco per ottenere il tuo preventivo.</p>
              </div>
            )}
          </div>

          {/* ── REFINEMENT PANEL ── */}
          <div>
            <div className="border-2 border-black lg:sticky lg:top-20">
              <button onClick={onToggleRefinement} className="w-full flex items-center justify-between px-5 py-4 bg-black text-white hover:bg-gray-900 transition-colors">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">PERSONALIZZA</p>
                  <p className="text-sm font-black mt-0.5">Affina il preventivo</p>
                </div>
                <span className="text-green-400 text-xl font-black">{refinementOpen ? "−" : "+"}</span>
              </button>

              {refinementOpen && (
                <div className="p-5 space-y-4 border-t-2 border-black max-h-[70vh] overflow-y-auto">
                  {visibleQuestions.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Nessuna domanda aggiuntiva disponibile per questo profilo.
                    </p>
                  ) : (
                    visibleQuestions.map((q) => (
                      <RefinementField
                        key={q.key}
                        question={q}
                        value={answers[q.key]}
                        onChange={(v) => onRefinementChange(q.key, v)}
                      />
                    ))
                  )}
                  {realPrice !== null && (
                    <div className="border-t-2 border-black pt-4 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest">Totale aggiornato</span>
                      <span className="font-black font-mono text-lg text-green-600">{fmt(realPrice)}/anno</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── OTHER OPTIONS ── */}
        {realPrice !== null && (
          <div className="mt-10 border-t-4 border-black pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight">Altre opzioni disponibili</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{FAKE_COMPANIES.length} compagnie</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 border-2 border-black">
              {FAKE_COMPANIES.map((company, i) => {
                const price = Math.round(realPrice * company.mult)
                const diffPct = Math.round((company.mult - 1) * 100)
                return (
                  <div key={company.id} className={`p-5 flex flex-col ${i < FAKE_COMPANIES.length - 1 ? "md:border-r-2 border-black" : ""} border-b-2 md:border-b-0 border-black`}>
                    <div className="flex-1">
                      {company.tag && (
                        <div className="inline-block border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase tracking-widest mb-3">{company.tag}</div>
                      )}
                      {!company.tag && <div className="h-[22px] mb-3" />}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xl font-black">{company.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">{company.product}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black font-mono">{fmt(price)}</p>
                          <p className={`text-[10px] font-black mt-0.5 ${diffPct > 0 ? "text-red-500" : "text-green-600"}`}>
                            {diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        {company.features.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-black flex items-center justify-center flex-shrink-0">
                              <span className="text-[7px] font-black">✓</span>
                            </div>
                            <span className="text-[10px] font-medium text-gray-500">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button className="w-full border-2 border-black font-black uppercase tracking-wider py-2 text-[10px] hover:bg-black hover:text-white transition-all mt-auto">
                      Seleziona →
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-8 border-2 border-black/20 p-4">
          <p className="text-[10px] text-gray-400 leading-relaxed">
            <strong>Nota:</strong> I prezzi di AXA, Generali, Unipol e Allianz sono stime illustrative.
            Il prezzo {featured?.insurerName} è calcolato dal nostro motore sui tariffari reali.
            ScelgoSicuro è un intermediario assicurativo iscritto al R.U.I. presso IVASS.
          </p>
        </div>
      </div>
      <style>{`@keyframes dot{0%,100%{transform:scale(.6);opacity:.4}50%{transform:scale(1.2);opacity:1}}`}</style>
    </div>
  )
}

// ─── LANDING CONTENT ─────────────────────────────────────────────────────────

function LandingContent({
  sectors,
  onSubmit,
  formError,
  formRef,
}: {
  sectors: Sector[]
  onSubmit: (d: FormFields) => Promise<void>
  formError: string | null
  formRef: React.RefObject<HTMLDivElement>
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10 lg:gap-16 items-start">
          <div className="space-y-8 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500">RC PROFESSIONALE · LIBERI PROFESSIONISTI</p>
            <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-black leading-[0.92] tracking-tight">
              Scegliere la RC<br />giusta non<br /><em className="not-italic text-green-500">dovrebbe essere complicato.</em>
            </h1>
            <p className="text-base text-gray-500 font-medium leading-relaxed max-w-md">
              ScelgoSicuro analizza il tuo profilo professionale, seleziona la soluzione più adatta e ti spiega davvero cosa stai acquistando.
            </p>
            <div className="space-y-2.5">
              {["Poche domande, preventivo in 2 minuti", "Analisi reale del tuo profilo di rischio", "Spiegazioni chiare — nessun linguaggio tecnico", "Emissione digitale in meno di 24 ore"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-400 border-2 border-black flex items-center justify-center flex-shrink-0">
                    <span className="text-black text-[10px] font-black leading-none">✓</span>
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t-2 border-black">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Compagnie convenzionate</p>
              <div className="flex flex-wrap gap-2">
                {["AMTRUST", "AXA", "GENERALI", "UNIPOL", "ALLIANZ"].map((c) => (
                  <span key={c} className="border-2 border-black px-3 py-1 text-[10px] font-black tracking-widest">{c}</span>
                ))}
              </div>
            </div>
          </div>

          <div ref={formRef} className="relative">
            <div className="absolute -top-6 -right-4 text-[11rem] font-black leading-none select-none pointer-events-none text-green-50 z-0" aria-hidden>RC</div>
            <div className="relative z-10">
              <QuoteFormComp sectors={sectors} onSubmit={onSubmit} error={formError} />
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-green-400 border-y-4 border-black overflow-hidden py-3">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 22s linear infinite" }}>
          {[0, 1, 2].map((rep) => (
            <span key={rep} className="inline-flex items-center mr-0">
              {["AMTRUST", "AXA", "GENERALI", "UNIPOL", "ALLIANZ", "HDI", "GROUPAMA", "ZURICH", "SARA"].map((c) => (
                <span key={`${rep}-${c}`} className="inline-flex items-center gap-6 mx-8 text-black font-black uppercase tracking-[0.2em] text-sm">
                  <span className="text-black/40">▲</span>{c}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="come-funziona" className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-3">COME FUNZIONA</p>
          <h2 className="text-[clamp(2.2rem,5vw,3.5rem)] font-black tracking-tight leading-[1.0]">Un processo semplice.<br />Pensato per chi lavora.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-black">
          {[
            { n: "01", title: "Inserisci poche informazioni", desc: "Ti chiediamo solo ciò che serve: professione, attività, responsabilità, rischi. Niente moduli infiniti o compilazioni inutili." },
            { n: "02", title: "Il sistema analizza il tuo profilo", desc: "ScelgoSicuro combina le caratteristiche della tua professione, i rischi tipici del settore, la qualità delle coperture e il costo. L'obiettivo non è mostrarti decine di prodotti — è trovare quello più coerente con il tuo lavoro." },
            { n: "03", title: "Ricevi una proposta già selezionata", desc: "Ti presentiamo la soluzione più adatta al tuo profilo. Se vuoi, puoi confrontarla con le alternative disponibili e affinare il preventivo in tempo reale." },
          ].map((s, i) => (
            <div key={i} className={`p-8 sm:p-10 ${i < 2 ? "md:border-r-2 border-black" : ""} border-b-2 md:border-b-0 border-black`}>
              <p className="text-7xl font-black text-green-400 leading-none mb-6 font-mono">{s.n}</p>
              <h3 className="text-xl font-black mb-3">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div className="border-y-4 border-black bg-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 border-2 border-white/10">
            {[
              { n: "2 min", label: "Per ottenere un preventivo" },
              { n: "5+", label: "Compagnie confrontate" },
              { n: "100%", label: "Online — zero burocrazia" },
              { n: "< 24h", label: "Polizza attiva" },
            ].map((s, i) => (
              <div key={i} className={`p-8 ${i < 3 ? "border-r border-white/10" : ""} border-b md:border-b-0 border-white/10`}>
                <p className="text-4xl sm:text-5xl font-black font-mono text-green-400">{s.n}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NON CONFRONTIAMO SOLO PREZZI */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-3">IL NOSTRO APPROCCIO</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-tight leading-[1.05] mb-6">
              Non confrontiamo solo i prezzi.<br />Analizziamo il tuo lavoro.
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Una RC professionale efficace dipende da molti fattori: il tipo di attività che svolgi, il livello di responsabilità, i clienti con cui lavori, i rischi specifici del tuo settore.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed mt-3">
              Per questo il nostro sistema non ordina semplicemente le polizze dal prezzo più basso. Identifica la soluzione più equilibrata tra protezione, coperture, affidabilità e costo.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px border-2 border-black">
            {[
              { label: "Tipo di attività svolta", desc: "Valutata in base al settore e alla specializzazione" },
              { label: "Livello di responsabilità", desc: "Struttura, volume d'affari, numero di collaboratori" },
              { label: "Rischi specifici del settore", desc: "Colpa grave, retroattività, massimali adeguati" },
              { label: "Qualità delle coperture", desc: "Non solo il premio annuo, ma cosa copre davvero" },
            ].map((item, i) => (
              <div key={i} className="p-5 bg-white border-b border-black last:border-b-0">
                <p className="font-black text-sm mb-1">{item.label}</p>
                <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPIRE UNA POLIZZA */}
      <div className="bg-black border-y-4 border-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400 mb-3">TRASPARENZA</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight mb-4">
                Capire una polizza dovrebbe essere semplice.
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Massimali, franchigie, retroattività, colpa grave. Molti professionisti sottoscrivono una polizza senza avere davvero chiaro cosa copre, cosa resta escluso e quali clausole incidono sulla protezione reale.
              </p>
              <p className="text-sm text-gray-400 leading-relaxed mt-3">
                ScelgoSicuro ti aiuta a comprendere le opzioni in modo semplice e chiaro, così puoi scegliere con maggiore sicurezza.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Cosa copre", "Cosa resta escluso", "Quali garanzie contano", "Clausole che incidono"].map((item) => (
                <div key={item} className="border-2 border-white/10 p-4 flex items-start gap-3">
                  <div className="w-4 h-4 bg-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-bold text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PROFESSIONI */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-3">SOLUZIONI DEDICATE</p>
          <h2 className="text-[clamp(2.2rem,5vw,3.5rem)] font-black tracking-tight leading-[1.0]">
            Ogni professione<br />ha esigenze diverse.
          </h2>
          <p className="text-sm text-gray-400 mt-4 max-w-lg">Anche la polizza dovrebbe esserlo. Copriamo le principali categorie professionali con soluzioni calibrate sul profilo di rischio reale.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 border-2 border-black">
          {["Medici", "Avvocati", "Ingegneri", "Geometri", "Architetti", "Commercialisti", "Consulenti", "Liberi professionisti"].map((prof, i) => (
            <div key={prof} className={`p-5 border-b-2 border-black ${i % 4 < 3 ? "sm:border-r-2 border-black" : ""}`}>
              <p className="font-black text-sm">{prof}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PERCHÉ SCELGOSICURO */}
      <div className="border-y-4 border-black bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-3">PERCHÉ NOI</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Perché scegliere ScelgoSicuro</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-2 border-black">
            {[
              { title: "Proposta realmente personalizzata", desc: "Basata sul tuo profilo professionale, non solo sul prezzo." },
              { title: "Sistema di selezione intelligente", desc: "Costruito per individuare la soluzione più coerente con il tuo livello di rischio." },
              { title: "Spiegazioni semplici e chiare", desc: "Per aiutarti a capire davvero cosa stai acquistando, senza termini tecnici." },
              { title: "Trasparenza totale", desc: "Ti consigliamo una soluzione, ma puoi sempre confrontare tutte le alternative." },
              { title: "Velocità e semplicità", desc: "Preventivo ed emissione gestiti completamente online, in pochi minuti." },
              { title: "Supporto umano quando serve", desc: "Tecnologia e consulenza lavorano insieme. Un consulente è sempre disponibile." },
            ].map((item, i) => (
              <div key={i} className={`p-6 border-b-2 border-black ${i % 3 < 2 ? "lg:border-r-2" : ""} ${i % 2 === 0 ? "sm:border-r-2 lg:border-r-0" : ""}`}>
                <div className="w-6 h-6 bg-green-400 border-2 border-black flex items-center justify-center mb-4">
                  <span className="text-black text-[10px] font-black">✓</span>
                </div>
                <h3 className="font-black text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section id="faq" className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-3">FAQ</p>
            <h2 className="text-4xl font-black tracking-tight">Domande frequenti</h2>
            <p className="text-sm text-gray-400 mt-4">
              Non trovi risposta?{" "}
              <span className="text-black font-bold border-b-2 border-green-400 cursor-pointer hover:text-green-600 transition-colors">Scrivici →</span>
            </p>
          </div>
          <div className="md:col-span-2 border-t-2 border-black">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b-2 border-black">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-5 px-4 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-sm pr-4">{item.q}</span>
                  <span className="text-xl font-black flex-shrink-0">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && <div className="px-4 pb-5 text-sm text-gray-500 leading-relaxed border-t border-black/10">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <div className="bg-green-400 border-y-4 border-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">La scelta giusta non è sempre la più economica.</h2>
            <p className="text-sm font-medium text-black/60 mt-2 max-w-md">È quella più adatta a proteggere il tuo lavoro. Online in pochi minuti — nessun obbligo.</p>
          </div>
          <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="bg-black text-white border-2 border-black font-black uppercase tracking-wider px-8 py-4 text-sm hover:bg-white hover:text-black transition-all flex-shrink-0">
            Ottieni il tuo preventivo →
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div>
              <p className="font-black text-2xl tracking-tighter mb-2">SCELGOSICURO<span className="text-green-400">.</span></p>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />P.IVA 12345678901</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {[
                { title: "Professioni", links: ["Medici", "Avvocati", "Ingegneri", "Commercialisti"] },
                { title: "Azienda", links: ["Chi siamo", "Come funziona", "Contatti"] },
                { title: "Legale", links: ["Privacy Policy", "Termini e condizioni", "Cookie Policy"] },
              ].map((col) => (
                <div key={col.title} className="space-y-3">
                  <p className="text-white">{col.title}</p>
                  {col.links.map((l) => <p key={l} className="hover:text-green-400 cursor-pointer transition-colors">{l}</p>)}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between gap-2 text-[10px] text-gray-600">
            <p>© 2025 ScelgoSicuro Srl. Tutti i diritti riservati.</p>
            <p>Regolato da IVASS — D.Lgs. 209/2005</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }
      `}</style>
    </>
  )
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function Navbar({ onCta }: { onCta: () => void }) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <span className="font-black text-xl tracking-tighter">SCELGOSICURO<span className="text-green-400">.</span></span>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
          <a href="#come-funziona" className="hover:text-green-500 transition-colors">Come funziona</a>
          <a href="#faq" className="hover:text-green-500 transition-colors">FAQ</a>
        </div>
        <button onClick={onCta} className="bg-green-400 text-black border-2 border-black font-black uppercase tracking-wider px-4 py-2 text-[10px] hover:bg-black hover:text-green-400 transition-all">
          Preventivo →
        </button>
      </div>
    </nav>
  )
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

export function LandingPage({ sectors }: { sectors: Sector[] }) {
  const [view, setView] = useState<"landing" | "loading" | "results">("landing")
  const [formError, setFormError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [nome, setNome] = useState("")
  const [sectorId, setSectorId] = useState("")
  const [sectorName, setSectorName] = useState("")
  const [professionName, setProfessionName] = useState("")
  const [quoteResults, setQuoteResults] = useState<QuoteResult[]>([])
  const [sectorQuestions, setSectorQuestions] = useState<SectorQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [isRefining, setIsRefining] = useState(false)
  const [priceUpdated, setPriceUpdated] = useState(false)
  const [refinementOpen, setRefinementOpen] = useState(true)
  const formRef = useRef<HTMLDivElement>(null!)

  async function handleFormSubmit(fields: FormFields) {
    setView("loading")
    setFormError(null)
    setNome(fields.nome)
    setSectorId(fields.sectorId)
    setSectorName(sectors.find((s) => String(s.id) === fields.sectorId)?.name ?? "")
    setProfessionName(fields.professionName)

    const sessionResult = await createQuoteSession({
      sectorId: fields.sectorId,
      professionSlug: fields.professionSlug,
      contactName: fields.nome,
      contactEmail: fields.email,
      contactPhone: fields.telefono,
    })

    if (!sessionResult.ok) {
      setFormError(sessionResult.error)
      setView("landing")
      return
    }

    const sid = sessionResult.sessionId
    setSessionId(sid)

    // Save sector question answers so the engine can compute a real price
    if (Object.keys(fields.sectorAnswers).length > 0) {
      await saveAnswers({ sessionId: sid, answers: fields.sectorAnswers })
    }

    // Track all answers (for visible_if evaluation in refinement panel)
    const allAnswers = { q_professione: fields.professionSlug, ...fields.sectorAnswers }
    setAnswers(allAnswers)

    await runEngine(sid)

    const [results, questions] = await Promise.all([
      fetchQuoteResults(sid),
      fetchSectorQuestions(fields.sectorId),
    ])

    setQuoteResults(results)
    setSectorQuestions(questions)
    setView("results")
  }

  async function handleRefinementChange(key: string, value: unknown) {
    if (!sessionId) return
    const newAnswers = { ...answers, [key]: value }
    setAnswers(newAnswers)
    setIsRefining(true)

    await tuneQuote(sessionId, { [key]: value })
    const results = await fetchQuoteResults(sessionId)

    setQuoteResults(results)
    setIsRefining(false)
    setPriceUpdated(true)
    setTimeout(() => setPriceUpdated(false), 1500)
  }

  // Pick the featured AmTrust result (prefer slot='safe', else first with price)
  const featured =
    quoteResults.find((r) => r.slot === "safe" && r.premiumTotal !== null) ??
    quoteResults.find((r) => r.premiumTotal !== null) ??
    quoteResults[0] ??
    null

  if (view === "loading") return <LoadingScreen />

  if (view === "results") {
    return (
      <ResultsPage
        nome={nome}
        sectorName={sectorName}
        professionName={professionName}
        featured={featured}
        allResults={quoteResults}
        sectorQuestions={sectorQuestions}
        answers={answers}
        sessionId={sessionId!}
        refinementOpen={refinementOpen}
        priceUpdated={priceUpdated}
        isRefining={isRefining}
        onToggleRefinement={() => setRefinementOpen((p) => !p)}
        onRefinementChange={handleRefinementChange}
        onBack={() => { setView("landing"); setQuoteResults([]); setSessionId(null) }}
      />
    )
  }

  return (
    <>
      <Navbar onCta={() => formRef.current?.scrollIntoView({ behavior: "smooth" })} />
      <LandingContent sectors={sectors} onSubmit={handleFormSubmit} formError={formError} formRef={formRef} />
    </>
  )
}
