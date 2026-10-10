import { useEffect, useState } from "react";
import { crm } from "@/crm/auth";
import { PageTitle, Card, inputCls, fmt } from "@/crm/CrmLayout";

const ACTIONS = { login: "Connexion", login_failed: "Échec de connexion", login_blocked: "Connexion bloquée", login_inactive: "Compte désactivé (tentative)", logout: "Déconnexion", demande_update: "Dossier modifié", relance_create: "Relance planifiée", slot_capacity: "Capacité créneau", article_status: "Statut article", user_create: "Compte créé", user_update: "Compte modifié", rate_limited: "Limite de débit", spam_honeypot: "Spam bloqué", export_csv: "Export CSV", session_create: "Session IA créée", session_update: "Session IA modifiée", inscription_validate: "Inscription validée" };

export default function Journal() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ action: "", q: "" });
  useEffect(() => {
    const t = setTimeout(() => crm.get("/crm/audit", { params: Object.fromEntries(Object.entries(f).filter(([, v]) => v)) }).then((r) => setRows(r.data)).catch(() => setRows([])), 200);
    return () => clearTimeout(t);
  }, [f]);
  return (
    <div data-testid="crm-journal">
      <PageTitle label="Sécurité" title="Journal d'audit"><span className="text-sm text-[#53616B]">{rows.length} entrées</span></PageTitle>
      <div className="grid sm:grid-cols-2 gap-3 mb-5 max-w-2xl">
        <select data-testid="journal-action-filter" value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })} className={inputCls}><option value="">Toutes les actions</option>{Object.entries(ACTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <input data-testid="journal-search" placeholder="Utilisateur, cible…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} className={inputCls} />
      </div>
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="text-left text-[11px] uppercase tracking-widest text-[#53616B] border-b border-[#25333D]/10"><tr>{["Date", "Action", "Utilisateur", "Cible", "Détails", "IP"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#25333D]/5">
            {rows.map((r) => (
              <tr key={r.id} data-testid={`journal-row-${r.action}`}>
                <td className="px-4 py-2.5 text-[#53616B] whitespace-nowrap">{fmt(r.at)}</td>
                <td className="px-4 py-2.5 font-semibold">{ACTIONS[r.action] || r.action}</td>
                <td className="px-4 py-2.5">{r.user || <span className="text-[#53616B]">anonyme</span>}{r.role && <span className="text-xs text-[#53616B]"> · {r.role}</span>}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{r.target}</td>
                <td className="px-4 py-2.5 text-xs text-[#53616B]">{Object.entries(r.meta || {}).map(([k, v]) => `${k}: ${v}`).join(" · ")}</td>
                <td className="px-4 py-2.5 text-xs text-[#53616B]">{r.ip}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[#53616B]">Aucune entrée.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
