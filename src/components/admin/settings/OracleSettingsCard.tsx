import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Brain, Save } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

const OracleSettingsCard: React.FC = () => {
  const { settings, isLoading, isSaving, saveSettings } = useSystemSettings();
  const [price, setPrice] = useState("5");
  const [freeLimit, setFreeLimit] = useState("3");
  const [autoPickEnabled, setAutoPickEnabled] = useState(false);
  const [imageEnabled, setImageEnabled] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    setPrice((settings.oracle_price_per_scan ?? 5).toString());
    setFreeLimit((settings.oracle_free_daily_limit ?? 3).toString());
    setAutoPickEnabled(settings.oracle_auto_pick_enabled ?? false);
    setImageEnabled(settings.oracle_image_enabled ?? true);
  }, [settings, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    const fl = parseInt(freeLimit, 10);
    if (isNaN(p) || p < 0) return;
    if (isNaN(fl) || fl < 0) return;

    await saveSettings({
      oracle_price_per_scan: p,
      oracle_free_daily_limit: fl,
      oracle_auto_pick_enabled: autoPickEnabled,
      oracle_image_enabled: imageEnabled,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>Oracle Settings</CardTitle>
        </div>
        <CardDescription>
          Control Oracle pricing, free daily quota, and which prediction modes are available to users
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="oracle-price">Price per prediction scan (ZAR)</Label>
            <Input
              id="oracle-price"
              type="number"
              min="0"
              step="0.5"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Charged after a user uses up their free daily predictions
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="oracle-free">Free predictions per user per day</Label>
            <Input
              id="oracle-free"
              type="number"
              min="0"
              step="1"
              value={freeLimit}
              onChange={(e) => setFreeLimit(e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              How many Oracle scans each user gets free every day before being charged
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="oracle-auto" className="cursor-pointer">Enable Auto Pick mode</Label>
              <p className="text-xs text-muted-foreground">
                When off, the Auto Pick tab is hidden from users
              </p>
            </div>
            <Switch
              id="oracle-auto"
              checked={autoPickEnabled}
              onCheckedChange={setAutoPickEnabled}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="oracle-image" className="cursor-pointer">Enable Image Upload mode</Label>
              <p className="text-xs text-muted-foreground">
                When off, the Image Upload tab is hidden from users
              </p>
            </div>
            <Switch
              id="oracle-image"
              checked={imageEnabled}
              onCheckedChange={setImageEnabled}
              disabled={isSaving}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Oracle Settings
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OracleSettingsCard;