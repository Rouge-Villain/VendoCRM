import { Card } from "@/components/ui/card";
import { ActivityLog } from "../components/ActivityLog";
import { SalesPipeline } from "../components/SalesPipeline";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="space-y-8">
        <Card className="p-6 transition-all hover:shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sales Pipeline</h2>
          <div className="mt-4">
            <SalesPipeline />
          </div>
        </Card>

        <Card className="p-6 transition-all hover:shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="mt-4">
            <ActivityLog />
          </div>
        </Card>
      </div>
    </div>
  );
}
