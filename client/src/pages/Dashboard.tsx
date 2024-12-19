import { Card } from "@/components/ui/card";
import { ActivityLog } from "../components/ActivityLog";
import { SalesPipeline } from "../components/SalesPipeline";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
      </div>

      <div className="space-y-8">
        <Card className="p-6 shadow-sm hover:shadow-md transition-all duration-200 border-t-4 border-t-primary">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Sales Pipeline
          </h2>
          <div className="mt-6">
            <SalesPipeline />
          </div>
        </Card>

        <Card className="p-6 shadow-sm hover:shadow-md transition-all duration-200 border-t-4 border-t-primary">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Recent Activity
          </h2>
          <div className="mt-6">
            <ActivityLog />
          </div>
        </Card>
      </div>
    </div>
  );
}
