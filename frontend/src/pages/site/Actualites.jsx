import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { PageHero, Section, Label } from "@/components/site/Page";
import { Reveal } from "@/components/gsr/Reveal";
import { NEWS, NEWS_BODY, IMG } from "@/data/gsr";
import { getArticles } from "@/lib/api";

const CAT_IMG = { Prévention: IMG.prevention, Mobilité: IMG.femmeConduite, Agences: IMG.leconMoniteur, Actualités: IMG.groupe };
const fmtPub = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "");

const usePublished = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => { getArticles().then(setRows).catch(() => setRows([])); }, []);
  return rows;
};

export default function Actualites() {
  const { id } = useParams();
  const published = usePublished();
  if (id) {
    const n = NEWS.find((x) => x.id === id);
    const a = published.find((x) => x.id === id);
    if (!n && !a) return published.length ? <Navigate to="/actualites" replace /> : null;
    const item = n ? { ...n, body: NEWS_BODY[n.id], fiction: true } : { ...a, image: CAT_IMG[a.cat] || IMG.groupe, date: fmtPub(a.published_at), body: a.body, fiction: false };
    return (
      <div data-testid={`news-page-${item.id}`}>
        <PageHero testId="news-hero" label={`Actualités · ${item.cat}`} title={item.title} image={item.image} text={item.date} />
        <Section>
          <div className="max-w-3xl">
            <p className="text-lg leading-relaxed whitespace-pre-line" data-testid="news-body">{item.body}</p>
            <p className="mt-10 text-xs text-[#53616B]">{item.fiction ? "Actualité fictive — exemple de contenu pour la démonstration." : `Publié par ${item.author} — validé par la Direction.`}</p>
            <Link to="/actualites" data-testid="news-back-link" className="mt-8 inline-block font-semibold hover:text-[#F29A58]">← Toutes les actualités</Link>
          </div>
        </Section>
      </div>
    );
  }
  const Cardz = ({ n, i }) => (
    <Reveal delay={i * 0.05}>
      <Link to={`/actualites/${n.id}`} data-testid={`news-card-${n.id}`} className="group block bg-white h-full">
        <div className="aspect-[4/3] overflow-hidden"><img src={n.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
        <div className="p-6">
          <div className="flex items-center gap-3 text-xs text-[#53616B]"><span className="uppercase tracking-widest border border-[#F29A58] px-2 py-1 text-[#25333D]">{n.cat}</span>{n.date}</div>
          <h2 className="mt-4 font-clash text-2xl font-medium group-hover:text-[#F29A58] transition-colors">{n.title}</h2>
        </div>
      </Link>
    </Reveal>
  );
  return (
    <div data-testid="actualites-page">
      <PageHero testId="actualites-hero" label="Actualités" title="Sur le terrain." image={IMG.groupe} text="Interventions, sessions, événements : la vie de l'association au fil des semaines." />
      {published.length > 0 && (
        <Section>
          <Label>Publiées par l'équipe</Label>
          <div className="mt-8 grid md:grid-cols-3 gap-6" data-testid="news-published-grid">
            {published.map((a, i) => <Cardz key={a.id} i={i} n={{ ...a, image: CAT_IMG[a.cat] || IMG.groupe, date: fmtPub(a.published_at) }} />)}
          </div>
        </Section>
      )}
      <Section tone="cream">
        <Label>Exemples de contenu</Label>
        <div className="mt-8 grid md:grid-cols-3 gap-6">{NEWS.map((n, i) => <Cardz key={n.id} n={n} i={i} />)}</div>
        <p className="mt-8 text-xs text-[#53616B]">Actualités fictives — exemples de contenu.</p>
      </Section>
    </div>
  );
}
