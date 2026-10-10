import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { crm, useAuth } from "@/crm/auth";
import { PageTitle, StatusBadge, TYPE_LABEL, fmt, Card, AGENCY_LABEL } from "@/crm/CrmLayout";

export default function Dashboard() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  useEffect(() => { crm.get("/crm/dashboard").then((r) => setD(r.data)); }, []);
  if (!d) return <p className="text-[#53616B]">Chargement…</p>;
  const kpis = [["Demandes", d.total, "crm-kpi-total"], ["Nouvelles", d.by_status.nouveau, "crm-kpi-nouveau"], ["RDV à 7 jours", d.rdv_week, "crm-kpi-rdv"], ["Relances dues", d.relances_due, "crm-kpi-relances"]];
  return (
    <div data-testid="crm-dashboard">
      <PageTitle label={`Bonjour ${user.name.split(" ")[0]}`} title={user.agency ? `Agence de ${AGENCY_LABEL[user.agency]}` : "Vue d'ensemble"} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(([l, v, t], i) => (
          <div key={l} data-testid={t} className={`p-5 lg:p-6 ${i === 1 ? "bg-[#F29A58]" : i === 3 && v > 0 ? "bg-[#25333D] text-white" : "bg-white"}`}>
            <p className="text-[11px] uppercase tracking-widest opacity-70">{l}</p><p className="mt-2 font-clash text-4xl lg:text-5xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-7" testId="crm-recent">
          <div className="flex justify-between items-center"><h2 className="font-clash text-xl font-semibold">Dernières demandes</h2><Link to="/crm/prospects" className="text-sm font-semibold hover:text-[#F29A58]">Tout voir →</Link></div>
          <ul className="mt-4 divide-y divide-[#25333D]/10">
            {d.recent.map((r) => (
              <li key={r.id} className="py-3 flex items-center gap-4 min-w-0">
                <div className="flex-1 min-w-0"><Link to={`/crm/prospects/${r.id}`} className="font-semibold hover:text-[#F29A58]">{r.name}</Link><p className="text-xs text-[#53616B] truncate">{r.reference} · {TYPE_LABEL[r.type]} · {AGENCY_LABEL[r.agency]} · {fmt(r.created_at)}</p></div>
                <span className="shrink-0"><StatusBadge status={r.status} label={d.status_labels[r.status]} /></span>
              </li>
            ))}
          </ul>
        </Card>
        <div className="lg:col-span-5 space-y-4 min-w-0">
          <Card testId="crm-by-status"><h2 className="font-clash text-xl font-semibold">Par statut</h2>
            <ul className="mt-4 space-y-2">{Object.entries(d.by_status).map(([s, n]) => (
              <li key={s} className="grid grid-cols-[1fr_auto] gap-3 items-center text-sm"><div className="flex items-center gap-3 min-w-0"><span className="w-24 shrink-0 truncate">{d.status_labels[s]}</span><div className="flex-1 h-2 bg-[#F6F3EE] min-w-0"><div className="h-2 bg-[#25333D]" style={{ width: `${d.total ? (n / d.total) * 100 : 0}%` }} /></div></div><span className="font-semibold">{n}</span></li>
            ))}</ul>
          </Card>
          <Card testId="crm-by-type"><h2 className="font-clash text-xl font-semibold">Par motif</h2>
            <ul className="mt-4 flex flex-wrap gap-2">{Object.entries(d.by_type).map(([t, n]) => <li key={t} className="border border-[#25333D]/15 px-3 py-1.5 text-sm">{TYPE_LABEL[t] || t} <b>{n}</b></li>)}</ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
