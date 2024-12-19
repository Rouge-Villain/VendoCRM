import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { type Activity } from "@db/schema";
import { NewActivityForm } from "./NewActivityForm";

interface CustomerHistoryProps {
  customerId: number;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerHistory({
  customerId,
  customerName,
  open,
  onOpenChange,
}: CustomerHistoryProps) {
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const { data: activities } = useQuery({
    queryKey: ["activities", customerId],
    queryFn: async () => {
      const response = await fetch(`/api/activities?customerId=${customerId}`);
      return response.json() as Promise<Activity[]>;
    },
  });

  const filteredActivities = activities?.filter(
    (activity) => filterType === "all" || activity.type === filterType
  );

  const sortedActivities = filteredActivities?.sort(
    (a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customer History - {customerName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="site_visit">Site Visit</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowNewActivity(true)}>
              Add Interaction
            </Button>
          </div>

          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              {sortedActivities?.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {activity.type.charAt(0).toUpperCase() +
                          activity.type.slice(1)}
                      </p>
                      <p className="text-sm text-gray-500">
                        via {activity.contactMethod}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">{activity.description}</p>
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-sm font-medium">Outcome</p>
                      <p className="text-sm text-gray-500">{activity.outcome}</p>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-sm font-medium">Next Steps</p>
                      <p className="text-sm text-gray-500">{activity.nextSteps}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Contacted by {activity.contactedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>

      <Dialog open={showNewActivity} onOpenChange={setShowNewActivity}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Interaction</DialogTitle>
          </DialogHeader>
          <NewActivityForm
            customerId={customerId}
            onSuccess={() => setShowNewActivity(false)}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
