import React from 'react';
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdvancedAnalytics() {
  const { data: customers, isError: isCustomersError, error: customersError } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/customers");
        if (!response.ok) {
          throw new Error(`Error fetching customers: ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        console.error("Customer fetch error:", error);
        throw error;
      }
    },
  });

  const { data: opportunities, isError: isOpportunitiesError, error: opportunitiesError } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/opportunities");
        if (!response.ok) {
          throw new Error(`Error fetching opportunities: ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        console.error("Opportunities fetch error:", error);
        throw error;
      }
    },
  });

  if (isCustomersError || isOpportunitiesError) {
    return (
      <div className="p-4 text-red-500">
        {isCustomersError && `Error loading customers: ${customersError?.message || 'Unknown error'}`}
        {isOpportunitiesError && `Error loading opportunities: ${opportunitiesError?.message || 'Unknown error'}`}
      </div>
    );
  }

  if (!customers || !opportunities) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading analytics data...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-lg text-muted-foreground">
              Select a metric to analyze
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedAnalytics;