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

  const links: Array<{ sectorSlug: string; questionKey: string; position: number; required: boolean; visibleIf?: Record<string, unknown> }> = [
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

  const under35Id = pid("amtrust-medico-under-35")
  if (!under35Id) {
    err("prodotto amtrust-medico-under-35 non trovato")
  } else {
    const missingRules = [
      {
        product_id: under35Id,
        name: "Massimale fisso 2.000.000",
        condition: { q_massimale_rc: { not_equals: 2000000 } },
        action: "exclude",
        reason: "Questo prodotto copre solo con massimale €2.000.000",
        priority: 1,
      },
      {
        product_id: under35Id,
        name: "Retroattività fissa 10 anni",
        condition: { q_retroattivita_rc: "illimitata" },
        action: "exclude",
        reason: "Questo prodotto copre solo con retroattività 10 anni",
        priority: 2,
      },
    ]

    for (const rule of missingRules) {
      const { data: existing } = await supabase
        .from("product_eligibility_rules")
        .select("id")
        .eq("product_id", under35Id)
        .eq("name", rule.name)
        .maybeSingle()

      if (existing) { ok(`già presente: "${rule.name}"`); continue }

      const { error } = await supabase.from("product_eligibility_rules").insert(rule)
      if (error) err(`insert regola "${rule.name}": ${error.message}`)
      else       ok(`inserita regola: "${rule.name}"`)
    }
  }

  // ── FIX 4: q_tipo_rapporto_lavoro — nuova domanda + sector_questions ─────

  info("FIX 4 — q_tipo_rapporto_lavoro (nuova domanda + link al settore medici)")

  const { error: qInsErr } = await supabase.from("questions").upsert(
    {
      key: "q_tipo_rapporto_lavoro",
      label: "Tipo di rapporto di lavoro",
      help_text: null,
      type: "dropdown",
      options: [
        { value: "libero_professionista", label: "Libero professionista" },
        { value: "dipendente_pubblico",   label: "Dipendente pubblico" },
        { value: "dipendente_privato",    label: "Dipendente privato" },
        { value: "specializzando",        label: "Specializzando" },
      ],
    },
    { onConflict: "key" }
  )
  if (qInsErr) err(`upsert question q_tipo_rapporto_lavoro: ${qInsErr.message}`)
  else         ok("question q_tipo_rapporto_lavoro upserted")

  // Re-fetch questions after upsert so qid() resolves the new key
  const { data: questionsRefresh } = await supabase.from("questions").select("id, key")
  const qid2 = (key: string) => questionsRefresh?.find((q) => q.key === key)?.id ?? null

  const colpaGraveAddonLinks: Array<{ questionKey: string; position: number; visibleIf: Record<string, unknown> }> = [
    { questionKey: "q_tipo_rapporto_lavoro",             position:  0, visibleIf: null as unknown as Record<string, unknown> },
    { questionKey: "q_dipendente_pubblico_plus",         position: 13, visibleIf: { q_tipo_rapporto_lavoro: "dipendente_pubblico" } },
    { questionKey: "q_pregressa_dip_privato",            position: 14, visibleIf: { q_tipo_rapporto_lavoro: "dipendente_pubblico" } },
    { questionKey: "q_ruolo_apicale",                    position: 15, visibleIf: { q_tipo_rapporto_lavoro: { in: ["dipendente_pubblico", "dipendente_privato"] } } },
    { questionKey: "q_altre_perdite_patrimoniali",       position: 16, visibleIf: { q_tipo_rapporto_lavoro: { in: ["dipendente_pubblico", "dipendente_privato"] } } },
    { questionKey: "q_attivita_compatibili_specializzazione", position: 17, visibleIf: { q_tipo_rapporto_lavoro: "specializzando" } },
    { questionKey: "q_attivita_accessorie_rc",           position: 18, visibleIf: { q_tipo_rapporto_lavoro: { in: ["dipendente_pubblico", "dipendente_privato"] } } },
  ]

  const mediciSectorId = sid("medici")
  if (!mediciSectorId) {
    err("settore medici non trovato")
  } else {
    for (const l of colpaGraveAddonLinks) {
      const questionId = qid2(l.questionKey)
      if (!questionId) { err(`domanda non trovata: ${l.questionKey}`); continue }
      const { error } = await supabase
        .from("sector_questions")
        .upsert(
          { sector_id: mediciSectorId, question_id: questionId, position: l.position, is_required: l.questionKey === "q_tipo_rapporto_lavoro", visible_if: l.visibleIf ?? null },
          { onConflict: "sector_id,question_id" }
        )
      if (error) err(`medici → ${l.questionKey}: ${error.message}`)
      else       ok(`medici → ${l.questionKey} (pos ${l.position})`)
    }
  }

  // ── FIX 5: rimuovi colpa grave da impiegati_pubblici, spostalo in medici ──

  info("FIX 5 — amtrust-colpa-grave-extra: settore impiegati_pubblici → medici")

  const cgProductId = pid("amtrust-colpa-grave-extra")
  const mediciId    = sid("medici")

  if (!cgProductId) {
    err("prodotto amtrust-colpa-grave-extra non trovato")
  } else {
    // Move product to medici sector
    const { error: movErr } = await supabase
      .from("products")
      .update({ sector_id: mediciId })
      .eq("id", cgProductId)
    if (movErr) err(`move to medici: ${movErr.message}`)
    else        ok("prodotto spostato nel settore medici")

    // Remove stale sector_questions from impiegati_pubblici
    const impubId = sid("impiegati_pubblici")
    if (impubId) {
      const cgQuestionKeys = [
        "q_categoria_rischio_cg", "q_massimale_rc", "q_retroattivita_rc",
        "q_dipendente_pubblico_plus", "q_pregressa_dip_privato", "q_ruolo_apicale",
        "q_altre_perdite_patrimoniali", "q_attivita_compatibili_specializzazione", "q_attivita_accessorie_rc",
      ]
      const cgQuestionIds = cgQuestionKeys.map((k) => qid2(k) ?? qid(k)).filter(Boolean) as number[]
      if (cgQuestionIds.length) {
        const { error: delSqErr } = await supabase
          .from("sector_questions")
          .delete()
          .eq("sector_id", impubId)
          .in("question_id", cgQuestionIds)
        if (delSqErr) err(`remove impiegati_pubblici sector_questions: ${delSqErr.message}`)
        else          ok("sector_questions colpa grave rimossi da impiegati_pubblici")
      }
    }

    // Fix coverage dimensions
    const cgCovId = cid("amtrust-colpa-grave-extra", "rc_colpa_grave")
    if (!cgCovId) {
      err("coverage rc_colpa_grave non trovata")
    } else {
      const { error: covErr } = await supabase
        .from("product_coverages")
        .update({ dimensions: ["q_tipo_rapporto_lavoro", "q_massimale_rc", "q_retroattivita_rc"] })
        .eq("id", cgCovId)
      if (covErr) err(`update dimensions: ${covErr.message}`)
      else        ok(`coverage dimensions aggiornate`)

      // Delete old rate rows and insert new ones
      const { error: delRrErr } = await supabase.from("product_rate_rows").delete().eq("coverage_id", cgCovId)
      if (delRrErr) {
        err(`delete rate rows: ${delRrErr.message}`)
      } else {
        ok("rate rows vecchie eliminate")
        const GYNE = ["gruppo_29", "gruppo_30", "gruppo_35", "gruppo_41"]
        const masses = [1000000, 2000000, 3000000, 5000000]
        const retros = ["10_anni", "illimitata"]

        // cod_01: dip_pub + gyne
        const cod01 = { "10_anni": [365, 395, 415, 440], "illimitata": [400, 435, 460, 485] }
        // cod_02: dip_pub + no_gyne
        const cod02 = { "10_anni": [320, 345, 365, 385], "illimitata": [350, 380, 400, 420] }
        // cod_03: dip_priv + gyne
        const cod03 = { "10_anni": [440, 475, 500, 530], "illimitata": [480, 520, 550, 580] }
        // cod_04: dip_priv + no_gyne
        const cod04 = { "10_anni": [380, 415, 435, 460], "illimitata": [420, 455, 480, 505] }
        // cod_05: specializzando
        const cod05 = { "10_anni": [185, 195, 205, 220], "illimitata": [200, 220, 230, 240] }

        const newRows: Array<{ coverage_id: number; dimension_values: Record<string, unknown>; premium: number; manual_quote: boolean }> = []

        for (const retro of retros) {
          masses.forEach((m, i) => {
            newRows.push({ coverage_id: cgCovId, dimension_values: { q_tipo_rapporto_lavoro: "dipendente_pubblico", q_gruppo_rischio_medico: { in: GYNE }, q_massimale_rc: m, q_retroattivita_rc: retro }, premium: cod01[retro as keyof typeof cod01][i], manual_quote: false })
            newRows.push({ coverage_id: cgCovId, dimension_values: { q_tipo_rapporto_lavoro: "dipendente_pubblico", q_gruppo_rischio_medico: { not_in: GYNE }, q_massimale_rc: m, q_retroattivita_rc: retro }, premium: cod02[retro as keyof typeof cod02][i], manual_quote: false })
            newRows.push({ coverage_id: cgCovId, dimension_values: { q_tipo_rapporto_lavoro: "dipendente_privato",  q_gruppo_rischio_medico: { in: GYNE }, q_massimale_rc: m, q_retroattivita_rc: retro }, premium: cod03[retro as keyof typeof cod03][i], manual_quote: false })
            newRows.push({ coverage_id: cgCovId, dimension_values: { q_tipo_rapporto_lavoro: "dipendente_privato",  q_gruppo_rischio_medico: { not_in: GYNE }, q_massimale_rc: m, q_retroattivita_rc: retro }, premium: cod04[retro as keyof typeof cod04][i], manual_quote: false })
            newRows.push({ coverage_id: cgCovId, dimension_values: { q_tipo_rapporto_lavoro: "specializzando", q_massimale_rc: m, q_retroattivita_rc: retro }, premium: cod05[retro as keyof typeof cod05][i], manual_quote: false })
          })
        }

        const { error: insRrErr } = await supabase.from("product_rate_rows").insert(newRows)
        if (insRrErr) err(`insert rate rows: ${insRrErr.message}`)
        else          ok(`inserite ${newRows.length} rate rows corrette`)
      }
    }

    // Fix addon available_if
    const addonFixes: Array<{ key: string; available_if: Record<string, unknown> }> = [
      { key: "dipendente_pubblico_plus",          available_if: { q_tipo_rapporto_lavoro: "dipendente_pubblico" } },
      { key: "pregressa_dip_privato",             available_if: { q_tipo_rapporto_lavoro: "dipendente_pubblico" } },
      { key: "ruolo_apicale_perdite_patrimoniali", available_if: { q_tipo_rapporto_lavoro: { in: ["dipendente_pubblico", "dipendente_privato"] } } },
      { key: "altre_perdite_patrimoniali",        available_if: { q_tipo_rapporto_lavoro: { in: ["dipendente_pubblico", "dipendente_privato"] } } },
      { key: "attivita_compatibili_specializzazione", available_if: { q_tipo_rapporto_lavoro: "specializzando" } },
      { key: "attivita_accessorie_rc",            available_if: { q_tipo_rapporto_lavoro: { in: ["dipendente_pubblico", "dipendente_privato"] } } },
    ]
    for (const a of addonFixes) {
      const { error } = await supabase
        .from("product_addons")
        .update({ available_if: a.available_if })
        .eq("product_id", cgProductId)
        .eq("key", a.key)
      if (error) err(`addon ${a.key}: ${error.message}`)
      else       ok(`addon ${a.key}: available_if aggiornato`)
    }
  }

  // ── FIX 6: eligibility rules — colpa grave + inverse per LP products ──────

  info("FIX 6 — eligibility rules colpa grave + inverse liberi professionisti")

  const eligibilityToAdd = [
    {
      productSlug: "amtrust-colpa-grave-extra",
      name: "Solo dipendenti",
      condition: { q_tipo_rapporto_lavoro: "libero_professionista" },
      action: "exclude",
      reason: "Questo prodotto è riservato a medici dipendenti (pubblici o privati) e specializzandi",
      priority: 0,
    },
    {
      productSlug: "amtrust-medico-protetto",
      name: "Solo liberi professionisti",
      condition: { q_tipo_rapporto_lavoro: { in: ["dipendente_pubblico", "dipendente_privato", "specializzando"] } },
      action: "exclude",
      reason: "Questo prodotto è riservato ai liberi professionisti",
      priority: 1,
    },
    {
      productSlug: "amtrust-medico-under-35",
      name: "Solo liberi professionisti",
      condition: { q_tipo_rapporto_lavoro: { in: ["dipendente_pubblico", "dipendente_privato", "specializzando"] } },
      action: "exclude",
      reason: "Questo prodotto è riservato ai liberi professionisti",
      priority: 3,
    },
  ]

  for (const rule of eligibilityToAdd) {
    const productId = pid(rule.productSlug)
    if (!productId) { err(`prodotto non trovato: ${rule.productSlug}`); continue }

    const { data: existing } = await supabase
      .from("product_eligibility_rules")
      .select("id")
      .eq("product_id", productId)
      .eq("name", rule.name)
      .maybeSingle()

    if (existing) { ok(`già presente: "${rule.name}" su ${rule.productSlug}`); continue }

    const { error } = await supabase.from("product_eligibility_rules").insert({
      product_id: productId,
      name: rule.name,
      condition: rule.condition,
      action: rule.action,
      reason: rule.reason,
      priority: rule.priority,
    })
    if (error) err(`insert regola "${rule.name}" su ${rule.productSlug}: ${error.message}`)
    else       ok(`inserita regola "${rule.name}" su ${rule.productSlug}`)
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
