import { Card } from "@/components/ui/card";
import { ActivityLog } from "../components/ActivityLog";
import { SalesPipeline } from "../components/SalesPipeline";
import { Users, TrendingUp, Building2, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const stats = [
    { name: "Total Customers", value: "521", icon: Users },
    { name: "Active Opportunities", value: "48", icon: TrendingUp },
    { name: "Monthly Sales", value: "$125,000", icon: Building2 },
    { name: "Equipment Deployed", value: "1,248", icon: Cpu },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.name} variants={item} className="min-w-[200px]">
              <Card className="p-4 sm:p-6 transition-all hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-center justify-between gap-4">
                  <div className="rounded-full p-3 bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-500 truncate">{stat.name}</h3>
                    <p className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

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
