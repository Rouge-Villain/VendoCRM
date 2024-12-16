import React from 'react';
import PropTypes from 'prop-types';
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
  const { data: customers = [], isLoading: customersLoading, error: customersError } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error(`Error fetching customers: ${response.statusText}`);
      }
      return response.json();
    },
    retry: 1
  });

  const { data: opportunities = [], isLoading: opportunitiesLoading, error: opportunitiesError } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      if (!response.ok) {
        throw new Error(`Error fetching opportunities: ${response.statusText}`);
      }
      return response.json();
    }
  });

  if (customersLoading || opportunitiesLoading) {
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

  if (customersError || opportunitiesError) {
    return (
      <div className="p-4 text-red-500">
        {customersError && `Error loading customers: ${customersError.message}`}
        {opportunitiesError && `Error loading opportunities: ${opportunitiesError.message}`}
      </div>
    );
  }

  // Calculate revenue by customer
  const revenueByCustomer = {};
  customers.forEach(customer => {
    const customerOpportunities = opportunities.filter(opp => opp.customerId === customer.id);
    const totalRevenue = customerOpportunities.reduce((sum, opp) => sum + (Number(opp.value) || 0), 0);
    if (totalRevenue > 0) {
      revenueByCustomer[customer.company || 'Unknown Company'] = totalRevenue;
    }
  });

  // Sort by revenue (descending) and take top 10
  const sortedCompanies = Object.entries(revenueByCustomer)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const chartData = {
    labels: sortedCompanies.map(([company]) => company),
    datasets: [{
      label: 'Revenue by Customer',
      data: sortedCompanies.map(([, revenue]) => revenue),
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1
    }]
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Customers by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Customer Revenue Analysis'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Revenue ($)'
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedAnalytics;
