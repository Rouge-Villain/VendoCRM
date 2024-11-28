import { Card } from "@/components/ui/card";
import { ActivityLog } from "../components/ActivityLog";
import { SalesPipeline } from "../components/SalesPipeline";

export default function Dashboard() {
  const stats = [
    { name: "Total Customers", value: "521" },
    { name: "Active Opportunities", value: "48" },
    { name: "Monthly Sales", value: "$125,000" },
    { name: "Equipment Deployed", value: "1,248" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Sales Pipeline</h2>
          <div className="mt-4">
            <SalesPipeline />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <div className="mt-4">
            <ActivityLog />
          </div>
        </Card>
      </div>
    </div>
  );
}
