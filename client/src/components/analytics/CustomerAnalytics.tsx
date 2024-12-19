import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerAnalyticsData } from '@/types/analytics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export const CustomerAnalytics: React.FC = () => {
  const { data: analyticsData, isLoading, error } = useQuery<CustomerAnalyticsData[]>({
    queryKey: ['/api/analytics/customers'],
  });

  if (isLoading) {
    return <div>Loading customer analytics...</div>;
  }

  if (error) {
    return <div>Error loading customer analytics: {String(error)}</div>;
  }

  const topCustomers = analyticsData?.slice(0, 10) || [];

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Revenue</CardTitle>
          <CardDescription>
            Showing the top 10 customers by total revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCustomers}>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#888888', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#888888', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-2">
                          <p className="font-medium">{payload[0].payload.name}</p>
                          <p className="text-muted-foreground">
                            Revenue: ${payload[0].value}
                          </p>
                          <p className="text-muted-foreground">
                            Orders: {payload[0].payload.totalOrders}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="totalSpent"
                  fill="currentColor"
                  className="fill-primary"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAnalytics;
