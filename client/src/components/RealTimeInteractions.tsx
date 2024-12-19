import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface Activity {
  id: number;
  customerId: number;
  type: string;
  description: string;
  createdAt: string;
  contactMethod: string;
  contactedBy: string;
  outcome: string;
}

interface Customer {
  id: number;
  name: string;
  company: string;
}

export function RealTimeInteractions() {
  const [realtimeActivities, setRealtimeActivities] = useState<Activity[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  useEffect(() => {
    let websocket: WebSocket | null = null;

    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log('Connecting to WebSocket:', wsUrl);
      websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log("Connected to activity stream");
        setConnectionStatus('connected');
      };

      websocket.onmessage = (event) => {
        try {
          const activity = JSON.parse(event.data);
          setRealtimeActivities((prev) => [activity, ...prev].slice(0, 50));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus('disconnected');
      };

      websocket.onclose = () => {
        console.log("WebSocket connection closed");
        setConnectionStatus('disconnected');
        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const getCustomerName = (customerId: number) => {
    const customer = customers?.find((c) => c.id === customerId);
    return customer ? `${customer.name} (${customer.company})` : `Customer #${customerId}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "call":
        return "📞";
      case "email":
        return "📧";
      case "meeting":
        return "🤝";
      default:
        return "📝";
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case "positive":
        return "bg-green-500";
      case "negative":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Real-Time Interactions
            <Badge variant={connectionStatus === 'connected' ? "default" : "secondary"}>
              {connectionStatus === 'connected' ? 'Live' : 'Connecting...'}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {realtimeActivities.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No activities yet
            </div>
          ) : (
            <div className="space-y-4">
              {realtimeActivities.map((activity, index) => (
                <div
                  key={`${activity.id}-${index}`}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-medium">
                        {getCustomerName(activity.customerId)}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {activity.contactMethod}
                        </Badge>
                        <Badge
                          className={`${getOutcomeColor(activity.outcome)} text-white`}
                        >
                          {activity.outcome}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        By {activity.contactedBy}
                      </p>
                      <time className="text-xs text-muted-foreground">
                        {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}