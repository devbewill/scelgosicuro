# Piano di Implementazione — Insurance Quote App

App Next.js + Supabase + Tailwind + shadcn/ui ispirata a Lokky, con due caratteristiche chiave rispetto al competitor:

1. **Comparatore multi-compagnia**: per ogni tipologia di prodotto mostriamo offerte di piu' compagnie (AXA, Unipol, AssIta, Generali, ecc.), non una sola.
2. **Architettura data-driven**: domande, regole di eligibility, pricing e raccomandazioni sono dati (tabelle + JSONB), non codice. Si modificano senza deploy.

---

## 1. Approccio: form progressivo in 3 fasi

**FASE A — Identificazione rapida (30 secondi)**
- Settore → Attivita' → Contatti (nome, email, telefono)
- Obiettivo: creare una sessione, permettere follow-up via email
- NO chiedere fatturato o dettagli qui: li chiederemo nel questionario vero

**FASE B — Questionario dettagliato**
- Domande specifiche per attivita', organizzate in sezioni logiche
  (professione, sinistri, polizze pregresse, la polizza che cerchi)
- Contiene tutte le variabili che servono per calcolare prezzo e eligibility
- E' qui che chiediamo iscrizione albo, sinistri, polizze in corso, incarichi,
  massimale desiderato, retroattivita', ecc.

**FASE C — Confronto preventivi**
- Mostriamo 2 prodotti featured ("Il piu' sicuro" + "Il piu' economico")
- Bottone "Vedi altri" per l'elenco completo dei prodotti eleggibili
- Ogni card mostra: compagnia, massimale, garanzie, franchigia, prezzo

**FASE D — Acquisto & binding**
- Checkout Stripe → webhook → creazione polizza legata all'utente
- `valid_from` / `valid_until` definiscono l'ambito di validita'

---

## 2. FASE A — Identificazione rapida

```
Schermata 1 ── Settore (grid di 13 card con icone)
                "Di cosa ti occupi?"
                    │
Schermata 2 ── Attivita' (lista ricercabile filtrata)
                "Qual e' la tua attivita' specifica?"
                    │
Schermata 3 ── Contatti (3 campi)
                "Lasciaci i tuoi contatti per salvare il preventivo"
                • Nome
                • Email
                • Cellulare
                    │
                    ▼
             Crea quote_session → vai a FASE B
```

Perche' chiediamo i contatti subito: ci permette di fare recovery via email ("Completa il tuo preventivo"), di inviare il link al preventivo salvato, e di avere un lead anche se l'utente abbandona la FASE B.

---

## 3. FASE B — Questionario dettagliato

Le domande sono caricate dinamicamente in base all'attivita', strutturate in sezioni:

```
📋 Questionario RC Professionale Medici (esempio NL07 — Chirurgo generale)

▼ La tua professione
  • Iscrizione Ordine dei Medici (anno + citta')
  • Specializzazione
  • Tipo rapporto di lavoro (libero prof / SSN / privato / misto)
  • Anni di attivita'
  • Volume d'affari annuo

▼ La tua pratica
  • Svolgi attivita' chirurgica? Di che tipo?
  • Volumi (prestazioni/anno, pazienti)
  • Incarichi specifici (consulenze, perizie, medico legale)

▼ Sinistri e polizze pregresse
  • Sinistri ultimi 5 anni (si'/no + numero + importi)
  • Richieste di risarcimento pregresse
  • Polizza RC attualmente in corso? (compagnia, massimale, scadenza)
  • Rifiuti/disdette da compagnie negli ultimi 5 anni

▼ La polizza che cerchi
  • Massimale desiderato
  • Retroattivita' richiesta
  • Data decorrenza
  • Garanzie opzionali (tutela legale, infortuni, ecc.)
```

**Ogni attivita' ha un questionario con sezioni/domande diverse:**
- Avvocati: Incarichi speciali (sindaco, curatore, CdA), ripartizione fatturato
- Architetti: Studio, ripartizione fatturato per tipo opera, sismabonus/cert.energetica
- Freelance: Estensioni territoriali, USA/Canada
- Bar/Ristoranti: Locale (mq, dipendenti), danni immobile, merci

---

## 4. FASE C — Confronto preventivi

L'utente vede 2 prodotti featured + bottone per vedere gli altri eleggibili:

```
🎯 Preventivi per RC Professionale Medici (Chirurgo generale)

┌─────────────────────────────┬─────────────────────────────┐
│ 🛡️  IL PIU' SICURO           │ 💰 IL PIU' ECONOMICO        │
│ AssIta Premium              │ AssIta Flex                 │
│ Massimale: €1M              │ Massimale: €1M              │
│ Tutela legale inclusa       │ Franchigia €500             │
│ Assistenza 24/7             │ No tutela legale            │
│ €1.650/anno                 │ €1.180/anno                 │
│ [Scegli]                    │ [Scegli]                    │
└─────────────────────────────┴─────────────────────────────┘

      ↓ [Vedi altri 3 preventivi compatibili]

  • AXA Medici Top        — €2.095/anno
  • Unipol ProteggiMedico — €1.420/anno
  • Allianz MediCare      — €1.890/anno
```

La scelta dei 2 featured e' guidata da un **sistema di scoring** (sez. 8).

---

## 5. Journey Medici completo (esempio NL07)

```
┌─────────────────────────────────────────────────────────────┐
│ FASE A — Identificazione                                    │
├─────────────────────────────────────────────────────────────┤
│ 1. Settore → "Medici" (NL)                                   │
│ 2. Attivita' → "Chirurghi generali" (NL07)                  │
│ 3. Contatti → nome, email, cellulare                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE B — Questionario (15-20 domande in 4 sezioni)          │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Engine: Eligibility → Pricing → Scoring → Recommendation    │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE C — Confronto (2 featured + altri eleggibili)          │
│ User sceglie "AssIta Flex"                                  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE D — Acquisto                                           │
├─────────────────────────────────────────────────────────────┤
│ • Review dati + consensi privacy                            │
│ • Stripe checkout → payment_intent                          │
│ • Webhook: crea policy con valid_from/valid_until           │
│ • Email di conferma + PDF certificato                       │
│ • Dashboard: "La tua polizza POL-2026-000123 e' attiva      │
│   fino al 17/04/2027"                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Database: principio architetturale

- **Catalogo prodotti, regole di eligibility, pricing e recommendation** → tutto in **tabelle relazionali**
- **Form (question bank, struttura questionario, risposte utente)** → **JSONB**
- **Glue tra i due mondi**: una stringa `question_key` che vive sia come chiave nel JSONB `answers` sia come colonna TEXT nelle tabelle di regole

```
RELAZIONALI (business catalog):
├─ insurers
├─ product_types
├─ products                      ← tutti i prodotti, N per compagnia
├─ activity_products
├─ product_coverage_options
├─ product_addons
├─ product_eligibility_rules
├─ product_base_prices
├─ product_multipliers
├─ product_multiplier_bands
├─ product_addon_prices
├─ scoring_rules
└─ product_recommendations

JSONB (form-related):
├─ questions.options / validation
├─ questionnaires.definition (sections + visible_if)
└─ quote_sessions.answers
```

---

## 7. Schema DB completo

### 7.1 Catalogo prodotti

```sql
insurers (
  id          uuid PK,
  code        text UNIQUE,          -- "AXA", "UNIPOL", "GENERALI"
  name        text,
  logo_url    text,
  website     text
)

product_types (
  id          text PK,              -- "RC_MEDICI", "RC_ARCHITETTI"
  name        text,
  category    text                  -- "ATT" | "IMP" | "IMM"
)

products (
  id              uuid PK,
  insurer_id      uuid FK → insurers,
  product_type_id text FK → product_types,
  code            text UNIQUE,      -- "AXA_MEDICI_TOP"
  name            text,             -- "Medici Top"
  description     text,
  status          text,             -- "active" | "inactive"
  valid_from      date,
  valid_until     date,
  created_at      timestamptz
)

activity_products (
  activity_id   text FK → activities,
  product_id    uuid FK → products,
  is_core       bool,
  sort_order    int,
  PRIMARY KEY (activity_id, product_id)
)

product_coverage_options (
  id                uuid PK,
  product_id        uuid FK → products,
  coverage_amount   numeric,       -- 500000, 1000000
  deductible        numeric,
  price_multiplier  numeric,
  is_default        bool,
  sort_order        int
)

product_addons (
  id              uuid PK,
  product_id      uuid FK → products,
  code            text,            -- "tutela_legale"
  name            text,
  description     text,
  price_fixed     numeric,
  price_percent   numeric,
  is_included     bool             -- true = sempre incluso
)
```

### 7.2 Eligibility (regole di esclusione)

```sql
product_eligibility_rules (
  id                uuid PK,
  product_id        uuid FK → products,
  question_key      text,          -- "q_specializzazione_medica"
  operator          text,          -- "equals" | "in" | "not_equals" |
                                   -- "greater_than" | "less_than" | "between"
  expected_value    text,
  expected_values   text[],        -- per "in" / "not_in"
  range_min         numeric,
  range_max         numeric,
  exclusion_reason  text,
  sort_order        int
)
```

**Logica:** se almeno una riga fa match sulle risposte utente → prodotto escluso.

### 7.3 Pricing (4 tabelle specializzate)

```sql
-- Prezzo base: dipende da 1 domanda
product_base_prices (
  id             uuid PK,
  product_id     uuid FK → products,
  question_key   text,
  answer_value   text,
  base_price     numeric,
  is_default     bool
)

-- Moltiplicatori con match esatto
product_multipliers (
  id             uuid PK,
  product_id     uuid FK → products,
  question_key   text,
  answer_value   text,
  multiplier     numeric,
  sort_order     int
)

-- Moltiplicatori a bande (valori numerici)
product_multiplier_bands (
  id             uuid PK,
  product_id     uuid FK → products,
  question_key   text,
  calculation    text,             -- "direct" | "years_since" | "band"
  range_min      numeric,
  range_max      numeric,
  multiplier     numeric,
  sort_order     int
)

-- Addon condizionali
product_addon_prices (
  id             uuid PK,
  product_id     uuid FK → products,
  question_key   text,
  trigger_value  text,
  price_fixed    numeric,
  price_percent  numeric
)
```

**Formula finale:**
```
prezzo_finale = base_price × Π(multipliers) × Π(bands) + Σ(addons)
```

### 7.4 Scoring & raccomandazioni

```sql
scoring_rules (
  id                uuid PK,
  activity_id       text FK → activities,   -- o product_type_id
  question_key      text,
  operator          text,
  expected_value    text,
  expected_values   text[],
  range_min         numeric,
  range_max         numeric,
  score_delta       numeric,                -- +5, -10, ecc.
  description       text,
  sort_order        int
)

product_recommendations (
  id              uuid PK,
  product_id      uuid FK → products,
  slot            text,                     -- "safe" | "economic"
  score_min       numeric,
  score_max       numeric,
  priority        int,                      -- 1=top, 10=fallback
  reason          text
)

CREATE INDEX idx_reco_lookup
  ON product_recommendations(slot, score_min, score_max);
```

### 7.5 Form (JSONB)

```sql
-- Bank domande riutilizzabili
questions (
  key         text PK,              -- "q_sinistri_5_anni" (stabile)
  label       text,
  help_text   text,
  type        text,                 -- "number" | "currency" | "dropdown" |
                                    -- "choice" | "multichoice" | "date" | ...
  options     jsonb,                -- [{value, label}]
  validation  jsonb,                -- {min, max, regex, required}
  category    text,
  created_at  timestamptz,
  updated_at  timestamptz
)

-- Questionario versionato per attivita'
questionnaires (
  id            uuid PK,
  activity_id   text FK → activities,
  version       int,
  status        text,                -- "draft" | "published" | "archived"
  definition    jsonb,              -- sections + items + visible_if
  published_at  timestamptz,
  UNIQUE (activity_id, version)
)
```

Esempio `questionnaires.definition`:

```json
{
  "title": "Preventivo RC Professionale Medici",
  "sections": [
    {
      "key": "professione",
      "title": "La tua professione",
      "items": [
        { "question_key": "q_anno_iscrizione_albo", "required": true },
        { "question_key": "q_specializzazione_medica", "required": true },
        {
          "question_key": "q_volume_affari_annuo",
          "required": true,
          "visible_if": {
            "question_key": "q_tipo_rapporto",
            "operator": "in",
            "value": ["libero_prof", "misto"]
          }
        }
      ]
    }
  ]
}
```

### 7.6 Transazionale

```sql
quote_sessions (
  id                uuid PK default gen_random_uuid(),
  activity_id       text FK → activities,
  questionnaire_id  uuid FK → questionnaires,  -- version lock
  contact_name      text,
  contact_email     text,
  contact_phone     text,
  answers           jsonb,                     -- {q_xxx: value}
  user_score        numeric,                   -- calcolato in FASE C
  status            text,                      -- "draft" | "calculated" |
                                               -- "product_selected" | "paid"
  selected_product_id uuid FK → products,
  created_at        timestamptz,
  updated_at        timestamptz
)

quote_results (
  id                uuid PK,
  session_id        uuid FK → quote_sessions,
  product_id        uuid FK → products,
  annual_price      numeric,
  monthly_price     numeric,
  coverage_snapshot jsonb,       -- massimale, garanzie per UI
  excluded          bool,
  excluded_reason   text,
  slot              text,         -- "safe" | "economic" | null (others)
  created_at        timestamptz
)

user_profiles (
  id         uuid PK FK → auth.users,
  email      text,
  first_name text,
  last_name  text,
  tax_code   text,
  vat_number text,
  phone      text,
  address    jsonb,
  created_at timestamptz
)

policies (
  id                 uuid PK,
  user_id            uuid FK → auth.users NOT NULL,
  quote_session_id   uuid FK → quote_sessions,
  product_id         uuid FK → products,
  policy_number      text UNIQUE,         -- "POL-2026-000123"
  purchased_at       timestamptz,
  valid_from         date,
  valid_until        date,
  status             text,                 -- "active" | "expired" | "cancelled"
  premium_paid       numeric,
  payment_id         text,                 -- Stripe payment_intent
  payment_status     text,
  coverage_snapshot  jsonb,                -- immutabile
  form_data_snapshot jsonb,                -- immutabile
  document_url       text,                 -- PDF certificato
  created_at         timestamptz,
  updated_at         timestamptz
)

CREATE INDEX idx_policies_user ON policies(user_id);
CREATE INDEX idx_policies_valid_until
  ON policies(valid_until) WHERE status = 'active';
```

---

## 8. Engine: dalle risposte ai preventivi ranked

Flusso completo di `generateQuotes(session_id)`:

```
INPUT: quote_sessions.id → legge activity_id, answers

┌──────────────────────────────────────────────────────────────┐
│ STEP 1 — Lista prodotti potenzialmente eleggibili            │
└──────────────────────────────────────────────────────────────┘
SELECT p.*, i.name, i.logo_url
FROM products p
JOIN insurers i ON i.id = p.insurer_id
JOIN activity_products ap ON ap.product_id = p.id
WHERE ap.activity_id = :activity_id
  AND p.status = 'active'
  AND CURRENT_DATE BETWEEN p.valid_from AND COALESCE(p.valid_until, '2099-12-31')

┌──────────────────────────────────────────────────────────────┐
│ STEP 2 — Filtro eligibility (app code)                       │
└──────────────────────────────────────────────────────────────┘
Per ogni prodotto, SELECT * FROM product_eligibility_rules WHERE product_id = :id
Se almeno una regola matcha answers[question_key] → escluso

┌──────────────────────────────────────────────────────────────┐
│ STEP 3 — Pricing per ogni prodotto eleggibile                │
└──────────────────────────────────────────────────────────────┘
base_price = product_base_prices lookup su answers
price = base_price
× product_multipliers matching
× product_multiplier_bands matching
+ product_addon_prices matching
→ annual_price

┌──────────────────────────────────────────────────────────────┐
│ STEP 4 — User score                                          │
└──────────────────────────────────────────────────────────────┘
score = 0
SELECT * FROM scoring_rules WHERE activity_id = :activity_id
Per ogni regola che matcha: score += score_delta

UPDATE quote_sessions SET user_score = :score

┌──────────────────────────────────────────────────────────────┐
│ STEP 5 — Pick featured products                              │
└──────────────────────────────────────────────────────────────┘
SELECT pr.product_id FROM product_recommendations pr
WHERE pr.slot = 'safe'
  AND :user_score BETWEEN pr.score_min AND pr.score_max - 0.01
  AND pr.product_id = ANY(:eligible_ids)
ORDER BY pr.priority ASC LIMIT 1
→ safe_product_id

Idem per slot = 'economic'
→ economic_product_id

Fallback se null:
  safe      → prodotto eleggibile con massimale piu' alto
  economic  → prodotto eleggibile col prezzo piu' basso

┌──────────────────────────────────────────────────────────────┐
│ STEP 6 — Persist risultati                                   │
└──────────────────────────────────────────────────────────────┘
INSERT INTO quote_results (session_id, product_id, annual_price,
                          coverage_snapshot, excluded, slot)
per ogni prodotto: eleggibili con slot se featured, null se "altri"

┌──────────────────────────────────────────────────────────────┐
│ STEP 7 — UI render                                           │
└──────────────────────────────────────────────────────────────┘
Top: 2 card (safe + economic)
Expandable: lista altri prodotti eleggibili
Tutti con compagnia, prezzo, coperture dal coverage_snapshot
```

---

## 9. Esempio concreto end-to-end

**Input** (chirurgo generale, 18 anni di attivita', 0 sinistri):

```json
{
  "q_specializzazione_medica": "chirurgia_generale",
  "q_anno_iscrizione_albo": 2008,
  "q_sinistri_5_anni": "no",
  "q_polizza_in_corso": "si",
  "q_attivita_chirurgica_estetica": "no",
  "q_volume_affari_annuo": 150000,
  "q_massimale_desiderato": 1000000,
  "q_retroattivita": "5y",
  "q_tutela_legale_opzione": true
}
```

**Step 1-2** — Eligibility: tutti i 4 prodotti RC_MEDICI passano.

**Step 3** — Pricing (esempio AXA Medici Top):

| Componente | Valore |
|---|---|
| base_price (chirurgia_generale) | 1350 |
| × massimale (1M) | × 1.35 |
| × years_since albo (18 anni → banda 15-999) | × 0.95 |
| × retroattivita' (5y) | × 1.15 |
| × sinistri (no) | × 1.00 |
| + addon tutela legale | + 150 |
| **Totale** | **≈ 2095 €/anno** |

Stesso calcolo per AssIta, Unipol, Generali.

**Step 4** — User score:

| Regola | Match | Delta |
|---|---|---|
| sinistri = no | ✓ | +10 |
| years_since albo > 15 | ✓ (18) | +8 |
| polizza in corso | ✓ | +3 |
| volume > 200k | ✗ | 0 |
| chirurgia estetica | ✗ | 0 |
| **Score** | | **+21** |

**Step 5** — Featured:

- Slot `safe`, score 21 rientra in 15-999 → `axa_medici_top` (priority 1)
- Slot `economic`, score 21 rientra in 15-999 → `unipol_basic` (priority 1)

**Output UI:**

```
🛡️ IL PIU' SICURO            💰 IL PIU' ECONOMICO
AXA Medici Top               Unipol ProteggiMedico
€2.095/anno                  €1.420/anno

[Vedi altri 2 preventivi]
  • AssIta Premium  — €1.881/anno
  • Generali Medical — €1.950/anno
```

---

## 10. FASE D — Acquisto & binding

```
1. User clicca "Scegli" su un preventivo
   UPDATE quote_sessions SET selected_product_id = :id, status = 'product_selected'

2. Pagina review + consensi (dati contraente se non gia' forniti)

3. POST /api/policies/prepare
   ├─ Crea/trova user account (magic link se nuovo)
   ├─ Salva user_profile
   ├─ Insert policy con status = "pending_payment"
   └─ Crea Stripe payment_intent

4. Stripe checkout completato

5. Stripe webhook → POST /api/webhooks/stripe
   ├─ Trova policy tramite payment_intent_id
   ├─ UPDATE policy:
   │    status = "active"
   │    policy_number = generatePolicyNumber()
   │    valid_from = answers.q_data_decorrenza
   │    valid_until = valid_from + 1 year
   │    coverage_snapshot = {...immutable snapshot}
   │    form_data_snapshot = {...immutable snapshot}
   ├─ Genera PDF certificato → Supabase Storage
   ├─ UPDATE policy.document_url
   └─ Email di conferma

6. Redirect /dashboard
   "La tua polizza POL-2026-000123 e' attiva fino al 17/04/2027"
```

**Perche' `coverage_snapshot` e `form_data_snapshot` immutabili:** la polizza e' un contratto. Anche se domani cambi pricing_rules, coperture o questionari, la polizza rimane identica a quella sottoscritta. Audit e contestazioni future sono sempre possibili.

---

## 11. Il "glue" — come le risposte si collegano ai prodotti

Il legame tra JSONB (answers) e tabelle relazionali (regole) e' la stringa **`question_key`**:

- E' la **chiave** nel JSONB `quote_sessions.answers` (es. `answers['q_sinistri_5_anni']`)
- E' una **colonna TEXT** in: `product_eligibility_rules`, `product_base_prices`, `product_multipliers`, `product_multiplier_bands`, `product_addon_prices`, `scoring_rules`

Questo permette di:
- Aggiungere una domanda: INSERT in `questions`, referenziarla in `questionnaires.definition`
- Far contare quella domanda nel pricing di un prodotto: INSERT in una delle tabelle `product_pricing_*` con la stessa `question_key`
- Far contare nello scoring: INSERT in `scoring_rules`

Nessuna migration strutturale. Tutto data entry.

---

## 12. Workflow: cosa editi per ogni modifica

| Vuoi... | Modifichi | Impatto |
|---|---|---|
| Aggiungere una domanda al questionario | `questionnaires.definition` (nuova version) + forse `questions` | Nuove session partono con v nuova, quelle in corso finiscono con la vecchia |
| Cambiare il label di una domanda | `questions.label` | Immediato, tutti i questionari |
| Aggiungere una compagnia per un'attivita' | INSERT in `products` + `activity_products` + regole pricing/eligibility | Visibile al prossimo calcolo |
| Cambiare prezzi di un prodotto | UPDATE `product_base_prices` / `product_multipliers` | Nuove quote usano i nuovi prezzi. Polizze esistenti: snapshot immutabile |
| Escludere una condizione su un prodotto | INSERT in `product_eligibility_rules` | Nuove quote filtrate |
| Spingere un prodotto come "sicuro" per profili esperti | INSERT in `product_recommendations` con score_min alto | Immediato |
| Penalizzare un tipo di profilo nello scoring | INSERT/UPDATE in `scoring_rules` con delta negativo | Immediato |
| Cambiare visibilita' condizionale di una domanda | `questionnaires.definition.items.visible_if` | Immediato nel form |
| Dismettere un prodotto (no nuove vendite) | UPDATE `products.valid_until` = oggi, oppure `status = 'inactive'` | Polizze esistenti restano valide |

---

## 13. Struttura App Next.js

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    ← Landing
│   ├── preventivo/
│   │   ├── layout.tsx              ← Stepper progress
│   │   ├── page.tsx                ← redirect → /settore
│   │   ├── settore/page.tsx        ← FASE A.1
│   │   ├── attivita/page.tsx      ← FASE A.2
│   │   ├── contatti/page.tsx       ← FASE A.3 (crea session)
│   │   ├── domande/page.tsx        ← FASE B (DynamicForm da questionnaire)
│   │   ├── preventivi/page.tsx     ← FASE C (safe + economic + altri)
│   │   └── conferma/page.tsx       ← Review + consensi
│   ├── checkout/[sessionId]/page.tsx   ← FASE D (Stripe)
│   ├── dashboard/page.tsx          ← Polizze attive
│   └── api/
│       ├── sectors/route.ts
│       ├── activities/[sectorId]/route.ts
│       ├── questions/[key]/route.ts
│       ├── questionnaires/[activityId]/route.ts
│       ├── quotes/route.ts
│       ├── quotes/[id]/route.ts
│       ├── quotes/[id]/calculate/route.ts
│       ├── policies/prepare/route.ts
│       └── webhooks/stripe/route.ts
│
├── components/
│   ├── quote/
│   │   ├── StepperNav.tsx
│   │   ├── SectorGrid.tsx
│   │   ├── ActivityList.tsx
│   │   ├── DynamicForm.tsx         ← renderizza definition JSONB
│   │   ├── QuestionField.tsx       ← switch su question.type
│   │   ├── ComparisonView.tsx      ← safe + economic + expandable
│   │   └── QuoteCard.tsx
│   └── ui/                         ← shadcn components
│
└── lib/
    ├── supabase/
    │   ├── client.ts
    │   └── server.ts
    ├── engine/
    │   ├── eligibility.ts          ← filtro prodotti
    │   ├── pricing.ts              ← calcolo prezzo
    │   ├── scoring.ts              ← user score
    │   ├── recommendation.ts       ← pick safe + economic
    │   └── operators.ts            ← matches() helpers
    ├── policy-generator.ts         ← PDF + policy number
    └── types.ts
```

---

## 14. Milestone di sviluppo

| # | Task | Priorita' |
|---|------|-----------|
| 1 | Setup Next.js + Supabase + shadcn/ui | Alta |
| 2 | Schema DB completo (tutte le tabelle della sez. 7) | Alta |
| 3 | Seed: settori, attivita', insurers, product_types | Alta |
| 4 | Seed: 1-2 attivita' pilota (es. Medici NL07 + Architetti NA05) con prodotti di almeno 2 compagnie | Alta |
| 5 | Bank domande + questionnaire definition per le attivita' pilota | Alta |
| 6 | Seed: eligibility_rules + pricing tables + scoring_rules + recommendations per prodotti pilota | Alta |
| 7 | FASE A: Settore → Attivita' → Contatti (UI + API) | Alta |
| 8 | DynamicForm che renderizza questionnaire JSONB + save answers | Alta |
| 9 | Engine: eligibility + pricing (moduli `lib/engine/`) | Alta |
| 10 | Engine: scoring + recommendation | Alta |
| 11 | FASE C: ComparisonView con safe + economic + expandable | Alta |
| 12 | Supabase Auth (magic link) | Media |
| 13 | FASE D: Stripe checkout + webhook + binding policy | Media |
| 14 | Generazione PDF certificato + Supabase Storage | Media |
| 15 | Dashboard utente con polizze attive | Media |
| 16 | Admin UI per editare questionnaires e regole | Media |
| 17 | Estensione catalogo: altre attivita' e altre compagnie | Media |
| 18 | Recovery email ("completa il tuo preventivo") | Bassa |
| 19 | Waiting list flow per prodotti non ancora attivi | Bassa |
| 20 | Gestione rinnovi polizze in scadenza | Bassa (v2) |
