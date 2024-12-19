import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Phone, Mail, Calendar, Plus, TrendingUp, 
  Users, ClipboardList, BarChart 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuickAction = ({ icon: Icon, label, onClick, variant = "outline" }) => (
  <Button
    variant={variant}
    className="flex flex-col items-center p-3 h-auto min-w-[80px] gap-1"
    onClick={onClick}
  >
    <Icon className="h-5 w-5" />
    <span className="text-xs">{label}</span>
  </Button>
);

export function MobileSalesDashboard() {
  const [showNewDeal, setShowNewDeal] = useState(false);

  const { data: opportunities } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      return response.json();
    },
  });

  const { data: recentActivities } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await fetch("/api/activities");
      return response.json();
    },
  });

  const quickActions = [
    { icon: Phone, label: "Call", onClick: () => {} },
    { icon: Mail, label: "Email", onClick: () => {} },
    { icon: Calendar, label: "Meeting", onClick: () => {} },
    { icon: Plus, label: "New Deal", onClick: () => setShowNewDeal(true) },
    { icon: Users, label: "Contacts", onClick: () => {} },
    { icon: ClipboardList, label: "Tasks", onClick: () => {} },
    { icon: BarChart, label: "Analytics", onClick: () => {} },
    { icon: TrendingUp, label: "Pipeline", onClick: () => {} },
  ];

  const recentDeals = opportunities?.slice(0, 3) || [];
  const recentActivitiesList = recentActivities?.slice(0, 3) || [];

  return (
    <div className="space-y-4 pb-6">
      {/* Quick Actions Grid */}
      <section className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="text-sm text-muted-foreground">This Month</div>
          <div className="text-2xl font-bold">
            ${opportunities?.reduce((sum, opp) => sum + Number(opp.value), 0)?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-muted-foreground">Pipeline Value</div>
        </Card>
        <Card className="p-3">
          <div className="text-sm text-muted-foreground">Deals Won</div>
          <div className="text-2xl font-bold">
            {opportunities?.filter(opp => opp.status === 'won')?.length || 0}
          </div>
          <div className="text-xs text-muted-foreground">This Month</div>
        </Card>
      </section>

      {/* Recent Deals */}
      <section className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Recent Deals</h2>
        <div className="space-y-3">
          {recentDeals.map((deal) => (
            <Card key={deal.id} className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">${Number(deal.value).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Customer #{deal.customerId}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium capitalize">{deal.stage}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(deal.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Activities */}
      <section className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Recent Activities</h2>
        <div className="space-y-3">
          {recentActivitiesList.map((activity) => (
            <Card key={activity.id} className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium capitalize">{activity.type}</div>
                  <div className="text-sm text-muted-foreground">
                    {activity.description.slice(0, 50)}...
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
