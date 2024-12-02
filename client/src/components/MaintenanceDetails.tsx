import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface MaintenanceDetailsProps {
  record: Maintenance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaintenanceDetails({
  record,
  open,
  onOpenChange,
}: MaintenanceDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(record.status);

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await fetch(`/api/maintenance/${record.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
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
        return "text-yellow-600 bg-yellow-100";
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      case "done":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Maintenance Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Machine ID</h4>
              <p>{record.machineId}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Serial Number</h4>
              <p>{record.serialNumber}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Machine Type</h4>
              <p className="capitalize">{record.machineType}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Maintenance Type</h4>
              <p className="capitalize">{record.maintenanceType}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Status</h4>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-md ${getStatusColor(status)}`}>
                  {status}
                </span>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                    statusMutation.mutate(value);
                  }}
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
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Description</h4>
            <p>{record.description}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Technician Notes</h4>
            <p>{record.technicianNotes || "No notes available"}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Parts Used</h4>
            {record.partsUsed && record.partsUsed.length > 0 ? (
              <ul className="list-disc list-inside">
                {record.partsUsed.map((part, index) => (
                  <li key={index}>
                    {part.name} - Quantity: {part.quantity}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No parts used</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Cost</h4>
              <p>${parseFloat(record.cost.toString()).toFixed(2)}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Scheduled Date</h4>
              <p>
                {record.scheduledDate
                  ? format(new Date(record.scheduledDate), "PPP")
                  : "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Completed Date</h4>
              <p>
                {record.completedDate
                  ? format(new Date(record.completedDate), "PPP")
                  : "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Next Maintenance</h4>
              <p>
                {record.nextMaintenanceDate
                  ? format(new Date(record.nextMaintenanceDate), "PPP")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
