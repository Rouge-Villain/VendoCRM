import React from 'react';
import { SalesAnalytics } from "../components/analytics/SalesAnalytics.jsx";
import { CustomerAnalytics } from "../components/analytics/CustomerAnalytics.jsx";
import { WinLossAnalytics } from "../components/analytics/WinLossAnalytics.jsx";
import AdvancedAnalytics from "../components/analytics/AdvancedAnalytics.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";

export default function Analytics() {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (event) => {
      console.error('Analytics Error:', event.error);
      setError(event.error?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

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
          <TabsTrigger value="winloss">Win/Loss Analysis</TabsTrigger>
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

        <TabsContent value="winloss" className="space-y-6">
          <WinLossAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
