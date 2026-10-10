import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { RdvForm } from "@/components/gsr/RdvForm";

export const RdvDialog = ({ open, onOpenChange, defaultAgency = "creteil", defaultType = "rendez-vous", fontClass = "" }) => {
  const [done, setDone] = useState(null);
  const close = (v) => {
    onOpenChange(v);
    if (!v) setDone(null);
  };
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent data-testid="rdv-dialog" className={`max-w-lg bg-[#FFF4EA] border-0 rounded-2xl text-[#25333D] max-h-[92vh] overflow-y-auto ${fontClass}`}>
        {done ? (
          <div data-testid="rdv-confirmation" className="py-6 text-center space-y-4">
            <CheckCircle2 className="mx-auto text-[#F29A58]" size={44} />
            <h3 className="text-2xl font-semibold">Demande enregistrée</h3>
            <p className="text-[#53616B]">Référence de votre dossier</p>
            <p data-testid="rdv-reference" className="break-all text-xl font-mono tracking-wider bg-white rounded-xl py-3">{done.reference}</p>
            {done.creneau && <p data-testid="rdv-creneau" className="text-sm">Créneau réservé : {new Date(done.creneau.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {done.creneau.time}</p>}
            {done.rappel_date && <p data-testid="rdv-rappel" className="text-sm">Rappel souhaité : {new Date(done.rappel_date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {done.rappel_time}</p>}
            <p className="text-xs text-[#53616B]">Conservez cette référence pour suivre votre demande. Démonstration : aucune donnée n'est transmise à GSR.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Votre demande</DialogTitle>
              <DialogDescription className="text-[#53616B]">Choisissez votre agence, nous revenons vers vous rapidement.</DialogDescription>
            </DialogHeader>
            <RdvForm defaultAgency={defaultAgency} defaultType={defaultType} onDone={(_, d) => setDone(d)} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
