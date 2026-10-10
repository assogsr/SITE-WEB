import { IMG } from "@/data/gsr";

export const Logo = ({ className = "h-12", chip = false, testId = "gsr-logo" }) => (
  <span
    data-testid={testId}
    className={`inline-flex items-center ${chip ? "bg-white rounded-xl px-3 py-2" : ""}`}
  >
    <img
      src={IMG.logo}
      alt="GSR — Génération Sécurité Routière"
      className={`${className} w-auto ${chip ? "" : "mix-blend-multiply"}`}
    />
  </span>
);
