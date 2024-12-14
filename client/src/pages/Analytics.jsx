import React from 'react';
import { SalesAnalytics } from "../components/analytics/SalesAnalytics.jsx";
import { CustomerAnalytics } from "../components/analytics/CustomerAnalytics.jsx";
import { AdvancedAnalytics } from "../components/analytics/AdvancedAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
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
