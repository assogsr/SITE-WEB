import { useState } from "react";
import { Bell, CalendarDays, FileText, TrendingUp, MapPin, Phone, ChevronRight, CheckCircle2, AlertCircle, Clock, Home, LogOut } from "lucide-react";
import { Logo } from "@/components/gsr/Logo";
import { AGENCIES } from "@/data/gsr";
import { ELEVE, RDV, DOCS, NOTIFS } from "@/pages/mobile/data";

const O = "#F29A58", N = "#25333D";

const Pill = ({ children, tone = "ok" }) => <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${tone === "ok" ? "bg-emerald-100 text-emerald-800" : tone === "warn" ? "bg-[#FFF4EA] text-[#b4532a]" : "bg-stone-100 text-stone-600"}`}>{children}</span>;

export const ScreenLogin = ({ onLogin }) => (
  <div data-testid="mobile-screen-login" className="h-full flex flex-col bg-[#25333D] text-white p-6">
    <div className="flex-1 flex flex-col justify-center">
      <Logo chip className="h-10 self-start" testId="mobile-logo" />
      <h2 className="font-clash text-3xl font-semibold mt-8 leading-tight">Mon espace<br /><span style={{ color: O }}>élève</span></h2>
      <p className="text-white/60 text-sm mt-3">Rendez-vous, progression, documents et notifications.</p>
      <div className="mt-8 space-y-3">
        <div className="bg-white/10 rounded-xl px-4 py-3 text-sm">ines.benali@exemple.fr</div>
        <div className="bg-white/10 rounded-xl px-4 py-3 text-sm tracking-[0.3em]">••••••••</div>
        <button data-testid="mobile-login-button" onClick={onLogin} className="w-full rounded-xl py-3.5 font-semibold text-sm" style={{ background: O, color: N }}>Se connecter</button>
      </div>
    </div>
    <p className="text-[10px] text-white/40 text-center">Démonstration — compte fictif. Application non publiée sur les stores.</p>
  </div>
);

export const ScreenHome = ({ go }) => {
  const pct = Math.round((ELEVE.heures.faites / ELEVE.heures.total) * 100);
  const next = RDV[0];
  return (
    <div data-testid="mobile-screen-home" className="p-5 space-y-4">
      <div><p className="text-xs text-[#53616B]">Bonjour</p><h2 className="font-clash text-2xl font-semibold">{ELEVE.prenom} 👋</h2><p className="text-[11px] font-mono text-[#53616B]">{ELEVE.reference}</p></div>
      <button onClick={() => go("rdv")} className="w-full text-left rounded-2xl p-4 text-white" style={{ background: N }} data-testid="mobile-home-next-rdv">
        <p className="text-[10px] uppercase tracking-widest text-white/60">Prochain rendez-vous</p>
        <p className="font-clash text-xl mt-1">{next.date} · {next.heure.split(" ")[0]}</p><p className="text-sm text-white/70">{next.type} avec {next.moniteur}</p>
      </button>
      <button onClick={() => go("progression")} className="w-full text-left rounded-2xl p-4 bg-[#FFF4EA]" data-testid="mobile-home-progress">
        <div className="flex justify-between text-sm"><span className="font-semibold">{ELEVE.formation}</span><span>{ELEVE.heures.faites}/{ELEVE.heures.total} h</span></div>
        <div className="mt-2 h-2 bg-white rounded-full"><div className="h-2 rounded-full" style={{ width: `${pct}%`, background: O }} /></div>
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => go("documents")} className="rounded-2xl p-4 bg-white border border-[#25333D]/10 text-left" data-testid="mobile-home-docs"><FileText size={20} style={{ color: O }} /><p className="mt-2 text-sm font-semibold">Documents</p><p className="text-xs text-[#b4532a]">1 pièce manquante</p></button>
        <button onClick={() => go("agence")} className="rounded-2xl p-4 bg-white border border-[#25333D]/10 text-left" data-testid="mobile-home-agency"><MapPin size={20} style={{ color: O }} /><p className="mt-2 text-sm font-semibold">Mon agence</p><p className="text-xs text-[#53616B]">Créteil</p></button>
      </div>
    </div>
  );
};

export const ScreenRdv = () => (
  <div data-testid="mobile-screen-rdv" className="p-5">
    <h2 className="font-clash text-2xl font-semibold">Rendez-vous</h2>
    <ul className="mt-4 space-y-3">
      {RDV.map((r) => (
        <li key={r.id} data-testid={`mobile-rdv-${r.id}`} className="rounded-2xl bg-white border border-[#25333D]/10 p-4">
          <div className="flex justify-between items-start"><p className="font-semibold">{r.date}</p><Pill tone={r.statut === "confirme" ? "ok" : "warn"}>{r.statut === "confirme" ? "Confirmé" : "À confirmer"}</Pill></div>
          <p className="text-sm text-[#53616B] flex items-center gap-1 mt-1"><Clock size={13} /> {r.heure}</p>
          <p className="text-sm mt-1">{r.type} · {r.moniteur}</p><p className="text-xs text-[#53616B]">{r.lieu}</p>
        </li>
      ))}
    </ul>
    <button data-testid="mobile-rdv-request" className="mt-4 w-full rounded-xl py-3 text-sm font-semibold" style={{ background: O, color: N }}>Demander un créneau</button>
    <p className="mt-2 text-[10px] text-[#53616B] text-center">La demande est traitée par l'agence, qui confirme le créneau.</p>
  </div>
);

export const ScreenProgression = () => {
  const icon = { acquis: <CheckCircle2 size={18} className="text-emerald-600" />, "en-cours": <TrendingUp size={18} style={{ color: O }} />, "a-venir": <Clock size={18} className="text-stone-400" /> };
  return (
    <div data-testid="mobile-screen-progression" className="p-5">
      <h2 className="font-clash text-2xl font-semibold">Progression</h2>
      <div className="mt-4 rounded-2xl p-4 text-white" style={{ background: N }}>
        <p className="text-[10px] uppercase tracking-widest text-white/60">Conduite</p>
        <p className="font-clash text-3xl mt-1">{ELEVE.heures.faites} h <span className="text-base text-white/60">/ {ELEVE.heures.total} h</span></p>
        <div className="mt-3 h-2 bg-white/15 rounded-full"><div className="h-2 rounded-full" style={{ width: `${(ELEVE.heures.faites / ELEVE.heures.total) * 100}%`, background: O }} /></div>
      </div>
      <div className="mt-3 rounded-2xl p-4 bg-[#FFF4EA] flex justify-between items-center"><div><p className="text-[10px] uppercase tracking-widest text-[#53616B]">Code de la route</p><p className="font-semibold">Obtenu le {ELEVE.code.date}</p></div><CheckCircle2 className="text-emerald-600" /></div>
      <h3 className="mt-5 text-xs uppercase tracking-widest text-[#53616B]">Compétences</h3>
      <ul className="mt-2 divide-y divide-[#25333D]/10">{ELEVE.competences.map((c) => <li key={c.id} data-testid={`mobile-competence-${c.id}`} className="py-3 flex items-center gap-3 text-sm">{icon[c.etat]}<span className={c.etat === "a-venir" ? "text-[#53616B]" : ""}>{c.label}</span></li>)}</ul>
    </div>
  );
};

export const ScreenDocuments = () => (
  <div data-testid="mobile-screen-documents" className="p-5">
    <h2 className="font-clash text-2xl font-semibold">Documents</h2>
    <ul className="mt-4 space-y-2">
      {DOCS.map((d) => (
        <li key={d.id} data-testid={`mobile-doc-${d.id}`} className={`rounded-2xl p-4 flex items-center gap-3 ${d.etat === "manquant" ? "bg-[#FFF4EA]" : "bg-white border border-[#25333D]/10"}`}>
          {d.etat === "manquant" ? <AlertCircle style={{ color: O }} /> : <FileText className="text-[#53616B]" />}
          <div className="flex-1"><p className="text-sm font-semibold">{d.nom}</p><p className="text-xs text-[#53616B]">{d.date ? `Déposé le ${d.date}` : "À déposer"}</p></div>
          {d.etat === "manquant" ? <button data-testid="mobile-doc-upload" className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: O, color: N }}>Déposer</button> : <ChevronRight size={16} className="text-[#53616B]" />}
        </li>
      ))}
    </ul>
  </div>
);

export const ScreenNotifs = ({ notifs, markRead }) => (
  <div data-testid="mobile-screen-notifications" className="p-5">
    <h2 className="font-clash text-2xl font-semibold">Notifications</h2>
    <ul className="mt-4 space-y-2">
      {notifs.map((n) => (
        <li key={n.id}><button data-testid={`mobile-notif-${n.id}`} onClick={() => markRead(n.id)} className={`w-full text-left rounded-2xl p-4 ${n.lu ? "bg-white border border-[#25333D]/10" : "bg-[#FFF4EA]"}`}>
          <div className="flex justify-between gap-3"><p className="text-sm font-semibold flex items-center gap-2">{!n.lu && <span className="h-2 w-2 rounded-full" style={{ background: O }} />}{n.titre}</p><span className="text-[10px] text-[#53616B] shrink-0">{n.quand}</span></div>
          <p className="text-xs text-[#53616B] mt-1">{n.texte}</p>
        </button></li>
      ))}
    </ul>
  </div>
);

export const ScreenAgence = () => {
  const a = AGENCIES.find((x) => x.id === ELEVE.agence);
  return (
    <div data-testid="mobile-screen-agence" className="p-5">
      <h2 className="font-clash text-2xl font-semibold">Mon agence</h2>
      <div className="mt-4 rounded-2xl overflow-hidden"><img src={a.image} alt="" className="h-32 w-full object-cover" /></div>
      <p className="mt-4 font-semibold">{a.name}</p>
      <p className="text-sm text-[#53616B]">{a.street}, {a.zip}</p>
      <p className="text-sm text-[#53616B] mt-2">{a.hours}</p>
      <a href={`tel:${a.tel}`} data-testid="mobile-agency-call" className="mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold" style={{ background: O, color: N }}><Phone size={16} /> {a.phone}</a>
    </div>
  );
};

export const TABS = [
  { id: "home", label: "Accueil", icon: Home },
  { id: "rdv", label: "RDV", icon: CalendarDays },
  { id: "progression", label: "Progrès", icon: TrendingUp },
  { id: "documents", label: "Docs", icon: FileText },
  { id: "notifications", label: "Alertes", icon: Bell },
];

export const useMobileState = () => {
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState("home");
  const [notifs, setNotifs] = useState(NOTIFS);
  const markRead = (id) => setNotifs((p) => p.map((n) => (n.id === id ? { ...n, lu: true } : n)));
  const logout = () => { setLogged(false); setTab("home"); setNotifs(NOTIFS); };
  return { logged, setLogged, tab, setTab, notifs, markRead, logout, unread: notifs.filter((n) => !n.lu).length, LogOut };
};
