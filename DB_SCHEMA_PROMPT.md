# ScelgoSicuro — Schema del Database (fonte di verità per l'inserimento di nuovi prodotti)

Questo documento descrive lo schema **attuale** del database (Supabase/PostgreSQL) di ScelgoSicuro.
È la fonte di verità da usare ogni volta che si analizza un tariffario e si devono scrivere le query SQL di inserimento.

---

## Principio fondamentale

L'architettura è **data-driven**: aggiungere un prodotto, una domanda o una regola di pricing è **sempre e solo un'operazione sui dati** (INSERT/UPDATE). Non si modifica mai il codice TypeScript.

Il collante tra il mondo del form e il mondo delle regole è il **`question_key`**: una stringa stabile (es. `q_eta`, `q_massimale_rc`, `q_professione`) che compare come `key` nelle tabelle domande e come campo nei JSONB delle regole di eligibilità, pricing e moltiplicatori. **Rinominare un question_key è un breaking change**: rompe tutte le regole che lo referenziano.

---

## Dati attualmente in produzione

### Settori (`sectors`)
| id | slug | name |
|----|------|------|
| 1 | medici | Medici |

### Compagnie (`insurers`)
| id | slug | name |
|----|------|------|
| 1 | amtrust | AmTrust Europe |

### Prodotti (`products`)
| id | slug | name | settore |
|----|------|------|---------|
| 1 | amtrust-medico-protetto | AmTrust Medico Protetto | medici |
| 2 | amtrust-colpa-grave-extra | AmTrust Colpa Grave Extra | medici |
| 3 | amtrust-medico-under-35 | AmTrust Medico Under 35 | medici |

### Domande di settore (`sector_questions`) — settore medici
| key | label | tipo | is_required | note |
|-----|-------|------|-------------|------|
| `q_tipo_assicurato_medico` | Tipo di attività | dropdown | **true** | libero_prof / dipendente |
| `q_sinistri_5_anni` | Sinistri negli ultimi 5 anni | number | **true** | min 0 |
| `q_attivita_struttura` | Dove svolgi la tua attività? | dropdown | **true** | una_struttura / no |
| `q_eta` | Quanti anni hai? | number | **true** | min 18 max 99 — raccolta nel questionario |
| `q_massimale_rc` | Massimale RC desiderato | dropdown | false | opzionale FASE C |
| `q_retroattivita` | Retroattività desiderata | dropdown | false | opzionale FASE C |
| `q_franchigia` | Franchigia | dropdown | false | visible_if: q_sinistri_5_anni = 0 |

> **Nota su `q_professione` e `q_tipo_area_medica`:**
> - `q_professione` viene pre-impostato in FASE A (selezione professione) e salvato in `quote_sessions.answers`.
> - `q_tipo_area_medica` viene derivato dalla colonna `professions.area_medica` e anch'esso salvato in `answers` al momento della creazione della sessione. Valori possibili: `chirurgica`, `non_chirurgica`, `altra`.
> - Entrambe le chiavi sono disponibili per regole di eligibilità, moltiplicatori e addon esattamente come le sector_questions.

### Domande di prodotto (`product_questions`) — AmTrust Medico Protetto (product_id = 1)
| key | label | tipo | phase | visible_if |
|-----|-------|------|-------|------------|
| `q_addon_ruolo_apicale` | Vuoi aggiungere la copertura Ruolo Apicale…? | dropdown | addon | — |
| `q_addon_rct_rco` | Vuoi aggiungere la copertura Perdite Patrimoniali…? | dropdown | addon | — |
| `q_addon_ecm` | Vuoi aggiungere la copertura Omesso Adempimento ECM? | dropdown | addon | — |
| `q_addon_medicina_estetica` | Svolgi anche attività di Medicina Estetica? | dropdown | addon | q_tipo_area_medica = non_chirurgica |
| `q_addon_attivita_invasive` | Svolgi anche attività invasive? | dropdown | addon | q_tipo_area_medica = non_chirurgica |

### Addon (`product_addons`) — AmTrust Medico Protetto (product_id = 1)
| key | name | pricing_mode | triggered_by | available_if |
|-----|------|--------------|--------------|--------------|
| `ruolo_apicale` | Ruolo Apicale e Direzione Sanitaria | flat (€450) | q_addon_ruolo_apicale = si | — |
| `rct_rco` | Perdite Patrimoniali e Conduzione Studio | flat (€100) | q_addon_rct_rco = si | — |
| `ecm` | Omesso Adempimento Crediti ECM | flat (€40) | q_addon_ecm = si | — |
| `medicina_estetica` | Estensione Medicina Estetica | rate_table | q_addon_medicina_estetica = si | q_tipo_area_medica = non_chirurgica |
| `attivita_invasive_minori` | Estensione Attività Invasive Minori | rate_table | q_addon_attivita_invasive = minori | q_tipo_area_medica = non_chirurgica |
| `attivita_invasive_soccorso` | Estensione Attività Invasive e Mezzi di Soccorso | rate_table | q_addon_attivita_invasive = soccorso | q_tipo_area_medica = non_chirurgica |

> Gli addon `rate_table` hanno `product_addon_rate_rows` per ogni professione non-chirurgica. Se il gruppo di rischio è ≤ soglia → `manual_quote = true` (prezzo da definire con AmTrust); se > soglia → `premium = 0` (inclusa gratuitamente).

---

## Schema tabelle

### `sectors`
```sql
id            BIGINT PK
slug          TEXT UNIQUE        -- es. 'medici', 'avvocati'
name          TEXT               -- es. 'Medici'
description   TEXT
display_order INT DEFAULT 0
is_active     BOOLEAN DEFAULT TRUE
```

---

### `professions`
Specializzazioni dentro un settore. La professione scelta viene salvata come `q_professione` in `quote_sessions.answers`.
```sql
id            BIGINT PK
sector_id     BIGINT FK → sectors(id)
slug          TEXT               -- es. 'pediatra_libera_scelta', 'chirurgo_generale'
name          TEXT               -- es. 'Pediatra di Libera Scelta (SSN)'
area_medica   TEXT               -- 'chirurgica' | 'non_chirurgica' | 'altra' (usato per q_tipo_area_medica)
display_order INT DEFAULT 0
is_active     BOOLEAN DEFAULT TRUE
UNIQUE (sector_id, slug)
```

---

### `insurers`
```sql
id        BIGINT PK
slug      TEXT UNIQUE   -- es. 'amtrust', 'axa', 'unipol'
name      TEXT          -- es. 'AmTrust Europe'
logo_url  TEXT
is_active BOOLEAN DEFAULT TRUE
```

---

### `products`
```sql
id          BIGINT PK
insurer_id  BIGINT FK → insurers(id)
sector_id   BIGINT FK → sectors(id)
slug        TEXT                  -- es. 'amtrust-medico-protetto'
name        TEXT                  -- es. 'AmTrust Medico Protetto'
description TEXT
version     TEXT                  -- es. '1.0', '2024'
is_active   BOOLEAN DEFAULT TRUE
valid_from  DATE
valid_until DATE
UNIQUE (insurer_id, slug, version)
```

---

### `sector_questions`
Domande condivise tra tutti i prodotti di un settore.

**`is_required`** controlla in quale fase appare la domanda:
- `true` → FASE B: mostrata nel questionario **prima** di vedere i risultati. L'utente deve rispondere.
- `false` → FASE C: mostrata come barra di raffinamento **dopo** i risultati. Se l'utente non risponde, il motore mostra una stima sul minimo.

```sql
id          BIGINT PK
sector_id   BIGINT FK → sectors(id)
key         TEXT           -- question_key, es. 'q_sinistri_5_anni'
label       TEXT           -- testo mostrato all'utente
help_text   TEXT
type        TEXT CHECK IN ('dropdown','number','text','boolean','date','multiselect')
options     JSONB          -- [{"value": ..., "label": "..."}] — solo per dropdown/multiselect
validation  JSONB          -- {"min":0,"max":99,"step":1} — solo per number
position    INT            -- ordine di visualizzazione
section     TEXT           -- intestazione di sezione (opzionale)
is_required BOOLEAN        -- true = FASE B obbligatoria | false = FASE C opzionale
visible_if  JSONB          -- condizione per mostrare la domanda (stessa DSL delle regole)
UNIQUE (sector_id, key)
```

**Esempio `options` per dropdown:**
```json
[
  {"value": "libero_prof", "label": "Libero professionista"},
  {"value": "dipendente",  "label": "Dipendente SSN / struttura privata"}
]
```
> I valori numerici devono essere numeri JSON (non stringhe): `{"value": 1000000, "label": "€ 1.000.000"}`.

**Opzioni attuali `q_attivita_struttura` (solo 2):**
```json
[
  {"value": "una_struttura", "label": "Sì, esclusivamente presso una struttura"},
  {"value": "no",            "label": "No"}
]
```

---

### `product_questions`
Domande specifiche di un singolo prodotto. Usate per addon, eligibilità avanzata o pricing.

```sql
id          BIGINT PK
product_id  BIGINT FK → products(id)
key         TEXT           -- question_key
label       TEXT
help_text   TEXT
type        TEXT CHECK IN ('dropdown','number','text','boolean','date','multiselect')
options     JSONB
validation  JSONB
position    INT
section     TEXT
is_required BOOLEAN DEFAULT FALSE
visible_if  JSONB
phase       TEXT CHECK IN ('eligibility','pricing','addon')
UNIQUE (product_id, key)
```

> Le domande `phase = 'addon'` vengono mostrate nella barra di raffinamento della FASE C (risultati), insieme alle sector_questions non-required.

---

### `product_coverages`
Le garanzie che compongono un prodotto. Il campo `dimensions` è un array JSON di question_key: indica **quali risposte dell'utente determinano il prezzo**.

```sql
id           BIGINT PK
product_id   BIGINT FK → products(id)
key          TEXT           -- es. 'rc_professionale', 'rc_colpa_grave'
name         TEXT           -- es. 'RC Professionale'
is_mandatory BOOLEAN        -- se false, la copertura è opzionale
available_if JSONB
dimensions   JSONB          -- array di question_key: ["q_professione", "q_massimale_rc"]
UNIQUE (product_id, key)
```

---

### `product_rate_rows`
Il tariffario grezzo. Ogni riga è un premio annuo per una combinazione esatta di dimensioni.

- In **modalità base** (risposte incomplete): cerca il match parziale più economico → `is_estimate = true`
- In **modalità refined** (tutte le dimensioni risposte): cerca il match esatto → `is_estimate = false`

```sql
id               BIGINT PK
coverage_id      BIGINT FK → product_coverages(id)
dimension_values JSONB          -- es. {"q_professione":"pediatra_libera_scelta","q_massimale_rc":2000000}
premium          NUMERIC(12,2)
manual_quote     BOOLEAN
```

**Esempio di INSERT (pattern consigliato):**
```sql
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', r.prof, 'q_massimale_rc', r.mass),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'amtrust-medico-protetto'
CROSS JOIN (VALUES
  ('pediatra_libera_scelta', 1000000,  497.00),
  ('pediatra_libera_scelta', 2000000,  572.00),
  ('mmg',                    1000000,  497.00),
  ('mmg',                    2000000,  572.00)
) AS r(prof, mass, premium)
WHERE cov.key = 'rc_professionale';
```

> **Importante:** i valori in `dimension_values` devono essere dello stesso tipo (numero vs stringa) usato in `answers`. Se il massimale è salvato come numero (`2000000`), non usare la stringa `"2000000"`.

---

### `product_eligibility_rules`
Regole di esclusione. **Quando `condition` è vera → applica `action`**.

- `action = 'exclude'`: il prodotto viene escluso
- `action = 'manual_quote'`: il prodotto viene mostrato con flag "preventivo su misura"

In modalità base, le regole con chiavi mancanti in `answers` vengono **saltate** (tri-state evaluation).

```sql
id         BIGINT PK
product_id BIGINT FK → products(id)
name       TEXT
condition  JSONB          -- vedi DSL condizioni sotto
action     TEXT CHECK IN ('exclude','manual_quote')
reason     TEXT
priority   INT
```

---

### `product_multipliers`
Fattori moltiplicativi sul prezzo base. `factor < 1` = sconto, `factor > 1` = sovrappremio.

- `coverage_id = NULL` → si applica all'intero prodotto
- `coverage_id = <id>` → si applica solo a quella copertura

```sql
id          BIGINT PK
product_id  BIGINT FK → products(id)
coverage_id BIGINT FK → product_coverages(id)  -- null = intero prodotto
name        TEXT
factor      NUMERIC(8,4)   -- es. 0.85, 1.15
condition   JSONB
priority    INT
```

**Formula pricing:** `premio_finale = base × factor_1 × factor_2 × … + addons`

---

### `product_addons`
Garanzie opzionali o estensioni.

- `pricing_mode = 'flat'`: prezzo fisso in `flat_premium`
- `pricing_mode = 'rate_table'`: il prezzo dipende da dimensioni → vedi `product_addon_rate_rows`

```sql
id           BIGINT PK
product_id   BIGINT FK → products(id)
key          TEXT
name         TEXT
pricing_mode TEXT CHECK IN ('flat','rate_table')
flat_premium NUMERIC(12,2)  -- solo se pricing_mode = 'flat'
triggered_by JSONB          -- condizione che attiva l'addon
available_if JSONB          -- condizione per rendere l'addon disponibile (filtra visibilità)
dimensions   JSONB          -- solo se pricing_mode = 'rate_table': array di question_key
UNIQUE (product_id, key)
```

---

### `product_addon_rate_rows`
Tariffario per addon a `rate_table`.

```sql
id               BIGINT PK
addon_id         BIGINT FK → product_addons(id)
dimension_values JSONB
premium          NUMERIC(12,2)
manual_quote     BOOLEAN DEFAULT FALSE   -- true = prezzo non disponibile, contattare AgEnt
```

---

### `quote_sessions`
Una sessione di preventivo. `answers` accumula tutte le risposte:

- FASE A: `q_professione`, `q_tipo_area_medica` (sintetici, impostati alla creazione)
- FASE B: sector_questions con `is_required = true` (incluso `q_eta`)
- FASE C: sector_questions con `is_required = false` + product_questions con `phase = 'addon'`

```sql
id        BIGINT PK
sector_id BIGINT FK → sectors(id)
contact   JSONB    -- {"name":"...","email":"...","phone":"..."}
answers   JSONB    -- {"q_professione":"pediatra_libera_scelta","q_tipo_area_medica":"non_chirurgica","q_eta":32,...}
status    TEXT CHECK IN ('draft','completed','bound','abandoned')
```

---

### `quote_results`
Risultati del motore per una sessione. Una riga per prodotto valutato.

```sql
id                BIGINT PK
session_id        BIGINT FK → quote_sessions(id)
product_id        BIGINT FK → products(id)
slot              TEXT CHECK IN ('safe','economic')  -- null per prodotti non in evidenza
premium_total     NUMERIC(12,2)                       -- null se escluso o manual_quote
premium_breakdown JSONB
manual_quote      BOOLEAN
exclusion_reason  TEXT
is_estimate       BOOLEAN
available_options JSONB    -- {"q_massimale_rc":[1000000,2000000],"q_franchigia":[0,2500,10000]}
```

---

## DSL per le condizioni JSONB

Usata in: `product_eligibility_rules.condition`, `product_multipliers.condition`, `product_addons.triggered_by`, `product_addons.available_if`, `sector_questions.visible_if`, `product_questions.visible_if`.

### Forma semplice
```json
{"key": "q_sinistri_5_anni", "op": "greater_than", "value": 2}
```

### Operatori disponibili
| op | significato | esempio value |
|----|-------------|---------------|
| `equals` | uguale | `"libero_prof"` o `1000000` |
| `not_equals` | diverso | `"dipendente"` |
| `in` | in lista | `["grp1","grp2"]` |
| `not_in` | non in lista | `["neurochirurgia"]` |
| `greater_than` | strettamente maggiore | `2` |
| `greater_than_or_equal` | maggiore o uguale | `35` |
| `less_than` | strettamente minore | `35` |
| `less_than_or_equal` | minore o uguale | `70` |
| `between` | intervallo incluso | `[35, 40]` |

### Combinatori logici
```json
// AND — tutte le condizioni devono essere vere
{"all": [
  {"key": "q_eta", "op": "greater_than_or_equal", "value": 35},
  {"key": "q_eta", "op": "less_than_or_equal",    "value": 40}
]}

// OR — almeno una condizione deve essere vera
{"any": [
  {"key": "q_tipo_area_medica", "op": "equals", "value": "chirurgica"},
  {"key": "q_tipo_area_medica", "op": "equals", "value": "non_chirurgica"}
]}
```

> ⚠️ Usare **`{"all":[...]}`** e **`{"any":[...]}`**, NON `{"op":"all","conditions":[...]}` (formato non riconosciuto dal motore).

---

## Flusso del motore di preventivo

`generateQuotes(sessionId)`:

1. **Carica** tutti i prodotti attivi del settore
2. **Rileva modalità:**
   - `refined` se tutte le chiavi non-required (sector_questions + product_questions addon) sono in `answers`
   - `base` altrimenti (calcola stime sul match parziale più economico)
3. **Eligibilità:** valuta `product_eligibility_rules`. Se `condition = true` → exclude o manual_quote. In `base` le regole con chiavi mancanti sono saltate.
4. **Pricing:** per ogni copertura `is_mandatory=true`, cerca `product_rate_rows` il cui `dimension_values` matcha `answers`. In `base` usa il match parziale più economico → `is_estimate = true`.
5. **Moltiplicatori:** applica `product_multipliers` con condition vera. In `base` applica solo quelli con chiavi già in `answers`.
6. **Addons:** somma i premi degli addon con `triggered_by = true` e `available_if` soddisfatta.
7. **Calcola `available_options`:** raccoglie i valori distinti delle chiavi non-required per ogni prodotto eleggibile. Salvato in `quote_results.available_options`.
8. **Slot:** safe = primo eleggibile, economic = secondo (se disponibili).
9. **Persiste** tutti i risultati in `quote_results`.

---

## Guida passo-passo: inserire un nuovo prodotto

### 1. Controlla se l'insurer esiste già
```sql
SELECT id, slug, name FROM insurers WHERE slug = 'nome-compagnia';
-- Se non esiste:
INSERT INTO insurers (slug, name) VALUES ('nome-compagnia', 'Nome Compagnia SPA');
```

### 2. Inserisci il prodotto
```sql
INSERT INTO products (insurer_id, sector_id, slug, name, description, version, is_active)
SELECT i.id, s.id, 'slug-prodotto', 'Nome Prodotto', 'Descrizione breve', '1.0', true
FROM insurers i, sectors s
WHERE i.slug = 'nome-compagnia' AND s.slug = 'medici';
```

### 3. Verifica le sector_questions esistenti
Le chiavi disponibili per il settore medici:

**is_required = true (FASE B):**
`q_tipo_assicurato_medico`, `q_sinistri_5_anni`, `q_attivita_struttura`, `q_eta`

**Pre-impostati in FASE A (sempre disponibili):**
`q_professione`, `q_tipo_area_medica`

**is_required = false (FASE C, opzionali):**
`q_massimale_rc`, `q_retroattivita`, `q_franchigia`

### 4. Aggiungi eventuali sector_questions mancanti
```sql
INSERT INTO sector_questions (sector_id, key, label, type, options, position, is_required)
SELECT s.id, 'q_nuova_chiave', 'Label per l''utente', 'dropdown',
  '[{"value":"opt1","label":"Opzione 1"},{"value":"opt2","label":"Opzione 2"}]'::jsonb,
  99, true
FROM sectors s WHERE s.slug = 'medici';
```

### 5. Definisci le coperture (`product_coverages`)
```sql
INSERT INTO product_coverages (product_id, key, name, is_mandatory, dimensions)
SELECT p.id, 'rc_professionale', 'RC Professionale', true, '["q_professione","q_massimale_rc"]'::jsonb
FROM products p WHERE p.slug = 'slug-prodotto';
```

### 6. Inserisci il tariffario (`product_rate_rows`)
```sql
INSERT INTO product_rate_rows (coverage_id, dimension_values, premium, manual_quote)
SELECT cov.id,
       jsonb_build_object('q_professione', r.prof, 'q_massimale_rc', r.mass),
       r.premium, false
FROM product_coverages cov
JOIN products p ON p.id = cov.product_id AND p.slug = 'slug-prodotto'
CROSS JOIN (VALUES
  ('slug-professione-1', 1000000, 500.00),
  ('slug-professione-2', 2000000, 1200.00)
) AS r(prof, mass, premium)
WHERE cov.key = 'rc_professionale';
```

### 7. Aggiungi regole di eligibilità
```sql
INSERT INTO product_eligibility_rules (product_id, name, condition, action, reason, priority)
SELECT p.id, 'Solo liberi professionisti',
  '{"key":"q_tipo_assicurato_medico","op":"equals","value":"dipendente"}'::jsonb,
  'exclude', 'Prodotto riservato ai liberi professionisti', 10
FROM products p WHERE p.slug = 'slug-prodotto';
```

### 8. Aggiungi i moltiplicatori
```sql
INSERT INTO product_multipliers (product_id, coverage_id, name, factor, condition, priority)
SELECT p.id, NULL, 'Attività solo in struttura (-15%)', 0.85,
  '{"key":"q_attivita_struttura","op":"equals","value":"una_struttura"}'::jsonb, 10
FROM products p WHERE p.slug = 'slug-prodotto';
```

### 9. Aggiungi addon flat
```sql
-- 1. Domanda di prodotto
INSERT INTO product_questions (product_id, key, label, help_text, type, options, position, section, is_required, phase)
SELECT p.id, 'q_addon_mio_addon', 'Vuoi aggiungere X?', 'Descrizione copertura.',
  'dropdown', '[{"label":"Sì (+€100)","value":"si"},{"label":"No","value":"no"}]'::jsonb,
  10, 'Garanzie Aggiuntive', false, 'addon'
FROM products p WHERE p.slug = 'slug-prodotto';

-- 2. Addon
INSERT INTO product_addons (product_id, key, name, pricing_mode, flat_premium, triggered_by)
SELECT p.id, 'mio_addon', 'Nome Addon', 'flat', 100.00,
  '{"key":"q_addon_mio_addon","op":"equals","value":"si"}'::jsonb
FROM products p WHERE p.slug = 'slug-prodotto';
```

### 10. Aggiungi addon a tariffa variabile (rate_table)
```sql
-- 1. Domanda di prodotto
INSERT INTO product_questions (product_id, key, label, type, options, position, section, is_required, phase)
SELECT p.id, 'q_addon_mio_addon', 'Vuoi X?', 'dropdown',
  '[{"label":"Sì","value":"si"},{"label":"No","value":"no"}]'::jsonb,
  10, 'Garanzie Aggiuntive', false, 'addon'
FROM products p WHERE p.slug = 'slug-prodotto';

-- 2. Addon
INSERT INTO product_addons (product_id, key, name, pricing_mode, triggered_by, available_if, dimensions)
SELECT p.id, 'mio_addon', 'Nome Addon', 'rate_table',
  '{"key":"q_addon_mio_addon","op":"equals","value":"si"}'::jsonb,
  NULL,
  '["q_professione"]'::jsonb
FROM products p WHERE p.slug = 'slug-prodotto';

-- 3. Righe tariffario addon
INSERT INTO product_addon_rate_rows (addon_id, dimension_values, premium, manual_quote)
SELECT a.id, jsonb_build_object('q_professione', r.prof), r.premium, r.manual
FROM product_addons a
JOIN products p ON p.id = a.product_id AND p.slug = 'slug-prodotto'
CROSS JOIN (VALUES
  ('mmg',      0.00, false),
  ('chirurgo', 0.00, true)   -- manual_quote = true se prezzo non ancora disponibile
) AS r(prof, premium, manual)
WHERE a.key = 'mio_addon';
```

---

## Errori comuni da evitare

| Errore | Problema | Soluzione |
|--------|----------|-----------|
| `"q_massimale_rc": "2000000"` (stringa) | Il match fallisce — answers salva numeri | Usare `2000000` (numero) |
| `{"op":"all","conditions":[...]}` | Formato non riconosciuto dal motore | Usare `{"all":[...]}` |
| `{"op":"any","conditions":[...]}` | Come sopra | Usare `{"any":[...]}` |
| Aggiungere una professione senza rate_row | Il motore non trova prezzo → null | Aggiungere tutte le rate_rows |
| Condizione eligibilità invertita | La condition esclude quando vera | Invertire la condizione |
| question_key nuovo senza sector_question o product_question | Ignorato in modalità base | Aggiungere la domanda corrispondente |
| phase = 'B' in product_questions | Vincolo CHECK fallisce | Usare 'eligibility', 'pricing' o 'addon' |
| type = 'radio' in sector/product_questions | Vincolo CHECK fallisce | Usare 'dropdown' |
