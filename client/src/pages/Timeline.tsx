import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Activity } from "@db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Timeline() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: activities } = useQuery({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch("/api/activities");
      return response.json() as Promise<Activity[]>;
    },
  });

  const filteredActivities = activities?.filter((activity) => {
    const matchesSearch = activity.description.toLowerCase().includes(search.toLowerCase()) ||
      activity.outcome?.toLowerCase().includes(search.toLowerCase()) ||
      activity.nextSteps?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === "all" || activity.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const sortedActivities = filteredActivities?.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Customer Interaction Timeline
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search activities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-[200px]">
                <Select
                  value={filterType}
                  onValueChange={(value) => setFilterType(value)}
                >
                  <SelectTrigger>
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
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {sortedActivities?.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold capitalize">
                            {activity.type}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            via {activity.contactMethod}
                          </p>
                        </div>
                        <time className="text-sm text-muted-foreground">
                          {activity.createdAt
                            ? new Date(activity.createdAt).toLocaleString()
                            : "N/A"}
                        </time>
                      </div>
                      <div className="mt-4 space-y-2">
                        <p>{activity.description}</p>
                        {activity.outcome && (
                          <div className="rounded-md bg-muted p-2">
                            <p className="font-medium">Outcome</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.outcome}
                            </p>
                          </div>
                        )}
                        {activity.nextSteps && (
                          <div className="rounded-md bg-muted p-2">
                            <p className="font-medium">Next Steps</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.nextSteps}
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Contacted by {activity.contactedBy}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
