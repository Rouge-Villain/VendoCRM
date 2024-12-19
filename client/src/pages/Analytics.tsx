import React from 'react';
import { SalesAnalytics } from "../components/analytics/SalesAnalytics";
import { CustomerAnalytics } from "../components/analytics/CustomerAnalytics";
import { WinLossAnalytics } from "../components/analytics/WinLossAnalytics";
import AdvancedAnalytics from "../components/analytics/AdvancedAnalytics";
import * as TabsPrimitive from "@radix-ui/react-tabs";

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  className?: string;
  children: React.ReactNode;
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    {...props}
  />
));
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className="flex border-b"
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className="px-4 py-2 -mb-px border-b-2 border-transparent hover:border-gray-300"
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className="mt-4"
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

const Analytics: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
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
        
        <TabsContent value="advanced">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="sales">
          <SalesAnalytics />
        </TabsContent>
        
        <TabsContent value="customers">
          <CustomerAnalytics />
        </TabsContent>

        <TabsContent value="winloss">
          <WinLossAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Analytics;
