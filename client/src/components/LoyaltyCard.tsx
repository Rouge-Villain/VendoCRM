import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface LoyaltyCardProps {
  customerId: number;
}

export function LoyaltyCard({ customerId }: LoyaltyCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState("");

  const { data: loyaltyData, isLoading } = useQuery({
    queryKey: ["loyalty", customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}/loyalty`);
      if (!response.ok) throw new Error("Failed to fetch loyalty data");
      return response.json();
    },
  });

  const earnMutation = useMutation({
    mutationFn: async ({ points, source, description }: { points: number; source: string; description: string }) => {
      const response = await fetch(`/api/customers/${customerId}/loyalty/earn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points, source, description }),
      });
      if (!response.ok) throw new Error("Failed to add points");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty", customerId] });
      toast({ title: "Points added successfully" });
      setPointsToAdd("");
    },
    onError: () => {
      toast({ title: "Failed to add points", variant: "destructive" });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async ({ points, description }: { points: number; description: string }) => {
      const response = await fetch(`/api/customers/${customerId}/loyalty/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points, description }),
      });
      if (!response.ok) throw new Error("Failed to redeem points");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty", customerId] });
      toast({ title: "Points redeemed successfully" });
      setPointsToRedeem("");
    },
    onError: () => {
      toast({ title: "Failed to redeem points", variant: "destructive" });
    },
  });

  const handleAddPoints = () => {
    const points = parseInt(pointsToAdd);
    if (isNaN(points) || points <= 0) {
      toast({ title: "Please enter a valid number of points", variant: "destructive" });
      return;
    }
    earnMutation.mutate({
      points,
      source: "manual",
      description: "Points manually added",
    });
  };

  const handleRedeemPoints = () => {
    const points = parseInt(pointsToRedeem);
    if (isNaN(points) || points <= 0) {
      toast({ title: "Please enter a valid number of points", variant: "destructive" });
      return;
    }
    if (points > (loyaltyData?.loyalty?.loyaltyPoints || 0)) {
      toast({ title: "Insufficient points", variant: "destructive" });
      return;
    }
    redeemMutation.mutate({
      points,
      description: "Points manually redeemed",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
        </CardHeader>
        <CardContent>Loading loyalty data...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
      <CardHeader className="border-b bg-card">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/></svg>
            <span className="tracking-tight">Loyalty Program</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              loyaltyData?.loyalty?.loyaltyTier === 'platinum' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-400/30' :
              loyaltyData?.loyalty?.loyaltyTier === 'gold' ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-400/30' :
              loyaltyData?.loyalty?.loyaltyTier === 'silver' ? 'bg-gray-100 text-gray-700 ring-1 ring-gray-400/30' :
              'bg-blue-100 text-blue-700 ring-1 ring-blue-400/30'
            }`}>
              {loyaltyData?.loyalty?.loyaltyTier?.toUpperCase()}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Current Points</h3>
                <p className="text-4xl font-bold tracking-tight text-primary">
                  {loyaltyData?.loyalty?.loyaltyPoints || 0}
                </p>
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-70"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                  Last earned: {loyaltyData?.loyalty?.lastPointsEarned ? 
                    format(new Date(loyaltyData.loyalty.lastPointsEarned), 'PP') : 
                    'Never'}
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/></svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  Add Points
                </h4>
                {earnMutation.isPending && (
                  <span className="text-xs text-muted-foreground animate-pulse">Processing...</span>
                )}
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(e.target.value)}
                  placeholder="Enter points to add"
                  className="pr-20 h-11 text-lg"
                />
                <Button 
                  onClick={handleAddPoints} 
                  disabled={earnMutation.isPending}
                  className="absolute right-1 top-1 h-9"
                >
                  <span className="mr-2">Add</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m5 12 6 6 9-9"/></svg>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary"><path d="M2 7h20"/><path d="M16 2v5"/><path d="M8 2v5"/><path d="M3 16c0 3 2 4 4 4"/><path d="M7 17c0-3 2-4 4-4"/><path d="M11 13c4 0 6 1 6 4"/><path d="M15 17c0 3-2 4-4 4"/></svg>
                  Redeem Points
                </h4>
                {redeemMutation.isPending && (
                  <span className="text-xs text-muted-foreground animate-pulse">Processing...</span>
                )}
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  placeholder="Enter points to redeem"
                  className="pr-24 h-11 text-lg"
                />
                <Button 
                  onClick={handleRedeemPoints} 
                  disabled={redeemMutation.isPending}
                  className="absolute right-1 top-1 h-9"
                >
                  <span className="mr-2">Redeem</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 9v6"/></svg>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                Points History
              </h4>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Export History
              </Button>
            </div>
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[140px]">Date</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[100px] text-right">Points</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loyaltyData?.history?.map((record: any) => (
                    <TableRow key={record.id} className="group">
                      <TableCell className="font-medium">
                        {format(new Date(record.transactionDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.type === 'earned' 
                            ? 'bg-green-100 text-green-700 ring-1 ring-green-400/30' 
                            : 'bg-red-100 text-red-700 ring-1 ring-red-400/30'
                        }`}>
                          {record.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          record.type === 'earned' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {record.type === 'earned' ? '+' : '-'}{Math.abs(record.points)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {record.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
