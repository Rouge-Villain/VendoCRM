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
import { Button } from "@/components/ui/button";
import { FileDown as FileDownIcon } from "lucide-react";
import { type Customer, type Opportunity } from "@db/schema";
import { exportAnalyticsData } from "@/lib/exportData";

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
      return response.json() as Promise<Customer[]>;
    },
  });

  const { data: opportunities } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      return response.json() as Promise<Opportunity[]>;
    },
  });

  // Calculate customer acquisition trends (monthly)
  const acquisitionTrends = customers?.reduce((acc, customer) => {
    if (customer.createdAt) {
      const date = new Date(customer.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate machine type distribution
  const machineDistribution = customers?.reduce((acc, customer) => {
    if (Array.isArray(customer.machineTypes)) {
      (customer.machineTypes as string[]).forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const acquisitionChartData = {
    labels: Object.keys(acquisitionTrends || {}),
    datasets: [
      {
        label: 'New Customers',
        data: Object.values(acquisitionTrends || {}),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(99, 102, 241)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const machineChartData = {
    labels: Object.keys(machineDistribution || {}),
    datasets: [
      {
        data: Object.values(machineDistribution || {}),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(14, 165, 233, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(147, 51, 234, 0.7)',
        ],
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background via-background/95 to-secondary/5">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-primary tracking-tight">Customer Acquisition Trends</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => exportAnalyticsData(customers || [], opportunities || [], 'acquisition')}
            >
              <FileDownIcon className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Line
              data={acquisitionChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 1000,
                  easing: 'easeInOutQuart',
                },
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        size: 12,
                        weight: '500',
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                      size: 14,
                      weight: 'bold',
                    },
                    bodyFont: {
                      size: 12,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background via-background/95 to-secondary/5">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-primary tracking-tight">Machine Type Distribution</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => exportAnalyticsData(customers || [], opportunities || [], 'distribution')}
            >
              <FileDownIcon className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Pie
              data={machineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 1000,
                  animateRotate: true,
                  animateScale: true,
                },
                plugins: {
                  legend: {
                    position: 'right' as const,
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        size: 12,
                        weight: '500',
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                      size: 14,
                      weight: 'bold',
                    },
                    bodyFont: {
                      size: 12,
                    },
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
