
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, ShieldCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@/types";
import { format } from "date-fns";

interface SellersTableProps {
  sellers: User[];
  onApprove: (sellerId: string) => void;
  onSuspend: (sellerId: string) => void;
  onUnsuspend: (sellerId: string) => void;
  onVerify: (sellerId: string) => void;
  onUnverify: (sellerId: string) => void;
}

const SellersTable: React.FC<SellersTableProps> = ({
  sellers,
  onApprove,
  onSuspend,
  onUnsuspend,
  onVerify,
  onUnverify
}) => {
  if (sellers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tipsters found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipster</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.map((seller) => (
            <TableRow key={seller.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  {seller.avatar_url && (
                    <img
                      src={seller.avatar_url}
                      alt={seller.username}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{seller.username || "No username"}</span>
                      {seller.verified && (
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{seller.email}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant={seller.approved ? "default" : "secondary"}>
                    {seller.approved ? "Approved" : "Pending"}
                  </Badge>
                  {seller.suspended && (
                    <Badge variant="destructive">Suspended</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={seller.verified ? "default" : "outline"} className={seller.verified ? "bg-blue-500 hover:bg-blue-600" : ""}>
                  {seller.verified ? (
                    <>
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3 mr-1" />
                      Unverified
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell>
                {seller.createdAt && format(seller.createdAt, "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {!seller.approved && (
                    <Button
                      size="sm"
                      onClick={() => onApprove(seller.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  )}
                  
                  {seller.approved && !seller.suspended && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onSuspend(seller.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Suspend
                    </Button>
                  )}
                  
                  {seller.suspended && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUnsuspend(seller.id)}
                    >
                      Unsuspend
                    </Button>
                  )}

                  {seller.approved && (
                    <>
                      {seller.verified ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUnverify(seller.id)}
                          className="border-blue-500 text-blue-500 hover:bg-blue-50"
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Unverify
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => onVerify(seller.id)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <ShieldCheck className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SellersTable;
