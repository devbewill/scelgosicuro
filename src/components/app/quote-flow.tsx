"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
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

const inputCls = "w-full border border-[#E8E4DC] bg-white px-4 py-3.5 text-[#1C1C1A] text-base font-medium rounded-2xl focus:outline-none focus:border-[#5046E4] focus:ring-2 focus:ring-[#5046E4]/20 transition-all duration-200 appearance-none placeholder:text-[#5F5F5A]/50"
const labelCls = "block text-xs font-semibold text-[#5F5F5A] mb-1.5 tracking-wide"

function Btn({ children, onClick, disabled, type = "button" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="w-full bg-[#5046E4] text-white font-semibold py-3.5 text-base rounded-full transition-all duration-200 hover:bg-[#4338CA] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(80,70,228,0.25)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
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

// ─── TYPES ────────────────────────────────────────────────────────────────────

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

function SectorField({ question, value, answers, onChange }: {
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
              className={`flex-1 py-3 border text-sm font-semibold rounded-2xl transition-all duration-200 ${value === opt.v ? "border-[#5046E4] bg-[#EEF2FF] text-[#5046E4]" : "border-[#E8E4DC] bg-white text-[#1C1C1A] hover:border-[#5046E4]/40"}`}>
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

function QuoteForm({ sectors, onSubmit, error }: {
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
    <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden max-w-lg w-full">
      <div className="bg-[#F7F4EE] px-7 py-5 border-b border-[#E8E4DC]">
        <span className="inline-block bg-[#EEF2FF] text-[#5046E4] text-xs font-semibold rounded-full px-3 py-1 mb-2">
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
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${done ? "bg-[#5046E4] text-white" : active ? "bg-[#1C1C1A] text-white" : "bg-[#F7F4EE] text-[#5F5F5A]"}`}>
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
                  Specializzazione{loadingProfs ? <span className="ml-2 text-[#5046E4] font-medium normal-case tracking-normal">Caricamento…</span> : ""}
                </label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Cerca la tua specializzazione…"
                  value={professionQuery}
                  autoComplete="off"
                  onChange={(e) => { setProfessionQuery(e.target.value); setB("professionSlug", ""); setB("professionName", ""); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && filteredProfessions.length > 0 && (
                  <ul className="absolute z-50 mt-1.5 max-h-56 w-full overflow-auto bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E8E4DC] text-sm">
                    {filteredProfessions.map((p) => (
                      <li key={p.slug}
                        className="cursor-pointer px-4 py-3 font-medium text-[#1C1C1A] hover:bg-[#EEF2FF] hover:text-[#5046E4] first:rounded-t-2xl last:rounded-b-2xl transition-colors border-b border-[#E8E4DC] last:border-b-0"
                        onMouseDown={() => { setB("professionSlug", p.slug); setB("professionName", p.name); setProfessionQuery(p.name); setShowSuggestions(false) }}>
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
            <p className="text-xs text-[#5F5F5A]/60 text-center pt-1">🔒 I tuoi dati sono al sicuro. Nessuno spam.</p>
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
            <div key={i} className="w-2.5 bg-[#5046E4] rounded-full" style={{ height: "24px", animation: `bar 0.9s ease-in-out ${i * 0.12}s infinite` }} />
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

function RefinementField({ question, value, onChange }: {
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
              className={`flex-1 py-3 border text-sm font-semibold rounded-2xl transition-all duration-200 ${value === opt.v ? "border-[#5046E4] bg-[#EEF2FF] text-[#5046E4]" : "border-[#E8E4DC] bg-white text-[#1C1C1A] hover:border-[#5046E4]/40"}`}>
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
  nome, sectorName, professionName, featured,
  sectorQuestions, answers, refinementOpen,
  priceUpdated, isRefining, onToggleRefinement, onRefinementChange, onBack,
}: {
  nome: string
  sectorName: string
  professionName: string
  featured: QuoteResult | null
  sectorQuestions: SectorQuestion[]
  answers: Record<string, unknown>
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
      <div className="bg-white border-b border-[#E8E4DC] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">
            ScelgoSicuro<span className="text-[#5046E4]">.</span>
          </Link>
          <button onClick={onBack}
            className="text-sm font-semibold text-[#1C1C1A] border border-[#E8E4DC] px-4 py-2 rounded-full hover:bg-[#F7F4EE] transition-all duration-200">
            ← Nuovo preventivo
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-10 pb-4">
        <span className="inline-block bg-[#EEF2FF] text-[#5046E4] text-xs font-semibold rounded-full px-3 py-1 mb-4">
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
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#5046E4]">
                <span>⭐</span> La nostra scelta per te
              </span>
              {priceUpdated && (
                <span className="bg-[#EEF2FF] text-[#5046E4] text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                  ↑ Aggiornato
                </span>
              )}
            </div>

            {featured ? (
              <>
                <div className={`bg-[#EEF2FF] p-6 sm:p-8 transition-opacity duration-300 ${isRefining ? "opacity-60" : ""}`}>
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
                          <div key={i} className="w-1.5 h-1.5 bg-[#5046E4] rounded-full" style={{ animation: `dot 0.6s ease-in-out ${i * 0.15}s infinite` }} />
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
                  <button className="flex-1 bg-[#5046E4] text-white font-semibold py-4 text-base rounded-full transition-all duration-200 hover:bg-[#4338CA] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(80,70,228,0.25)]">
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
                  <span className="inline-block bg-[#EEF2FF] text-[#5046E4] text-xs font-semibold rounded-full px-2.5 py-0.5 mb-1">Personalizza</span>
                  <p className="text-base font-semibold text-[#1C1C1A]">Affina il preventivo</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-[#F7F4EE] flex items-center justify-center text-[#1C1C1A] font-bold text-lg flex-shrink-0">
                  {refinementOpen ? "−" : "+"}
                </span>
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
                      <span className="font-bold text-lg text-[#5046E4]">{fmt(realPrice)}/anno</span>
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
                      {company.tag
                        ? <span className="inline-block bg-[#EEF2FF] text-[#5046E4] text-[10px] font-semibold rounded-full px-2.5 py-0.5 mb-3">{company.tag}</span>
                        : <div className="h-[22px] mb-3" />
                      }
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold text-[#1C1C1A]">{company.name}</p>
                          <p className="text-xs text-[#5F5F5A] font-medium mt-0.5">{company.product}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#1C1C1A]">{fmt(price)}</p>
                          <p className={`text-xs font-semibold mt-0.5 ${diffPct > 0 ? "text-red-500" : "text-[#5046E4]"}`}>
                            {diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        {company.features.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                              <span className="text-[#5046E4] text-[8px] font-bold">✓</span>
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

// ─── ROOT QUOTE FLOW ──────────────────────────────────────────────────────────

export function QuoteFlow({ sectors }: { sectors: Sector[] }) {
  const [view, setView] = useState<"form" | "loading" | "results">("form")
  const [formError, setFormError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [nome, setNome] = useState("")
  const [sectorName, setSectorName] = useState("")
  const [professionName, setProfessionName] = useState("")
  const [quoteResults, setQuoteResults] = useState<QuoteResult[]>([])
  const [sectorQuestions, setSectorQuestions] = useState<SectorQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [isRefining, setIsRefining] = useState(false)
  const [priceUpdated, setPriceUpdated] = useState(false)
  const [refinementOpen, setRefinementOpen] = useState(true)

  async function handleFormSubmit(fields: FormFields) {
    setView("loading")
    setFormError(null)
    setNome(fields.nome)
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
      setView("form")
      return
    }

    const sid = sessionResult.sessionId
    setSessionId(sid)

    if (Object.keys(fields.sectorAnswers).length > 0) {
      await saveAnswers({ sessionId: sid, answers: fields.sectorAnswers })
    }

    setAnswers({ q_professione: fields.professionSlug, ...fields.sectorAnswers })
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
        sectorQuestions={sectorQuestions}
        answers={answers}
        refinementOpen={refinementOpen}
        priceUpdated={priceUpdated}
        isRefining={isRefining}
        onToggleRefinement={() => setRefinementOpen((p) => !p)}
        onRefinementChange={handleRefinementChange}
        onBack={() => { setView("form"); setQuoteResults([]); setSessionId(null) }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE]">
      <nav className="bg-white border-b border-[#E8E4DC]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">
            ScelgoSicuro<span className="text-[#5046E4]">.</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-[#5F5F5A] hover:text-[#1C1C1A] transition-colors">
            ← Torna alla home
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <span className="inline-block bg-[#EEF2FF] text-[#5046E4] text-xs font-semibold rounded-full px-3.5 py-1.5 mb-4">
              Preventivo gratuito · Senza impegno
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1C1C1A] tracking-tight font-[family-name:var(--font-heading)]">
              Calcola la tua RC Professionale
            </h1>
            <p className="text-base text-[#5F5F5A] mt-3 leading-relaxed">
              Poche domande, risultato in 2 minuti. Confrontiamo le migliori compagnie e ti mostriamo la soluzione più adatta al tuo profilo.
            </p>
          </div>
          <QuoteForm sectors={sectors} onSubmit={handleFormSubmit} error={formError} />
        </div>
      </div>
    </div>
  )
}
