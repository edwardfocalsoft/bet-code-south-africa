
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BadgeDollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BankDetailsFormProps {
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    branchCode: string;
    accountType: string;
  };
  setBankDetails: React.Dispatch<React.SetStateAction<{
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    branchCode: string;
    accountType: string;
  }>>;
  hasBankDetails: boolean;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const BankDetailsForm: React.FC<BankDetailsFormProps> = ({
  bankDetails,
  setBankDetails,
  hasBankDetails,
  isSaving,
  onSubmit
}) => {
  return (
    <Card className="betting-card mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BadgeDollarSign className="h-5 w-5 text-betting-green" />
          <CardTitle className="text-lg">Bank Account Details</CardTitle>
        </div>
        <CardDescription>
          Add your banking information to receive payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountHolder">Account Holder Name</Label>
              <Input
                id="accountHolder"
                value={bankDetails.accountHolder}
                onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                placeholder="Full name as per bank account"
                className="bg-betting-black border-betting-light-gray"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                placeholder="e.g. Standard Bank"
                className="bg-betting-black border-betting-light-gray"
                disabled={isSaving}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                placeholder="Your bank account number"
                className="bg-betting-black border-betting-light-gray"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchCode">Branch Code</Label>
              <Input
                id="branchCode"
                value={bankDetails.branchCode}
                onChange={(e) => setBankDetails({...bankDetails, branchCode: e.target.value})}
                placeholder="Branch code or sort code"
                className="bg-betting-black border-betting-light-gray"
                disabled={isSaving}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select
              value={bankDetails.accountType}
              onValueChange={(value) => setBankDetails({...bankDetails, accountType: value})}
              disabled={isSaving}
            >
              <SelectTrigger className="bg-betting-black border-betting-light-gray">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking / Current</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="bg-betting-green hover:bg-betting-green-dark"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                hasBankDetails ? "Update Bank Details" : "Save Bank Details"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BankDetailsForm;
