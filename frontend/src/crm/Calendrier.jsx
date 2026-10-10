import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { crm, useAuth, can } from "@/crm/auth";
import { PageTitle, TYPE_LABEL, fmtD, Card, inputCls, AGENCY_LABEL } from "@/crm/CrmLayout";

export default function Calendrier() {
  const { user } = useAuth();
  const [agency, setAgency] = useState(user.agency || "creteil");
  const [slots, setSlots] = useState([]);
  const load = () => crm.get("/crm/calendrier", { params: { agency } }).then((r) => setSlots(r.data));
  useEffect(() => { load(); }, [agency]);
  const days = [...new Set(slots.map((s) => s.date))];
  const setCap = async (s, cap) => { await crm.patch(`/crm/calendrier/${s.id}`, { capacity: cap }); toast.success("Capacité modifiée"); load(); };
  return (
    <div data-testid="crm-calendrier">
      <PageTitle label="Calendrier" title={`Rendez-vous · ${AGENCY_LABEL[agency]}`}>
        {!user.agency && <select data-testid="calendar-agency-select" value={agency} onChange={(e) => setAgency(e.target.value)} className={inputCls}><option value="creteil">Créteil</option><option value="bonneuil">Bonneuil</option></select>}
      </PageTitle>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {days.map((day) => (
          <Card key={day} testId={`calendar-day-${day}`}>
            <h2 className="font-clash text-lg font-semibold capitalize">{fmtD(day)}</h2>
            <ul className="mt-3 space-y-2">
              {slots.filter((s) => s.date === day).map((s) => (
                <li key={s.id} data-testid={`calendar-slot-${s.id}`} className={`p-3 text-sm ${s.booked ? "bg-[#FFF4EA]" : "bg-[#F6F3EE]"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{s.time}</span>
                    <span className="text-xs text-[#53616B]">{s.booked}/{s.capacity} {s.remaining === 0 && <b className="text-[#b4532a]">· complet</b>}</span>
                    {can(user, "direction", "responsable") && <div className="flex gap-1"><button data-testid="slot-cap-minus" onClick={() => setCap(s, Math.max(s.booked, s.capacity - 1))} className="w-6 h-6 border text-xs hover:bg-[#25333D] hover:text-white">−</button><button data-testid="slot-cap-plus" onClick={() => setCap(s, s.capacity + 1)} className="w-6 h-6 border text-xs hover:bg-[#25333D] hover:text-white">+</button></div>}
                  </div>
                  {s.demandes.map((d) => <Link key={d.id} to={`/crm/prospects/${d.id}`} className="block mt-2 text-xs hover:text-[#F29A58]"><b>{d.name}</b> · {TYPE_LABEL[d.type]} · <span className="font-mono">{d.reference}</span></Link>)}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
