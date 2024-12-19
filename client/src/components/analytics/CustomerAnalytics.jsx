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
import { Line, Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function CustomerAnalytics() {
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      const data = await response.json();
      return data;
    },
  });

  // Calculate customer acquisition trends (monthly)
  const acquisitionTrends = React.useMemo(() => {
    if (!customers) return {};
    return customers.reduce((acc, customer) => {
      if (customer.createdAt) {
        const date = new Date(customer.createdAt);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[monthYear] = (acc[monthYear] || 0) + 1;
      }
      return acc;
    }, {});
  }, [customers]);

  // Calculate machine type distribution
  const machineDistribution = React.useMemo(() => {
    if (!customers) return {};
    return customers.reduce((acc, customer) => {
      if (Array.isArray(customer.machineTypes)) {
        customer.machineTypes.forEach(type => {
          acc[type] = (acc[type] || 0) + 1;
        });
      }
      return acc;
    }, {});
  }, [customers]);

  const acquisitionChartData = {
    labels: Object.keys(acquisitionTrends),
    datasets: [
      {
        label: 'New Customers',
        data: Object.values(acquisitionTrends),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const machineChartData = {
    labels: Object.keys(machineDistribution),
    datasets: [
      {
        data: Object.values(machineDistribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Acquisition Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line
              data={acquisitionChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Machine Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Pie
              data={machineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

CustomerAnalytics.propTypes = {};

export default CustomerAnalytics;
