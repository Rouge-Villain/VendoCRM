import { SalesAnalytics } from "../components/analytics/SalesAnalytics";
import { CustomerAnalytics } from "../components/analytics/CustomerAnalytics";
import { AdvancedAnalytics } from "../components/analytics/AdvancedAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics & Reporting</h1>
      </div>

      <Tabs defaultValue="advanced" className="space-y-6">
        <TabsList>
          <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="advanced" className="space-y-6">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <SalesAnalytics />
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-6">
          <CustomerAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
