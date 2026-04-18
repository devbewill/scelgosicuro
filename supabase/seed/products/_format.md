# Canonical product file format

Each AmTrust product PDF (tariffario) is converted to a single JSON file that
the seed pipeline loads into the catalog and rules tables.

One file per product version. File name = product slug, kebab-case.

## Top-level shape

```jsonc
{
  "slug":          "amtrust-commercialista-protetto",
  "insurer":       "amtrust",
  "product_type":  "rc_professionale_commercialista",
  "name":          "AmTrust Commercialista Protetto",
  "version":       "2024-10",
  "source_pdf":    "Tariffa_CommercialistaProtetto_V6_def.pdf",

  "questions":   [ /* question_key definitions used by this product */ ],
  "coverages":   [ /* one entry per independently-purchasable coverage */ ],
  "addons":      [ /* optional extras (flat price OR rate table) */ ],
  "eligibility": [ /* rules that exclude or mark for manual quote */ ]
}
```

## `coverages[]`

A **coverage** is a purchasable unit with its own premium (e.g. "RC
Professionale", "Tutela Legale", "Infortuni"). The base premium is looked up
on a N-dimensional rate table keyed by `question_key` values.

```jsonc
{
  "key":         "rc_professionale",
  "name":        "Responsabilità Civile Professionale",
  "mandatory":   true,
  "dimensions":  ["q_fascia_fatturato", "q_massimale_rc", "q_retroattivita_rc"],
  "rates":       [ /* one row per cell of the printed table */ ],
  "multipliers": [ /* conditional % adjustments on this coverage's premium */ ]
}
```

### `rates[]`

Each row is one cell of the printed matrix.
- Keys = values of the `dimensions` above (exact match).
- `premium` = gross premium in €. Either this OR `manual_quote:true` must be set.
- `manual_quote:true` covers "RD / Valutazione Direzionale / Non acquistabile".

```jsonc
{"q_fascia_fatturato":"0_25000", "q_massimale_rc":2000000, "q_retroattivita_rc":"10_anni", "premium":574}
{"q_fascia_fatturato":"0_25000", "q_massimale_rc":5000000, "q_retroattivita_rc":"10_anni", "manual_quote":true}
```

### `multipliers[]`

Conditional % adjustments, cumulative. Each rule fires if its `if` matches the
session answers; the `factor` multiplies the coverage premium. Applied in
order; product of all factors = final multiplier.

Supported operators in `if`: literal scalar (= equals), or one of
`{equals, not_equals, in, not_in, greater_than, less_than, between}`.

```jsonc
{"if":{"q_raddoppio_franchigia":"si"}, "factor":0.90}
{"if":{"q_sinistri_5_anni":{"greater_than":0}}, "factor":1.15}
{"if":{"q_high_risk_ratio":{"between":[0.70, 0.85]}}, "factor":1.45}
```

## `addons[]`

Optional extras. Two pricing modes:

- `"flat"` — fixed € premium, irrespective of profile.
- `"rate_table"` — has its own `dimensions` + `rates` like a coverage.

```jsonc
{"key":"cyber_liability", "name":"Cyber Liability", "pricing_mode":"flat", "premium":96}

{"key":"visto_leggero_730", "name":"Visto leggero e 730", "pricing_mode":"rate_table",
 "dimensions":["q_massimale_rc"],
 "rates":[
   {"q_massimale_rc":3000000, "premium":220},
   {"q_massimale_rc":5000000, "premium":290}
 ]}
```

Addon-level optional fields:
- `"mandatory_with": ["coverage_key"]` — can only be bought if the listed
  coverage is in the cart (e.g. "Vertenze passive" requires TL).
- `"free_if":  {...}` — eligibility-style condition that sets the price to 0
  (e.g. "Medicina Estetica free if gruppo_rischio > 15" in Medico Protetto).
- `"available_if": {...}` — condition for showing the addon at all
  (e.g. Sanitario "Solo Colpa Grave" combos not offered for Ostetrica).

## `eligibility[]`

Rules that exclude the product entirely or force a manual quote. The engine
is documented in `IMPLEMENTATION_PLAN.md` §8 step 2.

```jsonc
{"if":{"q_sinistri_5_anni":{"greater_than":2}}, "action":"exclude", "reason":"Più di 2 sinistri pregressi"}
{"if":{"q_fatturato":{"greater_than":300000}}, "action":"manual_quote"}
```

## `questions[]`

Definitions for every `question_key` referenced above. Matches the shape of
the `questions` table (see migration `0003_catalog_form_engine.sql`):

```jsonc
{
  "key":      "q_fascia_fatturato",
  "label":    "Qual è il tuo fatturato annuo?",
  "type":     "dropdown",
  "options":  [
    {"value":"0_25000",      "label":"Fino a €25.000"},
    {"value":"25001_50000",  "label":"€25.001 – €50.000"}
  ]
}
```

## Mapping to DB tables

| Canonical field              | Target table(s)                                    |
|------------------------------|----------------------------------------------------|
| `questions[]`                | `questions`                                        |
| `coverages[].rates[]`        | `product_rates` (extended — see `0004_pricing_v2`) |
| `coverages[].multipliers[]`  | `product_multipliers` / `product_multiplier_bands` |
| `addons[]`                   | `product_addons` + `product_addon_rates`           |
| `eligibility[]`              | `product_eligibility_rules`                        |
