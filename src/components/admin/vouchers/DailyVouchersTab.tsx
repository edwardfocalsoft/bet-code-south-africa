
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Gift, Calendar } from "lucide-react";
import { useDailyVouchers } from "@/hooks/useDailyVouchers";
import { format } from "date-fns";

const DailyVouchersTab: React.FC = () => {
  const { vouchers, loading, createVoucher } = useDailyVouchers();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    value: 50,
    count: 5
  });

  const generateVoucherCode = () => {
    return 'DAILY' + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleCreateVouchers = async () => {
    try {
      setIsCreating(true);
      
      for (let i = 0; i < formData.count; i++) {
        await createVoucher({
          code: generateVoucherCode(),
          value: formData.value,
          drop_date: formData.date,
          drop_time: formData.time
        });
      }
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        value: 50,
        count: 5
      });
    } catch (error) {
      console.error('Error creating vouchers:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Daily Vouchers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Drop Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-betting-black border-betting-light-gray"
              />
            </div>
            
            <div>
              <Label htmlFor="time">Drop Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="bg-betting-black border-betting-light-gray"
              />
            </div>
            
            <div>
              <Label htmlFor="value">Voucher Value (R)</Label>
              <Input
                id="value"
                type="number"
                min="1"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 50 })}
                className="bg-betting-black border-betting-light-gray"
              />
            </div>
            
            <div>
              <Label htmlFor="count">Number of Vouchers</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="10"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 5 })}
                className="bg-betting-black border-betting-light-gray"
              />
            </div>
          </div>
          
          <Button
            onClick={handleCreateVouchers}
            disabled={isCreating}
            className="bg-betting-green hover:bg-betting-green-dark"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Vouchers...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create {formData.count} Vouchers for {format(new Date(formData.date), 'MMM dd, yyyy')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Today's Vouchers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vouchers created for today yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {vouchers.map((voucher, index) => (
                <Card key={voucher.id} className="betting-card">
                  <CardContent className="p-4 text-center">
                    <div className="mb-2">
                      <Badge variant={voucher.is_claimed ? "default" : "secondary"}>
                        Voucher #{index + 1}
                      </Badge>
                    </div>
                    
                    <div className="text-xl font-bold text-betting-green mb-2">
                      R{voucher.value}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      Code: {voucher.code}
                    </div>
                    
                    <Badge variant={voucher.is_claimed ? "default" : "outline"}>
                      {voucher.is_claimed ? "Claimed" : "Available"}
                    </Badge>
                    
                    {voucher.claim && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        by {voucher.claim.claimer_username}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyVouchersTab;
