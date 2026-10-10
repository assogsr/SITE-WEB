import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { crm, useAuth } from "@/crm/auth";
import { PageTitle, StatusBadge, TYPE_LABEL, fmt, Card, inputCls, AGENCY_LABEL } from "@/crm/CrmLayout";

export default function Prospects() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState({ statuses: {} });
  const [f, setF] = useState({ q: "", status: "", type: "", agency: "" });
  useEffect(() => { crm.get("/crm/meta").then((r) => setMeta(r.data)); }, []);
  useEffect(() => {
    const t = setTimeout(() => crm.get("/crm/demandes", { params: Object.fromEntries(Object.entries(f).filter(([, v]) => v)) }).then((r) => setRows(r.data)), 250);
    return () => clearTimeout(t);
  }, [f]);
  return (
    <div data-testid="crm-prospects">
      <PageTitle label="Prospects" title="Demandes & dossiers">
        <span className="text-sm text-[#53616B]">{rows ? `${rows.length} dossier${rows.length > 1 ? "s" : ""}` : ""}</span>
      </PageTitle>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <input data-testid="prospects-search" placeholder="Nom, référence, e-mail, téléphone…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} className={inputCls} />
        <select data-testid="prospects-status-filter" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className={inputCls}><option value="">Tous les statuts</option>{Object.entries(meta.statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select data-testid="prospects-type-filter" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className={inputCls}><option value="">Tous les motifs</option>{Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        {!user.agency && <select data-testid="prospects-agency-filter" value={f.agency} onChange={(e) => setF({ ...f, agency: e.target.value })} className={inputCls}><option value="">Toutes les agences</option><option value="creteil">Créteil</option><option value="bonneuil">Bonneuil</option></select>}
      </div>
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="text-left text-[11px] uppercase tracking-widest text-[#53616B] border-b border-[#25333D]/10"><tr>{["Référence", "Nom", "Motif", "Agence", "Contact", "Reçue le", "Statut"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#25333D]/5">
            {rows?.map((r) => (
              <tr key={r.id} data-testid={`prospect-row-${r.reference}`} className="hover:bg-[#FFF4EA] transition-colors">
                <td className="px-4 py-3 font-mono text-xs"><Link to={`/crm/prospects/${r.id}`} className="hover:text-[#F29A58]">{r.reference}</Link></td>
                <td className="px-4 py-3 font-semibold"><Link to={`/crm/prospects/${r.id}`} className="hover:text-[#F29A58] inline-flex items-center gap-2">{r.name}{r.duplicates_count > 0 && <AlertTriangle data-testid="duplicate-flag" size={14} className="text-[#F29A58]" title="Doublon potentiel" />}</Link></td>
                <td className="px-4 py-3">{TYPE_LABEL[r.type]}{r.rappel_date && <span className="block text-[11px] text-[#b4532a]">Rappel {r.rappel_date.slice(8)}/{r.rappel_date.slice(5, 7)} · {r.rappel_time}</span>}</td>
                <td className="px-4 py-3">{AGENCY_LABEL[r.agency]}</td>
                <td className="px-4 py-3 text-[#53616B]">{r.phone || r.email}</td>
                <td className="px-4 py-3 text-[#53616B]">{fmt(r.created_at)}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} label={r.status_label} /></td>
              </tr>
            ))}
            {rows && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-[#53616B]">Aucun dossier.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
