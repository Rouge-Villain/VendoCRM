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
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Loyalty Program</span>
          <span className={`text-sm px-2 py-1 rounded ${
            loyaltyData?.loyalty?.loyaltyTier === 'platinum' ? 'bg-purple-100 text-purple-700' :
            loyaltyData?.loyalty?.loyaltyTier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
            loyaltyData?.loyalty?.loyaltyTier === 'silver' ? 'bg-gray-100 text-gray-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {loyaltyData?.loyalty?.loyaltyTier?.toUpperCase()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold">Current Points</h3>
              <p className="text-3xl font-bold text-primary">
                {loyaltyData?.loyalty?.loyaltyPoints || 0}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Last earned: {loyaltyData?.loyalty?.lastPointsEarned ? 
                format(new Date(loyaltyData.loyalty.lastPointsEarned), 'PP') : 
                'Never'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Add Points</h4>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(e.target.value)}
                  placeholder="Enter points"
                />
                <Button onClick={handleAddPoints} disabled={earnMutation.isPending}>
                  Add
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Redeem Points</h4>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  placeholder="Enter points"
                />
                <Button onClick={handleRedeemPoints} disabled={redeemMutation.isPending}>
                  Redeem
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Points History</h4>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loyaltyData?.history?.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.transactionDate), 'PP')}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.type === 'earned' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {record.type}
                        </span>
                      </TableCell>
                      <TableCell className={record.type === 'earned' ? 'text-green-600' : 'text-red-600'}>
                        {record.type === 'earned' ? '+' : '-'}{Math.abs(record.points)}
                      </TableCell>
                      <TableCell>{record.description}</TableCell>
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
