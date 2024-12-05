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
      <div className="sticky top-0 z-10">
        <div className="bg-card shadow-sm rounded-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">Equipment Maintenance</h1>
              <p className="text-muted-foreground mt-1">Schedule and track equipment maintenance</p>
            </div>
            <Button 
              onClick={() => setIsOpen(true)}
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              Schedule Maintenance
            </Button>
          </div>
        </div>
      </div>

      <MaintenanceTable records={maintenanceRecords || []} />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="max-w-3xl mx-auto">
          <div className="p-6">
            <MaintenanceForm onSuccess={() => setIsOpen(false)} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
