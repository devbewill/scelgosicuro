import { BrandLogo } from "./brand-logo";

const FOOTER_LINKS = ["Privacy Policy", "Termini", "Cookies", "© 2026 Boutique Risk Management"];

export function Footer() {
  return (
    <footer className="bg-white py-12 sm:py-24 px-6 sm:px-12 border-t border-black/5">
      <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-12">
        <div className="flex items-center gap-2 sm:gap-3">
          <BrandLogo className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="text-xl sm:text-2xl font-black tracking-tighter uppercase">
            ScelgoSicuro
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-12 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-black/40">
          {FOOTER_LINKS.map((link) => (
            <a key={link} href="#">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
