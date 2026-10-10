import { useEffect, useState } from "react";
import { toast } from "sonner";
import { crm, useAuth, can } from "@/crm/auth";
import { PageTitle, fmt, Card, inputCls } from "@/crm/CrmLayout";
import { apiError } from "@/lib/api";

const ST = { brouillon: "Brouillon", en_attente: "En attente de validation", publie: "Publié", refuse: "Refusé" };

export default function Contenus() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ title: "", cat: "Actualités", body: "" });
  const load = () => crm.get("/crm/articles").then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);
  const create = async (e) => { e.preventDefault(); try { await crm.post("/crm/articles", f); setF({ title: "", cat: "Actualités", body: "" }); toast.success("Brouillon créé"); load(); } catch (x) { toast.error(apiError(x)); } };
  const setStatus = async (id, status) => { try { await crm.patch(`/crm/articles/${id}`, null, { params: { status } }); load(); } catch (x) { toast.error(apiError(x)); } };
  const direction = can(user, "direction");
  return (
    <div data-testid="crm-contenus">
      <PageTitle label="Contenus" title="Actualités du site" />
      <p className="mb-5 text-sm text-[#53616B]">L'éditeur rédige et soumet ; seule la Direction publie ou refuse.</p>
      <div className="grid lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-7 p-0">
          <ul className="divide-y divide-[#25333D]/5">
            {rows.map((a) => (
              <li key={a.id} data-testid={`article-${a.id}`} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-[11px] uppercase tracking-widest text-[#F29A58]">{a.cat}</p><h2 className="font-clash text-xl font-semibold">{a.title}</h2><p className="text-xs text-[#53616B]">{a.author} · {fmt(a.created_at)}</p></div>
                  <span data-testid="article-status" className="text-[11px] uppercase tracking-wider font-semibold bg-[#F6F3EE] px-2.5 py-1">{ST[a.status]}</span>
                </div>
                <p className="mt-3 text-sm">{a.body}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {a.status === "brouillon" && <button data-testid="article-submit" onClick={() => setStatus(a.id, "en_attente")} className="border border-[#25333D] px-3 py-1.5 font-semibold hover:bg-[#25333D] hover:text-white">Soumettre à la Direction</button>}
                  {direction && a.status === "en_attente" && <><button data-testid="article-publish" onClick={() => setStatus(a.id, "publie")} className="bg-[#F29A58] px-3 py-1.5 font-semibold">Publier</button><button data-testid="article-reject" onClick={() => setStatus(a.id, "refuse")} className="border px-3 py-1.5">Refuser</button></>}
                  {!direction && a.status === "en_attente" && <button data-testid="article-publish-forbidden" onClick={() => setStatus(a.id, "publie")} className="border px-3 py-1.5 text-[#53616B]">Publier (réservé Direction)</button>}
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="lg:col-span-5" testId="article-form">
          <h2 className="font-clash text-xl font-semibold">Nouvel article</h2>
          <form onSubmit={create} className="mt-4 space-y-3">
            <input data-testid="article-title-input" required placeholder="Titre" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`${inputCls} w-full`} />
            <select data-testid="article-cat-select" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })} className={`${inputCls} w-full`}>{["Actualités", "Prévention", "Mobilité", "Agences"].map((c) => <option key={c}>{c}</option>)}</select>
            <textarea data-testid="article-body-input" required rows={6} placeholder="Texte de l'article" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className={`${inputCls} w-full`} />
            <button data-testid="article-create" className="w-full bg-[#25333D] text-white py-3 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors">Enregistrer le brouillon</button>
          </form>
        </Card>
      </div>
    </div>
  );
}
