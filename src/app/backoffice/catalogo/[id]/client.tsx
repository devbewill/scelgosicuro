"use client"

import * as React from "react"
import Link from "next/link"
import type { BOProductDetail } from "@/lib/data/backoffice"
import { ConditionDisplay } from "@/components/backoffice/condition-display"
import { RuleForm } from "@/components/backoffice/rule-form"
import { MultiplierForm } from "@/components/backoffice/multiplier-form"
import { Button } from "@/components/ui/button"
import { deleteEligibilityRule, deleteMultiplier, toggleProductActive } from "@/app/backoffice/actions"

const TABS = ["Regole", "Moltiplicatori"] as const
type Tab = typeof TABS[number]

type Modal =
  | { type: "rule"; rule?: BOProductDetail["eligibilityRules"][number] }
  | { type: "multiplier"; multiplier?: BOProductDetail["multipliers"][number] }
  | null

const EUR = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" })
const PCT = (f: number) => { const d = Math.round((f - 1) * 100); return d >= 0 ? `+${d}%` : `${d}%` }

export function ProductDetailClient({ product }: { product: BOProductDetail }) {
  const [tab, setTab] = React.useState<Tab>("Regole")
  const [modal, setModal] = React.useState<Modal>(null)
  const [toggling, setToggling] = React.useState(false)
  const [datiTecniciOpen, setDatiTecniciOpen] = React.useState(false)

  async function handleToggle() {
    setToggling(true)
    await toggleProductActive(product.id, !product.is_active)
    setToggling(false)
  }

  return (
    <div className="flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-card px-6">
        <Link href="/backoffice/catalogo" className="text-xs text-muted-foreground hover:text-foreground">
          ← Catalogo
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-sm font-bold">{product.name}</h1>
        <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
          product.is_active ? "bg-[#ffe0f2] text-[#1C1C1A]" : "bg-muted text-muted-foreground"
        }`}>
          {product.is_active ? "Attivo" : "Disattivo"}
        </span>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToggle} disabled={toggling}>
            {product.is_active ? "Disattiva" : "Attiva"}
          </Button>
        </div>
      </header>

      <main className="flex flex-col gap-6 p-6">
        {/* Info card */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Compagnia", value: product.insurer.name },
            { label: "Settore", value: product.sector.name },
            { label: "Versione", value: product.version },
            { label: "Slug", value: product.slug },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="mt-0.5 font-mono text-sm font-bold break-all">{value}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Coperture", n: product.coverages.length },
            { label: "Regole eligibility", n: product.eligibilityRules.length, warn: product.eligibilityRules.length === 0 },
            { label: "Moltiplicatori", n: product.multipliers.length },
            { label: "Addon", n: product.addons.length },
          ].map(({ label, n, warn }) => (
            <div key={label} className={`rounded-lg border p-3 ${warn ? "border-red-200 bg-red-50" : "bg-card"}`}>
              <div className="text-2xl font-bold">{n}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs — solo sezioni editabili */}
        <div>
          <div className="flex gap-0 border-b">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
                  tab === t
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="pt-4">
            {/* ── REGOLE ── */}
            {tab === "Regole" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Valutate in ordine di priorità. La prima che scatta blocca.
                  </p>
                  <Button size="sm" onClick={() => setModal({ type: "rule" })}>+ Aggiungi regola</Button>
                </div>
                {product.eligibilityRules.length === 0 && (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Nessuna regola — tutti i clienti sono eleggibili per questo prodotto.
                  </div>
                )}
                {product.eligibilityRules.map((r) => (
                  <div key={r.id} className="flex items-start gap-4 rounded-lg border bg-card p-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {r.priority}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{r.name}</span>
                        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                          r.action === "exclude" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {r.action === "exclude" ? "ESCLUDI" : "MANUALE"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">SE</span>
                        <ConditionDisplay condition={r.condition} />
                      </div>
                      {r.reason && (
                        <p className="mt-1 text-xs text-muted-foreground">→ "{r.reason}"</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setModal({ type: "rule", rule: r })}
                        className="rounded px-2 py-1 text-xs hover:bg-muted"
                      >
                        Modifica
                      </button>
                      <DeleteBtn onConfirm={async () => { await deleteEligibilityRule(r.id, product.id) }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── MOLTIPLICATORI ── */}
            {tab === "Moltiplicatori" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Tutti quelli che matchano vengono moltiplicati tra loro.
                  </p>
                  <Button size="sm" onClick={() => setModal({ type: "multiplier" })}>+ Aggiungi</Button>
                </div>
                {product.multipliers.length === 0 && (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Nessun moltiplicatore configurato.
                  </div>
                )}
                {product.multipliers.length > 0 && (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-bold">Nome</th>
                          <th className="px-4 py-2.5 text-left font-bold">Applica a</th>
                          <th className="px-4 py-2.5 text-left font-bold">Fattore</th>
                          <th className="px-4 py-2.5 text-left font-bold">Condizione</th>
                          <th className="px-3 py-2.5 text-center font-bold">Prio</th>
                          <th className="px-4 py-2.5" />
                        </tr>
                      </thead>
                      <tbody>
                        {product.multipliers.map((m, i) => (
                          <tr key={m.id} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                            <td className="px-4 py-3 font-bold">{m.name}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                              {m.coverageKey ?? "tutto il prodotto"}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`rounded px-2 py-0.5 text-xs font-bold font-mono ${
                                m.factor < 1 ? "bg-[#ffe0f2] text-[#1C1C1A]" :
                                m.factor > 1 ? "bg-red-100 text-red-800" : "bg-muted"
                              }`}>
                                {m.factor} ({PCT(m.factor)})
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <ConditionDisplay condition={m.condition} />
                            </td>
                            <td className="px-3 py-3 text-center text-xs text-muted-foreground">{m.priority}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => setModal({ type: "multiplier", multiplier: m })}
                                  className="rounded px-2 py-1 text-xs hover:bg-muted"
                                >
                                  Modifica
                                </button>
                                <DeleteBtn onConfirm={async () => { await deleteMultiplier(m.id, product.id) }} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dati tecnici — coperture e addon, sola lettura */}
        <div className="rounded-lg border">
          <button
            onClick={() => setDatiTecniciOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
          >
            <span className="text-sm font-bold text-muted-foreground">Dati tecnici</span>
            <span className="text-xs text-muted-foreground">
              {product.coverages.length} coperture · {product.addons.length} addon {datiTecniciOpen ? "▲" : "▼"}
            </span>
          </button>

          {datiTecniciOpen && (
            <div className="border-t flex flex-col gap-6 p-4">
              {/* Coperture */}
              {product.coverages.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Coperture</h3>
                  <div className="flex flex-col gap-3">
                    {product.coverages.map((c) => (
                      <div key={c.id} className="rounded-lg border bg-card">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                          <div>
                            <span className="font-bold">{c.name}</span>
                            <span className="ml-2 font-mono text-xs text-muted-foreground">{c.key}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                              c.is_mandatory ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}>
                              {c.is_mandatory ? "Obbligatoria" : "Opzionale"}
                            </span>
                            <span className="text-xs text-muted-foreground">{c.rateCount} tariffe</span>
                          </div>
                        </div>
                        <div className="px-4 py-3 text-xs space-y-1.5">
                          <div>
                            <span className="text-muted-foreground">Dimensioni: </span>
                            {(c.dimensions as unknown as string[]).map((d: string) => (
                              <span key={d} className="mr-1 font-mono bg-muted rounded px-1 py-0.5">{d}</span>
                            ))}
                          </div>
                          {c.available_if != null && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">Disponibile se:</span>
                              <ConditionDisplay condition={c.available_if} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addon */}
              {product.addons.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Addon</h3>
                  <div className="flex flex-col gap-3">
                    {product.addons.map((a) => (
                      <div key={a.id} className="rounded-lg border bg-card p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{a.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">{a.key}</span>
                          <span className={`ml-auto rounded px-2 py-0.5 text-xs font-bold ${
                            a.pricing_mode === "flat" ? "bg-blue-100 text-blue-800" : "bg-muted"
                          }`}>
                            {a.pricing_mode === "flat" ? `flat ${EUR.format(a.flat_premium ?? 0)}` : "rate table"}
                          </span>
                        </div>
                        {a.triggered_by != null && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-muted-foreground">Auto se:</span>
                            <ConditionDisplay condition={a.triggered_by} />
                          </div>
                        )}
                        {a.available_if != null && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-muted-foreground">Disponibile se:</span>
                            <ConditionDisplay condition={a.available_if} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl">
            <h2 className="mb-4 font-bold">
              {modal.type === "rule"
                ? (modal.rule ? "Modifica regola" : "Nuova regola eligibility")
                : (modal.multiplier ? "Modifica moltiplicatore" : "Nuovo moltiplicatore")}
            </h2>
            {modal.type === "rule" && (
              <RuleForm productId={product.id} initial={modal.rule} onClose={() => setModal(null)} />
            )}
            {modal.type === "multiplier" && (
              <MultiplierForm
                productId={product.id}
                coverages={product.coverages}
                initial={modal.multiplier}
                onClose={() => setModal(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DeleteBtn({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const [pending, setPending] = React.useState(false)
  const [confirm, setConfirm] = React.useState(false)

  if (confirm) {
    return (
      <span className="flex gap-1">
        <button
          onClick={async () => { setPending(true); await onConfirm(); setPending(false); setConfirm(false) }}
          disabled={pending}
          className="rounded px-2 py-1 text-xs font-bold text-destructive hover:bg-destructive/10"
        >
          {pending ? "…" : "Sì"}
        </button>
        <button onClick={() => setConfirm(false)} className="rounded px-2 py-1 text-xs hover:bg-muted">No</button>
      </span>
    )
  }
  return (
    <button onClick={() => setConfirm(true)} className="rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10">
      Elimina
    </button>
  )
}
