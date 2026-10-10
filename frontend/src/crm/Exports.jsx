import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { crm } from "@/crm/auth";
import { PageTitle, Card, inputCls, fmt } from "@/crm/CrmLayout";

export default function Exports() {
  const [meta, setMeta] = useState({ statuses: {} });
  const [f, setF] = useState({ kind: "prospects", date_from: "", date_to: "", agency: "", status: "" });
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const loadLog = () => crm.get("/crm/audit", { params: { action: "export_csv", limit: 20 } }).then((r) => setLog(r.data)).catch(() => {});
  useEffect(() => { crm.get("/crm/meta").then((r) => setMeta(r.data)); loadLog(); }, []);
  const run = async () => {
    setBusy(true);
    try {
      const res = await crm.get("/crm/export", { params: Object.fromEntries(Object.entries(f).filter(([, v]) => v)), responseType: "blob" });
      const name = (res.headers["content-disposition"] || "").match(/filename="([^"]+)"/)?.[1] || `gsr-${f.kind}.csv`;
      const url = URL.createObjectURL(res.data);
      const a = Object.assign(document.createElement("a"), { href: url, download: name });
      a.click(); URL.revokeObjectURL(url);
      toast.success(`Export ${name} téléchargé`); loadLog();
    } catch { toast.error("Export impossible"); } finally { setBusy(false); }
  };
  return (
    <div data-testid="crm-exports">
      <PageTitle label="Direction" title="Exports CSV" />
      <div className="grid lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-5" testId="export-form">
          <h2 className="font-clash text-xl font-semibold">Paramètres</h2>
          <div className="mt-4 space-y-3">
            <select data-testid="export-kind" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className={`${inputCls} w-full`}><option value="prospects">Prospects (toutes demandes)</option><option value="rendez-vous">Rendez-vous</option></select>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-[#53616B]">Du<input data-testid="export-from" type="date" value={f.date_from} onChange={(e) => setF({ ...f, date_from: e.target.value })} className={`${inputCls} w-full mt-1`} /></label>
              <label className="text-xs text-[#53616B]">Au<input data-testid="export-to" type="date" value={f.date_to} onChange={(e) => setF({ ...f, date_to: e.target.value })} className={`${inputCls} w-full mt-1`} /></label>
            </div>
            <select data-testid="export-agency" value={f.agency} onChange={(e) => setF({ ...f, agency: e.target.value })} className={`${inputCls} w-full`}><option value="">Toutes les agences</option><option value="creteil">Créteil</option><option value="bonneuil">Bonneuil</option></select>
            <select data-testid="export-status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className={`${inputCls} w-full`}><option value="">Tous les statuts</option>{Object.entries(meta.statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <button data-testid="export-run" disabled={busy} onClick={run} className="w-full inline-flex items-center justify-center gap-2 bg-[#25333D] text-white py-3 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors disabled:opacity-60"><Download size={16} /> {busy ? "Génération…" : "Télécharger le CSV"}</button>
            <p className="text-[11px] text-[#53616B]">CSV séparateur « ; », encodage UTF-8 (compatible Excel). Chaque export est journalisé.</p>
          </div>
        </Card>
        <Card className="lg:col-span-7 p-0" testId="export-log">
          <h2 className="font-clash text-xl font-semibold px-5 pt-5">Derniers exports</h2>
          <ul className="mt-3 divide-y divide-[#25333D]/5">
            {log.map((l) => <li key={l.id} data-testid="export-log-row" className="px-5 py-3 text-sm flex flex-wrap gap-x-4 gap-y-1"><span className="text-[#53616B]">{fmt(l.at)}</span><b>{l.target}</b><span>{l.user}</span><span className="text-xs text-[#53616B]">{Object.entries(l.meta || {}).map(([k, v]) => `${k}: ${v}`).join(" · ")}</span></li>)}
            {log.length === 0 && <li className="px-5 py-8 text-center text-[#53616B]">Aucun export pour le moment.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
