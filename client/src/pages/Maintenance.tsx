import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MaintenanceForm } from "../components/MaintenanceForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wrench } from "lucide-react";

export default function Maintenance() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="sticky top-0 z-10">
        <div className="bg-card border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">Equipment Maintenance</h1>
              <p className="text-muted-foreground mt-1">Schedule and track equipment maintenance</p>
            </div>
            <Button 
              onClick={() => setIsOpen(true)}
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Wrench className="w-4 h-4" />
              Schedule Maintenance
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Maintenance</DialogTitle>
          </DialogHeader>
          <MaintenanceForm onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">No Maintenance Records</h2>
          <p className="text-muted-foreground">
            Click the "Schedule Maintenance" button to create your first maintenance record.
          </p>
        </div>
      </div>
    </div>
  );
}
