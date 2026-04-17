# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repo is **pre-code**: only `IMPLEMENTATION_PLAN.md` exists. There is no `package.json`, no source tree, no build/test/lint commands yet. The plan describes a Next.js + Supabase + Tailwind + shadcn/ui app ("scelgosicuro" — an insurance quote comparator inspired by Lokky).

When asked to scaffold, follow the structure in `IMPLEMENTATION_PLAN.md` §13 and the milestone order in §14 — do not invent a different layout.

Plan and product copy are in **Italian**. Keep UI strings, question labels, and user-facing content in Italian unless asked otherwise. Code identifiers and comments should be in English.

## Two non-negotiable product principles

These distinguish this app from the competitor (Lokky) and drive most architectural decisions:

1. **Multi-insurer comparison.** For every product type, surface offers from multiple compagnie (AXA, Unipol, AssIta, Generali, …) — never a single carrier. The "safe vs economic" featured pair plus an expandable list of other eligible products is the canonical UI (plan §4).
2. **Data-driven, not code-driven.** Questions, eligibility rules, pricing, scoring, and recommendations live in **database tables and JSONB** — not in TypeScript. Adding a question, a product, or a pricing rule must be data entry, never a code change or migration. If you find yourself encoding a business rule in TS, you are doing it wrong — push it to the relevant table (plan §11, §12).

## The "glue": `question_key`

The single most important concept in this codebase: a stable string `question_key` (e.g. `q_sinistri_5_anni`) is the join between the form world and the rules world.

- It's the **key** in the JSONB `quote_sessions.answers` blob.
- It's a **TEXT column** in every rules table: `product_eligibility_rules`, `product_base_prices`, `product_multipliers`, `product_multiplier_bands`, `product_addon_prices`, `scoring_rules`.
- It's referenced from `questionnaires.definition` (JSONB) and `questions` (the bank).

Renaming a `question_key` is a breaking change across both worlds. Treat keys as a public contract.

## Database split: relational vs JSONB

Deliberate separation (plan §6):

- **Relational tables** hold the business catalog and rules: `insurers`, `products`, `activity_products`, `product_eligibility_rules`, `product_base_prices`, `product_multipliers`, `product_multiplier_bands`, `product_addon_prices`, `scoring_rules`, `product_recommendations`, `policies`.
- **JSONB** holds form shape and answers: `questions.options/validation`, `questionnaires.definition` (sections + `visible_if`), `quote_sessions.answers`.

Don't move things across this line without thinking — e.g. don't normalize `answers` into rows, and don't push pricing into JSONB.

## The quote engine pipeline

`lib/engine/` implements `generateQuotes(session_id)` as a strict 7-step pipeline (plan §8). Keep the steps separated — don't fuse eligibility into pricing or scoring into recommendation:

1. Eligible-product lookup (`activity_products` ∩ active products).
2. Eligibility filter — apply `product_eligibility_rules`; any matching rule excludes the product.
3. Pricing — `base_price × Π(multipliers) × Π(bands) + Σ(addons)`.
4. User score — sum `scoring_rules.score_delta` for matching rules; persist to `quote_sessions.user_score`.
5. Pick featured products — query `product_recommendations` by slot (`safe` | `economic`) and score band, with documented fallbacks.
6. Persist all results to `quote_results` (featured rows carry a `slot`, others have `slot=null`).
7. Render: 2 featured cards on top, expandable list of others below.

Rule-match logic (`equals` / `in` / `not_equals` / `greater_than` / `less_than` / `between`) is shared across eligibility, pricing, and scoring — implement it once in `lib/engine/operators.ts`.

## Immutability of sold policies

When a policy is bound (Stripe webhook), snapshot `coverage_snapshot` and `form_data_snapshot` into the `policies` row and **never mutate them**. Pricing tables, questionnaires, and product definitions can change freely afterward; the policy must remain identical to what was sold. Audit trail and dispute resolution depend on this (plan §10).

`questionnaires` are versioned (`activity_id` + `version` unique). A `quote_session` locks to a `questionnaire_id` at creation so in-flight quotes finish on the version they started on, even after a new version is published.

## Phase model (FASE A → D)

The user journey has four phases — keep them as separate routes under `app/preventivo/` and `app/checkout/` (plan §13). Don't collapse them:

- **A — Identification (30s):** settore → attività → contatti. Creates `quote_sessions`. Contact details are captured *before* the questionnaire so abandoned sessions are still recoverable leads.
- **B — Questionnaire:** `DynamicForm` renders `questionnaires.definition` from JSONB. Honors `visible_if` for conditional questions.
- **C — Comparison:** runs the engine, shows safe + economic + expandable others.
- **D — Purchase:** Stripe checkout → webhook → policy binding with snapshots and PDF generation.
