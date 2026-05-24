import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ticket, TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth/useAuth";

const PROMPT_KEY = "tipster_share_prompt_shown";

const TipsterSharePromptDialog = () => {
  const [open, setOpen] = useState(false);
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || userRole !== "seller") return;

    const alreadyShown = sessionStorage.getItem(PROMPT_KEY);
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(PROMPT_KEY, "true");
    }, 3500);

    return () => clearTimeout(timer);
  }, [currentUser, userRole]);

  const handleShare = () => {
    setOpen(false);
    navigate("/seller/tickets/create");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-primary/20 bg-card">
        <div className="bg-gradient-to-br from-betting-green/20 via-primary/10 to-transparent p-6 pb-4 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-betting-green/15 border border-betting-green/25 mb-4">
            <Ticket className="h-8 w-8 text-betting-green" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-betting-green/10 border border-betting-green/20 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-betting-green" />
            <span className="text-xs font-semibold text-betting-green uppercase tracking-wide">Tipster</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Share your tickets and grow your following
          </h2>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Post your booking codes to climb the leaderboard, attract subscribers,
            and earn from every sale. The more you share, the more you earn.
          </p>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleShare}
              className="w-full bg-betting-green hover:bg-betting-green/90 text-white gap-2"
            >
              <Ticket className="h-4 w-4" /> Post a Ticket <ArrowRight className="h-4 w-4" />
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

export default TipsterSharePromptDialog;
