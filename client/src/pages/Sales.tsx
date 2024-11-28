import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { SalesPipeline } from "../components/SalesPipeline";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { type Opportunity } from "@db/schema";

export default function Sales() {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      return response.json() as Promise<Opportunity[]>;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
      </div>

      <Card className="p-6">
        <SalesPipeline />
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities?.map((opportunity) => (
              <TableRow key={opportunity.id}>
                <TableCell>{opportunity.customerId}</TableCell>
                <TableCell>{opportunity.productId}</TableCell>
                <TableCell>${opportunity.value.toLocaleString()}</TableCell>
                <TableCell>{opportunity.status}</TableCell>
                <TableCell>{opportunity.createdAt ? new Date(opportunity.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
