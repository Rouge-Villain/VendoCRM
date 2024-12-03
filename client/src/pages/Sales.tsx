import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DealPipeline } from "../components/DealPipeline";
import { DealForm } from "../components/DealForm";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { type Opportunity } from "@db/schema";

export default function Sales() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      return response.json() as Promise<Opportunity[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Pipeline</h1>
        <Button 
          onClick={() => setIsOpen(true)}
          className="px-6 py-2 hover:scale-105 transition-transform duration-200"
        >
          New Deal
        </Button>
      </div>

      <Card className="p-6 overflow-hidden">
        <DealPipeline />
      </Card>

      <div className="rounded-lg border shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities?.map((opportunity) => (
              <TableRow key={opportunity.id}>
                <TableCell>{opportunity.customerId}</TableCell>
                <TableCell>{opportunity.productId}</TableCell>
                <TableCell>${parseFloat(opportunity.value.toString()).toLocaleString()}</TableCell>
                <TableCell className="capitalize">{opportunity.stage}</TableCell>
                <TableCell className="capitalize">{opportunity.status}</TableCell>
                <TableCell>{opportunity.probability}%</TableCell>
                <TableCell>
                  {opportunity.createdAt ? new Date(opportunity.createdAt).toLocaleDateString() : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DealForm onSuccess={() => setIsOpen(false)} />
      </Dialog>
    </div>
  );
}
