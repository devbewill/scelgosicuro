"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { LandingNav } from "@/components/landing-nav"

const SKY = "#aaddc0"
const BLUE = "#38a372"
const BLACK = "#000000"
const WHITE = "#FFFFFF"
const GRAY = "#F5F5F5"
const DARK_TEXT = "#111111"
const MUTED_TEXT = "#555555"

const NAV_LINKS = ["Features", "Soluzioni", "Prezzi", "Azienda"]

const PROFESSIONI = ["Medico Chirurgo", "Medico di Base", "Avvocato", "Ingegnere", "Architetto", "Commercialista", "Geometra", "Psicologo", "Dentista"]
const ATTIVITA = ["Studio individuale", "Studio associato", "Società professionale", "Libero professionista"]
const MASSIMALI = ["€250.000", "€500.000", "€1.000.000", "€2.000.000", "€5.000.000"]
const FRANCHIGIE = ["Nessuna", "€500", "€1.000", "€2.500", "€5.000"]

const STORY_STEPS = [
  {
    title: "Invia",
    body: "Richiedi il tuo preventivo in 2 minuti. Compila solo ciò che serve.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  },
  {
    title: "Ricevi",
    body: "Il sistema confronta 12 Compagnie e ti mostra la proposta migliore.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
  },
  {
    title: "Dividi",
    body: "Suddividi il pagamento in rate mensili. Zero sorprese, zero costi nascosti.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
  },
  {
    title: "Raccogli",
    body: "La tua polizza RC arriva via email. Copertura attiva da subito.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
  },
]

const FEATURES = [
  {
    tag: "VELOCITÀ",
    title: "Preventivo in 2 minuti. Nessuna carta necessaria.",
    body: "Rispondi a poche domande essenziali. Il nostro sistema analizza il tuo profilo e confronta le migliori RC professionali disponibili. Risultato: una proposta su misura, senza complicatezioni.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    alt: "Dashboard analytics",
    flip: false,
  },
  {
    tag: "TRASPARENZA",
    title: "Capisci cosa stai sottoscrivendo. Ogni clausola.",
    body: "Massimali, franchigie, esclusioni, retroattività. Ti spieghiamo tutto in modo chiaro prima che tu decida. Nessun sorpresa, nessun termine nascosto.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
    alt: "Team meeting",
    flip: true,
  },
]

const CARD_BLOCKS = [
  {
    bg: BLUE,
    tag: "SU MISURA",
    title: "Pensato per la\ntua professione.",
    body: "Ogni attività professionale ha rischi diversi. La tua RC deve essere calibrata sul tuo lavoro, non su uno generico.",
    cta: "Scopri la tua soluzione",
    ctaColor: WHITE,
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  },
  {
    bg: SKY,
    tag: "SUPPORTO",
    title: "Un consulente\ndedicato, sempre.",
    body: "Hai domande? Puoi parlare con una persona vera. Nessun bot, nessuna attesa infinita.",
    cta: "Parla con noi",
    ctaColor: BLACK,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
  },
]

const STATS = [
  { value: "12", label: "Compagnie confrontate" },
  { value: "€850", label: "Risparmio medio annuo" },
  { value: "4.9", label: "Rating utenti" },
  { value: "2min", label: "Tempo medio preventivo" },
]

const STACK_CARDS = [
  { title: "Confronto intelligente", body: "Analizziamo 12 Compagnie e ordiniamo le proposte per coerenza con il tuo profilo.", bg: "#0e5635", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80" },
  { title: "Preventivo in 2 minuti", body: "Nessun modulo infinito. Solo le informazioni essenziali per una proposta su misura.", bg: "#1c8957", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80" },
  { title: "Copertura chiara", body: "Ti spieghiamo ogni clausola prima che tu decida. Zero sorprese, zero termini nascosti.", bg: "#38a372", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80" },
]

const FAQS = [
  {
    q: "Quanto tempo serve per avere un preventivo?",
    a: "In media 2-3 minuti. Pochi campi, nessuna documentazione necessaria.",
  },
  {
    q: "Il preventivo è gratuito e senza impegno?",
    a: "Sì, assolutamente. Nessun costo, nessun obbligo di acquisto.",
  },
  {
    q: "Posso scegliere di confrontare tutte le compagnie?",
    a: "Sì. Ti mostriamo una proposta consigliata, ma puoi sempre vedere tutte le alternative.",
  },
  {
    q: "Che coperture sono incluse nella RC professionale?",
    a: "Dipende dalla polizza scelta. In genere: RC verso terzi, colpa grave, retroattività. Ti spieghiamo ogni clausola prima che tu decida.",
  },
]

export default function Landing12Page() {
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [professione, setProfessione] = useState("")
  const [attivita, setAttivita] = useState("")
  const [massimale, setMassimale] = useState("")
  const [franchigia, setFranchigia] = useState("")
  const [activeStep, setActiveStep] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [paypalVisible, setPaypalVisible] = useState(false)
  const [paypalProgress, setPaypalProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleStoryScroll = () => {
      const section = document.querySelector(".story-section")
      if (!section) return
      const rect = section.getBoundingClientRect()
      const sectionHeight = section.scrollHeight - window.innerHeight
      const scrolledInSection = -rect.top
      const progress = Math.max(0, Math.min(1, scrolledInSection / sectionHeight))
      setScrollProgress(progress * 100)
      const rawStep = Math.floor(progress * 4)
      setActiveStep(Math.min(3, Math.max(0, rawStep)))
    }
    window.addEventListener("scroll", handleStoryScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleStoryScroll)
  }, [])

  useEffect(() => {
    const handlePaypalScroll = () => {
      const section = document.querySelector(".paypal-pin-section") as HTMLElement
      if (!section) return
      const rect = section.getBoundingClientRect()
      const sectionHeight = section.scrollHeight - window.innerHeight
      const scrolledInSection = -rect.top
      const progress = Math.max(0, Math.min(1, scrolledInSection / sectionHeight))
      setPaypalProgress(progress * 100)
setPaypalVisible(progress > 0.05)
    }
    window.addEventListener("scroll", handlePaypalScroll, { passive: true })
    return () => window.removeEventListener("scroll", handlePaypalScroll)
  }, [])

  return (
    <>
      <LandingNav current="12" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: ${WHITE}; color: ${DARK_TEXT}; overflow-x: hidden; }

        .paypal-hero { min-height: 100vh; background: ${SKY}; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 120px 32px 80px; position: relative; overflow: hidden; }
        .paypal-hero::before { content: ''; position: absolute; top: -60px; right: -80px; width: 600px; height: 600px; background: rgba(255,255,255,0.12); border-radius: 50%; pointer-events: none; }
        .paypal-hero::after { content: ''; position: absolute; bottom: -100px; left: -60px; width: 400px; height: 400px; background: rgba(255,255,255,0.08); border-radius: 50%; pointer-events: none; }

        .pill-tag { display: inline-block; background: rgba(0,0,0,0.08); color: ${DARK_TEXT}; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; padding: 8px 20px; border-radius: 100px; margin-bottom: 32px; }

        .hero-title { font-size: clamp(3.5rem, 9vw, 8rem); font-weight: 800; letter-spacing: -0.06em; line-height: 0.92; color: ${DARK_TEXT}; margin-bottom: 32px; max-width: 14ch; }
        .hero-sub { font-size: clamp(1rem, 2vw, 1.25rem); font-weight: 400; color: rgba(17,17,17,0.65); max-width: 44ch; line-height: 1.6; margin-bottom: 48px; }

        .hero-cta-group { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: center; }
        .btn-primary { background: ${BLACK}; color: ${WHITE}; font-size: 15px; font-weight: 600; padding: 18px 40px; border-radius: 100px; text-decoration: none; transition: transform 0.2s ease, opacity 0.2s ease; display: inline-block; }
        .btn-primary:hover { transform: scale(1.04); opacity: 0.92; }
        .btn-secondary { background: transparent; color: ${DARK_TEXT}; font-size: 15px; font-weight: 500; padding: 18px 36px; border-radius: 100px; text-decoration: none; border: 1.5px solid rgba(17,17,17,0.2); transition: all 0.2s ease; display: inline-block; }
        .btn-secondary:hover { border-color: rgba(17,17,17,0.5); transform: scale(1.03); }

        .hero-mockup { position: relative; margin-top: 64px; width: 100%; max-width: 540px; }
        .mockup-card { background: ${WHITE}; border-radius: 28px; padding: 32px; box-shadow: 0 40px 100px rgba(0,0,0,0.12); text-align: left; }
        .mockup-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .mockup-icon { width: 44px; height: 44px; border-radius: 12px; background: ${BLUE}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mockup-label { font-size: 12px; color: ${MUTED_TEXT}; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
        .mockup-value { font-size: 22px; font-weight: 700; color: ${DARK_TEXT}; }
        .mockup-bar { height: 8px; background: ${GRAY}; border-radius: 100px; overflow: hidden; margin-top: 4px; }
        .mockup-bar-fill { height: 100%; background: ${BLUE}; border-radius: 100px; }
        .mockup-divider { height: 1px; background: ${GRAY}; margin: 20px 0; }
        .mockup-company { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: ${DARK_TEXT}; }
        .mockup-company span:last-child { font-weight: 700; color: ${BLUE}; }

        .floating-badge { position: absolute; background: ${WHITE}; border-radius: 20px; padding: 14px 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.12); font-size: 13px; font-weight: 600; color: ${DARK_TEXT}; display: flex; align-items: center; gap: 10px; }
        .badge-1 { bottom: -20px; left: -40px; }
        .badge-2 { top: 40px; right: -30px; }
        .badge-dot { width: 10px; height: 10px; border-radius: 50%; background: #22C55E; }

        @media (max-width: 768px) {
          .hero-title { font-size: clamp(2.8rem, 11vw, 4rem); }
          .paypal-hero { padding: 100px 24px 60px; }
          .hero-mockup { max-width: 100%; }
          .floating-badge { display: none; }
        }

        /* Navbar */
        .paypal-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,0,0,0.06); transition: box-shadow 0.3s ease; }
        .paypal-nav.scrolled { box-shadow: 0 1px 20px rgba(0,0,0,0.08); }
        .paypal-nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .paypal-nav-logo { font-size: 18px; font-weight: 800; color: ${DARK_TEXT}; text-decoration: none; letter-spacing: -0.04em; }
        .paypal-nav-links { display: flex; gap: 32px; list-style: none; }
        .paypal-nav-links a { font-size: 14px; font-weight: 500; color: ${MUTED_TEXT}; text-decoration: none; transition: color 0.2s ease; }
        .paypal-nav-links a:hover { color: ${DARK_TEXT}; }
        .paypal-nav-cta { background: ${BLACK}; color: ${WHITE}; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 100px; text-decoration: none; transition: transform 0.2s ease, opacity 0.2s ease; display: inline-block; }
        .paypal-nav-cta:hover { transform: scale(1.04); opacity: 0.9; }
        @media (max-width: 768px) { .paypal-nav-links { display: none; } }

        /* NL Form */
        .nl-form-section { padding: 80px 32px; background: ${WHITE}; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .nl-form-inner { max-width: 1400px; margin: 0 auto; }
        .nl-form-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${BLUE}; margin-bottom: 24px; display: block; }
        .nl-form { display: flex; align-items: center; flex-wrap: wrap; gap: 0; }
        .nl-form-text { font-size: 3rem; font-weight: 800; color: ${DARK_TEXT}; letter-spacing: -0.04em; line-height: 1.3; }
        .nl-form select { appearance: none; background: transparent; border: none; border-bottom: 2px solid ${BLUE}; color: ${BLUE}; font-size: 3rem; font-family: inherit; font-weight: 800; padding: 4px 12px; cursor: pointer; outline: none; min-width: 160px; transition: all 0.25s ease; }
        .nl-form select:hover { background: rgba(0,56,255,0.05); }
        .nl-form select:focus { border-bottom-color: ${SKY}; }
        @media (max-width: 768px) {
          .nl-form-section { padding: 60px 24px; }
          .nl-form { flex-wrap: wrap; align-items: center; gap: 4px 0; }
          .nl-form-text { font-size: 1.2rem; }
          .nl-form select { font-size: 1.2rem; min-width: 100px; padding: 2px 8px; }
        }

        /* Stats bar */
        .stats-bar { background: ${BLACK}; padding: 48px 32px; }
        .stats-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
        .stat-item { text-align: center; }
        .stat-value { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: ${WHITE}; letter-spacing: -0.04em; }
        .stat-label { font-size: 13px; color: rgba(255,255,255,0.55); margin-top: 6px; font-weight: 400; }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

        /* Feature sections */
        .feature-section { padding: 120px 32px; max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .feature-section.flip { direction: rtl; }
        .feature-section.flip > * { direction: ltr; }
        .feature-tag { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: ${BLUE}; margin-bottom: 20px; display: block; }
        .feature-title { font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; color: ${DARK_TEXT}; margin-bottom: 24px; }
        .feature-body { font-size: 1rem; line-height: 1.7; color: ${MUTED_TEXT}; max-width: 44ch; }
        .feature-img-wrap { border-radius: 24px; overflow: hidden; position: relative; aspect-ratio: 4/3; }
        .feature-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .feature-img-tag { position: absolute; bottom: 20px; left: 20px; background: ${WHITE}; border-radius: 100px; padding: 8px 16px; font-size: 12px; font-weight: 600; color: ${DARK_TEXT}; }
        @media (max-width: 768px) { .feature-section { grid-template-columns: 1fr; gap: 40px; padding: 80px 24px; } .feature-section.flip { direction: ltr; } }

        /* Colored blocks */
        .color-blocks { display: grid; grid-template-columns: 1fr 1fr; }
        .color-block { padding: 80px 48px; min-height: 480px; display: flex; flex-direction: column; position: relative; overflow: hidden; }
        .color-block-content { position: relative; z-index: 1; max-width: 480px; }
        .color-block .block-tag { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 20px; display: block; }
        .color-block h3 { font-size: clamp(2rem, 3vw, 2.6rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; white-space: pre-line; margin-bottom: 20px; }
        .color-block p { font-size: 1rem; line-height: 1.65; opacity: 0.75; margin-bottom: 32px; max-width: 36ch; }
        .color-block a { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 100px; text-decoration: none; transition: transform 0.2s ease; width: fit-content; }
        .color-block a:hover { transform: scale(1.04); }
        .color-block-deco { position: absolute; border-radius: 50%; opacity: 0.12; }
        @media (max-width: 768px) { .color-blocks { grid-template-columns: 1fr; } .color-block { padding: 60px 32px; min-height: 400px; } }

        /* Split editorial */
        .editorial-split { display: grid; grid-template-columns: 1fr 1fr; }
        .editorial-img { position: relative; min-height: 560px; }
        .editorial-img img { width: 100%; height: 100%; object-fit: cover; }
        .editorial-text { background: ${GRAY}; padding: 80px 64px; display: flex; flex-direction: column; justify-content: center; }
        .editorial-text .big-num { font-size: 6rem; font-weight: 800; color: rgba(0,56,255,0.08); letter-spacing: -0.06em; line-height: 1; margin-bottom: -20px; }
        .editorial-text h3 { font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 800; letter-spacing: -0.04em; color: ${DARK_TEXT}; margin-bottom: 20px; line-height: 1.1; }
        .editorial-text p { font-size: 1rem; line-height: 1.7; color: ${MUTED_TEXT}; max-width: 40ch; margin-bottom: 32px; }
        @media (max-width: 768px) { .editorial-split { grid-template-columns: 1fr; } .editorial-text { padding: 60px 32px; } }

        /* Process section */
        .process-section { padding: 120px 32px; background: ${GRAY}; text-align: center; }
        .section-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${BLUE}; margin-bottom: 20px; }
        .section-title { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; letter-spacing: -0.05em; color: ${DARK_TEXT}; margin-bottom: 16px; line-height: 1; }
        .section-sub { font-size: 1.1rem; color: ${MUTED_TEXT}; max-width: 48ch; margin: 0 auto 64px; line-height: 1.6; }
        .process-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; max-width: 1000px; margin: 0 auto; }
        .process-step { background: ${WHITE}; padding: 48px 40px; text-align: left; }
        .step-num { font-size: 11px; font-weight: 700; color: ${SKY}; letter-spacing: 0.1em; margin-bottom: 24px; display: block; }
        .step-title { font-size: 1.3rem; font-weight: 700; color: ${DARK_TEXT}; margin-bottom: 12px; letter-spacing: -0.02em; }
        .step-body { font-size: 0.95rem; color: ${MUTED_TEXT}; line-height: 1.65; }
        @media (max-width: 768px) { .process-steps { grid-template-columns: 1fr; } .process-section { padding: 80px 24px; } }

        /* Marquee / ticker */
        .ticker-section { background: ${GRAY}; padding: 40px 0; overflow: hidden; border-top: 1px solid rgba(0,0,0,0.05); border-bottom: 1px solid rgba(0,0,0,0.05); }
        .ticker-label { text-align: center; font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${MUTED_TEXT}; margin-bottom: 32px; }
        .ticker-track { display: flex; gap: 48px; animation: ticker-scroll 24s linear infinite; width: max-content; }
        .ticker-item { font-size: 1.4rem; font-weight: 800; color: ${DARK_TEXT}; letter-spacing: -0.04em; white-space: nowrap; opacity: 0.2; transition: opacity 0.3s ease; }
        .ticker-item:hover { opacity: 1; }
        @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @media (max-width: 768px) { .ticker-item { font-size: 1rem; } }

        /* Animated counter section */
        .counter-section { padding: 120px 32px; background: ${WHITE}; text-align: center; }
        .counter-grid { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .counter-item { padding: 48px 32px; border: 1px solid rgba(0,0,0,0.06); }
        .counter-num { font-size: clamp(3rem, 6vw, 5rem); font-weight: 800; letter-spacing: -0.06em; color: ${BLUE}; line-height: 1; }
        .counter-label { font-size: 14px; color: ${MUTED_TEXT}; margin-top: 12px; font-weight: 400; }
        @media (max-width: 768px) { .counter-grid { grid-template-columns: 1fr; } }

        /* Floating cards gallery */
        .gallery-section { padding: 120px 32px; background: ${BLUE}; position: relative; overflow: hidden; }
        .gallery-section::before { content: ''; position: absolute; top: -200px; left: -200px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(103,199,242,0.12) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
        .gallery-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${SKY}; margin-bottom: 20px; display: block; text-align: center; }
        .gallery-title { font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 800; letter-spacing: -0.04em; color: ${WHITE}; text-align: center; margin-bottom: 64px; line-height: 1.1; }
        .gallery-cards { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
        .gallery-card { background: rgba(255,255,255,0.06); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; width: 260px; transition: transform 0.3s ease, background 0.3s ease; cursor: default; }
        .gallery-card-icon { width: 48px; height: 48px; border-radius: 14px; background: ${WHITE}; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .gallery-card-icon svg { width: 22px; height: 22px; }
        .gallery-card:hover { transform: translateY(-8px); background: rgba(255,255,255,0.12); }
        .gallery-card h4 { font-size: 1rem; font-weight: 700; color: ${WHITE}; margin-bottom: 8px; letter-spacing: -0.02em; }
        .gallery-card p { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.5; }

        /* Scroll-driven storytelling */
        .story-section { height: 400vh; position: relative; }
        .story-sticky { position: sticky; top: 0; height: 100vh; display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; background: ${GRAY}; }
        .story-left { display: flex; flex-direction: column; justify-content: center; padding: 80px 240px; position: relative; }
        .story-left-inner { width: 100%; max-width: none; }
        .story-left-item { padding: 12px 0; cursor: pointer; transition: opacity 0.4s ease; }
        .story-left-item.inactive { opacity: 0.35; }
        .story-left-item:hover { opacity: 1; }
        .story-left-title { font-size: clamp(3.3rem, 5.25vw, 4.5rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: ${DARK_TEXT}; }
        .story-progress-vertical { position: absolute; left: 32px; top: 80px; bottom: 80px; width: 2px; background: rgba(0,0,0,0.06); display: none; }
        .story-progress-fill { width: 100%; background: ${BLUE}; transition: height 0.3s ease; }
        .story-right { position: relative; overflow: hidden; height: 100%; }
        .story-right-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .story-right-content { position: absolute; inset: 0; transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); z-index: 1; }
        .story-right-content.inactive { opacity: 0; transform: translateY(24px); pointer-events: none; z-index: 0; }
        .story-right-content.active { opacity: 1; transform: translateY(0); z-index: 2; }
        .story-right-body { position: absolute; bottom: 80px; left: 64px; font-size: clamp(1rem, 1.5vw, 1.2rem); color: ${WHITE}; line-height: 1.5; max-width: 44ch; text-shadow: 0 2px 12px rgba(0,0,0,0.3); }
        @media (max-width: 768px) { .story-sticky { grid-template-columns: 1fr; grid-template-rows: auto 1fr; } .story-left { padding: 60px 32px; flex-direction: row; align-items: center; gap: 24px; border-right: none; border-bottom: 1px solid rgba(0,0,0,0.06); overflow-x: auto; } .story-left-item { padding: 0; flex-shrink: 0; } .story-left-title { font-size: 1.4rem; } .story-right { padding: 60px 32px; } }

        /* PayPal-style fullscreen pinned scroll */
        .paypal-pin-section { height: 300vh; position: relative; }
        .paypal-pin-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; background: ${BLACK}; }
.paypal-pin-content { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
        .paypal-pin-left { position: absolute; top: 18vh; left: 6vw; overflow: hidden; }
        .paypal-pin-right { position: absolute; bottom: 18vh; right: 6vw; overflow: hidden; text-align: right; }
        .paypal-pin-word { font-size: 180px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.15; color: #fafafa; transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s ease; white-space: nowrap; }
        .paypal-pin-word.from-left { transform: translateX(-200px); opacity: 0; }
        .paypal-pin-word.from-right { transform: translateX(200px); opacity: 0; }
        .paypal-pin-word.visible { transform: translateX(0); opacity: 1; }
        @media (max-width: 768px) { .paypal-pin-content { flex-direction: column; justify-content: center; align-items: flex-start; padding: 0 40px; gap: 0; } .paypal-pin-word { font-size: clamp(3rem, 12vw, 6rem); } .paypal-pin-right { text-align: left; } .paypal-pin-left { margin-top: 35vh; } .paypal-pin-right { margin-bottom: 0; } }

        /* Stacked panels */
        .stack-section { position: relative; background: ${WHITE}; }
        .stack-header { text-align: center; padding: 40px 32px 80px; }
        .stack-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #2E7D32; margin-bottom: 16px; display: block; }
        .stack-title { font-size: clamp(2.8rem, 5vw, 4.5rem); font-weight: 800; letter-spacing: -0.05em; line-height: 1; color: ${DARK_TEXT}; }
        .stack-cards-container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        .stack-card-wrapper { position: sticky; top: 80px; margin-bottom: 40px; }
        .stack-card { width: 100%; max-width: 1000px; margin: 0 auto; border-radius: 0; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.1); display: grid; grid-template-columns: 1fr 1fr; min-height: 600px; }
        .stack-card-inner { padding: 56px 48px; display: flex; flex-direction: column; justify-content: center; }
        .stack-card-title { font-size: clamp(2.4rem, 4vw, 3.2rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; color: ${WHITE}; margin-bottom: 20px; }
        .stack-card-body { font-size: clamp(1.1rem, 1.5vw, 1.3rem); line-height: 1.6; color: rgba(255,255,255,0.75); max-width: 36ch; font-weight: 500; }
        .stack-card-img { position: relative; width: 100%; height: 100%; min-height: 600px; }
        @media (max-width: 768px) { .stack-card { grid-template-columns: 1fr; min-height: auto; } .stack-card-inner { padding: 32px 24px; } .stack-card-img { min-height: 220px; } .stack-card-wrapper { top: 60px; } .stack-header { padding: 80px 24px 48px; } }

        /* CTA section */
        .cta-section { background: ${BLACK}; padding: 120px 32px; text-align: center; }
        .cta-title { font-size: clamp(2.8rem, 6vw, 5rem); font-weight: 800; letter-spacing: -0.05em; color: ${WHITE}; line-height: 1; margin-bottom: 24px; }
        .cta-sub { font-size: 1.1rem; color: rgba(255,255,255,0.55); max-width: 44ch; margin: 0 auto 48px; line-height: 1.65; }
        .cta-section .btn-primary { background: ${SKY}; color: ${BLACK}; font-size: 16px; padding: 20px 48px; }
        .cta-section .btn-primary:hover { transform: scale(1.04); opacity: 0.92; }

        /* FAQ */
        .faq-section { padding: 120px 32px; max-width: 800px; margin: 0 auto; }
        .faq-title { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.04em; color: ${DARK_TEXT}; margin-bottom: 56px; text-align: center; }
        .faq-item { border-bottom: 1px solid ${GRAY}; }
        .faq-q { width: 100%; background: none; border: none; padding: 28px 0; font-size: 1.1rem; font-weight: 600; color: ${DARK_TEXT}; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .faq-q:hover { color: ${BLUE}; }
        .faq-icon { width: 24px; height: 24px; flex-shrink: 0; transition: transform 0.3s ease; }
        .faq-item.open .faq-icon { transform: rotate(45deg); }
        .faq-a { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, padding 0.4s ease; }
        .faq-item.open .faq-a { max-height: 200px; padding-bottom: 28px; }
        .faq-a p { font-size: 1rem; line-height: 1.7; color: ${MUTED_TEXT}; }

        /* Footer */
        .paypal-footer { background: ${GRAY}; padding: 80px 32px 40px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 64px; }
        .footer-brand h4 { font-size: 20px; font-weight: 800; color: ${DARK_TEXT}; letter-spacing: -0.04em; margin-bottom: 12px; }
        .footer-brand p { font-size: 14px; color: ${MUTED_TEXT}; line-height: 1.6; max-width: 32ch; }
        .footer-col h5 { font-size: 13px; font-weight: 600; color: ${DARK_TEXT}; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.08em; }
        .footer-col a { display: block; font-size: 14px; color: ${MUTED_TEXT}; text-decoration: none; margin-bottom: 12px; transition: color 0.2s ease; }
        .footer-col a:hover { color: ${DARK_TEXT}; }
        .footer-bottom { border-top: 1px solid rgba(0,0,0,0.08); padding-top: 32px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: ${MUTED_TEXT}; }
        @media (max-width: 768px) { .footer-top { grid-template-columns: 1fr 1fr; } .footer-bottom { flex-direction: column; gap: 16px; text-align: center; } }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`paypal-nav${scrolled ? " scrolled" : ""}`}>
        <div className="paypal-nav-inner">
          <Link href="/" className="paypal-nav-logo">ScelgoSicuro</Link>
          <ul className="paypal-nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <LandingNav current="12" />
            <Link href="/app" className="paypal-nav-cta">Calcola preventivo</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="paypal-hero">
        <span className="pill-tag">RC Professionale — Confronto Gratuito</span>
        <h1 className="hero-title">
          La tua assicurazione<br />
          professionale,<br />
          trovata.
        </h1>
        <p className="hero-sub">
          Confronto intelligente tra 12 Compagnie. Preventivo in 2 minuti. Nessuna carta necessaria.
        </p>
        <div className="hero-cta-group">
          <Link href="/app" className="btn-primary">Calcola il tuo preventivo →</Link>
          <Link href="#" className="btn-secondary">Come funziona</Link>
        </div>
      </section>

{/* ── STACKED PANELS ── */}
      <section className="stack-section">
        <div className="stack-header">
          <span className="stack-eyebrow">COME FUNZIONA</span>
          <h2 className="stack-title">Semplice. Veloce. Trasparente.</h2>
        </div>
        <div className="stack-cards-container">
          {STACK_CARDS.map((card, i) => (
            <div key={i} className="stack-card-wrapper" style={{ zIndex: i + 1 }}>
              <div className="stack-card">
                <div className="stack-card-inner" style={{ background: card.bg }}>
                  <h3 className="stack-card-title">{card.title}</h3>
                  <p className="stack-card-body">{card.body}</p>
                </div>
                <div className="stack-card-img">
                  <Image src={card.image} alt={card.title} fill style={{ objectFit: "cover", objectPosition: "center 30%" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="stats-bar">
        <div className="stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NL FORM ── */}
      <section className="nl-form-section">
        <div className="nl-form-inner">
          <span className="nl-form-eyebrow">TROVA LA TUA POLIZZA</span>
          <div className="nl-form">
            <span className="nl-form-text">Sono{" "}</span>
            <select value={professione} onChange={(e) => setProfessione(e.target.value)}>
              <option value="" disabled>professione</option>
              {PROFESSIONI.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <span className="nl-form-text"> e lavoro come{" "}</span>
            <select value={attivita} onChange={(e) => setAttivita(e.target.value)}>
              <option value="" disabled>tipo di attività</option>
              {ATTIVITA.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <span className="nl-form-text"> cerco una RC con massimale{" "}</span>
            <select value={massimale} onChange={(e) => setMassimale(e.target.value)}>
              <option value="" disabled>massimale</option>
              {MASSIMALI.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="nl-form-text"> e franchigia{" "}</span>
            <select value={franchigia} onChange={(e) => setFranchigia(e.target.value)}>
              <option value="" disabled>franchigia</option>
              {FRANCHIGIE.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: BLACK, color: WHITE, fontSize: 14, fontWeight: 600, padding: "16px 32px", borderRadius: 100, textDecoration: "none", transition: "transform 0.2s ease, opacity 0.2s ease" }}>
              Calcola preventivo →
            </Link>
            <span style={{ fontSize: 13, color: MUTED_TEXT }}>Gratuito · 2 min · Nessun impegno</span>
          </div>
        </div>
      </section>

      {/* ── FEATURE SPLIT 1 ── */}
      <section className="feature-section">
        <div>
          <span className="feature-tag">{FEATURES[0].tag}</span>
          <h2 className="feature-title">{FEATURES[0].title}</h2>
          <p className="feature-body">{FEATURES[0].body}</p>
        </div>
        <div className="feature-img-wrap">
          <Image src={FEATURES[0].image} alt={FEATURES[0].alt} fill style={{ objectFit: "cover" }} />
          <span className="feature-img-tag">✓ Preventivo calcolato</span>
        </div>
      </section>

      {/* ── COLOR BLOCKS ── */}
      <section className="color-blocks">
        {CARD_BLOCKS.map((b, i) => (
          <div key={i} className="color-block" style={{ background: b.bg }}>
            <div className="color-block-deco" style={{ width: 320, height: 320, top: -80, right: -60, background: i === 0 ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)" }} />
            <div className="color-block-deco" style={{ width: 180, height: 180, bottom: -40, left: 80, background: i === 0 ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)", borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }} />
            <div style={{ position: "absolute", top: 48, right: 48, width: 60, height: 60, border: `3px solid ${i === 0 ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.12)"}`, borderRadius: 16, transform: "rotate(15deg)" }} />
            <div className="color-block-content">
              <span className="block-tag" style={{ color: i === 0 ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}>{b.tag}</span>
              <h3 style={{ color: i === 0 ? WHITE : DARK_TEXT }}>{b.title}</h3>
              <p style={{ color: i === 0 ? WHITE : MUTED_TEXT }}>{b.body}</p>
              <a href="/app" style={{ background: b.ctaColor, color: i === 0 ? BLUE : WHITE }}>{b.cta}</a>
            </div>
          </div>
        ))}
      </section>

      {/* ── FEATURE SPLIT 2 (flipped) ── */}
      <section className="feature-section flip">
        <div>
          <span className="feature-tag">{FEATURES[1].tag}</span>
          <h2 className="feature-title">{FEATURES[1].title}</h2>
          <p className="feature-body">{FEATURES[1].body}</p>
        </div>
        <div className="feature-img-wrap">
          <Image src={FEATURES[1].image} alt={FEATURES[1].alt} fill style={{ objectFit: "cover" }} />
          <span className="feature-img-tag">✓ Nessuna sorpresa</span>
        </div>
      </section>

      {/* ── EDITORIAL SPLIT ── */}
      <section className="editorial-split">
        <div className="editorial-img">
          <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80" alt="Professional woman" fill style={{ objectFit: "cover", objectPosition: "center top" }} />
        </div>
        <div className="editorial-text">
          <div className="big-num">12</div>
          <h3>Compagnie.<br />Un'unica<br />proposta.</h3>
          <p>Non ti mostriamo tutte le polizze disponibili. Ti consigliamo la più adatta al tuo profilo professionale, dopo averne analizzate 12.</p>
          <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: BLUE, textDecoration: "none" }}>
            Trova la tua polizza →
          </Link>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="process-section">
        <p className="section-eyebrow">IL PROCESSO</p>
        <h2 className="section-title">Tre passi. Nessuna carta.</h2>
        <p className="section-sub">Un percorso semplice e veloce, pensato per chi ha poco tempo ma vuole la copertura giusta.</p>
        <div className="process-steps">
          <div className="process-step">
            <span className="step-num">01</span>
            <div className="step-title">Racconta il tuo lavoro</div>
            <p className="step-body">Professione, attività, massimale preferito. Solo le informazioni che servono davvero.</p>
          </div>
          <div className="process-step">
            <span className="step-num">02</span>
            <div className="step-title">Il sistema analizza</div>
            <p className="step-body">Confrontiamo 12 Compagnie. Valutiamo copertura, prezzo e coerenza con il tuo rischio.</p>
          </div>
          <div className="process-step">
            <span className="step-num">03</span>
            <div className="step-title">Ricevi la proposta</div>
            <p className="step-body">Ti presentiamo la soluzione migliore. Se vuoi, confrontala con tutte le alternative.</p>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <section className="ticker-section">
        <p className="ticker-label">Trusted by 12+ leading insurers</p>
        <div style={{ overflow: "hidden" }}>
          <div className="ticker-track">
            {["AXA", "Generali", "UnipolSai", "Allianz", "HDI", "AmTrust", "Unipol", "Cattolica", "Zurich", "Lloyd's", "Helvetia", "Reale"].map((c, i) => (
              <span key={i} className="ticker-item">{c}</span>
            ))}
            {["AXA", "Generali", "UnipolSai", "Allianz", "HDI", "AmTrust", "Unipol", "Cattolica", "Zurich", "Lloyd's", "Helvetia", "Reale"].map((c, i) => (
              <span key={`dup-${i}`} className="ticker-item">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── COUNTER SECTION ── */}
      <motion.section
        className="counter-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="counter-grid">
          {[{ num: "98%", label: "Clienti soddisfatti" }, { num: "4.9★", label: "Rating medio" }, { num: "2min", label: "Per un preventivo" }].map((c, i) => (
            <motion.div
              key={c.label}
              className="counter-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <div className="counter-num">{c.num}</div>
              <div className="counter-label">{c.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── GALLERY / BENEFITS ── */}
      <section className="gallery-section">
        <motion.span
          className="gallery-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          PERCHÉ SCEGLIERCI
        </motion.span>
        <motion.h2
          className="gallery-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Più di un comparatore.<br />Un consulente intelligente.
        </motion.h2>
        <div className="gallery-cards">
          {[
            {
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#38a372" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
              title: "Velocità",
              desc: "2 minuti per il tuo preventivo. Zero carta."
            },
            {
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#38a372" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
              title: "Sicurezza",
              desc: "Dati crittografati. Nessuna email necessaria."
            },
            {
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#38a372" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
              title: "Precisione",
              desc: "12 Compagnie analizzate per ogni profilo."
            },
            {
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#38a372" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
              title: "Supporto",
              desc: "Un consulente umano sempre disponibile."
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              className="gallery-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className="gallery-card-icon">{card.icon}</div>
              <h4>{card.title}</h4>
              <p>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── STORY SECTION ── */}
      <section className="story-section">
        <div className="story-sticky">
          {/* LEFT: step labels */}
          <div className="story-left">
            <div className="story-left-inner">
              {STORY_STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className={`story-left-item ${activeStep === i ? "active" : "inactive"}`}
                  onClick={() => {
                    const section = document.querySelector(".story-section") as HTMLElement
                    if (!section) return
                    const target = section.offsetTop + (section.scrollHeight / 4) * i
                    window.scrollTo({ top: target, behavior: "smooth" })
                  }}
                >
                  <div className="story-left-title">{step.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: active step content */}
          <div className="story-right">
            {STORY_STEPS.map((step, i) => (
              <div key={step.title} className={`story-right-content ${activeStep === i ? "active" : "inactive"}`}>
                <Image src={step.image} alt={step.title} className="story-right-img" fill style={{ objectFit: "cover" }} />
                <p className="story-right-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAYPAL-STYLE PIN ── */}
      <section className="paypal-pin-section">
        <div className="paypal-pin-sticky">
          <div style={{
            position: "relative",
            width: `${40 + paypalProgress * 0.55}vw`,
            height: `${25 + paypalProgress * 0.7}vh`,
            maxWidth: "98vw",
            maxHeight: "98vh",
            borderRadius: paypalProgress > 90 ? 0 : 24,
            overflow: "hidden",
            transition: "border-radius 0.4s ease",
            zIndex: 1,
          }}>
            <Image src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1800&q=80" alt="" fill style={{ objectFit: "cover", objectPosition: "center 40%" }} />
            <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.2 + paypalProgress * 0.002})`, zIndex: 1, pointerEvents: "none" }} />
          </div>
          <div className="paypal-pin-content">
            <div className="paypal-pin-left">
              <div className={`paypal-pin-word from-left ${paypalVisible ? "visible" : ""}`}>La tua RC</div>
            </div>
            <div className="paypal-pin-right">
              <div className={`paypal-pin-word from-right ${paypalVisible ? "visible" : ""}`}>scelgo sicuro</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="cta-section">
        <h2 className="cta-title">La tua RC<br />professionale.</h2>
        <p className="cta-sub">Non la più cara. Non la più barata. La più adatta al tuo lavoro. Calcolala in 2 minuti.</p>
        <Link href="/app" className="btn-primary">Calcola il tuo preventivo →</Link>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section">
        <h2 className="faq-title">Domande frequenti</h2>
        {FAQS.map((faq, i) => (
          <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
            <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              {faq.q}
              <svg className="faq-icon" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <div className="faq-a"><p>{faq.a}</p></div>
          </div>
        ))}
      </section>

      {/* ── FOOTER ── */}
      <footer className="paypal-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <h4>ScelgoSicuro</h4>
              <p>La RC professionale scelta con criterio. Preventivo gratuito, senza impegno.</p>
            </div>
            <div className="footer-col">
              <h5>Prodotto</h5>
              <a href="#">Funzionalità</a>
              <a href="#">Prezzi</a>
              <a href="#">Compagnie</a>
              <a href="#">FAQ</a>
            </div>
            <div className="footer-col">
              <h5>Azienda</h5>
              <a href="#">Chi siamo</a>
              <a href="#">Professioni</a>
              <a href="#">Blog</a>
              <a href="#">Contatti</a>
            </div>
            <div className="footer-col">
              <h5>Legale</h5>
              <a href="#">Privacy</a>
              <a href="#">Termini</a>
              <a href="#">Cookie</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2025 ScelgoSicuro. Tutti i diritti riservati.</span>
            <span>P.IVA 12345678901</span>
          </div>
        </div>
      </footer>
    </>
  )
}