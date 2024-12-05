import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { type Maintenance } from "@db/schema";
import { format } from "date-fns";
import { MaintenanceDetails } from "./MaintenanceDetails";
import { type Part } from "./MaintenanceDetails";
import { type MaintenanceWithParts } from "./MaintenanceDetails";

interface MaintenanceTableProps {
  records: Maintenance[];
}

export function MaintenanceTable({ records }: MaintenanceTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceWithParts | null>(null);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/maintenance/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast({ title: "Status updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "in-progress":
        return "bg-blue-500";
      case "done":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      <div className="rounded-lg border shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-200 overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold w-[120px]">Machine ID</TableHead>
              <TableHead className="font-semibold w-[140px]">Serial Number</TableHead>
              <TableHead className="font-semibold w-[120px]">Type</TableHead>
              <TableHead className="font-semibold min-w-[200px]">Description</TableHead>
              <TableHead className="font-semibold w-[160px]">Status</TableHead>
              <TableHead className="font-semibold w-[140px]">Scheduled Date</TableHead>
              <TableHead className="font-semibold w-[100px]">Notes</TableHead>
              <TableHead className="font-semibold w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{record.machineId}</TableCell>
                <TableCell className="font-mono text-sm">{record.serialNumber}</TableCell>
                <TableCell className="capitalize font-medium text-muted-foreground">{record.maintenanceType}</TableCell>
                <TableCell className="max-w-[200px] truncate">{record.description}</TableCell>
                <TableCell className="min-w-[160px]">
                  <Select
                    value={record.status}
                    onValueChange={(value) =>
                      statusMutation.mutate({ id: record.id, status: value })
                    }
                  >
                    <SelectTrigger className="h-8 w-[160px]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(record.status)}`} />
                        <SelectValue className="flex-1 text-left" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {record.scheduledDate
                    ? format(new Date(record.scheduledDate), "PPP")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const typedRecord: MaintenanceWithParts = {
                        ...record,
                        partsUsed: Array.isArray(record.partsUsed)
                          ? (record.partsUsed as any[]).map(part => ({
                              name: String(part.name || ''),
                              quantity: Number(part.quantity || 0)
                            }))
                          : []
                      };
                      setSelectedRecord(typedRecord);
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedRecord && (
        <MaintenanceDetails
          record={{
            ...selectedRecord,
            partsUsed: Array.isArray(selectedRecord.partsUsed) 
              ? selectedRecord.partsUsed.map((part: { name: string | number; quantity: string | number }) => ({
                  name: String(part.name),
                  quantity: Number(part.quantity)
                }))
              : []
          }}
          open={!!selectedRecord}
          onOpenChange={(open) => !open && setSelectedRecord(null)}
        />
      )}
    </>
  );
}
