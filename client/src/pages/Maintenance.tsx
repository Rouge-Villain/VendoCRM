import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MaintenanceForm } from "../components/MaintenanceForm";
import { MaintenanceTable } from "../components/MaintenanceTable";
import { Dialog } from "@/components/ui/dialog";
import { type Maintenance } from "@db/schema";

export default function Maintenance() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: maintenanceRecords, isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const response = await fetch("/api/maintenance");
      return response.json() as Promise<Maintenance[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Equipment Maintenance
        </h1>
        <Button onClick={() => setIsOpen(true)}>
          Schedule Maintenance
        </Button>
      </div>

      <MaintenanceTable records={maintenanceRecords || []} />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <MaintenanceForm onSuccess={() => setIsOpen(false)} />
      </Dialog>
    </div>
  );
}
