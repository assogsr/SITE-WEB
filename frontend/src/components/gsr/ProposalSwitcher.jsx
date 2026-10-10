import { Link, useLocation } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

const ITEMS = [
  { to: "/proposition-1", label: "1" },
  { to: "/proposition-2", label: "2" },
  { to: "/proposition-3", label: "3" },
];

export const ProposalSwitcher = () => {
  const { pathname } = useLocation();
  return (
    <div
      data-testid="proposal-switcher"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 rounded-full bg-[#25333D]/95 backdrop-blur-md px-2 py-2 shadow-2xl ring-1 ring-white/10"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <Link
        to="/propositions"
        data-testid="switcher-back-link"
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        <LayoutGrid size={14} /> <span className="hidden sm:inline">Propositions</span>
      </Link>
      {ITEMS.map((i) => (
        <Link
          key={i.to}
          to={i.to}
          data-testid={`switcher-link-${i.label}`}
          className={`h-8 w-8 grid place-items-center rounded-full text-xs font-semibold transition-colors ${
            pathname === i.to ? "bg-[#F29A58] text-[#25333D]" : "text-white/80 hover:bg-white/10"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </div>
  );
};
