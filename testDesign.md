# Technical UI Audit — Marshmallow.com

> Analisi tecnica del design system di Marshmallow.com  
> Focus: UI Architecture, UX Patterns, Typography, Spacing, Motion e Visual Language.

---

# 1. Palette Colori

## Colori Principali

| Uso | Colore | HEX |
|---|---|---|
| Background principale | Warm Off-White / Cream | `#F7F4EE` |
| Background secondario | White | `#FFFFFF` |
| Testo principale | Dark Charcoal | `#1C1C1A` |
| Testo secondario | Medium Gray | `#5F5F5A` |
| Primary Accent | Mint Teal | `#00C2A8` |
| Primary Hover | Dark Teal | `#009E89` |
| Highlight Soft | Pale Mint | `#DDF7F2` |
| Border neutrali | Light Gray | `#E8E4DC` |

---

# 2. Buttons

## Primary Button

```css
background: #00C2A8;
color: #FFFFFF;
border-radius: 999px;
padding: 14px 24px;
height: 48px;
transition: all 200ms ease;

Hover State
background: #009E89;
transform: translateY(-1px);
box-shadow: 0 8px 20px rgba(0,0,0,0.08);
Secondary / Ghost Button
background: transparent;
border: 1px solid #1C1C1A;
color: #1C1C1A;

Hover:

background: rgba(0,0,0,0.03);
3. Tipografia
Font Family
Heading Font

Probabile:

Söhne
Circular
Maison Neue
Alternative Google Fonts
Uso	Font
Heading	Space Grotesk
Heading Alt	Plus Jakarta Sans
Body	Inter
Body Alt	Manrope
4. Gerarchia Tipografica
H1
font-size: 64px - 80px;
font-weight: 700;
line-height: 0.95;
letter-spacing: -0.03em;
H2
font-size: 40px - 56px;
font-weight: 700;
line-height: 1.0;
H3
font-size: 28px - 32px;
font-weight: 600;
Body Large
font-size: 18px - 20px;
font-weight: 400;
line-height: 1.6;
Body Standard
font-size: 16px;
font-weight: 400;
line-height: 1.6;
Small Labels
font-size: 14px;
font-weight: 500;
5. Layout & Spaziatura
Filosofia

Il design system utilizza:

molto whitespace
spacing generoso
gerarchia visiva molto pulita
sezioni ariose

Riferimenti stilistici:

Stripe
Monzo
Linear
Notion
Container
max-width: 1200px;
padding-inline: 24px;
margin: 0 auto;
Sezioni Desktop
padding-top: 96px - 140px;
padding-bottom: 96px - 140px;
Sezioni Mobile
padding: 64px 24px;
6. Grid System
Layout

Pattern predominante:

display: grid;
grid-template-columns: repeat(12, 1fr);
gap: 32px;

Uso frequente di:

layout asimmetrici
text/media split
stacking responsive su mobile
7. Bordi & Forme
Border Radius
Pulsanti
border-radius: 999px;
Card
border-radius: 24px;
Inputs
border-radius: 16px;
8. Shadows
Shadow principale
box-shadow: 0 8px 30px rgba(0,0,0,0.08);
Shadow soft
box-shadow: 0 4px 20px rgba(0,0,0,0.06);

Caratteristiche:

ombre molto leggere
elevazione minima
effetto premium soft UI
9. Iconografia
Stile

Le icone sono:

lineari
geometriche
monocromatiche
minimal

Simili a:

Lucide
Feather
Phosphor Light
10. Illustrazioni
Stile Visual
flat design
gradient morbidi
palette desaturata
forme organiche
feeling “friendly fintech”
11. Micro-interazioni
Button Hover
transition:
background-color 200ms ease,
transform 200ms ease,
box-shadow 200ms ease;

Hover:

transform: translateY(-1px);
Card Hover
transform: translateY(-2px);
box-shadow: 0 12px 40px rgba(0,0,0,0.10);
12. Motion Design

Caratteristiche:

motion minimale
nessuna animazione aggressiva
focus su fluidità e feedback tattile

Probabile stack:

Framer Motion
CSS transitions
spring animations leggere
13. UX Patterns
CTA
molto visibili
forte contrasto
pochi elementi competono visivamente
Copywriting
headline oversize
paragrafi stretti (~60ch)
alta leggibilità
Responsive
stacking molto pulito
componenti modulari
spacing consistente
14. Tailwind Design Tokens
Colors
colors: {
  background: "#F7F4EE",
  foreground: "#1C1C1A",
  primary: "#00C2A8",
  primaryHover: "#009E89",
  muted: "#5F5F5A",
  border: "#E8E4DC",
}
Radius
borderRadius: {
  xl: "16px",
  "2xl": "24px",
  full: "999px"
}
Shadows
boxShadow: {
  soft: "0 8px 30px rgba(0,0,0,0.08)"
}
15. Frontend Stack Probabile

Probabile architettura:

React / Next.js
Tailwind CSS
CSS Modules
Framer Motion
Design Tokens centralizzati
16. Conclusione

Il design system di Marshmallow rappresenta un perfetto equilibrio tra:

fintech minimalism
editorial typography
soft UI
accessibility-first design
Elementi chiave da replicare
Palette soft con accento teal
Typography oversize
Pill buttons
White space abbondante
Motion quasi invisibile
Ombre molto leggere
Layout modulari e respiranti