import { Link, useParams, Navigate } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useRdv } from "@/components/site/Layout";
import { PageHero, Section, Label, Btn } from "@/components/site/Page";
import { AGENCIES, mapSrc, IMG } from "@/data/gsr";

const AgencyBlock = ({ a, full }) => {
  const open = useRdv();
  return (
    <article data-testid={`agency-block-${a.id}`} className="grid lg:grid-cols-12 gap-8 bg-white p-6 lg:p-10">
      <div className="lg:col-span-5">
        <Label>Agence</Label>
        <h2 className="mt-3 font-clash text-3xl lg:text-4xl font-semibold">{a.city}</h2>
        <ul className="mt-8 space-y-4">
          <li className="flex gap-4"><MapPin className="text-[#F29A58] shrink-0" /><span>{a.street}<br />{a.zip}</span></li>
          <li className="flex gap-4"><Phone className="text-[#F29A58] shrink-0" /><a href={`tel:${a.tel}`} data-testid={`agency-phone-${a.id}`} className="font-clash text-2xl hover:text-[#F29A58]">{a.phone}</a></li>
          <li className="flex gap-4"><Mail className="text-[#F29A58] shrink-0" /><a href={`mailto:${a.email}`} className="break-all hover:text-[#F29A58]">{a.email}</a></li>
          <li className="flex gap-4 text-[#53616B]"><Clock className="text-[#F29A58] shrink-0" />{a.hours}</li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Btn testId={`agency-rdv-${a.id}`} onClick={() => open(a.id, "rendez-vous")}>Rendez-vous à {a.city}</Btn>
          {!full && <Link to={`/agences/${a.id}`} data-testid={`agency-link-${a.id}`} className="border border-[#25333D] px-6 py-4 text-sm font-semibold hover:bg-[#25333D] hover:text-white transition-colors">Voir l'agence</Link>}
        </div>
      </div>
      <div className="lg:col-span-7 min-h-[320px] bg-[#FFF4EA]"><iframe title={`Carte ${a.city}`} data-testid={`agency-map-${a.id}`} src={mapSrc(a)} className="h-full w-full min-h-[320px] grayscale-[40%]" loading="lazy" /></div>
    </article>
  );
};

export default function Agences() {
  const { id } = useParams();
  if (id) {
    const a = AGENCIES.find((x) => x.id === id);
    if (!a) return <Navigate to="/agences" replace />;
    return (
      <div data-testid={`agency-page-${a.id}`}>
        <PageHero testId="agency-hero" label="Nos agences" title={a.name} image={a.image} text="Accueil, inscriptions, cours de code et départ des leçons de conduite." />
        <Section tone="cream"><AgencyBlock a={a} full /></Section>
        <Section>
          <div className="flex flex-wrap items-center justify-between gap-6"><p className="text-[#53616B]">Nous avons aussi une agence à {AGENCIES.find((x) => x.id !== a.id).city}.</p><Link to="/agences" data-testid="agency-back-link" className="font-semibold hover:text-[#F29A58]">← Toutes les agences</Link></div>
        </Section>
      </div>
    );
  }
  return (
    <div data-testid="agences-page">
      <PageHero testId="agences-hero" label="Nos agences" title="Deux adresses, une même exigence." image={IMG.leconMoniteur} text="Deux agences dans le Val-de-Marne pour vous accueillir, vous informer et vous former." />
      <Section tone="cream"><div className="space-y-6">{AGENCIES.map((a) => <AgencyBlock key={a.id} a={a} />)}</div></Section>
    </div>
  );
}
