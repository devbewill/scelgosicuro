"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { runSimulation } from "@/app/backoffice/actions"
import { searchProfessions } from "./actions"
import { matchesProfession, type ProfMatch } from "@/lib/engine/conditions"
import type { SimProductResult } from "@/lib/engine/simulate"
import type { BOSector, TariffariAnalysis, PricingDriver, AddonRateRow, ProfessionEntry } from "@/lib/data/backoffice"
import type { SectorHit, ProductHit, OptionHit, ConditionHit, ProfessionHit } from "./actions"
import type { SectorQuestion } from "@/lib/types"

const EUR = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" })
const PCT = (f: number) => { const d = Math.round((f - 1) * 100); return d > 0 ? `+${d}%` : `${d}%` }

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}

// ── Shared tab header ─────────────────────────────────────────────────────────

function TabBar({
  tab,
  sector,
  onTabChange,
}: {
  tab: "analizza" | "simula"
  sector: BOSector | null
  onTabChange: (t: "analizza" | "simula") => void
}) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-6">
      <h1 className="text-sm font-bold">Simulatore</h1>
      {sector && (
        <>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm">{sector.name}</span>
        </>
      )}
      <div className="ml-auto flex gap-1 rounded-lg border p-1">
        {(["analizza", "simula"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={`rounded px-3 py-1 text-xs font-bold transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "analizza" ? "Analizza" : "Simula"}
          </button>
        ))}
      </div>
    </header>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALIZZA VIEW
// ══════════════════════════════════════════════════════════════════════════════

const RULE_TYPE_CONFIG = {
  eligibility: { label: "Eligibilità",    cls: "bg-red-100 text-red-700" },
  multiplier:  { label: "Moltiplicatore", cls: "bg-blue-100 text-blue-700" },
  addon:       { label: "Add-on",         cls: "bg-green-100 text-green-700" },
  option:      { label: "Opzione",        cls: "bg-purple-100 text-purple-700" },
} as const

function TypeBadge({ type }: { type: keyof typeof RULE_TYPE_CONFIG }) {
  const { label, cls } = RULE_TYPE_CONFIG[type]
  return <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>{label}</span>
}

function Highlight({ text, term }: { text: string; term: string }) {
  if (!term) return <>{text}</>
  const i = text.toLowerCase().indexOf(term.toLowerCase())
  if (i === -1) return <>{text}</>
  return <>{text.slice(0, i)}<mark className="bg-yellow-200 text-foreground rounded px-0.5">{text.slice(i, i + term.length)}</mark>{text.slice(i + term.length)}</>
}

function SearchResults({ hits, term, loading, onSelect }: { hits: ProfessionHit[]; term: string; loading: boolean; onSelect: (sectorSlug: string, profession?: string) => void }) {
  if (loading) return <p className="py-4 text-sm text-muted-foreground text-center animate-pulse">Ricerca in corso…</p>
  if (hits.length === 0 && term.length >= 2) return <p className="py-4 text-sm text-muted-foreground text-center">Nessun risultato per "<strong>{term}</strong>".</p>

  const sectorHits    = hits.filter((h): h is SectorHit    => h.kind === "sector")
  const productHits   = hits.filter((h): h is ProductHit   => h.kind === "product")
  const optionHits    = hits.filter((h): h is OptionHit    => h.kind === "option")
  const conditionHits = hits.filter((h): h is ConditionHit => h.kind === "condition")

  const byProduct = new Map<string, { product: string; insurer: string; sectorSlug: string; sectorName: string; rules: ConditionHit[] }>()
  for (const h of conditionHits) {
    const key = `${h.sectorSlug}:${h.productId}`
    if (!byProduct.has(key)) byProduct.set(key, { product: h.productName, insurer: h.insurerName, sectorSlug: h.sectorSlug, sectorName: h.sectorName, rules: [] })
    byProduct.get(key)!.rules.push(h)
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">{hits.length} risultat{hits.length === 1 ? "o" : "i"} per "<strong>{term}</strong>"</p>

      {sectorHits.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Settori</p>
          <div className="rounded-lg border bg-card overflow-hidden divide-y">
            {sectorHits.map((h, i) => (
              <button key={i} onClick={() => onSelect(h.sectorSlug)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium"><Highlight text={h.sectorName} term={term} /></span>
                  <span className="font-mono text-xs text-muted-foreground"><Highlight text={h.sectorSlug} term={term} /></span>
                </div>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">Apri tariffario →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {productHits.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prodotti</p>
          <div className="rounded-lg border bg-card overflow-hidden divide-y">
            {productHits.map((h, i) => (
              <button key={i} onClick={() => onSelect(h.sectorSlug)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors group">
                <div>
                  <span className="text-sm font-medium"><Highlight text={h.productName} term={term} /></span>
                  <span className="ml-2 text-xs text-muted-foreground">{h.insurerName}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.sectorName}</p>
                </div>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">Analizza regole →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {optionHits.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Come opzione selezionabile</p>
          <div className="rounded-lg border bg-card overflow-hidden divide-y">
            {optionHits.map((h, i) => (
              <button key={i} onClick={() => onSelect(h.sectorSlug, h.optionValue)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors group">
                <div className="flex items-start gap-3 min-w-0">
                  <TypeBadge type="option" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium"><Highlight text={h.optionLabel} term={term} /></span>
                    {h.optionLabel !== h.optionValue && <span className="ml-2 font-mono text-xs text-muted-foreground"><Highlight text={h.optionValue} term={term} /></span>}
                    <p className="text-xs text-muted-foreground mt-0.5">{h.sectorName} · {h.questionLabel}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">Analizza regole →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {byProduct.size > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nelle condizioni di prodotto</p>
          <div className="space-y-2">
            {Array.from(byProduct.entries()).map(([key, group]) => (
              <div key={key} className="rounded-lg border bg-card overflow-hidden">
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
                  <div>
                    <span className="text-sm font-medium">{group.product}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{group.insurer}</span>
                    <span className="ml-2 text-xs text-muted-foreground">· {group.sectorName}</span>
                  </div>
                  <button onClick={() => onSelect(group.sectorSlug)} className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-4">Analizza settore →</button>
                </div>
                <div className="divide-y">
                  {group.rules.map((r, i) => (
                    <div key={i} className="px-4 py-3 grid grid-cols-[auto_1fr_auto] gap-x-3 items-start">
                      <TypeBadge type={r.ruleType} />
                      <div>
                        <p className="text-sm font-medium">{r.ruleName}</p>
                        {r.conditionDescription && <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{r.conditionDescription}</p>}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {r.matchedValues.map((v) => <span key={v} className="rounded bg-yellow-100 px-1.5 py-0.5 font-mono text-xs text-yellow-800"><Highlight text={v} term={term} /></span>)}
                        </div>
                      </div>
                      <span className={`font-mono text-xs shrink-0 ${r.ruleType === "eligibility" ? "text-red-600" : r.ruleType === "multiplier" ? "text-blue-600" : "text-green-600"}`}>{r.effect}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const MATCH_CONFIG: Record<ProfMatch, { icon: string; label: string; cls: string }> = {
  fires:   { icon: "✓", label: "si applica",    cls: "text-green-600 font-semibold" },
  blocked: { icon: "✗", label: "non si applica", cls: "text-red-500" },
  neutral: { icon: "–", label: "altri criteri",  cls: "text-muted-foreground" },
}

function MatchCell({ match }: { match: ProfMatch }) {
  const { icon, label, cls } = MATCH_CONFIG[match]
  return <span className={`flex items-center gap-1 text-xs ${cls}`} title={label}><span className="text-sm leading-none">{icon}</span><span className="hidden sm:inline">{label}</span></span>
}

function humanizeKey(key: string, labels: Map<string, string>): string {
  if (labels.has(key)) return labels.get(key)!
  return key.replace(/^q_/, "").replace(/_/g, " ")
}

function AddonRateTable({ rows, questionLabels, filterKey, filterValue }: { rows: AddonRateRow[]; questionLabels: Map<string, string>; filterKey?: string | null; filterValue?: string | null }) {
  if (rows.length === 0) return <p className="text-xs text-muted-foreground italic">Nessuna tariffa caricata.</p>
  const filtered = filterKey && filterValue ? rows.filter((r) => String(r.dimensionValues[filterKey]) === filterValue) : rows
  const displayRows = filtered.length > 0 ? filtered : rows
  const dimKeys: string[] = []
  const seenKeys = new Set<string>()
  for (const row of displayRows) {
    for (const k of Object.keys(row.dimensionValues)) {
      if (!seenKeys.has(k)) { seenKeys.add(k); dimKeys.push(k) }
    }
  }
  const visibleDimKeys = filterKey && filtered.length > 0 ? dimKeys.filter((k) => k !== filterKey) : dimKeys
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="bg-muted/60 text-muted-foreground">
          {visibleDimKeys.map((k) => <th key={k} className="px-3 py-1.5 text-left font-medium border border-border/50">{humanizeKey(k, questionLabels)}</th>)}
          <th className="px-3 py-1.5 text-right font-medium border border-border/50">Premio/anno</th>
        </tr>
      </thead>
      <tbody>
        {displayRows.map((row, i) => (
          <tr key={i} className="border-b border-border/30 hover:bg-muted/20">
            {visibleDimKeys.map((k) => <td key={k} className="px-3 py-1.5 border border-border/50">{String(row.dimensionValues[k] ?? "—")}</td>)}
            <td className="px-3 py-1.5 text-right font-mono font-medium border border-border/50 text-green-700">
              {row.manualQuote ? <span className="text-amber-600 italic">su richiesta</span> : row.premium != null ? EUR.format(row.premium) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

type AnnotatedDriver = PricingDriver & { match: ProfMatch }

function ProductAnalysisCard({ product, primaryQuestionKey, selectedProfession, onlyRelevant, defaultOpen, questionLabels }: { product: TariffariAnalysis["products"][number]; primaryQuestionKey: string | null; selectedProfession: string | null; onlyRelevant: boolean; defaultOpen?: boolean; questionLabels: Map<string, string> }) {
  const [open, setOpen] = React.useState(defaultOpen ?? false)
  const [expandedAddon, setExpandedAddon] = React.useState<Set<number>>(new Set())
  const professionMode = !!primaryQuestionKey && !!selectedProfession

  const withMatch: AnnotatedDriver[] = product.drivers.map((d) => ({
    ...d,
    match: professionMode ? matchesProfession(d.condition, primaryQuestionKey!, selectedProfession!) : "neutral",
  }))

  const visibleDrivers = onlyRelevant && professionMode ? withMatch.filter((d) => d.match !== "neutral") : withMatch
  const firesCount = withMatch.filter((d) => d.match === "fires").length
  const blockedCount = withMatch.filter((d) => d.match === "blocked").length

  return (
    <div className="rounded-lg border bg-card">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-sm">{product.name}</span>
          <span className="text-xs text-muted-foreground">{product.insurer}</span>
          {product.drivers.length > 0 && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{product.drivers.length} {product.drivers.length === 1 ? "regola" : "regole"}</span>}
          {professionMode && firesCount > 0 && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">{firesCount} attive</span>}
          {professionMode && blockedCount > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{blockedCount} non attive</span>}
        </div>
        <span className="ml-4 shrink-0 text-muted-foreground text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t">
          {visibleDrivers.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {onlyRelevant && professionMode ? "Nessuna regola attiva per questa professione." : "Nessuna regola di pricing configurata."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-4 py-2 text-left font-medium w-32">Tipo</th>
                    <th className="px-4 py-2 text-left font-medium">Regola</th>
                    <th className="px-4 py-2 text-left font-medium">Condizione</th>
                    <th className="px-4 py-2 text-left font-medium w-44">Effetto</th>
                    <th className="px-4 py-2 text-left font-medium w-32">Ambito</th>
                    {professionMode && <th className="px-4 py-2 text-left font-medium w-32">Per questa prof.</th>}
                  </tr>
                </thead>
                <tbody>
                  {visibleDrivers.map((d, i) => {
                    const hasRates = d.type === "addon" && d.rateRows != null && d.rateRows.length > 0
                    const isExpanded = expandedAddon.has(i)
                    const colSpan = professionMode ? 6 : 5
                    const rowCls = professionMode && d.match === "fires" ? "bg-green-50/60" : professionMode && d.match === "blocked" ? "opacity-40" : "hover:bg-muted/20"
                    return (
                      <React.Fragment key={i}>
                        <tr className={`border-b ${rowCls}`}>
                          <td className="px-4 py-2.5"><TypeBadge type={d.type} /></td>
                          <td className="px-4 py-2.5 font-medium">{d.name}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs leading-relaxed">{d.description || <span className="italic">—</span>}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex flex-col gap-1">
                              <span className={`font-mono text-xs ${d.type === "eligibility" ? "text-red-600" : d.type === "multiplier" ? "text-blue-600" : "text-green-600"}`}>{d.effect}</span>
                              {hasRates && <button onClick={() => setExpandedAddon((prev) => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next })} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 text-left">{isExpanded ? "Nascondi tariffe ▲" : "Vedi tariffe ▼"}</button>}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{d.scope ?? "—"}</td>
                          {professionMode && <td className="px-4 py-2.5"><MatchCell match={d.match} /></td>}
                        </tr>
                        {hasRates && isExpanded && (
                          <tr className="border-b last:border-0 bg-muted/10">
                            <td colSpan={colSpan} className="px-6 py-3">
                              <AddonRateTable rows={d.rateRows!} questionLabels={questionLabels} filterKey={primaryQuestionKey} filterValue={selectedProfession} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AnalizzaView({ sectors, selectedSector, analysis, selectedProfession, onSectorChange, onProfessionChange }: { sectors: BOSector[]; selectedSector: BOSector | null; analysis: TariffariAnalysis | null; selectedProfession: string | null; onSectorChange: (slug: string | null) => void; onProfessionChange: (value: string | null) => void }) {
  const [onlyRelevant, setOnlyRelevant] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [searchHits, setSearchHits] = React.useState<ProfessionHit[]>([])
  const [searchLoading, setSearchLoading] = React.useState(false)
  const debouncedTerm = useDebounce(searchTerm, 300)
  const router = useRouter()

  React.useEffect(() => {
    if (debouncedTerm.trim().length < 2) { setSearchHits([]); return }
    let cancelled = false
    setSearchLoading(true)
    searchProfessions(debouncedTerm).then((hits) => { if (!cancelled) { setSearchHits(hits); setSearchLoading(false) } })
    return () => { cancelled = true }
  }, [debouncedTerm])

  const isSearching = searchTerm.trim().length >= 2
  const primaryQ = analysis?.primaryQuestion ?? null
  const professionMode = !!primaryQ && !!selectedProfession

  const questionLabels = React.useMemo(
    () => new Map((analysis?.questions ?? []).map((q) => [q.key, q.label])),
    [analysis]
  )

  function onSelectSearchResult(sectorSlug: string, professionValue?: string) {
    setSearchTerm("")
    setSearchHits([])
    const base = `/backoffice/simulatore?tab=analizza&sector=${sectorSlug}`
    router.push(professionValue ? `${base}&profession=${encodeURIComponent(professionValue)}` : base)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end gap-4">
        {/* Ricerca */}
        <div className="relative w-72">
          <Input
            placeholder="Cerca professione…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(""); setSearchHits([]) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">✕</button>
          )}
        </div>

        {!isSearching && (
          <>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Settore</p>
              <div className="w-56">
                <Select value={selectedSector?.slug ?? ""} onValueChange={(v) => onSectorChange(v || null)}>
                  <SelectTrigger><SelectValue placeholder="Scegli un settore…" /></SelectTrigger>
                  <SelectContent>{sectors.map((s) => <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {primaryQ && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{primaryQ.label}</p>
                <div className="w-64">
                  <Select value={selectedProfession ?? ""} onValueChange={(v) => onProfessionChange(v || null)}>
                    <SelectTrigger><SelectValue placeholder="Tutte…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tutte</SelectItem>
                      {primaryQ.options.map((opt) => <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label ?? String(opt.value)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {professionMode && (
              <label className="flex items-center gap-2 text-sm cursor-pointer pb-1">
                <input type="checkbox" checked={onlyRelevant} onChange={(e) => setOnlyRelevant(e.target.checked)} className="rounded" />
                Solo regole attive
              </label>
            )}
          </>
        )}
      </div>

      {professionMode && !isSearching && (
        <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/40 px-4 py-3 text-xs">
          <span className="text-green-700"><strong>✓ si applica</strong> — regola attivata da questa professione</span>
          <span className="text-muted-foreground"><strong>– altri criteri</strong> — regola indipendente</span>
          <span className="text-red-500"><strong>✗ non si applica</strong> — regola non scatta</span>
        </div>
      )}

      {isSearching ? (
        <SearchResults hits={searchHits} term={debouncedTerm} loading={searchLoading} onSelect={onSelectSearchResult} />
      ) : analysis ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {analysis.products.length === 0 ? "Nessun prodotto attivo" : `${analysis.products.length} prodott${analysis.products.length === 1 ? "o" : "i"} attiv${analysis.products.length === 1 ? "o" : "i"}`}
          </p>
          {analysis.products.map((p) => (
            <ProductAnalysisCard key={p.id} product={p} primaryQuestionKey={primaryQ?.key ?? null} selectedProfession={selectedProfession} onlyRelevant={onlyRelevant} defaultOpen={!!selectedProfession} questionLabels={questionLabels} />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">Seleziona un settore per iniziare, oppure cerca una professione.</p>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SIMULA VIEW
// ══════════════════════════════════════════════════════════════════════════════

function QuestionField({ sq, value, onChange, answers }: { sq: SectorQuestion; value: unknown; onChange: (v: unknown) => void; answers: Record<string, unknown> }) {
  const q = sq.question
  if (sq.visibleIf) {
    const visible = Object.entries(sq.visibleIf as Record<string, unknown>).every(([k, v]) => answers[k] === v)
    if (!visible) return null
  }
  const strVal = value !== undefined && value !== null ? String(value) : ""
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold leading-tight">{q.label}</label>
      {q.type === "dropdown" && q.options ? (
        <Select value={strVal} onValueChange={(v) => { if (!v) return; const opt = q.options!.find((o) => String(o.value) === v); onChange(opt ? opt.value : v) }}>
          <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Seleziona…" /></SelectTrigger>
          <SelectContent>{q.options.map((o) => <SelectItem key={String(o.value)} value={String(o.value)}>{o.label ?? String(o.value)}</SelectItem>)}</SelectContent>
        </Select>
      ) : q.type === "number" ? (
        <Input type="number" value={strVal} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} min={q.validation?.min} max={q.validation?.max} className="h-8 text-xs" />
      ) : (
        <Input value={strVal} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" />
      )}
    </div>
  )
}

function ResultCard({ result, cheapest, priciest, expanded, onToggle }: { result: SimProductResult; cheapest: number | null | undefined; priciest: number | null | undefined; expanded: boolean; onToggle: () => void }) {
  const isExcluded = result.status === "excluded"
  const isManual   = result.status === "manual_quote"
  const isCheapest = result.premiumTotal !== null && result.premiumTotal === cheapest && cheapest !== priciest
  const isPriciest = result.premiumTotal !== null && result.premiumTotal === priciest && cheapest !== priciest
  const borderClass = isExcluded ? "border-red-200 opacity-60" : isManual ? "border-yellow-200" : isCheapest ? "border-green-300" : isPriciest ? "border-blue-300" : "border-border"
  const firedMults = result.allMultipliers.filter((m) => m.fired)
  const notFiredMults = result.allMultipliers.filter((m) => !m.fired)

  return (
    <div className={`rounded-lg border bg-card overflow-hidden ${borderClass}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{result.productName}</span>
            <span className="text-xs text-muted-foreground">{result.insurerName}</span>
            {isCheapest && <span className="rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-bold">Più economico</span>}
            {isPriciest && <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold">Più completo</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 max-w-xs">
          {firedMults.map((m, i) => <span key={i} className={`rounded px-1.5 py-0.5 text-xs font-bold font-mono ${m.factor < 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`} title={m.name}>{PCT(m.factor)}</span>)}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isExcluded && <span className="text-xs text-destructive font-bold">Escluso</span>}
          {isManual   && <span className="text-xs text-yellow-700 font-bold">Su misura</span>}
          {result.premiumTotal !== null && <span className="text-lg font-bold tabular-nums">{EUR.format(result.premiumTotal)}</span>}
          {result.exclusionReason && <span className="text-xs text-muted-foreground max-w-32 truncate" title={result.exclusionReason}>{result.exclusionReason}</span>}
          {(result.coverages.length > 0 || result.firedRules.length > 0) && <button onClick={onToggle} className="text-xs text-muted-foreground hover:text-foreground">{expanded ? "▲" : "▼"}</button>}
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-muted/20 px-4 py-3 space-y-4 text-xs">
          {result.firedRules.length > 0 && (
            <div>
              <p className="font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Regole scattate</p>
              {result.firedRules.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 font-bold ${r.action === "exclude" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{r.action === "exclude" ? "ESCLUDI" : "MANUALE"}</span>
                  <span>{r.name}</span>
                  {r.reason && <span className="text-muted-foreground">→ "{r.reason}"</span>}
                </div>
              ))}
            </div>
          )}
          {result.coverages.map((c) => (
            <div key={c.key}>
              <p className="font-bold text-muted-foreground uppercase tracking-wide mb-1.5">{c.name}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded bg-muted px-1.5 py-0.5">base {EUR.format(c.base)}</span>
                {c.multipliers.map((m, i) => (
                  <React.Fragment key={i}>
                    <span className="text-muted-foreground">×</span>
                    <span className={`rounded px-1.5 py-0.5 font-bold font-mono ${m.factor < 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`} title={m.name}>{m.factor} ({PCT(m.factor)})</span>
                  </React.Fragment>
                ))}
                <span className="text-muted-foreground">=</span>
                <span className="font-bold">{EUR.format(c.subtotal)}</span>
              </div>
            </div>
          ))}
          {result.addons.filter(a => a.triggered).length > 0 && (
            <div>
              <p className="font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Addon inclusi</p>
              {result.addons.filter(a => a.triggered).map((a) => (
                <div key={a.key} className="flex items-center gap-2">
                  {a.premium !== null
                    ? <span className="rounded bg-muted px-1.5 py-0.5">+{EUR.format(a.premium)}</span>
                    : <span className="rounded bg-yellow-100 text-yellow-800 px-1.5 py-0.5 text-xs font-bold">su richiesta</span>
                  }
                  <span>{a.name}</span>
                </div>
              ))}
            </div>
          )}
          {notFiredMults.length > 0 && (
            <div>
              <p className="font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Condizioni non scattate</p>
              <div className="flex flex-wrap gap-1.5">
                {notFiredMults.map((m, i) => <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground" title={`scope: ${m.scope}`}>{m.name} ({PCT(m.factor)})</span>)}
              </div>
            </div>
          )}
          <Link href={`/backoffice/catalogo/${result.productId}`} className="inline-block text-xs text-primary hover:underline">Vai al prodotto →</Link>
        </div>
      )}
    </div>
  )
}

function SimulaView({ sectors, selectedSector, questions, prefillAnswers }: { sectors: BOSector[]; selectedSector: BOSector | null; questions: SectorQuestion[]; prefillAnswers: Record<string, unknown> }) {
  const router = useRouter()
  const [answers, setAnswers] = React.useState<Record<string, unknown>>(prefillAnswers)
  const [results, setResults] = React.useState<SimProductResult[] | null>(null)
  const [running, setRunning] = React.useState(false)
  const [expanded, setExpanded] = React.useState<number | null>(null)

  const eligible  = results?.filter((r) => r.status === "eligible") ?? []
  const cheapest  = eligible[0]?.premiumTotal
  const priciest  = eligible[eligible.length - 1]?.premiumTotal

  async function simulate() {
    if (!selectedSector) return
    setRunning(true); setResults(null); setExpanded(null)
    const res = await runSimulation(selectedSector.id, answers)
    setResults(res); setRunning(false)
  }

  return (
    <div className="flex flex-1 gap-0">
      <aside className="w-80 shrink-0 border-r flex flex-col gap-4 p-4 overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Settore</label>
          <Select value={selectedSector?.slug ?? ""} onValueChange={(v) => v && router.push(`/backoffice/simulatore?tab=simula&sector=${v}`)}>
            <SelectTrigger><SelectValue placeholder="Scegli settore…" /></SelectTrigger>
            <SelectContent>{sectors.map((s) => <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {questions.map((sq) => (
          <QuestionField key={sq.question.key} sq={sq} value={answers[sq.question.key]} onChange={(v) => setAnswers((prev) => ({ ...prev, [sq.question.key]: v }))} answers={answers} />
        ))}

        {selectedSector && (
          <Button onClick={simulate} disabled={running} className="mt-2">
            {running ? "Calcolo…" : "Simula preventivi"}
          </Button>
        )}

        {results && (
          <div className="rounded-lg bg-muted p-3 text-xs space-y-1">
            <div className="font-bold">{results.length} prodotti</div>
            <div className="text-green-700">{results.filter(r => r.status === "eligible").length} quotabili</div>
            <div className="text-yellow-700">{results.filter(r => r.status === "manual_quote").length} preventivo manuale</div>
            <div className="text-destructive">{results.filter(r => r.status === "excluded").length} esclusi</div>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto p-4">
        {!selectedSector && <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Seleziona un settore per iniziare</div>}
        {selectedSector && !results && !running && <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Compila le domande e clicca "Simula preventivi"</div>}
        {running && <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Calcolo in corso…</div>}
        {results && (
          <div className="flex flex-col gap-3">
            {results.map((r) => (
              <ResultCard key={r.productId} result={r} cheapest={cheapest} priciest={priciest} expanded={expanded === r.productId} onToggle={() => setExpanded(expanded === r.productId ? null : r.productId)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN CLIENT
// ══════════════════════════════════════════════════════════════════════════════

export function SimulatoreClient({
  tab,
  sectors,
  professionIndex: _pi,
  selectedSector,
  questions,
  prefillAnswers,
  analysis,
  selectedProfession,
}: {
  tab: "analizza" | "simula"
  sectors: BOSector[]
  professionIndex: ProfessionEntry[]
  selectedSector: BOSector | null
  questions: SectorQuestion[]
  prefillAnswers: Record<string, unknown>
  analysis: TariffariAnalysis | null
  selectedProfession: string | null
}) {
  const router = useRouter()

  function switchTab(t: "analizza" | "simula") {
    const base = `/backoffice/simulatore?tab=${t}`
    router.push(selectedSector ? `${base}&sector=${selectedSector.slug}` : base)
  }

  function onSectorChange(slug: string | null) {
    router.push(slug ? `/backoffice/simulatore?tab=${tab}&sector=${slug}` : `/backoffice/simulatore?tab=${tab}`)
  }

  function onProfessionChange(value: string | null) {
    if (!selectedSector) return
    const base = `/backoffice/simulatore?tab=analizza&sector=${selectedSector.slug}`
    router.push(value ? `${base}&profession=${encodeURIComponent(value)}` : base)
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "100vh" }}>
      <TabBar tab={tab} sector={selectedSector} onTabChange={switchTab} />

      {tab === "analizza" && (
        <AnalizzaView
          sectors={sectors}
          selectedSector={selectedSector}
          analysis={analysis}
          selectedProfession={selectedProfession}
          onSectorChange={onSectorChange}
          onProfessionChange={onProfessionChange}
        />
      )}

      {tab === "simula" && (
        <SimulaView
          sectors={sectors}
          selectedSector={selectedSector}
          questions={questions}
          prefillAnswers={prefillAnswers}
        />
      )}
    </div>
  )
}
