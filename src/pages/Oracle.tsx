import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth/useAuth";
import { Brain, Zap, Loader2, TrendingUp, Shield, Target, ChevronDown, X, Calendar, History, Trash2, Clock, Coins, LogIn, ImagePlus, Camera } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";

type Prediction = {
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchDate: string;
  kickoffTime: string;
  predictedScore: string;
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  likeliness: string;
  prediction: string;
  expectedGoals: number;
  expectedCorners: number;
  reasoning: string;
};

type SearchHistoryItem = {
  id: string;
  query: string | null;
  mode: string;
  legs: number | null;
  leagues: string[] | null;
  goal_filter: string | null;
  corner_filter: string | null;
  btts_filter: string | null;
  double_chance_filter: string | null;
  safe_only: boolean;
  date_from: string | null;
  date_to: string | null;
  predictions: Prediction[] | null;
  advice: string | null;
  created_at: string;
};

const LEAGUES = [
  "English Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1",
  "Eredivisie", "Primeira Liga", "Scottish Premiership", "Championship",
  "MLS", "A-League", "J-League", "K-League", "Chinese Super League",
  "Saudi Pro League", "CAF Champions League", "PSL (South Africa)",
  "NFD (South Africa)", "Copa Libertadores", "Copa Sudamericana",
  "UEFA Champions League", "UEFA Europa League", "UEFA Conference League",
  "World Cup Qualifiers", "AFCON Qualifiers", "International Friendlies",
  "League One (England)", "League Two (England)", "Serie B", "2. Bundesliga",
  "Ligue 2", "Belgian Pro League", "Swiss Super League", "Turkish Super Lig",
  "Greek Super League", "Russian Premier League", "Ukrainian Premier League",
  "Brazilian Serie A", "Argentine Liga Profesional", "Mexican Liga MX",
  "Women's Super League", "NWSL", "Copa America", "Euros",
];

const AUTO_PICK_COST = 2.5;
const IMAGE_COST = 5;

const Oracle = () => {
  const { currentUser, userRole } = useAuth();
  const [query, setQuery] = useState("");
  const [userBalance, setUserBalance] = useState<number>(0);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [safeOnly, setSafeOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("auto_pick");
  const [legs, setLegs] = useState("5");
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(["All"]);
  const [goalFilter, setGoalFilter] = useState("any");
  const [cornerFilter, setCornerFilter] = useState("any");
  const [bttsFilter, setBttsFilter] = useState("any");
  const [doubleChanceFilter, setDoubleChanceFilter] = useState("any");
  const [leagueOpen, setLeagueOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return format(d, "yyyy-MM-dd");
  });
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Image prediction state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageQuery, setImageQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image filter state
  const [imgGoalFilter, setImgGoalFilter] = useState("any");
  const [imgCornerFilter, setImgCornerFilter] = useState("any");
  const [imgBttsFilter, setImgBttsFilter] = useState("any");
  const [imgDoubleChanceFilter, setImgDoubleChanceFilter] = useState("any");
  const [imgSafeOnly, setImgSafeOnly] = useState(false);

  const currentCost = activeTab === "image" ? IMAGE_COST : AUTO_PICK_COST;

  const fetchHistory = async () => {
    if (!currentUser) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from("oracle_searches" as any)
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setHistory((data as any[]) || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const saveSearch = async (preds: Prediction[], adviceText: string, imageMode = false) => {
    if (!currentUser) return;
    try {
      await supabase.from("oracle_searches" as any).insert({
        user_id: currentUser.id,
        query: (imageMode ? imageQuery : query) || (imageMode ? "Image prediction" : null),
        mode: imageMode ? "image" : "auto_pick",
        legs: parseInt(legs),
        leagues: selectedLeagues.includes("All") ? null : selectedLeagues,
        goal_filter: (imageMode ? imgGoalFilter : goalFilter) !== "any" ? (imageMode ? imgGoalFilter : goalFilter) : null,
        corner_filter: (imageMode ? imgCornerFilter : cornerFilter) !== "any" ? (imageMode ? imgCornerFilter : cornerFilter) : null,
        btts_filter: (imageMode ? imgBttsFilter : bttsFilter) !== "any" ? (imageMode ? imgBttsFilter : bttsFilter) : null,
        double_chance_filter: (imageMode ? imgDoubleChanceFilter : doubleChanceFilter) !== "any" ? (imageMode ? imgDoubleChanceFilter : doubleChanceFilter) : null,
        safe_only: imageMode ? imgSafeOnly : safeOnly,
        date_from: dateFrom,
        date_to: dateTo,
        predictions: preds as any,
        advice: adviceText || null,
      } as any);
    } catch (err) {
      console.error("Failed to save search:", err);
    }
  };

  const deleteHistory = async (id: string) => {
    try {
      await supabase.from("oracle_searches" as any).delete().eq("id", id);
      setHistory(prev => prev.filter(h => h.id !== id));
      toast.success("Search deleted");
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const loadFromHistory = (item: SearchHistoryItem) => {
    setPredictions(item.predictions || []);
    setAdvice(item.advice || "");
    setShowHistory(false);
    toast.success("Loaded from history");
  };

  useEffect(() => {
    if (showHistory && currentUser) fetchHistory();
  }, [showHistory, currentUser]);

  const fetchBalance = async () => {
    if (!currentUser) return;
    const { data } = await supabase.from("profiles").select("credit_balance").eq("id", currentUser.id).single();
    if (data) setUserBalance(data.credit_balance || 0);
  };

  useEffect(() => {
    if (currentUser) fetchBalance();
  }, [currentUser]);

  const chargeUser = async (cost: number) => {
    if (!currentUser) return false;
    try {
      const { error } = await supabase.rpc("charge_oracle_search" as any, {
        p_user_id: currentUser.id,
        p_cost: cost,
      });
      if (error) throw error;
      
      if (userRole === "buyer") {
        await supabase
          .from("profiles")
          .update({ loyalty_points: (currentUser.loyaltyPoints || 0) + 1 })
          .eq("id", currentUser.id);
      }
      
      setUserBalance(prev => prev - cost);
      return true;
    } catch (err: any) {
      console.error("Charge error:", err);
      toast.error(err.message || "Failed to charge. Check your balance.");
      return false;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImagePredict = async () => {
    if (!currentUser) {
      toast.error("Please log in to use the Oracle");
      return;
    }
    if (!imageFile || !imagePreview) {
      toast.error("Please upload an image of upcoming games");
      return;
    }
    if (userBalance < IMAGE_COST) {
      toast.error(`Insufficient balance. You need at least R${IMAGE_COST}. Please top up your wallet.`);
      return;
    }

    setLoading(true);
    setPredictions([]);
    setAdvice("");

    try {
      const charged = await chargeUser(IMAGE_COST);
      if (!charged) return;

      const { data, error } = await supabase.functions.invoke("oracle-predict", {
        body: {
          mode: "image",
          imageBase64: imagePreview,
          query: imageQuery,
          legs: parseInt(legs),
          safeOnly: imgSafeOnly,
          goalFilter: imgGoalFilter,
          cornerFilter: imgCornerFilter,
          bttsFilter: imgBttsFilter,
          doubleChanceFilter: imgDoubleChanceFilter,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const preds = data?.predictions || [];
      const adviceText = data?.advice || "";
      setPredictions(preds);
      setAdvice(adviceText);

      if (preds.length > 0) {
        await saveSearch(preds, adviceText, true);
      }
      
      clearImage();
    } catch (err: any) {
      console.error("Oracle image error:", err);
      toast.error(err.message || "Failed to get predictions from image");
      fetchBalance();
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!currentUser) {
      toast.error("Please log in to use the Oracle");
      return;
    }
    if (userBalance < AUTO_PICK_COST) {
      toast.error(`Insufficient balance. You need at least R${AUTO_PICK_COST} to use the Oracle. Please top up your wallet.`);
      return;
    }

    setLoading(true);
    setPredictions([]);
    setAdvice("");

    try {
      const charged = await chargeUser(AUTO_PICK_COST);
      if (!charged) return;

      const { data, error } = await supabase.functions.invoke("oracle-predict", {
        body: {
          query,
          mode: "auto_pick",
          legs: parseInt(legs),
          safeOnly,
          leagues: selectedLeagues.includes("All") ? [] : selectedLeagues,
          goalFilter,
          cornerFilter,
          bttsFilter,
          doubleChanceFilter,
          dateFrom,
          dateTo,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const preds = data?.predictions || [];
      const adviceText = data?.advice || "";
      setPredictions(preds);
      setAdvice(adviceText);

      if (preds.length > 0) {
        await saveSearch(preds, adviceText);
      }
    } catch (err: any) {
      console.error("Oracle error:", err);
      toast.error(err.message || "Failed to get predictions");
      fetchBalance();
    } finally {
      setLoading(false);
    }
  };

  const getLikelinessColor = (likeliness: string) => {
    switch (likeliness?.toLowerCase()) {
      case "very high": return "bg-primary/20 text-primary border-primary/30";
      case "high": return "bg-primary/15 text-primary border-primary/20";
      case "medium": return "bg-accent/20 text-accent border-accent/30";
      case "low": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getBarColor = (pct: number) => {
    if (pct >= 60) return "bg-primary";
    if (pct >= 40) return "bg-accent";
    return "bg-muted-foreground/40";
  };

  const toggleLeague = (league: string) => {
    if (league === "All") {
      setSelectedLeagues(["All"]);
      return;
    }
    setSelectedLeagues(prev => {
      const without = prev.filter(l => l !== "All");
      if (without.includes(league)) {
        const next = without.filter(l => l !== league);
        return next.length === 0 ? ["All"] : next;
      }
      return [...without, league];
    });
  };

  const removeLeague = (league: string) => {
    setSelectedLeagues(prev => {
      const next = prev.filter(l => l !== league);
      return next.length === 0 ? ["All"] : next;
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Oracle</h1>
              <p className="text-sm text-muted-foreground">AI-powered football predictions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser && (
              <Badge variant="outline" className="gap-1 text-sm py-1.5 px-3">
                <Coins className="h-3.5 w-3.5" />
                R{userBalance.toFixed(2)}
              </Badge>
            )}
            {currentUser && (
              <Button
                variant={showHistory ? "default" : "outline"}
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                History
              </Button>
            )}
          </div>
        </div>

        {/* Login Gate */}
        {!currentUser && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <Brain className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Log in to use the Oracle</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get AI-powered predictions starting from R{AUTO_PICK_COST}. Punters earn 1 BC point per search!
              </p>
              <Link to="/auth/login">
                <Button className="gap-2">
                  <LogIn className="h-4 w-4" /> Log In
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Search History Panel */}
        {showHistory && (
          <Card className="mb-6 border-border bg-card">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Search History
              </h3>
              {historyLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No search history yet</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {history.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                      onClick={() => loadFromHistory(item)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.mode === "image" ? "📷 Image" : `Auto ${item.legs}`}
                          </Badge>
                          {item.goal_filter && item.goal_filter !== "any" && (
                            <Badge variant="secondary" className="text-xs">{item.goal_filter}</Badge>
                          )}
                          {item.btts_filter && item.btts_filter !== "any" && (
                            <Badge variant="secondary" className="text-xs">{item.btts_filter}</Badge>
                          )}
                          {item.corner_filter && item.corner_filter !== "any" && (
                            <Badge variant="secondary" className="text-xs">{item.corner_filter}</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {(item.predictions as any)?.length || 0} predictions
                          </span>
                        </div>
                        <p className="text-sm text-foreground truncate">
                          {item.query || (item.mode === "image" ? "Image prediction" : "Auto Pick")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(item.created_at), "MMM d, yyyy HH:mm")}
                          {item.date_from && ` • ${item.date_from} → ${item.date_to}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={e => { e.stopPropagation(); deleteHistory(item.id); }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs: Auto Pick vs Image Upload */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="auto_pick" className="flex-1 gap-2">
              <Zap className="h-4 w-4" /> Auto Pick
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">R{AUTO_PICK_COST}</Badge>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1 gap-2">
              <Camera className="h-4 w-4" /> Image Upload
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">R{IMAGE_COST}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Auto Pick Tab */}
          <TabsContent value="auto_pick">
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">Number of legs:</Label>
                  <Select value={legs} onValueChange={setLegs}>
                    <SelectTrigger className="w-24 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Optional: additional instructions for AI..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="bg-secondary border-border flex-1"
                  />
                </div>

                {/* Date Range */}
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm text-muted-foreground">From:</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="w-[150px] h-9 bg-secondary border-border text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">To:</Label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="w-[150px] h-9 bg-secondary border-border text-sm"
                    />
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-3 items-center">
                  <Popover open={leagueOpen} onOpenChange={setLeagueOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 h-9 min-w-[160px] justify-between">
                        <span className="truncate text-left">
                          {selectedLeagues.includes("All") ? "All Leagues" : `${selectedLeagues.length} league${selectedLeagues.length > 1 ? "s" : ""}`}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0 max-h-80 overflow-hidden" align="start">
                      <div className="p-2 border-b border-border">
                        <button
                          onClick={() => { setSelectedLeagues(["All"]); }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedLeagues.includes("All") ? "bg-primary/15 text-primary font-medium" : "hover:bg-secondary text-foreground"}`}
                        >
                          All Leagues
                        </button>
                      </div>
                      <div className="overflow-y-auto max-h-60 p-2 space-y-0.5">
                        {LEAGUES.map(league => (
                          <label key={league} className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-secondary cursor-pointer text-sm">
                            <Checkbox
                              checked={selectedLeagues.includes(league)}
                              onCheckedChange={() => toggleLeague(league)}
                              className="h-4 w-4"
                            />
                            <span className="text-foreground">{league}</span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Select value={goalFilter} onValueChange={setGoalFilter}>
                    <SelectTrigger className="w-[160px] h-9 bg-secondary border-border text-sm">
                      <SelectValue placeholder="Goals filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any goals</SelectItem>
                      <SelectItem value="over 0.5 goals">Over 0.5</SelectItem>
                      <SelectItem value="over 1.5 goals">Over 1.5</SelectItem>
                      <SelectItem value="over 2.5 goals">Over 2.5</SelectItem>
                      <SelectItem value="over 3.5 goals">Over 3.5</SelectItem>
                      <SelectItem value="over 4.5 goals">Over 4.5</SelectItem>
                      <SelectItem value="under 1.5 goals">Under 1.5</SelectItem>
                      <SelectItem value="under 2.5 goals">Under 2.5</SelectItem>
                      <SelectItem value="under 3.5 goals">Under 3.5</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={cornerFilter} onValueChange={setCornerFilter}>
                    <SelectTrigger className="w-[160px] h-9 bg-secondary border-border text-sm">
                      <SelectValue placeholder="Corners filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any corners</SelectItem>
                      <SelectItem value="over 7.5 corners">Over 7.5</SelectItem>
                      <SelectItem value="over 8.5 corners">Over 8.5</SelectItem>
                      <SelectItem value="over 9.5 corners">Over 9.5</SelectItem>
                      <SelectItem value="over 10.5 corners">Over 10.5</SelectItem>
                      <SelectItem value="over 11.5 corners">Over 11.5</SelectItem>
                      <SelectItem value="under 8.5 corners">Under 8.5</SelectItem>
                      <SelectItem value="under 9.5 corners">Under 9.5</SelectItem>
                      <SelectItem value="under 10.5 corners">Under 10.5</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={bttsFilter} onValueChange={setBttsFilter}>
                    <SelectTrigger className="w-[160px] h-9 bg-secondary border-border text-sm">
                      <SelectValue placeholder="BTTS filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any BTTS</SelectItem>
                      <SelectItem value="btts yes">BTTS Yes</SelectItem>
                      <SelectItem value="btts no">BTTS No</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={doubleChanceFilter} onValueChange={setDoubleChanceFilter}>
                    <SelectTrigger className="w-[160px] h-9 bg-secondary border-border text-sm">
                      <SelectValue placeholder="Double Chance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any result</SelectItem>
                      <SelectItem value="1X">1X (Home or Draw)</SelectItem>
                      <SelectItem value="X2">X2 (Draw or Away)</SelectItem>
                      <SelectItem value="12">12 (Home or Away)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 ml-auto">
                    <Shield className="h-4 w-4 text-primary" />
                    <Label htmlFor="safe" className="text-sm cursor-pointer">Safe bets only</Label>
                    <Switch id="safe" checked={safeOnly} onCheckedChange={setSafeOnly} />
                  </div>
                </div>

                {/* Selected leagues tags */}
                {!selectedLeagues.includes("All") && selectedLeagues.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLeagues.map(l => (
                      <Badge key={l} variant="secondary" className="gap-1 pr-1 text-xs">
                        {l}
                        <button onClick={() => removeLeague(l)} className="ml-0.5 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <Button onClick={handlePredict} disabled={loading} className="w-full gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                  {loading ? "Oracle is thinking..." : `Auto Pick ${legs} Matches (R${AUTO_PICK_COST})`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Upload Tab */}
          <TabsContent value="image">
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a screenshot of upcoming games. The AI will identify teams, game types, and provide predictions.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {!imagePreview ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <ImagePlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload a picture of upcoming games</p>
                    <p className="text-xs text-muted-foreground mt-1">The AI will identify teams, game types, and provide predictions</p>
                  </button>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={imagePreview} alt="Uploaded games" className="w-full max-h-64 object-contain bg-secondary" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <Input
                  placeholder="Optional: additional instructions for AI..."
                  value={imageQuery}
                  onChange={e => setImageQuery(e.target.value)}
                  className="bg-secondary border-border"
                />

                {/* Image filters */}
                <div className="flex flex-wrap gap-3 items-center">
                  <Select value={imgGoalFilter} onValueChange={setImgGoalFilter}>
                    <SelectTrigger className="w-[160px] h-9 bg-secondary border-border text-sm">
                      <SelectValue placeholder="Goals filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any goals</SelectItem>
                      <SelectItem value="over 0.5 goals">Over 0.5</SelectItem>
                      <SelectItem value="over 1.5 goals">Over 1.5</SelectItem>
                      <SelectItem value="over 2.5 goals">Over 2.5</SelectItem>
                      <SelectItem value="over 3.5 goals">Over 3.5</SelectItem>
                      <SelectItem value="under 2.5 goals">Under 2.5</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={imgBttsFilter} onValueChange={setImgBttsFilter}>
                    <SelectTrigger className="w-[160px] h-9 bg-secondary border-border text-sm">
                      <SelectValue placeholder="BTTS filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any BTTS</SelectItem>
                      <SelectItem value="btts yes">BTTS Yes</SelectItem>
                      <SelectItem value="btts no">BTTS No</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={imgDoubleChanceFilter} onValueChange={setImgDoubleChanceFilter}>
                    <SelectTrigger className="w-[160px] h-9 bg-secondary border-border text-sm">
                      <SelectValue placeholder="Double Chance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any result</SelectItem>
                      <SelectItem value="1X">1X (Home or Draw)</SelectItem>
                      <SelectItem value="X2">X2 (Draw or Away)</SelectItem>
                      <SelectItem value="12">12 (Home or Away)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 ml-auto">
                    <Shield className="h-4 w-4 text-primary" />
                    <Label htmlFor="img-safe" className="text-sm cursor-pointer">Safe only</Label>
                    <Switch id="img-safe" checked={imgSafeOnly} onCheckedChange={setImgSafeOnly} />
                  </div>
                </div>

                <Button
                  onClick={handleImagePredict}
                  disabled={loading || !imagePreview}
                  className="w-full gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                  {loading ? "Oracle is analyzing image..." : `Predict from Image (R${IMAGE_COST})`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Advice */}
        {advice && (
          <Card className="mb-4 border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex gap-3 items-start">
              <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{advice}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {predictions.length > 0 && (
          <div className="space-y-3">
            {predictions.map((p, i) => (
              <Card key={i} className="border-border bg-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">{p.league}</span>
                      <span>•</span>
                      <span>{p.matchDate} {p.kickoffTime}</span>
                    </div>
                    <Badge className={`text-xs border ${getLikelinessColor(p.likeliness)}`}>
                      {p.likeliness}
                    </Badge>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{p.homeTeam}</p>
                        <p className="font-semibold text-foreground">{p.awayTeam}</p>
                      </div>
                      <div className="text-center px-4">
                        <div className="text-2xl font-bold text-primary">{p.predictedScore}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Predicted</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Home</div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full rounded-full ${getBarColor(p.homeWinPct)}`} style={{ width: `${p.homeWinPct}%` }} />
                        </div>
                        <div className="text-sm font-bold mt-1">{p.homeWinPct}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Draw</div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full rounded-full ${getBarColor(p.drawPct)}`} style={{ width: `${p.drawPct}%` }} />
                        </div>
                        <div className="text-sm font-bold mt-1">{p.drawPct}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Away</div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full rounded-full ${getBarColor(p.awayWinPct)}`} style={{ width: `${p.awayWinPct}%` }} />
                        </div>
                        <div className="text-sm font-bold mt-1">{p.awayWinPct}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-border pt-3">
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">Exp. Goals: <span className="text-foreground font-medium">{p.expectedGoals}</span></span>
                        <span className="text-muted-foreground">Exp. Corners: <span className="text-foreground font-medium">{p.expectedCorners}</span></span>
                      </div>
                      <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {p.prediction}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">{p.reasoning}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && predictions.length === 0 && !showHistory && (
          <div className="text-center py-16 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">Ask the Oracle</p>
            <p className="text-sm mt-1">Auto-pick matches or upload a picture of games for AI predictions</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Oracle;
