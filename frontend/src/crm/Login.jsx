import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/gsr/Logo";
import { useAuth } from "@/crm/auth";
import { apiError } from "@/lib/api";

const DEMO = [
  ["Direction", "direction@example.test", process.env.REACT_APP_DEMO_ADMIN_PASSWORD || ""],
  ["Responsable Créteil", "responsable.creteil@gsr-demo.fr", process.env.REACT_APP_DEMO_PASSWORD || ""],
  ["Accueil Bonneuil", "accueil.bonneuil@gsr-demo.fr", process.env.REACT_APP_DEMO_PASSWORD || ""],
  ["Éditeur", "editeur@gsr-demo.fr", process.env.REACT_APP_DEMO_PASSWORD || ""],
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try { await login(f.email, f.password); nav(loc.state?.from || "/crm"); } catch (x) { setErr(apiError(x)); } finally { setBusy(false); }
  };
  return (
    <div data-testid="crm-login-page" className="min-h-screen grid lg:grid-cols-2 font-satoshi">
      <div className="bg-[#25333D] text-white p-10 lg:p-16 flex flex-col justify-between">
        <Logo chip className="h-10" testId="crm-login-logo" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/60">Espace interne</p>
          <h1 className="mt-4 font-clash text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1]">CRM Génération<br /><span className="text-[#F29A58]">Sécurité Routière</span></h1>
          <p className="mt-6 text-white/70 max-w-md">Prospects, rendez-vous, relances et contenus. Accès réservé à l'équipe GSR.</p>
        </div>
        <p className="text-xs text-white/40">Prototype de démonstration — comptes et données fictifs.</p>
      </div>
      <div className="bg-[#FFF4EA] p-8 lg:p-16 flex items-center">
        <div className="w-full max-w-md">
          <h2 className="font-clash text-3xl font-semibold text-[#25333D]">Connexion</h2>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <input data-testid="crm-login-email" type="email" required placeholder="E-mail professionnel" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="w-full rounded-xl border border-[#25333D]/15 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F29A58]/60" />
            <input data-testid="crm-login-password" type="password" required placeholder="Mot de passe" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className="w-full rounded-xl border border-[#25333D]/15 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F29A58]/60" />
            {err && <p data-testid="crm-login-error" className="text-sm text-[#b4532a]">{err}</p>}
            <button data-testid="crm-login-submit" disabled={busy} className="w-full rounded-full bg-[#25333D] text-white py-3.5 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors disabled:opacity-60">{busy ? "Connexion…" : "Se connecter"}</button>
          </form>
          {process.env.REACT_APP_DEMO_MODE === "true" && <div className="mt-10">
            <p className="text-[11px] uppercase tracking-widest text-[#53616B]">Comptes de démonstration</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO.map(([r, e, p]) => (
                <button key={e} type="button" data-testid={`crm-demo-${r.split(" ")[0].toLowerCase()}`} onClick={() => setF({ email: e, password: p })} className="text-left bg-white rounded-xl px-3 py-2.5 text-xs hover:ring-2 hover:ring-[#F29A58]/40 transition-shadow">
                  <span className="block font-semibold text-[#25333D]">{r}</span><span className="text-[#53616B] break-all">{e}</span>
                </button>
              ))}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}
