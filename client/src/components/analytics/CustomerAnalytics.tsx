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
  Filler,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { FileDown as FileDownIcon } from "lucide-react";
import { type Customer, type Opportunity, type MachineType } from "@/types/db";
import { exportAnalyticsData } from "@/lib/exportData";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Type definitions for our analytics data
interface AcquisitionData {
  [monthYear: string]: number;
}

interface MachineData {
  [machineType: string]: number;
}

// Line chart specific types
interface LineChartDataset {
  type: 'line';
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill: boolean;
  pointBackgroundColor: string;
  pointBorderColor: string;
  pointBorderWidth: number;
  pointRadius: number;
  pointHoverRadius: number;
}

interface LineChartData {
  labels: string[];
  datasets: LineChartDataset[];
}

// Pie chart specific types
interface PieChartDataset {
  type: 'pie';
  label: string;
  data: number[];
  backgroundColor: string[];
  hoverOffset: number;
}

interface PieChartData {
  labels: string[];
  datasets: PieChartDataset[];
}

export function CustomerAnalytics() {
  const { data: customers } = useQuery<Customer[], Error>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error(`Error fetching customers: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const { data: opportunities } = useQuery<Opportunity[], Error>({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      if (!response.ok) {
        throw new Error(`Error fetching opportunities: ${response.statusText}`);
      }
      return response.json();
    },
  });

  // Calculate customer acquisition trends
  const acquisitionTrends = customers?.reduce<AcquisitionData>((acc, customer) => {
    if (customer.createdAt) {
      const date = new Date(customer.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate machine type distribution
  const machineDistribution = customers?.reduce<MachineData>((acc, customer) => {
    if (Array.isArray(customer.machineTypes)) {
      customer.machineTypes.forEach((machine) => {
        if (typeof machine === 'string') {
          acc[machine] = (acc[machine] || 0) + 1;
        } else if (typeof machine === 'object' && machine !== null) {
          const { type, quantity = 1 } = machine;
          acc[type] = (acc[type] || 0) + quantity;
        }
      });
    }
    return acc;
  }, {});

  const acquisitionChartData: LineChartData = {
    labels: Object.keys(acquisitionTrends || {}),
    datasets: [
      {
        type: 'line',
        label: 'New Customers',
        data: Object.values(acquisitionTrends || {}),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const machineChartData: PieChartData = {
    labels: Object.keys(machineDistribution || {}),
    datasets: [
      {
        type: 'pie',
        label: 'Machine Distribution',
        data: Object.values(machineDistribution || {}),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(14, 165, 233, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(147, 51, 234, 0.7)',
        ],
        hoverOffset: 15,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Customer Acquisition Trends</CardTitle>
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
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(148, 163, 184, 0.1)',
                    },
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              } as const}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Machine Type Distribution</CardTitle>
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
              } as const}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
