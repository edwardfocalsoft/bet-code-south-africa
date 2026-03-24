import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth/useAuth";

const PROMO_KEY = "oracle_promo_shown";

const OraclePromoDialog = () => {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    // Show promo once per session after login
    const alreadyShown = sessionStorage.getItem(PROMO_KEY);
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(PROMO_KEY, "true");
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentUser]);

  const handleTryOracle = () => {
    setOpen(false);
    navigate("/oracle");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-primary/20 bg-card">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-betting-green/20 via-primary/10 to-transparent p-6 pb-4 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-betting-green/15 border border-betting-green/25 mb-4">
            <Brain className="h-8 w-8 text-betting-green" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-betting-green/10 border border-betting-green/20 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-betting-green" />
            <span className="text-xs font-semibold text-betting-green uppercase tracking-wide">Now 100% Free</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Try the BetCode Oracle
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Get AI-powered predictions on goals, corners, BTTS and more — completely free. Just pick your matches and let the Oracle do the rest!
          </p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-secondary/70">
              <div className="text-lg font-bold text-betting-green">Free</div>
              <div className="text-[10px] text-muted-foreground">No cost</div>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/70">
              <div className="text-lg font-bold text-betting-green">AI</div>
              <div className="text-[10px] text-muted-foreground">Smart picks</div>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/70">
              <div className="text-lg font-bold text-betting-green">Live</div>
              <div className="text-[10px] text-muted-foreground">Real fixtures</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleTryOracle}
              className="w-full bg-betting-green hover:bg-betting-green/90 text-white gap-2"
            >
              <Brain className="h-4 w-4" /> Use Oracle Now <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full text-muted-foreground text-sm"
            >
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OraclePromoDialog;
