import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, BellRing, FileText, UserCog, LogOut, ExternalLink, ScrollText, Download, GraduationCap } from "lucide-react";
import { Logo } from "@/components/gsr/Logo";
import { useAuth, can } from "@/crm/auth";

const ITEMS = [
  { to: "/crm", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/crm/prospects", label: "Prospects", icon: Users, roles: ["direction", "responsable", "accueil"] },
  { to: "/crm/calendrier", label: "Calendrier", icon: CalendarDays, roles: ["direction", "responsable", "accueil"] },
  { to: "/crm/relances", label: "Relances", icon: BellRing, roles: ["direction", "responsable", "accueil"] },
  { to: "/crm/contenus", label: "Contenus", icon: FileText, roles: ["direction", "editeur"] },
  { to: "/crm/sessions-ia", label: "Sessions IA", icon: GraduationCap, roles: ["direction", "responsable", "editeur"] },
  { to: "/crm/exports", label: "Exports CSV", icon: Download, roles: ["direction"] },
  { to: "/crm/utilisateurs", label: "Utilisateurs", icon: UserCog, roles: ["direction"] },
  { to: "/crm/journal", label: "Journal d'audit", icon: ScrollText, roles: ["direction"] },
];

export const AGENCY_LABEL = { creteil: "Créteil", bonneuil: "Bonneuil" };

export default function CrmLayout() {
  const { user, logout } = useAuth();
  const items = ITEMS.filter((i) => !i.roles || can(user, ...i.roles));
  return (
    <div data-testid="crm-layout" className="min-h-screen font-satoshi bg-[#F6F3EE] text-[#25333D] lg:grid lg:grid-cols-[250px_1fr] overflow-x-hidden">
      <aside className="bg-[#25333D] text-white flex lg:flex-col lg:min-h-screen lg:sticky lg:top-0 lg:h-screen">
        <div className="hidden lg:block p-6"><Logo chip className="h-9" testId="crm-logo" /><p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-white/50">Espace interne</p></div>
        <nav className="flex lg:flex-col overflow-x-auto no-scrollbar flex-1 px-2 lg:px-3 py-2 lg:py-0 gap-1">
          {items.map(({ to, label, icon: I, end }) => (
            <NavLink key={to} to={to} end={end} data-testid={`crm-nav-${end ? "dashboard" : to.split("/").pop()}`}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 text-sm whitespace-nowrap transition-colors ${isActive ? "bg-[#F29A58] text-[#25333D] font-semibold" : "text-white/75 hover:bg-white/10"}`}>
              <I size={17} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block p-5 border-t border-white/10 text-sm">
          <p data-testid="crm-user-name" className="font-semibold">{user.name}</p>
          <p data-testid="crm-user-role" className="text-xs text-white/60">{user.role_label}{user.agency ? ` · ${AGENCY_LABEL[user.agency]}` : ""}</p>
          <div className="mt-4 flex gap-3 text-xs">
            <button data-testid="crm-logout" onClick={logout} className="inline-flex items-center gap-1 hover:text-[#F29A58]"><LogOut size={14} /> Déconnexion</button>
            <Link to="/" className="inline-flex items-center gap-1 hover:text-[#F29A58]"><ExternalLink size={14} /> Site</Link>
          </div>
        </div>
        <button data-testid="crm-logout-mobile" onClick={logout} className="lg:hidden px-4 text-white/70"><LogOut size={18} /></button>
      </aside>
      <main className="p-5 lg:p-10 min-w-0"><Outlet /></main>
    </div>
  );
}

export const PageTitle = ({ label, title, children }) => (
  <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
    <div><p className="text-[11px] uppercase tracking-[0.25em] text-[#53616B]">{label}</p><h1 className="mt-2 font-clash text-3xl lg:text-4xl font-semibold">{title}</h1></div>
    {children}
  </div>
);

export const StatusBadge = ({ status, label }) => {
  const c = { nouveau: "bg-[#F29A58] text-[#25333D]", en_cours: "bg-[#25333D] text-white", rdv_fixe: "bg-sky-100 text-sky-900", inscrit: "bg-emerald-100 text-emerald-900", traite: "bg-stone-200 text-stone-700", annule: "bg-rose-100 text-rose-900" }[status] || "bg-stone-100";
  return <span data-testid="status-badge" className={`inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${c}`}>{label || status}</span>;
};

export const TYPE_LABEL = { "rendez-vous": "Rendez-vous", informations: "Informations", inscription: "Inscription", rappel: "Rappel", intervention: "Intervention", partenariat: "Partenariat", "formation-ia": "Formation IA" };
export const fmt = (iso) => (iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—");
export const fmtD = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : "—");
export const Card = ({ children, className = "", testId }) => <div data-testid={testId} className={`bg-white p-5 lg:p-6 min-w-0 ${className}`}>{children}</div>;
export const inputCls = "rounded-xl border border-[#25333D]/15 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F29A58]/60";
