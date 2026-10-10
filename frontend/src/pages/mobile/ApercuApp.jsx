import { useState } from "react";
import { LogOut, Smartphone } from "lucide-react";
import { PageHero, Section, Label } from "@/components/site/Page";
import { ScreenLogin, ScreenHome, ScreenRdv, ScreenProgression, ScreenDocuments, ScreenNotifs, ScreenAgence, TABS, useMobileState } from "@/pages/mobile/screens";
import { IMG } from "@/data/gsr";

const Phone = ({ os, children, unread }) => (
  <div data-testid={`mobile-frame-${os}`} className={`relative mx-auto w-[330px] h-[680px] bg-[#111] ${os === "ios" ? "rounded-[46px] p-3" : "rounded-[28px] p-2.5"} shadow-2xl`}>
    <div className={`relative h-full w-full bg-[#F6F3EE] overflow-hidden ${os === "ios" ? "rounded-[36px]" : "rounded-[20px]"}`}>
      {os === "ios" ? <div className="absolute top-2 left-1/2 -translate-x-1/2 h-7 w-28 bg-[#111] rounded-full z-20" /> : <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-3.5 w-3.5 bg-[#111] rounded-full z-20" />}
      <div className="absolute top-3 inset-x-6 flex justify-between text-[10px] font-semibold z-10 text-[#25333D]"><span>9:41</span><span>{unread > 0 ? `● ${unread}` : ""} ▮▮▮</span></div>
      {children}
    </div>
  </div>
);

export default function ApercuApp() {
  const [os, setOs] = useState("ios");
  const s = useMobileState();
  const screens = { home: <ScreenHome go={s.setTab} />, rdv: <ScreenRdv />, progression: <ScreenProgression />, documents: <ScreenDocuments />, notifications: <ScreenNotifs notifs={s.notifs} markRead={s.markRead} />, agence: <ScreenAgence /> };
  return (
    <div data-testid="apercu-app-page">
      <PageHero testId="apercu-hero" label="Aperçu — application élève" title="L'espace élève GSR, dans la poche." image={IMG.sourireVolant}
        text="Démonstration interactive de la future application mobile : rendez-vous, progression, documents et notifications. L'application iOS/Android réelle est prévue en phase 3 et n'est pas disponible sur les stores." />
      <Section tone="cream">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <Label>Prototype cliquable</Label>
            <h2 className="mt-4 font-clash text-3xl lg:text-4xl font-semibold">Testez le parcours élève.</h2>
            <p className="mt-4 text-[#53616B]">Connectez-vous avec le compte fictif, puis naviguez entre les onglets. Toutes les données affichées sont inventées pour la démonstration.</p>
            <div className="mt-8 inline-flex border border-[#25333D]/15 bg-white p-1" role="tablist">
              {[["ios", "iOS"], ["android", "Android"]].map(([k, l]) => <button key={k} data-testid={`apercu-os-${k}`} onClick={() => setOs(k)} className={`px-5 py-2 text-sm font-semibold transition-colors ${os === k ? "bg-[#25333D] text-white" : "hover:bg-[#FFF4EA]"}`}>{l}</button>)}
            </div>
            <ul className="mt-10 space-y-4 text-sm">
              {[["Rendez-vous", "Leçons confirmées ou à confirmer, demande de créneau traitée par l'agence."], ["Progression", "Heures de conduite, code, compétences du livret d'apprentissage."], ["Documents", "Pièces du dossier, statut, dépôt des documents manquants."], ["Notifications", "Confirmations, rappels de pièces, compétences validées."]].map(([t, x]) => (
                <li key={t} className="grid grid-cols-[120px_1fr] gap-4 border-t border-[#25333D]/10 pt-4"><span className="font-semibold">{t}</span><span className="text-[#53616B]">{x}</span></li>
              ))}
            </ul>
            <p className="mt-8 text-xs text-[#53616B] inline-flex items-center gap-2"><Smartphone size={14} /> Les demandes faites depuis l'application seront reliées au CRM GSR (phase 3).</p>
          </div>
          <div className="lg:col-span-7">
            <Phone os={os} unread={s.logged ? s.unread : 0}>
              {!s.logged ? <ScreenLogin onLogin={() => s.setLogged(true)} /> : (
                <div className="h-full flex flex-col pt-10 text-[#25333D]">
                  <div className="flex-1 overflow-y-auto">{screens[s.tab]}</div>
                  <nav data-testid="mobile-tabbar" className="grid grid-cols-5 bg-white border-t border-[#25333D]/10 pb-4 pt-2">
                    {TABS.map(({ id, label, icon: I }) => (
                      <button key={id} data-testid={`mobile-tab-${id}`} onClick={() => s.setTab(id)} className={`relative flex flex-col items-center gap-1 text-[10px] ${s.tab === id ? "text-[#F29A58] font-semibold" : "text-[#53616B]"}`}>
                        <I size={20} />{label}
                        {id === "notifications" && s.unread > 0 && <span data-testid="mobile-unread-badge" className="absolute top-0 right-5 h-4 min-w-4 px-1 rounded-full bg-[#F29A58] text-[#25333D] text-[9px] font-bold grid place-items-center">{s.unread}</span>}
                      </button>
                    ))}
                  </nav>
                  <button data-testid="mobile-logout" onClick={s.logout} className="absolute top-3 right-20 text-[#53616B] z-10" aria-label="Déconnexion"><LogOut size={14} /></button>
                </div>
              )}
            </Phone>
          </div>
        </div>
      </Section>
    </div>
  );
}
