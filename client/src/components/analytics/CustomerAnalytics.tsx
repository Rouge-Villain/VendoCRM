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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown as FileDownIcon } from "lucide-react";
import { type Customer, type Opportunity } from "@db/schema";
import { exportAnalyticsData } from "../../lib/exportData";

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
) as unknown;

type AcquisitionTrends = Record<string, number>;
type MachineDistribution = Record<string, number>;
type MachineType = string;

// Type guard to check if value is a valid machine type string
function isMachineType(value: unknown): value is MachineType {
  return typeof value === 'string' && value.length > 0;
}

type ChartType = 'line' | 'bar' | 'pie';

interface BaseChartDataset {
  type?: ChartType;
  label?: string;
  data: number[];
  borderColor?: string;
  backgroundColor: string | string[];
  borderWidth?: number;
  yAxisID?: string;
}

interface LineChartDataset extends BaseChartDataset {
  type?: 'line';
  tension?: number;
  fill?: boolean;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  pointBorderWidth?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointHoverBackgroundColor?: string;
  pointHoverBorderColor?: string;
  pointHoverBorderWidth?: number;
}

interface PieChartDataset extends BaseChartDataset {
  type?: 'pie';
  hoverOffset?: number;
}

type ChartDataset<TType extends keyof ChartTypeRegistry = keyof ChartTypeRegistry> = 
  TType extends 'line' ? LineChartDataset :
  TType extends 'pie' ? PieChartDataset :
  never;

interface ChartData<TType extends keyof ChartTypeRegistry = keyof ChartTypeRegistry> {
  labels: string[];
  datasets: ChartDataset<TType>[];
}

export function CustomerAnalytics() {
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error(`Error fetching customers: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const { data: opportunities } = useQuery<Opportunity[]>({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      if (!response.ok) {
        throw new Error(`Error fetching opportunities: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const acquisitionTrends = customers?.reduce<AcquisitionTrends>((acc, customer) => {
    if (customer.createdAt) {
      const date = new Date(customer.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    }
    return acc;
  }, {});

  const machineDistribution = customers?.reduce<MachineDistribution>((acc, customer) => {
    if (customer.machineTypes) {
      const types = Array.isArray(customer.machineTypes) 
        ? customer.machineTypes
        : typeof customer.machineTypes === 'string' 
        ? [customer.machineTypes]
        : [];

      types.forEach(machineType => {
        const type = typeof machineType === 'object' && machineType !== null
          ? machineType.type
          : typeof machineType === 'string'
          ? machineType
          : null;

        if (type && typeof type === 'string') {
          acc[type] = (acc[type] || 0) + 1;
        }
      });
    }
    return acc;
  }, {});

  const acquisitionChartData: ChartData = {
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

  const machineChartData: ChartData = {
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
      <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background via-background/95 to-secondary/5 border border-border/50 group">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-primary tracking-tight group-hover:text-primary/90 transition-colors">Customer Acquisition Trends</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
              onClick={() => exportAnalyticsData(customers || [], opportunities || [], 'acquisition')}
            >
              <FileDownIcon className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Line
              data={acquisitionChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 1500,
                  easing: 'easeOutQuart',
                },
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        size: 12,
                        weight: 500,
                        family: 'system-ui'
                      },
                      color: 'rgb(100, 116, 139)',
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    padding: {
                      x: 12,
                      y: 8
                    },
                    titleFont: {
                      size: 14,
                      weight: 600,
                      family: 'system-ui'
                    },
                    bodyFont: {
                      size: 12,
                      family: 'system-ui'
                    },
                    borderColor: 'rgba(148, 163, 184, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    displayColors: true,
                    boxPadding: 4,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      drawOnChartArea: true,
                      color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                      font: {
                        size: 11,
                        family: 'system-ui'
                      },
                      color: 'rgb(100, 116, 139)',
                      padding: 8,
                    },
                    border: {
                      display: false,
                    }
                  },
                  x: {
                    grid: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      font: {
                        size: 11,
                        family: 'system-ui'
                      },
                      color: 'rgb(100, 116, 139)',
                      padding: 8,
                    },
                    border: {
                      display: false,
                    }
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
                        weight: 500,
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                      size: 14,
                      weight: 500,
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
