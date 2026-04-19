# Database — scelgosicuro

## Panoramica

Schema Postgres (Supabase). Nessuna logica di business in TypeScript — tutto vive nelle tabelle.
Il filo conduttore è il **`question_key`**: stringa stabile che lega le risposte del form alle regole di pricing e alle rate.

---

## Mappa delle relazioni

```
sectors ──┬──< sector_questions >──────────── questions
          ├──< sector_scoring_rules
          ├──< sector_product_recommendations >── products
          └──< quote_sessions ──< quote_results ──< policies

insurers ──< products ──┬──< product_coverages ──< product_rate_rows
                        ├──< product_multipliers  (coverage_id nullable)
                        ├──< product_addons ──< product_addon_rate_rows
                        └──< product_eligibility_rules
```

---

## Tabelle catalogo

### `sectors`
Macro-settori professionali (Medici, Avvocati, Commercialisti, …). Ogni settore ha un form dedicato e un set di prodotti assicurativi associati.

| colonna | tipo | note |
|---|---|---|
| id | UUID PK | |
| slug | TEXT UNIQUE | es. `medici`, `avvocati` |
| name | TEXT | label italiana |
| description | TEXT | |
| display_order | INT | ordine nel picker |
| is_active | BOOLEAN | |

---

### `insurers`
Compagnie assicurative. Tabella di lookup usata solo per la visualizzazione (nome + logo).

| colonna | tipo | note |
|---|---|---|
| id | UUID PK | |
| slug | TEXT UNIQUE | es. `amtrust`, `axa` |
| name | TEXT | |
| logo_url | TEXT | |
| is_active | BOOLEAN | |

---

### `products`
Un prodotto = un tariffario di una compagnia per un settore. Ogni prodotto porta con sé il proprio intero set di regole (eligibility, pricing, addons, multipliers). Prodotti di compagnie diverse convivono sullo stesso settore.

| colonna | tipo | note |
|---|---|---|
| id | UUID PK | |
| insurer_id | UUID FK → insurers | |
| sector_id | UUID FK → sectors | |
| slug | TEXT | es. `amtrust-medico-protetto` |
| name | TEXT | nome commerciale |
| version | TEXT | data versione tariffario |
| source_pdf | TEXT | path PDF originale |
| is_active | BOOLEAN | |
| valid_from / valid_until | DATE | finestre di validità |

---

## Tabelle form

### `questions`
Bank globale di domande riutilizzabili tra settori. Ogni domanda ha una chiave stabile (`key`) che non va mai rinominata — è il contratto pubblico tra form e regole.

| colonna | tipo | note |
|---|---|---|
| id | UUID PK | |
| key | TEXT UNIQUE | es. `q_sinistri_5_anni` — **immutabile** |
| label | TEXT | testo italiano mostrato all'utente |
| help_text | TEXT | |
| type | TEXT | `dropdown`, `number`, `text`, `boolean`, `date`, `multiselect` |
| options | JSONB | `[{"value": "gruppo_01", "label": "1 – Pediatria SSN"}, …]` |
| validation | JSONB | `{"min": 0, "max": 10, "step": 1}` |

---

### `sector_questions`
Composizione del form per settore. Risponde a: quali domande mostrare, in che ordine, obbligatorie o opzionali, e quando mostrarle (condizione `visible_if`). È una tabella di giunzione M2M con metadati.

| colonna | tipo | note |
|---|---|---|
| sector_id | UUID FK → sectors | PK composita con question_id |
| question_id | UUID FK → questions | |
| position | INT | ordine di rendering |
| section | TEXT | label sezione visiva (es. "Garanzie opzionali") |
| is_required | BOOLEAN | |
| visible_if | JSONB | condizione DSL — la domanda appare solo se vera |

**Nota:** alcune domande sono universali e non vivono qui. `q_eta` per esempio è raccolta in Fase A (form di contatto) e salvata direttamente in `quote_sessions.answers` — non compare nel questionario settoriale.

---

## Tabelle regole

### `sector_scoring_rules`
Assegna un punteggio di rischio all'utente in base alle sue risposte. Il punteggio finale determina quale prodotto viene raccomandato come `safe` vs `economic` tra quelli disponibili.

| colonna | tipo | note |
|---|---|---|
| sector_id | UUID FK → sectors | |
| name | TEXT | descrizione della regola |
| condition | JSONB | DSL condizione |
| score_delta | INT | positivo = profilo più rischioso |
| category | TEXT | es. `risk`, `size`, `seniority` |

---

### `product_eligibility_rules`
Definisce chi NON può acquistare un prodotto. Ogni regola ha una condizione: se vera, il prodotto viene escluso (`exclude`) o segnalato come preventivo su misura (`manual_quote`). Le regole sono valutate in ordine di `priority` e si ferma alla prima che scatta.

| colonna | tipo | note |
|---|---|---|
| product_id | UUID FK → products | |
| name | TEXT | |
| condition | JSONB | DSL condizione |
| action | TEXT | `exclude` oppure `manual_quote` |
| reason | TEXT | messaggio mostrato all'utente |
| priority | INT | ordine di valutazione (ASC) |

---

## Tabelle pricing

### `product_coverages`
Le garanzie di un prodotto (RC Professionale, Tutela Legale, Infortuni, …). Ogni copertura ha dimensioni — i `question_key` che formano gli assi della matrice di tariffe.

| colonna | tipo | note |
|---|---|---|
| id | UUID PK | |
| product_id | UUID FK → products | |
| key | TEXT | es. `rc_professionale` |
| name | TEXT | |
| is_mandatory | BOOLEAN | se false la copertura è opzionale |
| available_if | JSONB | condizione di attivazione per coperture opzionali |
| dimensions | JSONB | es. `["q_gruppo_rischio_medico", "q_massimale_rc"]` |
| position | INT | ordine |

---

### `product_rate_rows`
Celle della matrice prezzi. Una riga per ogni combinazione di valori delle dimensioni. Il motore cerca la riga dove **tutti** i valori in `dimension_values` corrispondono alle risposte dell'utente.

| colonna | tipo | note |
|---|---|---|
| coverage_id | UUID FK → product_coverages | |
| dimension_values | JSONB | es. `{"q_gruppo_rischio_medico":"gruppo_10","q_massimale_rc":2000000}` |
| premium | NUMERIC | prezzo lordo annuo |
| manual_quote | BOOLEAN | se true → non quotabile online, richiede intervento |

---

### `product_multipliers`
Fattori moltiplicativi applicati al premio base. Possono essere a livello di prodotto (`coverage_id NULL`, si applica a tutte le coperture) o specifici per una singola copertura. Tutti i moltiplicatori la cui condizione è vera vengono moltiplicati tra loro.

| colonna | tipo | note |
|---|---|---|
| product_id | UUID FK → products | |
| coverage_id | UUID FK nullable | null = livello prodotto |
| name | TEXT | |
| factor | NUMERIC | es. `0.85` = −15%, `1.15` = +15% |
| condition | JSONB | DSL condizione |
| priority | INT | ordine di applicazione |

---

### `product_addons`
Garanzie aggiuntive. Vengono incluse automaticamente nel calcolo se la condizione `triggered_by` è vera. Il prezzo è `flat` (importo fisso) o `rate_table` (matrice come le coperture base).

| colonna | tipo | note |
|---|---|---|
| id | UUID PK | |
| product_id | UUID FK → products | |
| key | TEXT | es. `retroattivita_illimitata` |
| name | TEXT | |
| pricing_mode | TEXT | `flat` oppure `rate_table` |
| flat_premium | NUMERIC | solo se `pricing_mode = flat` |
| triggered_by | JSONB | condizione per includere automaticamente l'addon |
| available_if | JSONB | condizione per renderlo selezionabile |
| dimensions | JSONB | solo se `pricing_mode = rate_table` |

---

### `product_addon_rate_rows`
Celle di prezzo per gli addon con `pricing_mode = rate_table`. Stessa logica di `product_rate_rows`.

| colonna | tipo | note |
|---|---|---|
| addon_id | UUID FK → product_addons | |
| dimension_values | JSONB | |
| premium | NUMERIC | |
| manual_quote | BOOLEAN | |

---

## Tabelle raccomandazioni

### `sector_product_recommendations`
Associa un prodotto a uno slot di visualizzazione (`safe` o `economic`) in base alla banda di punteggio dell'utente. Se non ci sono raccomandazioni configurate, il motore usa un fallback automatico: prodotto più economico → `economic`, più caro → `safe`.

| colonna | tipo | note |
|---|---|---|
| sector_id | UUID FK → sectors | |
| product_id | UUID FK → products | |
| slot | TEXT | `safe` oppure `economic` |
| min_score / max_score | INT | banda di punteggio (null = illimitato) |
| priority | INT | tiebreaker se più prodotti rientrano nella banda |

---

## Tabelle runtime

### `quote_sessions`
Una sessione = un preventivo in corso. Creata in Fase A con i dati di contatto. Le risposte del form vengono mergeate progressivamente in `answers` — mai sovrascritte integralmente, per non perdere valori pre-impostati (es. `q_eta` dalla Fase A).

| colonna | tipo | note |
|---|---|---|
| id | UUID PK | |
| sector_id | UUID FK → sectors | |
| contact | JSONB | `{"name": "…", "email": "…", "phone": "…"}` |
| answers | JSONB | `{"q_eta": 38, "q_gruppo_rischio_medico": "gruppo_10", …}` |
| user_score | INT | calcolato dal motore |
| status | TEXT | `draft` → `completed` → `bound` \| `abandoned` |

---

### `quote_results`
Un risultato per ogni prodotto elaborato nella sessione. Il motore inserisce una riga per ogni prodotto del settore: con prezzo se quotabile, senza se escluso o manuale.

| colonna | tipo | note |
|---|---|---|
| session_id | UUID FK → quote_sessions | |
| product_id | UUID FK → products | |
| slot | TEXT | `safe`, `economic`, o null |
| premium_total | NUMERIC | prezzo finale calcolato |
| premium_breakdown | JSONB | dettaglio per copertura e addon es. `{"rc_professionale": 890, "addon_omesso_ecm": 40}` |
| manual_quote | BOOLEAN | |
| exclusion_reason | TEXT | motivo esclusione o richiesta manuale |

---

### `policies`
Polizza acquistata — **immutabile dopo il binding**. Al momento dell'acquisto, prodotto e risposte vengono snapshotted. Le tabelle di pricing possono cambiare liberamente in seguito senza alterare polizze già emesse.

| colonna | tipo | note |
|---|---|---|
| session_id | UUID FK | |
| quote_result_id | UUID FK | |
| product_snapshot | JSONB | copia completa del prodotto |
| form_snapshot | JSONB | copia delle risposte al momento dell'acquisto |
| stripe_payment_intent_id | TEXT UNIQUE | |
| pdf_url | TEXT | |

---

## DSL condizioni (JSONB)

Usato in: `sector_scoring_rules.condition`, `product_eligibility_rules.condition`, `product_multipliers.condition`, `product_addons.triggered_by`, `sector_questions.visible_if`.

```jsonc
// Uguaglianza diretta
{"q_attivita_struttura": "si"}

// Operatore esplicito (formato nuovo)
{"key": "q_sinistri_5_anni", "op": "greater_than", "value": 2}

// Operatore come oggetto (formato legacy, compatibile)
{"q_sinistri_5_anni": {"greater_than": 2}}
{"q_eta": {"between": [35, 40]}}

// AND — tutte devono essere vere
{"all": [{"q_franchigia_medico": "2500"}, {"q_sinistri_5_anni": 0}]}

// OR — almeno una deve essere vera
{"any": [{"q_massimale_rc": 1000000}, {"q_massimale_rc": 2000000}]}
```

Operatori supportati: `equals`, `not_equals`, `in`, `not_in`, `greater_than`, `less_than`, `between`.

---

## Pipeline del motore (`generateQuotes`)

1. **Prodotti eleggibili** — carica tutti i `products` dove `sector_id = session.sector_id AND is_active`
2. **Filtro eligibility** — per ogni prodotto, valuta le `product_eligibility_rules` in ordine di `priority`. Se una condizione è vera: `exclude` rimuove il prodotto dalla comparazione, `manual_quote` lo mostra senza prezzo
3. **Pricing** — per ogni copertura `is_mandatory` del prodotto:
   - trova la riga in `product_rate_rows` con `dimension_values ⊆ answers`
   - applica tutti i `product_multipliers` la cui condizione è vera: `premio_base × Π(factor)`
   - somma gli addon `triggered_by` che matchano
4. **Scoring** — somma i `sector_scoring_rules.score_delta` che matchano; salva `user_score` in `quote_sessions`
5. **Featured** — assegna slot `safe`/`economic` dalle `sector_product_recommendations` per banda di score. Fallback automatico se la tabella è vuota: più economico → `economic`, più caro → `safe`
6. **Persist** — cancella i vecchi risultati della sessione e inserisce le nuove righe in `quote_results`
7. **Render** — 2 card featured in cima, lista espandibile degli altri, sezione separata per manual_quote e prodotti esclusi

---

## Use case: Dott. Rossi, Pediatra, 38 anni

### Profilo
- **Settore:** Medici
- **Età:** 38 anni (raccolta in Fase A)
- **Specialità:** Pediatria senza neonatologia
- **Massimale RC:** €2.000.000
- **Retroattività:** 10 anni
- **Attività presso struttura:** No (libera professione)
- **Franchigia:** Nessuna
- **Sinistri pregressi:** 0
- **Addon selezionati:** Omesso adempimento ECM

Le risposte vengono salvate in `quote_sessions.answers`:
```json
{
  "q_eta": 38,
  "q_gruppo_rischio_medico": "gruppo_10",
  "q_massimale_rc": 2000000,
  "q_retroattivita_rc": "10_anni",
  "q_attivita_struttura": "no",
  "q_franchigia_medico": "nessuna",
  "q_sinistri_5_anni": 0,
  "q_omesso_ecm": "si"
}
```

---

### Step 1 — Prodotti disponibili per il settore Medici

```sql
SELECT id, slug FROM products
WHERE sector_id = '<medici_id>' AND is_active = true
```

Risultato:
- `amtrust-medico-protetto`
- `amtrust-medico-under-35`

---

### Step 2 — Filtro eligibility

**amtrust-medico-under-35** ha la regola:
```json
{ "condition": {"q_eta": {"greater_than": 35}}, "action": "exclude" }
```
`q_eta = 38 > 35` → condizione vera → prodotto **escluso**.

**amtrust-medico-protetto** ha la regola:
```json
{ "condition": {"q_sinistri_5_anni": {"greater_than": 2}}, "action": "manual_quote" }
```
`q_sinistri_5_anni = 0 > 2` → falso → nessuna esclusione. Procede al pricing.

---

### Step 3 — Pricing di amtrust-medico-protetto

#### 3a. Premio base (RC Professionale)

La copertura `rc_professionale` ha `dimensions = ["q_gruppo_rischio_medico", "q_massimale_rc"]`.
Il motore cerca in `product_rate_rows` la riga che matcha:

```json
{"q_gruppo_rischio_medico": "gruppo_10", "q_massimale_rc": 2000000}
```

Trovata: **€ 1.049,00**

#### 3b. Moltiplicatori

Valuta tutti i `product_multipliers` per `amtrust-medico-protetto`:

| Regola | Condizione | Valore risposta | Risultato | Factor |
|---|---|---|---|---|
| Attività presso Struttura −15% | `q_attivita_struttura = "si"` | `"no"` | FALSO | — |
| Franchigia €2.500 −3% | `q_franchigia = "2500" AND sinistri = 0` | `"nessuna"` | FALSO | — |
| Franchigia €10.000 −12% | `q_franchigia = "10000" AND sinistri = 0` | `"nessuna"` | FALSO | — |
| 1 sinistro +15% | `q_sinistri = 1` | `0` | FALSO | — |
| 2 sinistri +50% | `q_sinistri = 2` | `0` | FALSO | — |
| Under 35 −7% | `q_eta < 35` | `38` | FALSO | — |
| Età 35–40 −5% | `q_eta BETWEEN 35 AND 40` | `38` | **VERO** | **× 0.95** |
| 70 anni o più +3% | `q_eta > 69` | `38` | FALSO | — |

Factor complessivo: **0.95**

Premio dopo moltiplicatori: `1.049,00 × 0,95 = **€ 996,55**`

#### 3c. Addon auto-triggered

Il motore valuta tutti gli addon con `triggered_by` che matchano le risposte:

| Addon | `triggered_by` | Valore risposta | Incluso | Prezzo |
|---|---|---|---|---|
| Retroattività illimitata | `q_retroattivita_rc = "illimitata"` | `"10_anni"` | NO | — |
| Attività invasive minori | `q_attivita_invasive_minori = "si"` | non risposto | NO | — |
| Attività invasive soccorso | `q_attivita_invasive_soccorso = "si"` | non risposto | NO | — |
| Medicina estetica | `q_medicina_estetica = "si"` | non risposto | NO | — |
| Ruolo apicale €450 | `q_ruolo_apicale_medico = "si"` | non risposto | NO | — |
| Altre perdite RCT/RCO €100 | `q_altre_perdite_rct_rco = "si"` | non risposto | NO | — |
| Omesso ECM €40 (flat) | `q_omesso_ecm = "si"` | `"si"` | **SÌ** | **€ 40,00** |

#### 3d. Premio totale

```
996,55 (RC base × moltiplicatori) + 40,00 (addon ECM) = € 1.036,55
```

Salvato in `quote_results`:
```json
{
  "premium_total": 1036.55,
  "premium_breakdown": {
    "rc_professionale": 996.55,
    "addon_omesso_ecm": 40.00
  },
  "slot": "safe",
  "manual_quote": false,
  "exclusion_reason": null
}
```

---

### Step 4 — Scoring

Non ci sono `sector_scoring_rules` configurate per il settore Medici → `user_score = 0`.

---

### Step 5 — Slot featured

`sector_product_recommendations` è vuota per Medici. Il motore usa il fallback:
- un solo prodotto quotabile → assegnato a slot `safe`

Il Dott. Rossi vede quindi `amtrust-medico-protetto` nella sezione **"Proposte in evidenza"** come card *Sicuro*.

---

### Riepilogo parametri che hanno inciso sul prezzo

| Parametro | Valore | Effetto |
|---|---|---|
| Gruppo di rischio | gruppo_10 (Pediatria senza neonatologia) | base €1.049,00 |
| Massimale RC | €2.000.000 | seleziona colonna nella matrice |
| Età 35–40 anni | 38 | moltiplicatore ×0,95 → −€52,45 |
| Nessuna franchigia | — | nessun sconto |
| 0 sinistri pregressi | — | nessuna maggiorazione |
| Attività non in struttura | no | nessuno sconto struttura |
| Addon ECM | sì | +€40,00 flat |
| **Totale** | | **€ 1.036,55** |

---

## Gerarchia dei dati e come sono collegati

```
insurers                              ← "chi è la compagnia"
  └── products                        ← "qual è il prodotto"
        ├── product_coverages          ← "cosa copre (RC, infortuni…)"
        │     ├── product_rate_rows    ← "quanto costa per ogni combo di risposte"
        │     └── product_multipliers  ← "sconti/maggiorazioni sulla singola copertura"
        ├── product_multipliers        ← "sconti/maggiorazioni su tutto il prodotto (coverage_id NULL)"
        ├── product_addons             ← "estensioni opzionali/automatiche"
        │     └── product_addon_rate_rows ← "quanto costa ogni addon"
        └── product_eligibility_rules  ← "quando escludere o mandare a preventivo manuale"

sectors                               ← "medici / avvocati / …"
  ├── sector_questions                 ← "quali domande fanno parte del form di questo settore"
  │     └── questions                  ← "testo, tipo, opzioni (bank globale condiviso)"
  ├── sector_scoring_rules             ← "come calcolare lo score utente dalle risposte"
  └── sector_product_recommendations   ← "score X → mostra prodotto Y come safe/economic"
```

Le due sotto-gerarchie si incontrano in `quote_results`: il motore prende le risposte da `quote_sessions.answers` (che usano i `question_key`), le confronta con le regole di ogni prodotto, e produce un risultato.

---

## Aggiungere una nuova compagnia (stesso settore, stesse domande)

Scenario tipico: la Compagnia X fornisce un tariffario medici con le stesse domande di AmTrust ma prezzi diversi.

**Cosa aggiungere:**

| Tabella | Cosa inserire |
|---|---|
| `insurers` | Una riga: `{slug: "compagnia-x", name: "Compagnia X Srl"}` |
| `products` | Una riga con `insurer_id = compagnia-x`, `sector_id = medici` |
| `product_coverages` | Una riga per copertura — stessa struttura, `product_id` del nuovo prodotto |
| `product_rate_rows` | Tutte le righe con le **nuove tariffe** — stesse `dimension_values`, `premium` diversi |
| `product_multipliers` | Nuove righe se le regole di sconto differiscono; identiche se uguali (con il nuovo `product_id`) |
| `product_addons` + `product_addon_rate_rows` | Solo se offre estensioni diverse o a prezzi diversi |
| `product_eligibility_rules` | Solo se ha regole di esclusione diverse |

**Cosa NON toccare:**

| Tabella | Perché |
|---|---|
| `sectors` | Il settore "medici" esiste già |
| `questions` / `sector_questions` | Le domande del form sono le stesse |
| `sector_scoring_rules` | Lo scoring è di settore, non di prodotto |
| `sector_product_recommendations` | Idem — si aggiorna solo se si vuole che il nuovo prodotto venga raccomandato come safe/economic |

**In pratica:** crea `supabase/seed/products/compagnia-x-medico.json` con la stessa struttura di `amtrust-medico-protetto.json`, cambia `insurer`, `slug`, `name`, e sostituisci i `premium` nelle `rates`. Il form mostra automaticamente il nuovo prodotto nella comparazione senza toccare il codice.

---

## Aggiungere un nuovo prodotto

1. Crea `supabase/seed/products/<slug>.json` seguendo il formato canonico
2. Aggiungi la mappatura `slug → settore` in `scripts/load-products.mjs`
3. `node scripts/load-products.mjs && supabase db query --linked -f supabase/seed/seed_all.sql`

Nessuna migration, nessun deploy di codice. Le regole, le tariffe e le domande vivono esclusivamente nel DB.
