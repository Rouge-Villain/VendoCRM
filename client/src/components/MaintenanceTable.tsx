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

interface MaintenanceTableProps {
  records: Maintenance[];
}

export function MaintenanceTable({ records }: MaintenanceTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecord, setSelectedRecord] = useState<Maintenance | null>(null);

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
        return "text-yellow-700 bg-yellow-100 border border-yellow-200 shadow-sm shadow-yellow-100/50";
      case "in-progress":
        return "text-blue-700 bg-blue-100 border border-blue-200 shadow-sm shadow-blue-100/50";
      case "done":
        return "text-green-700 bg-green-100 border border-green-200 shadow-sm shadow-green-100/50";
      default:
        return "text-gray-700 bg-gray-100 border border-gray-200 shadow-sm shadow-gray-100/50";
    }
  };

  return (
    <>
      <div className="rounded-lg border shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Machine ID</TableHead>
              <TableHead className="font-semibold">Serial Number</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Scheduled Date</TableHead>
              <TableHead className="font-semibold">Notes</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{record.machineId}</TableCell>
                <TableCell className="font-mono text-sm">{record.serialNumber}</TableCell>
                <TableCell className="capitalize font-medium text-muted-foreground">{record.maintenanceType}</TableCell>
                <TableCell className="max-w-[200px] truncate">{record.description}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                    <Select
                      value={record.status}
                      onValueChange={(value) =>
                        statusMutation.mutate({ id: record.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    onClick={() => setSelectedRecord(record)}
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
          record={selectedRecord}
          open={!!selectedRecord}
          onOpenChange={(open) => !open && setSelectedRecord(null)}
        />
      )}
    </>
  );
}
