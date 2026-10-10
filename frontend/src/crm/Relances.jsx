import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { crm } from "@/crm/auth";
import { PageTitle, fmtD, Card, AGENCY_LABEL } from "@/crm/CrmLayout";

export default function Relances() {
  const [rows, setRows] = useState([]);
  const [all, setAll] = useState(false);
  const load = () => crm.get("/crm/relances", { params: { all } }).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [all]);
  const done = async (id) => { await crm.patch(`/crm/relances/${id}`, null, { params: { done: true } }); load(); };
  return (
    <div data-testid="crm-relances">
      <PageTitle label="Relances" title="À rappeler">
        <label className="text-sm flex items-center gap-2"><input data-testid="relances-show-all" type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> Afficher les relances effectuées</label>
      </PageTitle>
      <Card className="p-0">
        <ul className="divide-y divide-[#25333D]/5">
          {rows.map((r) => (
            <li key={r.id} data-testid={`relance-row-${r.id}`} className={`flex items-center gap-4 px-5 py-4 ${r.overdue ? "bg-[#FFF4EA]" : ""}`}>
              <button data-testid="relance-row-done" disabled={r.done} onClick={() => done(r.id)} className="disabled:opacity-40"><CheckCircle2 size={22} className={r.done ? "text-emerald-600" : "text-[#F29A58]"} /></button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold"><Link to={`/crm/prospects/${r.demande_id}`} className="hover:text-[#F29A58]">{r.name}</Link> <span className="font-mono text-xs text-[#53616B]">{r.reference}</span></p>
                <p className="text-sm text-[#53616B] truncate">{r.note} · {r.channel} · {AGENCY_LABEL[r.agency]}</p>
              </div>
              <span className={`text-sm font-semibold ${r.overdue ? "text-[#b4532a]" : ""}`}>{r.overdue && "En retard · "}{fmtD(r.due_date)}</span>
            </li>
          ))}
          {rows.length === 0 && <li className="px-5 py-10 text-center text-[#53616B]">Aucune relance en attente.</li>}
        </ul>
      </Card>
    </div>
  );
}
