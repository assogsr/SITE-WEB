import { createContext, useContext, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/gsr/Logo";
import { RdvDialog } from "@/components/gsr/RdvDialog";
import { AGENCIES, ROUTES, FOOTER_LINKS } from "@/data/gsr";

const RdvCtx = createContext(() => {});
export const useRdv = () => useContext(RdvCtx);

const SiteNav = ({ onRdv }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const dark = pathname === "/";
  const link = ({ isActive }) => `transition-colors hover:text-[#F29A58] ${isActive ? "text-[#F29A58]" : ""}`;
  return (
    <header className="fixed top-4 inset-x-4 z-50">
      <div className={`max-w-7xl mx-auto flex items-center justify-between gap-4 backdrop-blur-xl px-3 py-2.5 ${dark ? "bg-[#25333D]/90 text-white" : "bg-[#25333D] text-white shadow-lg"}`}>
        <Link to="/" data-testid="site-home-link"><Logo chip className="h-9" testId="site-logo" /></Link>
        <nav className="hidden lg:flex gap-7 text-sm text-white/80">
          {ROUTES.map((r) => <NavLink key={r.to} to={r.to} data-testid={`site-nav-${r.to.slice(1)}`} className={link}>{r.label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden md:flex items-center gap-2 text-xs text-white/60 pr-2"><span className="h-2 w-2 rounded-full bg-[#F29A58] animate-pulse" /> Créteil · Bonneuil</span>
          <button data-testid="site-nav-rdv-button" onClick={() => onRdv()} className="hidden sm:block bg-[#F29A58] text-[#25333D] px-5 py-2.5 text-sm font-semibold hover:bg-white transition-colors">Rendez-vous</button>
          <button data-testid="site-mobile-menu-toggle" onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div data-testid="site-mobile-menu" className="lg:hidden max-w-7xl mx-auto bg-[#25333D] text-white px-5 py-4 space-y-3">
          {ROUTES.map((r) => <NavLink key={r.to} to={r.to} onClick={() => setOpen(false)} className="block">{r.label}</NavLink>)}
          <Link to="/contact" onClick={() => setOpen(false)} className="block">Contact</Link>
          <button onClick={() => { setOpen(false); onRdv(); }} className="w-full bg-[#F29A58] text-[#25333D] py-3 text-sm font-semibold">Rendez-vous</button>
        </div>
      )}
    </header>
  );
};

const SiteFooter = () => (
  <footer className="bg-[#25333D] text-white pt-20 pb-16">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <p className="font-clash text-4xl lg:text-7xl font-semibold leading-none">Génération<br /><span className="text-[#F29A58]">Sécurité Routière</span></p>
      <div className="mt-16 grid md:grid-cols-4 gap-10 text-sm text-white/65 border-t border-white/10 pt-10">
        <div><Logo chip className="h-10" testId="site-footer-logo" /><p className="mt-4">Association loi 1901<br />Auto-école sociale et solidaire · Val-de-Marne</p></div>
        {AGENCIES.map((a) => (
          <div key={a.id} className="space-y-1"><Link to={`/agences/${a.id}`} className="text-white font-semibold mb-2 block hover:text-[#F29A58]">{a.city}</Link><p>{a.street}, {a.zip}</p><p>{a.phone}</p><p>{a.email}</p></div>
        ))}
        <ul className="space-y-2">{FOOTER_LINKS.map((l) => <li key={l.to}><Link to={l.to} data-testid={`site-footer-${l.to.slice(1)}`} className="hover:text-[#F29A58]">{l.label}</Link></li>)}</ul>
      </div>
      <p className="mt-10 text-[11px] text-white/40">Prototype de démonstration — contenus et données fictifs. © Génération Sécurité Routière.</p>
    </div>
  </footer>
);

export default function Layout() {
  const [rdv, setRdv] = useState({ open: false, agency: "creteil", type: "rendez-vous" });
  const open = (agency, type) => setRdv({ open: true, agency: typeof agency === "string" ? agency : "creteil", type: type || "rendez-vous" });
  return (
    <RdvCtx.Provider value={open}>
      <div data-testid="site-layout" className="font-satoshi bg-white text-[#25333D]">
        <SiteNav onRdv={open} />
        <Outlet />
        <SiteFooter />
        <RdvDialog key={rdv.agency + rdv.type + rdv.open} open={rdv.open} defaultAgency={rdv.agency} defaultType={rdv.type} onOpenChange={(v) => setRdv({ ...rdv, open: v })} fontClass="font-satoshi" />
      </div>
    </RdvCtx.Provider>
  );
}
