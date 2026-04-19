import { createClient } from "@/lib/supabase/server"

// One-time data repair. Safe to re-run (idempotent).
// Visit /backoffice/repair to execute.

export default async function RepairPage() {
  const supabase = await createClient()
  const log: string[] = []

  function ok(msg: string)   { log.push(`✅ ${msg}`) }
  function err(msg: string)  { log.push(`❌ ${msg}`) }
  function info(msg: string) { log.push(`\nℹ️  ${msg}`) }

  // ── Lookup helpers ────────────────────────────────────────────────────────

  const { data: sectors }   = await supabase.from("sectors").select("id, slug")
  const { data: questions } = await supabase.from("questions").select("id, key")
  const { data: products }  = await supabase.from("products").select("id, slug")
  const { data: coverages } = await supabase.from("product_coverages").select("id, product_id, key")

  if (!sectors || !questions || !products || !coverages) {
    return <Pre lines={["Errore nel recupero dei dati base."]} />
  }

  const sid  = (slug: string) => sectors.find((s)  => s.slug === slug)?.id  ?? null
  const qid  = (key: string)  => questions.find((q) => q.key  === key)?.id   ?? null
  const pid  = (slug: string) => products.find((p)  => p.slug === slug)?.id  ?? null
  const cid  = (productSlug: string, covKey: string) => {
    const productId = pid(productSlug)
    return coverages.find((c) => c.product_id === productId && c.key === covKey)?.id ?? null
  }

  // ── FIX 1: sector_questions mancanti ─────────────────────────────────────

  info("FIX 1 — sector_questions mancanti")

  const links: Array<{ sectorSlug: string; questionKey: string; position: number; required: boolean }> = [
    { sectorSlug: "medici", questionKey: "q_gruppo_rischio_medico",      position:  0, required: true  },
    { sectorSlug: "medici", questionKey: "q_massimale_rc",               position:  1, required: true  },
    { sectorSlug: "medici", questionKey: "q_retroattivita_rc",           position:  2, required: true  },
    { sectorSlug: "medici", questionKey: "q_attivita_struttura",         position:  3, required: true  },
    { sectorSlug: "medici", questionKey: "q_eta",                        position:  4, required: true  },
    { sectorSlug: "medici", questionKey: "q_franchigia_medico",          position:  5, required: true  },
    { sectorSlug: "medici", questionKey: "q_sinistri_5_anni",            position:  6, required: true  },
    { sectorSlug: "medici", questionKey: "q_medicina_estetica",          position:  7, required: false },
    { sectorSlug: "medici", questionKey: "q_attivita_invasive_minori",   position:  8, required: false },
    { sectorSlug: "medici", questionKey: "q_attivita_invasive_soccorso", position:  9, required: false },
    { sectorSlug: "medici", questionKey: "q_ruolo_apicale_medico",       position: 10, required: false },
    { sectorSlug: "medici", questionKey: "q_altre_perdite_rct_rco",      position: 11, required: false },
    { sectorSlug: "medici", questionKey: "q_omesso_ecm",                 position: 12, required: false },
    { sectorSlug: "dentisti", questionKey: "q_attivita_dentista",        position: 0, required: true },
    { sectorSlug: "dentisti", questionKey: "q_massimale_rc",             position: 1, required: true },
    { sectorSlug: "dentisti", questionKey: "q_retroattivita_rc",         position: 2, required: true },
    { sectorSlug: "dentisti", questionKey: "q_svolge_in_struttura",      position: 3, required: true },
    { sectorSlug: "dentisti", questionKey: "q_eta",                      position: 4, required: true },
    { sectorSlug: "dentisti", questionKey: "q_franchigia",               position: 5, required: true },
    { sectorSlug: "dentisti", questionKey: "q_sinistri_5_anni",          position: 6, required: true },
  ]

  for (const l of links) {
    const sectorId   = sid(l.sectorSlug)
    const questionId = qid(l.questionKey)
    if (!sectorId)   { err(`settore non trovato: ${l.sectorSlug}`);   continue }
    if (!questionId) { err(`domanda non trovata: ${l.questionKey}`);   continue }
    const { error } = await supabase
      .from("sector_questions")
      .upsert(
        { sector_id: sectorId, question_id: questionId, position: l.position, is_required: l.required, visible_if: null },
        { onConflict: "sector_id,question_id" }
      )
    if (error) err(`${l.sectorSlug} → ${l.questionKey}: ${error.message}`)
    else       ok(`${l.sectorSlug} → ${l.questionKey}`)
  }

  // ── FIX 2: amtrust-medico-under-35 rate rows (q_fascia_eta → q_eta) ──────

  info("FIX 2 — rate rows amtrust-medico-under-35 (q_fascia_eta → q_eta)")

  const covId = cid("amtrust-medico-under-35", "rc_professionale")
  if (!covId) {
    err("copertura rc_professionale non trovata per amtrust-medico-under-35")
  } else {
    const { error: delErr } = await supabase.from("product_rate_rows").delete().eq("coverage_id", covId)
    if (delErr) {
      err(`delete rate rows: ${delErr.message}`)
    } else {
      ok("rate rows vecchie eliminate")
      const { error: insErr } = await supabase.from("product_rate_rows").insert([
        { coverage_id: covId, dimension_values: { q_eta: { less_than: 29 } },    premium: 300, manual_quote: false },
        { coverage_id: covId, dimension_values: { q_eta: { between: [29, 35] } }, premium: 340, manual_quote: false },
      ])
      if (insErr) err(`insert rate rows: ${insErr.message}`)
      else        ok("rate rows corrette inserite (q_eta<29 → €300, q_eta 29-35 → €340)")
    }
    const { error: dimErr } = await supabase
      .from("product_coverages").update({ dimensions: ["q_eta"] }).eq("id", covId)
    if (dimErr) err(`update dimensions: ${dimErr.message}`)
    else        ok(`coverage dimensions aggiornate: ["q_eta"]`)
  }

  // ── FIX 3: eligibility rules mancanti per amtrust-medico-under-35 ────────

  info("FIX 3 — eligibility rules mancanti (massimale fisso 2M, retro fissa 10 anni)")

  const productId = pid("amtrust-medico-under-35")
  if (!productId) {
    err("prodotto amtrust-medico-under-35 non trovato")
  } else {
    const missingRules = [
      {
        product_id: productId,
        name: "Massimale fisso 2.000.000",
        condition: { q_massimale_rc: { not_equals: 2000000 } },
        action: "exclude",
        reason: "Questo prodotto copre solo con massimale €2.000.000",
        priority: 1,
      },
      {
        product_id: productId,
        name: "Retroattività fissa 10 anni",
        condition: { q_retroattivita_rc: "illimitata" },
        action: "exclude",
        reason: "Questo prodotto copre solo con retroattività 10 anni",
        priority: 2,
      },
    ]

    for (const rule of missingRules) {
      // Check if already exists by name to keep idempotent
      const { data: existing } = await supabase
        .from("product_eligibility_rules")
        .select("id")
        .eq("product_id", productId)
        .eq("name", rule.name)
        .maybeSingle()

      if (existing) {
        ok(`già presente: "${rule.name}"`)
        continue
      }

      const { error } = await supabase.from("product_eligibility_rules").insert(rule)
      if (error) err(`insert regola "${rule.name}": ${error.message}`)
      else       ok(`inserita regola: "${rule.name}"`)
    }
  }

  return <Pre lines={log} />
}

function Pre({ lines }: { lines: string[] }) {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="mb-4 text-sm font-bold">Repair — eseguito</h1>
      <pre className="rounded-lg border bg-muted p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono">
        {lines.join("\n")}
      </pre>
      <p className="mt-4 text-xs text-muted-foreground">
        Puoi eliminare <code className="font-mono">src/app/backoffice/repair/</code> dopo aver verificato i risultati.
      </p>
    </div>
  )
}
