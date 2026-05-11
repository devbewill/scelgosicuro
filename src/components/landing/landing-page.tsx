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

// ─── FAKE COMPANIES ───────────────────────────────────────────────────────────

const FAKE_COMPANIES = [
  { id: "axa", name: "AXA", product: "RC Pro Smart", mult: 1.08, tag: null, features: ["Liquidazione in 72h", "Assistenza legale inclusa", "App mobile"] },
  { id: "generali", name: "Generali", product: "Libero Professionista", mult: 1.14, tag: null, features: ["Rete 400 agenzie", "Consulente dedicato", "App sinistri"] },
  { id: "unipol", name: "Unipol", product: "RC Pro Base", mult: 0.95, tag: "Più economico", features: ["Prezzo contenuto", "Copertura essenziale", "Gestione online"] },
  { id: "allianz", name: "Allianz", product: "Professionale Plus", mult: 1.21, tag: "Copertura completa", features: ["Premium 360°", "Cyber risk incluso", "Supporto internazionale"] },
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

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const MM = {
  bg:          "#F7F4EE",
  bgWhite:     "#FFFFFF",
  fg:          "#1C1C1A",
  muted:       "#5F5F5A",
  primary:     "#00C2A8",
  primaryHover:"#009E89",
  mintLight:   "#DDF7F2",
  border:      "#E8E4DC",
} as const

const inputCls = "w-full border border-[#E8E4DC] bg-white px-4 py-3.5 text-[#1C1C1A] text-base font-medium rounded-2xl focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/20 transition-all duration-200 appearance-none placeholder:text-[#5F5F5A]/50"
const labelCls = "block text-xs font-semibold text-[#5F5F5A] mb-1.5 tracking-wide"

function Btn({ children, onClick, disabled, type = "button" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="w-full bg-[#00C2A8] text-white font-semibold py-3.5 text-base rounded-full transition-all duration-200 hover:bg-[#009E89] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(0,194,168,0.25)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
      {children}
    </button>
  )
}

function BtnOutline({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="border border-[#E8E4DC] text-[#1C1C1A] font-semibold px-6 py-3.5 text-base rounded-full transition-all duration-200 hover:bg-black/[0.03] flex-shrink-0 cursor-pointer">
      {children}
    </button>
  )
}

// ─── FORM TYPES ───────────────────────────────────────────────────────────────

type FormFields = {
  sectorId: string
  professionSlug: string
  professionName: string
  sectorAnswers: Record<string, unknown>
  nome: string
  email: string
  telefono: string
}

// ─── SECTOR FIELD ─────────────────────────────────────────────────────────────

function SectorField({
  question, value, answers, onChange,
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
              className={`flex-1 py-3 border text-sm font-semibold rounded-2xl transition-all duration-200 ${value === opt.v ? "border-[#00C2A8] bg-[#DDF7F2] text-[#00C2A8]" : "border-[#E8E4DC] bg-white text-[#1C1C1A] hover:border-[#00C2A8]/40"}`}>
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

// ─── QUOTE FORM ───────────────────────────────────────────────────────────────

function QuoteFormComp({
  sectors, onSubmit, error,
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
  const [professionQuery, setProfessionQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const setB = (k: keyof typeof base, v: string) => setBase((p) => ({ ...p, [k]: v }))
  const setA = (k: string, v: unknown) => setSectorAnswers((p) => ({ ...p, [k]: v }))

  const currentAnswers = { q_professione: base.professionSlug, ...sectorAnswers }
  const visibleReq = requiredQuestions.filter((q) => checkVisible(q.visibleIf, currentAnswers))
  const totalSteps = requiredQuestions.length > 0 ? 3 : 2
  const stepLabels = totalSteps === 3 ? ["Professione", "Dettagli", "Contatti"] : ["Professione", "Contatti"]

  const filteredProfessions = professionQuery.trim()
    ? professions.filter((p) => p.name.toLowerCase().includes(professionQuery.toLowerCase()))
    : professions

  useEffect(() => {
    if (!base.sectorId) { setProfessions([]); setB("professionSlug", ""); setProfessionQuery(""); return }
    setLoadingProfs(true)
    fetchProfessions(base.sectorId)
      .then((p) => { setProfessions(p); setLoadingProfs(false) })
      .catch(() => setLoadingProfs(false))
    setB("professionSlug", "")
    setB("professionName", "")
    setProfessionQuery("")
    setRequiredQuestions([])
    setSectorAnswers({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base.sectorId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
        setLocalError(`Rispondi a: "${q.label}"`); return false
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
    <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
      {/* header */}
      <div className="bg-[#F7F4EE] px-7 py-5 border-b border-[#E8E4DC]">
        <span className="inline-block bg-[#DDF7F2] text-[#00C2A8] text-xs font-semibold rounded-full px-3 py-1 mb-2">
          Gratuito · Senza impegno
        </span>
        <p className="text-lg font-bold text-[#1C1C1A] font-[family-name:var(--font-heading)]">Calcola il tuo preventivo</p>
      </div>

      {/* step dots */}
      <div className="flex gap-2 px-7 pt-5">
        {stepLabels.map((label, i) => {
          const n = i + 1; const done = n < step; const active = n === step
          return (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${done ? "bg-[#00C2A8] text-white" : active ? "bg-[#1C1C1A] text-white" : "bg-[#F7F4EE] text-[#5F5F5A]"}`}>
                {done ? "✓" : n}
              </div>
              <span className={`text-xs font-medium ${active ? "text-[#1C1C1A]" : "text-[#5F5F5A]"}`}>{label}</span>
              {i < stepLabels.length - 1 && <div className="w-8 h-px bg-[#E8E4DC] mx-1" />}
            </div>
          )
        })}
      </div>

      <div className="p-7 space-y-4">
        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div>
              <label className={labelCls}>Settore professionale</label>
              <select className={inputCls} value={base.sectorId} onChange={(e) => setB("sectorId", e.target.value)}>
                <option value="">Seleziona il tuo settore…</option>
                {sectors.map((s) => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
              </select>
            </div>
            {base.sectorId && (
              <div ref={autocompleteRef} className="relative">
                <label className={labelCls}>
                  Specializzazione{loadingProfs ? <span className="ml-2 text-[#00C2A8] font-medium normal-case tracking-normal">Caricamento…</span> : ""}
                </label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Cerca la tua specializzazione…"
                  value={professionQuery}
                  autoComplete="off"
                  onChange={(e) => {
                    setProfessionQuery(e.target.value)
                    setB("professionSlug", "")
                    setB("professionName", "")
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && filteredProfessions.length > 0 && (
                  <ul className="absolute z-50 mt-1.5 max-h-56 w-full overflow-auto bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E8E4DC] text-sm">
                    {filteredProfessions.map((p) => (
                      <li
                        key={p.slug}
                        className="cursor-pointer px-4 py-3 font-medium text-[#1C1C1A] hover:bg-[#DDF7F2] hover:text-[#00C2A8] first:rounded-t-2xl last:rounded-b-2xl transition-colors border-b border-[#E8E4DC] last:border-b-0"
                        onMouseDown={() => {
                          setB("professionSlug", p.slug)
                          setB("professionName", p.name)
                          setProfessionQuery(p.name)
                          setShowSuggestions(false)
                        }}
                      >
                        {p.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {localError && <p className="text-sm text-red-500 font-medium">{localError}</p>}
            <Btn onClick={handleStep1Continue} disabled={loadingQs}>
              {loadingQs ? "Caricamento…" : "Continua →"}
            </Btn>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && totalSteps === 3 && (
          <>
            {visibleReq.map((q) => (
              <SectorField key={q.key} question={q} value={sectorAnswers[q.key]} answers={currentAnswers} onChange={(v) => setA(q.key, v)} />
            ))}
            {localError && <p className="text-sm text-red-500 font-medium">{localError}</p>}
            <div className="flex gap-3">
              <BtnOutline onClick={() => { setLocalError(null); setStep(1) }}>← Indietro</BtnOutline>
              <Btn onClick={() => validateStep2() && setStep(3)}>Continua →</Btn>
            </div>
          </>
        )}

        {/* CONTACTS */}
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
            {(localError || error) && <p className="text-sm text-red-500 font-medium">{localError ?? error}</p>}
            <div className="flex gap-3">
              <BtnOutline onClick={() => { setLocalError(null); setStep(step - 1) }}>← Indietro</BtnOutline>
              <Btn onClick={() => validateContacts() && onSubmit({ sectorId: base.sectorId, professionSlug: base.professionSlug, professionName: base.professionName, sectorAnswers, nome: base.nome, email: base.email, telefono: base.telefono })}>
                Calcola preventivo →
              </Btn>
            </div>
            <p className="text-xs text-[#5F5F5A]/70 text-center pt-1">🔒 I tuoi dati sono al sicuro. Nessuno spam.</p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── LOADING ─────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center gap-8">
      <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-12 flex flex-col items-center gap-6 max-w-sm w-full mx-6">
        <div className="flex items-end gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-2.5 bg-[#00C2A8] rounded-full" style={{ height: "24px", animation: `bar 0.9s ease-in-out ${i * 0.12}s infinite` }} />
          ))}
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-[#1C1C1A] font-[family-name:var(--font-heading)]">Analizzando il mercato</p>
          <p className="text-sm text-[#5F5F5A] mt-1">Confronto le migliori compagnie per te</p>
        </div>
      </div>
      <style>{`@keyframes bar{0%,100%{transform:scaleY(.4);opacity:.4}50%{transform:scaleY(1.6);opacity:1}}`}</style>
    </div>
  )
}

// ─── REFINEMENT FIELD ─────────────────────────────────────────────────────────

function RefinementField({
  question, value, onChange,
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
              className={`flex-1 py-3 border text-sm font-semibold rounded-2xl transition-all duration-200 ${value === opt.v ? "border-[#00C2A8] bg-[#DDF7F2] text-[#00C2A8]" : "border-[#E8E4DC] bg-white text-[#1C1C1A] hover:border-[#00C2A8]/40"}`}>
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
  nome, sectorName, professionName, featured, allResults,
  sectorQuestions, answers, sessionId, refinementOpen,
  priceUpdated, isRefining, onToggleRefinement, onRefinementChange, onBack,
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

  const recapItems: { label: string; value: string }[] = [
    ...(sectorName ? [{ label: "Settore", value: sectorName }] : []),
    ...(professionName ? [{ label: "Specializzazione", value: professionName }] : []),
    ...sectorQuestions
      .filter((q) => q.isRequired)
      .map((q) => ({ label: q.label, value: formatAnswerValue(q, answers[q.key]) }))
      .filter((item) => item.value !== ""),
  ]

  return (
    <div className="min-h-screen bg-[#F7F4EE]">
      {/* sticky header */}
      <div className="bg-white border-b border-[#E8E4DC] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <span className="font-bold text-xl text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">
            ScelgoSicuro<span className="text-[#00C2A8]">.</span>
          </span>
          <button onClick={onBack}
            className="text-sm font-semibold text-[#1C1C1A] border border-[#E8E4DC] px-4 py-2 rounded-full hover:bg-[#F7F4EE] transition-all duration-200">
            ← Nuovo preventivo
          </button>
        </div>
      </div>

      {/* heading */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-10 pb-4">
        <span className="inline-block bg-[#DDF7F2] text-[#00C2A8] text-xs font-semibold rounded-full px-3 py-1 mb-4">
          Preventivo personalizzato
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">
          {firstName ? `Ciao ${firstName}, abbiamo trovato` : "Abbiamo trovato"} la polizza giusta per te.
        </h1>
        {isEstimate && (
          <p className="text-sm text-amber-700 font-medium mt-3 bg-amber-50 border border-amber-200 rounded-xl inline-block px-4 py-2">
            ⚡ Preventivo stimato — completa le domande per il prezzo definitivo
          </p>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FEATURED CARD */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="bg-[#F7F4EE] px-6 py-4 flex items-center justify-between border-b border-[#E8E4DC]">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#00C2A8]">
                <span>⭐</span> La nostra scelta per te
              </span>
              {priceUpdated && (
                <span className="bg-[#DDF7F2] text-[#00C2A8] text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                  ↑ Aggiornato
                </span>
              )}
            </div>

            {featured ? (
              <>
                <div className={`bg-[#DDF7F2] p-6 sm:p-8 transition-opacity duration-300 ${isRefining ? "opacity-60" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">{featured.insurerName}</p>
                      <p className="text-base text-[#5F5F5A] font-medium mt-1">{featured.productName}</p>
                    </div>
                    <div className="text-right">
                      {realPrice !== null ? (
                        <>
                          <p className="text-4xl sm:text-5xl font-bold text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">{fmt(realPrice)}</p>
                          <p className="text-sm text-[#5F5F5A] font-medium mt-1">/ anno · IVA inclusa</p>
                          <p className="text-sm text-[#5F5F5A]/70">{fmt(Math.round(realPrice / 12))} / mese</p>
                        </>
                      ) : (
                        <p className="text-2xl font-bold text-[#5F5F5A]">Su richiesta</p>
                      )}
                    </div>
                  </div>
                  {isRefining && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-1.5 h-1.5 bg-[#00C2A8] rounded-full" style={{ animation: `dot 0.6s ease-in-out ${i * 0.15}s infinite` }} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-[#5F5F5A]">Ricalcolo in corso…</span>
                    </div>
                  )}
                </div>

                {recapItems.length > 0 && (
                  <div className="px-6 py-5 border-t border-[#E8E4DC]">
                    <p className="text-xs font-semibold text-[#5F5F5A] mb-3 tracking-wide">RIEPILOGO SCELTE</p>
                    <div className="flex flex-wrap gap-2">
                      {recapItems.map((item) => (
                        <span key={item.label} className="inline-flex items-center gap-2 bg-[#F7F4EE] border border-[#E8E4DC] px-3 py-2 rounded-xl text-sm">
                          <span className="font-medium text-[#5F5F5A]">{item.label}</span>
                          <span className="font-semibold text-[#1C1C1A]">{item.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="p-5 flex flex-col sm:flex-row gap-3 border-t border-[#E8E4DC]">
                  <button className="flex-1 bg-[#00C2A8] text-white font-semibold py-4 text-base rounded-full transition-all duration-200 hover:bg-[#009E89] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(0,194,168,0.25)]">
                    Acquista questa polizza →
                  </button>
                  <button className="border border-[#E8E4DC] text-[#1C1C1A] font-semibold px-6 py-4 text-sm rounded-full transition-all duration-200 hover:bg-[#F7F4EE]">
                    Dettagli DIP
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-[#5F5F5A]">
                <p className="font-bold text-lg text-[#1C1C1A]">Preventivo su richiesta</p>
                <p className="text-base mt-2">Compila le domande nel pannello a fianco per ottenere il tuo preventivo.</p>
              </div>
            )}
          </div>

          {/* REFINEMENT PANEL */}
          <div>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden lg:sticky lg:top-24">
              <button onClick={onToggleRefinement} className="w-full flex items-center justify-between px-5 py-5 hover:bg-[#F7F4EE] transition-colors">
                <div className="text-left">
                  <span className="inline-block bg-[#DDF7F2] text-[#00C2A8] text-xs font-semibold rounded-full px-2.5 py-0.5 mb-1">Personalizza</span>
                  <p className="text-base font-semibold text-[#1C1C1A]">Affina il preventivo</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-[#F7F4EE] flex items-center justify-center text-[#1C1C1A] font-bold text-lg flex-shrink-0">{refinementOpen ? "−" : "+"}</span>
              </button>

              {refinementOpen && (
                <div className="p-5 space-y-4 border-t border-[#E8E4DC] max-h-[70vh] overflow-y-auto">
                  {visibleQuestions.length === 0 ? (
                    <p className="text-sm text-[#5F5F5A] text-center py-4">
                      Nessuna domanda aggiuntiva disponibile per questo profilo.
                    </p>
                  ) : (
                    visibleQuestions.map((q) => (
                      <RefinementField key={q.key} question={q} value={answers[q.key]} onChange={(v) => onRefinementChange(q.key, v)} />
                    ))
                  )}
                  {realPrice !== null && (
                    <div className="border-t border-[#E8E4DC] pt-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#5F5F5A] tracking-wide">TOTALE AGGIORNATO</span>
                      <span className="font-bold text-lg text-[#00C2A8]">{fmt(realPrice)}/anno</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OTHER OPTIONS */}
        {realPrice !== null && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">Altre opzioni disponibili</h2>
              <span className="text-xs font-semibold text-[#5F5F5A] bg-[#F7F4EE] border border-[#E8E4DC] px-3 py-1.5 rounded-full">{FAKE_COMPANIES.length} compagnie</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {FAKE_COMPANIES.map((company) => {
                const price = Math.round(realPrice * company.mult)
                const diffPct = Math.round((company.mult - 1) * 100)
                return (
                  <div key={company.id} className="bg-white rounded-2xl border border-[#E8E4DC] p-5 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                    <div className="flex-1">
                      {company.tag && (
                        <span className="inline-block bg-[#DDF7F2] text-[#00C2A8] text-[10px] font-semibold rounded-full px-2.5 py-0.5 mb-3">{company.tag}</span>
                      )}
                      {!company.tag && <div className="h-[22px] mb-3" />}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold text-[#1C1C1A]">{company.name}</p>
                          <p className="text-xs text-[#5F5F5A] font-medium mt-0.5">{company.product}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#1C1C1A]">{fmt(price)}</p>
                          <p className={`text-xs font-semibold mt-0.5 ${diffPct > 0 ? "text-red-500" : "text-[#00C2A8]"}`}>
                            {diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        {company.features.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[#DDF7F2] flex items-center justify-center flex-shrink-0">
                              <span className="text-[#00C2A8] text-[8px] font-bold">✓</span>
                            </div>
                            <span className="text-xs text-[#5F5F5A] font-medium">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button className="w-full border border-[#E8E4DC] text-[#1C1C1A] font-semibold text-xs py-2.5 rounded-full hover:bg-[#F7F4EE] transition-colors mt-auto">
                      Seleziona →
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-8 bg-white border border-[#E8E4DC] rounded-2xl p-4">
          <p className="text-xs text-[#5F5F5A] leading-relaxed">
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
  sectors, onSubmit, formError, formRef,
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
      <section className="bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* left */}
            <div className="space-y-7">
              <span className="inline-block bg-[#DDF7F2] text-[#00C2A8] text-xs font-semibold rounded-full px-3.5 py-1.5">
                RC Professionale · Liberi Professionisti
              </span>
              <h1 className="text-[clamp(2.6rem,5.5vw,4.2rem)] font-bold leading-[1.0] tracking-[-0.03em] text-[#1C1C1A] font-[family-name:var(--font-heading)]">
                Scegliere la RC giusta non dovrebbe essere{" "}
                <span className="text-[#00C2A8]">complicato.</span>
              </h1>
              <p className="text-lg text-[#5F5F5A] leading-relaxed max-w-lg">
                ScelgoSicuro analizza il tuo profilo professionale, seleziona la soluzione più adatta e ti spiega davvero cosa stai acquistando.
              </p>
              <div className="space-y-3.5">
                {[
                  "Poche domande, preventivo in 2 minuti",
                  "Analisi reale del tuo profilo di rischio",
                  "Spiegazioni chiare — nessun linguaggio tecnico",
                  "Emissione digitale in meno di 24 ore",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#00C2A8] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[9px] font-bold leading-none">✓</span>
                    </div>
                    <span className="text-base text-[#1C1C1A] font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#5F5F5A] mb-3 tracking-wide">COMPAGNIE CONVENZIONATE</p>
                <div className="flex flex-wrap gap-2">
                  {["AMTRUST", "AXA", "GENERALI", "UNIPOL", "ALLIANZ"].map((c) => (
                    <span key={c} className="bg-white border border-[#E8E4DC] px-3.5 py-1.5 text-xs font-semibold text-[#5F5F5A] rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* right: form */}
            <div ref={formRef}>
              <QuoteFormComp sectors={sectors} onSubmit={onSubmit} error={formError} />
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-white border-y border-[#E8E4DC] overflow-hidden py-4">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
          {[0, 1, 2].map((rep) => (
            <span key={rep} className="inline-flex items-center">
              {["AMTRUST", "AXA", "GENERALI", "UNIPOL", "ALLIANZ", "HDI", "GROUPAMA", "ZURICH", "SARA"].map((c) => (
                <span key={`${rep}-${c}`} className="inline-flex items-center gap-5 mx-8 text-[#5F5F5A] font-semibold text-sm tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] inline-block" />{c}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="come-funziona" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24">
          <div className="mb-14 max-w-2xl">
            <span className="inline-block bg-[#DDF7F2] text-[#00C2A8] text-xs font-semibold rounded-full px-3.5 py-1.5 mb-5">
              Come funziona
            </span>
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.05] font-[family-name:var(--font-heading)]">
              Un processo semplice.<br />Pensato per chi lavora.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", title: "Inserisci poche informazioni", desc: "Ti chiediamo solo ciò che serve: professione, attività, responsabilità, rischi. Niente moduli infiniti o compilazioni inutili." },
              { n: "02", title: "Il sistema analizza il tuo profilo", desc: "ScelgoSicuro combina le caratteristiche della tua professione, i rischi tipici del settore e la qualità delle coperture. L'obiettivo non è mostrarti decine di prodotti — è trovare quello più coerente con il tuo lavoro." },
              { n: "03", title: "Ricevi una proposta già selezionata", desc: "Ti presentiamo la soluzione più adatta al tuo profilo. Se vuoi, puoi confrontarla con le alternative disponibili e affinare il preventivo in tempo reale." },
            ].map((s, i) => (
              <div key={i} className="bg-[#F7F4EE] rounded-3xl p-8 flex flex-col gap-5">
                <span className="text-5xl font-bold text-[#00C2A8] leading-none font-[family-name:var(--font-heading)]">{s.n}</span>
                <h3 className="text-xl font-bold text-[#1C1C1A] font-[family-name:var(--font-heading)]">{s.title}</h3>
                <p className="text-base text-[#5F5F5A] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[#1C1C1A]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
            {[
              { n: "2 min", label: "Per ottenere un preventivo" },
              { n: "5+", label: "Compagnie confrontate" },
              { n: "100%", label: "Online — zero burocrazia" },
              { n: "< 24h", label: "Polizza attiva" },
            ].map((s, i) => (
              <div key={i} className="bg-[#1C1C1A] p-8 sm:p-10">
                <p className="text-4xl sm:text-5xl font-bold text-[#00C2A8] font-[family-name:var(--font-heading)]">{s.n}</p>
                <p className="text-sm font-medium text-white/40 mt-3">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block bg-[#DDF7F2] text-[#00C2A8] text-xs font-semibold rounded-full px-3.5 py-1.5 mb-6">
                Il nostro approccio
              </span>
              <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.1] mb-6 font-[family-name:var(--font-heading)]">
                Non confrontiamo solo i prezzi.<br />Analizziamo il tuo lavoro.
              </h2>
              <p className="text-base text-[#5F5F5A] leading-relaxed">
                Una RC professionale efficace dipende da molti fattori: il tipo di attività che svolgi, il livello di responsabilità, i clienti con cui lavori, i rischi specifici del tuo settore.
              </p>
              <p className="text-base text-[#5F5F5A] leading-relaxed mt-4">
                Per questo il nostro sistema non ordina semplicemente le polizze dal prezzo più basso. Identifica la soluzione più equilibrata tra protezione, coperture, affidabilità e costo.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Tipo di attività svolta", desc: "Valutata in base al settore e alla specializzazione" },
                { label: "Livello di responsabilità", desc: "Struttura, volume d'affari, numero di collaboratori" },
                { label: "Rischi specifici del settore", desc: "Colpa grave, retroattività, massimali adeguati" },
                { label: "Qualità delle coperture", desc: "Non solo il premio annuo, ma cosa copre davvero" },
              ].map((item, i) => (
                <div key={i} className="bg-[#F7F4EE] border border-[#E8E4DC] rounded-2xl p-5 flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#DDF7F2] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#00C2A8] text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1C1C1A] text-base">{item.label}</p>
                    <p className="text-sm text-[#5F5F5A] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-[#DDF7F2] text-[#00C2A8] text-xs font-semibold rounded-full px-3.5 py-1.5 mb-6">
                Trasparenza
              </span>
              <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.1] mb-5 font-[family-name:var(--font-heading)]">
                Capire una polizza dovrebbe essere semplice.
              </h2>
              <p className="text-base text-[#5F5F5A] leading-relaxed">
                Massimali, franchigie, retroattività, colpa grave. Molti professionisti sottoscrivono una polizza senza avere davvero chiaro cosa copre, cosa resta escluso e quali clausole incidono sulla protezione reale.
              </p>
              <p className="text-base text-[#5F5F5A] leading-relaxed mt-4">
                ScelgoSicuro ti aiuta a comprendere le opzioni in modo semplice e chiaro, così puoi scegliere con maggiore sicurezza.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Cosa copre", "Cosa resta escluso", "Quali garanzie contano", "Clausole che incidono"].map((item) => (
                <div key={item} className="bg-white border border-[#E8E4DC] rounded-2xl p-5 flex items-start gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <div className="w-5 h-5 rounded-full bg-[#DDF7F2] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#00C2A8] text-[8px] font-bold">✓</span>
                  </div>
                  <span className="text-sm font-semibold text-[#1C1C1A] leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROFESSIONI */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24">
          <div className="mb-12">
            <span className="inline-block bg-[#DDF7F2] text-[#00C2A8] text-xs font-semibold rounded-full px-3.5 py-1.5 mb-5">
              Soluzioni dedicate
            </span>
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.05] font-[family-name:var(--font-heading)]">
              Ogni professione<br />ha esigenze diverse.
            </h2>
            <p className="text-base text-[#5F5F5A] mt-4 max-w-lg leading-relaxed">
              Anche la polizza dovrebbe esserlo. Copriamo le principali categorie professionali con soluzioni calibrate sul profilo di rischio reale.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["Medici", "Avvocati", "Ingegneri", "Geometri", "Architetti", "Commercialisti", "Consulenti", "Liberi professionisti"].map((prof) => (
              <div key={prof} className="bg-[#F7F4EE] border border-[#E8E4DC] rounded-2xl px-5 py-4 flex items-center gap-3 transition-all duration-200 hover:border-[#00C2A8]/40 hover:bg-[#DDF7F2]/30 cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-[#00C2A8] flex-shrink-0" />
                <p className="font-semibold text-sm text-[#1C1C1A]">{prof}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24">
          <div className="mb-12">
            <span className="inline-block bg-[#DDF7F2] text-[#00C2A8] text-xs font-semibold rounded-full px-3.5 py-1.5 mb-5">
              Perché noi
            </span>
            <h2 className="text-[clamp(2rem,4.5vw,3.2rem)] font-bold tracking-tight text-[#1C1C1A] leading-[1.05] font-[family-name:var(--font-heading)]">
              Perché scegliere ScelgoSicuro
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Proposta realmente personalizzata", desc: "Basata sul tuo profilo professionale, non solo sul prezzo." },
              { title: "Sistema di selezione intelligente", desc: "Costruito per individuare la soluzione più coerente con il tuo livello di rischio." },
              { title: "Spiegazioni semplici e chiare", desc: "Per aiutarti a capire davvero cosa stai acquistando, senza termini tecnici." },
              { title: "Trasparenza totale", desc: "Ti consigliamo una soluzione, ma puoi sempre confrontare tutte le alternative." },
              { title: "Velocità e semplicità", desc: "Preventivo ed emissione gestiti completamente online, in pochi minuti." },
              { title: "Supporto umano quando serve", desc: "Tecnologia e consulenza lavorano insieme. Un consulente è sempre disponibile." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-[#E8E4DC] rounded-3xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="w-10 h-10 bg-[#DDF7F2] rounded-2xl flex items-center justify-center mb-5">
                  <span className="text-[#00C2A8] text-base font-bold">✓</span>
                </div>
                <h3 className="font-bold text-[#1C1C1A] text-base mb-2 font-[family-name:var(--font-heading)]">{item.title}</h3>
                <p className="text-sm text-[#5F5F5A] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <span className="inline-block bg-[#DDF7F2] text-[#00C2A8] text-xs font-semibold rounded-full px-3.5 py-1.5 mb-5">
                FAQ
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#1C1C1A] font-[family-name:var(--font-heading)]">Domande frequenti</h2>
              <p className="text-base text-[#5F5F5A] mt-4 leading-relaxed">
                Non trovi risposta?{" "}
                <span className="text-[#00C2A8] font-semibold cursor-pointer hover:text-[#009E89] transition-colors">Scrivici →</span>
              </p>
            </div>
            <div className="md:col-span-2 space-y-3">
              {FAQ.map((item, i) => (
                <div key={i} className="bg-[#F7F4EE] border border-[#E8E4DC] rounded-2xl overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 px-6 text-left"
                  >
                    <span className="font-semibold text-base text-[#1C1C1A] pr-4">{item.q}</span>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold transition-all duration-200 ${openFaq === i ? "bg-[#00C2A8] text-white" : "bg-white text-[#5F5F5A]"}`}>
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-base text-[#5F5F5A] leading-relaxed border-t border-[#E8E4DC] pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="bg-[#00C2A8]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">
              La scelta giusta non è sempre la più economica.
            </h2>
            <p className="text-base text-white/70 mt-3 leading-relaxed">
              È quella più adatta a proteggere il tuo lavoro. Online in pochi minuti — nessun obbligo.
            </p>
          </div>
          <button
            onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="bg-white text-[#00C2A8] font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] flex-shrink-0"
          >
            Ottieni il tuo preventivo →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1C1C1A]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div>
              <p className="font-bold text-2xl text-white tracking-tight font-[family-name:var(--font-heading)] mb-3">
                ScelgoSicuro<span className="text-[#00C2A8]">.</span>
              </p>
              <p className="text-sm text-white/40 max-w-xs leading-relaxed">
                Intermediario assicurativo iscritto al R.U.I. presso IVASS.<br />P.IVA 12345678901
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-sm text-white/40">
              {[
                { title: "Professioni", links: ["Medici", "Avvocati", "Ingegneri", "Commercialisti"] },
                { title: "Azienda", links: ["Chi siamo", "Come funziona", "Contatti"] },
                { title: "Legale", links: ["Privacy Policy", "Termini e condizioni", "Cookie Policy"] },
              ].map((col) => (
                <div key={col.title} className="space-y-3">
                  <p className="text-white font-semibold text-xs tracking-widest uppercase">{col.title}</p>
                  {col.links.map((l) => (
                    <p key={l} className="hover:text-[#00C2A8] cursor-pointer transition-colors text-xs">{l}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/30">
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

// ─── THEME DEV TOOL ──────────────────────────────────────────────────────────

const SS_PALETTE = [
  { name: "Teal (default)", hex: "#00C2A8" },
  { name: "Blu", hex: "#60a5fa" },
  { name: "Viola", hex: "#c084fc" },
  { name: "Arancione", hex: "#fb923c" },
  { name: "Rosa", hex: "#f472b6" },
  { name: "Ambra", hex: "#fbbf24" },
  { name: "Ciano", hex: "#22d3ee" },
  { name: "Lime", hex: "#a3e635" },
  { name: "Rosso", hex: "#f87171" },
  { name: "Smeraldo", hex: "#34d399" },
  { name: "Fucsia", hex: "#e879f9" },
  { name: "Giallo", hex: "#facc15" },
]

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * c).toString(16).padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function randomColor(): string {
  const h = Math.floor(Math.random() * 360)
  const s = Math.floor(40 + Math.random() * 60)
  const l = Math.floor(8 + Math.random() * 84)
  return hslToHex(h, s, l)
}

function getOrCreateStyleEl() {
  let el = document.getElementById("ss-theme") as HTMLStyleElement | null
  if (!el) {
    el = document.createElement("style")
    el.id = "ss-theme"
    document.head.appendChild(el)
  }
  return el
}

function ThemeDevTool() {
  const [open, setOpen] = useState(false)
  const [activeHex, setActiveHex] = useState<string | null>(null)
  const [shuffleColors, setShuffleColors] = useState<{ accent: string; light: string; dark: string } | null>(null)

  function applyAccent(hex: string) {
    setActiveHex(hex)
    setShuffleColors(null)
    getOrCreateStyleEl().textContent = `
      [style*="--mm-accent"], .mm-accent { --mm-accent: ${hex}; }
    `
  }

  function applyShuffle() {
    const accent = randomColor()
    const light  = randomColor()
    const dark   = randomColor()
    setActiveHex(null)
    setShuffleColors({ accent, light, dark })
    getOrCreateStyleEl().textContent = `
      body { background-color: ${light} !important; }
      section, footer, nav { background-color: ${light} !important; }
    `
  }

  function reset() {
    setActiveHex(null)
    setShuffleColors(null)
    const el = document.getElementById("ss-theme")
    if (el) el.textContent = ""
  }

  const isActive = activeHex !== null || shuffleColors !== null

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white border border-[#E8E4DC] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-72 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E8E4DC] bg-[#F7F4EE]">
            <p className="text-xs font-semibold text-[#1C1C1A]">Theme Explorer</p>
            {isActive && (
              <button onClick={reset} className="text-xs font-semibold text-[#00C2A8] hover:underline">Reset</button>
            )}
          </div>

          <div className="p-4 space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-[#5F5F5A] mb-2.5 tracking-wide uppercase">Colore accento:</p>
              <div className="grid grid-cols-6 gap-1.5">
                {SS_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    title={c.name}
                    onClick={() => applyAccent(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-9 h-9 rounded-xl transition-all hover:scale-110 ${
                      activeHex === c.hex ? "ring-2 ring-[#1C1C1A] ring-offset-1 scale-110" : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-[#E8E4DC] pt-4 space-y-2">
              <button
                onClick={applyShuffle}
                className={`w-full border border-[#E8E4DC] py-3 text-xs font-semibold rounded-full transition-colors ${
                  shuffleColors ? "bg-[#1C1C1A] text-white border-[#1C1C1A]" : "text-[#1C1C1A] hover:bg-[#F7F4EE]"
                }`}
              >
                ⟳ Shuffle palette completa
              </button>
              <p className="text-[10px] text-[#5F5F5A]/60 text-center leading-relaxed">
                3 colori HSL random: accento · sfondo · struttura
              </p>
              {shuffleColors && (
                <div className="flex gap-2 justify-center pt-1">
                  {[
                    { hex: shuffleColors.accent, label: "accento" },
                    { hex: shuffleColors.light,  label: "sfondo" },
                    { hex: shuffleColors.dark,   label: "struttura" },
                  ].map((c) => (
                    <div key={c.label} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-xl border border-[#E8E4DC]" style={{ backgroundColor: c.hex }} />
                      <span className="text-[9px] text-[#5F5F5A] font-medium">{c.label}</span>
                      <span className="text-[8px] text-[#5F5F5A]/50 font-mono">{c.hex}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        style={activeHex ? { backgroundColor: activeHex } : shuffleColors ? { backgroundColor: shuffleColors.accent } : { backgroundColor: "#00C2A8" }}
        className="w-12 h-12 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] font-bold text-lg text-white flex items-center justify-center transition-transform hover:scale-105"
      >
        {open ? "✕" : "◐"}
      </button>
    </div>
  )
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function Navbar({ onCta }: { onCta: () => void }) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E8E4DC]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <span className="font-bold text-xl text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">
          ScelgoSicuro<span className="text-[#00C2A8]">.</span>
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5F5F5A]">
          <a href="#come-funziona" className="hover:text-[#1C1C1A] transition-colors">Come funziona</a>
          <a href="#faq" className="hover:text-[#1C1C1A] transition-colors">FAQ</a>
        </div>
        <button
          onClick={onCta}
          className="bg-[#00C2A8] text-white font-semibold px-5 py-2.5 text-sm rounded-full transition-all duration-200 hover:bg-[#009E89] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,194,168,0.3)]"
        >
          Preventivo gratuito →
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

    if (Object.keys(fields.sectorAnswers).length > 0) {
      await saveAnswers({ sessionId: sid, answers: fields.sectorAnswers })
    }

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
      <ThemeDevTool />
    </>
  )
}
