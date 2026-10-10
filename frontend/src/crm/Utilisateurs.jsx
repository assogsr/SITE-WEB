import { useEffect, useState } from "react";
import { toast } from "sonner";
import { crm } from "@/crm/auth";
import { PageTitle, Card, inputCls, AGENCY_LABEL } from "@/crm/CrmLayout";
import { apiError } from "@/lib/api";

export default function Utilisateurs() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ name: "", email: "", role: "accueil", agency: "creteil", password: "" });
  const load = () => crm.get("/crm/users").then((r) => setRows(r.data)).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const create = async (e) => {
    e.preventDefault();
    try { await crm.post("/crm/users", { ...f, agency: ["direction", "editeur"].includes(f.role) ? null : f.agency }); toast.success("Compte créé"); setF({ ...f, name: "", email: "", password: "" }); load(); } catch (x) { toast.error(apiError(x)); }
  };
  const patch = async (u, body) => { try { await crm.patch(`/crm/users/${u.id}`, body); toast.success(body.active === false ? "Compte désactivé" : body.active === true ? "Compte réactivé" : "Sessions révoquées"); load(); } catch (x) { toast.error(apiError(x)); } };
  return (
    <div data-testid="crm-utilisateurs">
      <PageTitle label="Paramètres" title="Utilisateurs & rôles" />
      <div className="grid lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-7 p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]"><thead className="text-left text-[11px] uppercase tracking-widest text-[#53616B] border-b border-[#25333D]/10"><tr><th className="px-5 py-3 font-medium">Nom</th><th className="px-5 py-3 font-medium">Rôle</th><th className="px-5 py-3 font-medium">Agence</th><th className="px-5 py-3 font-medium">État</th><th className="px-5 py-3" /></tr></thead>
            <tbody className="divide-y divide-[#25333D]/5">{rows.map((u) => (
              <tr key={u.id} data-testid={`user-row-${u.role}`} className={u.active === false ? "opacity-60" : ""}>
                <td className="px-5 py-3"><b>{u.name}</b><br /><span className="text-xs text-[#53616B]">{u.email}</span></td>
                <td className="px-5 py-3">{u.role_label}</td>
                <td className="px-5 py-3">{u.agency ? AGENCY_LABEL[u.agency] : "Toutes"}</td>
                <td className="px-5 py-3"><span data-testid="user-active-badge" className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 ${u.active === false ? "bg-rose-100 text-rose-900" : "bg-emerald-100 text-emerald-900"}`}>{u.active === false ? "Désactivé" : "Actif"}</span></td>
                <td className="px-5 py-3 text-xs whitespace-nowrap">
                  <button data-testid="user-toggle-active" onClick={() => patch(u, { active: u.active === false })} className="underline hover:text-[#F29A58] mr-3">{u.active === false ? "Réactiver" : "Désactiver"}</button>
                  <button data-testid="user-revoke" onClick={() => patch(u, { revoke_sessions: true })} className="underline hover:text-[#F29A58]">Révoquer sessions</button>
                </td>
              </tr>
            ))}</tbody></table>
        </Card>
        <Card className="lg:col-span-5" testId="user-form">
          <h2 className="font-clash text-xl font-semibold">Nouveau compte</h2>
          <form onSubmit={create} className="mt-4 space-y-3">
            <input data-testid="user-name-input" required placeholder="Nom" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={`${inputCls} w-full`} />
            <input data-testid="user-email-input" required type="email" placeholder="E-mail" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={`${inputCls} w-full`} />
            <div className="grid grid-cols-2 gap-2">
              <select data-testid="user-role-select" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className={inputCls}><option value="direction">Direction</option><option value="responsable">Responsable d'agence</option><option value="accueil">Accueil</option><option value="editeur">Éditeur</option></select>
              <select data-testid="user-agency-select" value={f.agency} onChange={(e) => setF({ ...f, agency: e.target.value })} className={inputCls} disabled={["direction", "editeur"].includes(f.role)}><option value="creteil">Créteil</option><option value="bonneuil">Bonneuil</option></select>
            </div>
            <input data-testid="user-password-input" required minLength={8} type="password" placeholder="Mot de passe (8 car. min.)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={`${inputCls} w-full`} />
            <button data-testid="user-create" className="w-full bg-[#25333D] text-white py-3 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors">Créer le compte</button>
          </form>
        </Card>
      </div>
    </div>
  );
}
