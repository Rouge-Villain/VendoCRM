import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Activity } from "@db/schema";

export function ActivityLog() {
  const { data: activities } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await fetch("/api/activities");
      return response.json() as Promise<Activity[]>;
    },
  });

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {activities?.map((activity) => (
          <div key={activity.id} className="flex gap-4 items-start">
            <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
            <div>
              <p className="text-sm font-medium">{activity.type}</p>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <p className="text-xs text-gray-400">
                {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
