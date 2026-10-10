import { Reveal } from "@/components/gsr/Reveal";

export const Label = ({ children, light }) => (
  <span className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-medium ${light ? "text-white/70" : "text-[#53616B]"}`}>
    <span className="h-2 w-2 bg-[#F29A58]" /> {children}
  </span>
);

export const PageHero = ({ label, title, text, image, testId }) => (
  <section data-testid={testId} className="relative bg-[#25333D] text-white overflow-hidden">
    {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
    <div className="absolute inset-0 bg-gradient-to-t from-[#25333D] via-[#25333D]/70 to-transparent" />
    <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-40 pb-20 lg:pb-28">
      <Reveal><Label light>{label}</Label></Reveal>
      <Reveal delay={0.1}><h1 className="mt-6 font-clash font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1] max-w-4xl">{title}</h1></Reveal>
      {text && <Reveal delay={0.2}><p className="mt-6 max-w-2xl text-white/70 text-base md:text-lg leading-relaxed">{text}</p></Reveal>}
    </div>
  </section>
);

export const Section = ({ children, tone = "white", id, className = "" }) => {
  const bg = { white: "bg-white", cream: "bg-[#FFF4EA]", dark: "bg-[#25333D] text-white" }[tone];
  return <section id={id} className={`${bg} py-20 lg:py-28 ${className}`}><div className="max-w-7xl mx-auto px-6 lg:px-10">{children}</div></section>;
};

export const Btn = ({ children, onClick, testId, ghost, to, as: As }) => {
  const cls = ghost
    ? "border border-[#F29A58] text-[#F29A58] px-6 py-3 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors inline-block"
    : "bg-[#25333D] text-white px-7 py-4 text-sm font-semibold hover:bg-[#F29A58] hover:text-[#25333D] transition-colors inline-block";
  if (As) return <As to={to} data-testid={testId} className={cls}>{children}</As>;
  return <button data-testid={testId} onClick={onClick} className={cls}>{children}</button>;
};
