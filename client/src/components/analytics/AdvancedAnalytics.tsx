import { useQuery } from "@tanstack/react-query";
import type { Customer, Opportunity } from "@db/schema";
import { exportToCSV, prepareAnalyticsData } from '../../lib/exportData';
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
  ChartTypeRegistry,
} from 'chart.js';
import type { 
  ChartData, 
  ChartOptions,
  ScriptableContext,
  TooltipItem,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "../ui";

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
) as void;

type ChartType = keyof ChartTypeRegistry;

interface BaseDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  pointStyle?: 'circle' | 'cross' | 'crossRot' | 'dash' | 'line' | 'rect' | 'rectRounded' | 'rectRot' | 'star' | 'triangle';
}

interface LineDataset extends BaseDataset {
  type: 'line';
  tension?: number;
  yAxisID?: 'y' | 'y1';
  pointRadius?: number;
  pointHoverRadius?: number;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  pointBorderWidth?: number;
}

interface BarDataset extends BaseDataset {
  type: 'bar';
  categoryPercentage?: number;
  barPercentage?: number;
  borderRadius?: number;
}

type Dataset = LineDataset | BarDataset;

interface ChartOptions extends ChartOptions<ChartType> {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      position: 'top' | 'bottom' | 'left' | 'right';
      labels: {
        font: Partial<{
          size: number;
          family: string;
          weight: string | number;
        }>;
      };
    };
    title?: {
      display: boolean;
      text: string;
    };
  };
  scales?: {
    y?: {
      type: 'linear';
      display: boolean;
      position?: 'left' | 'right';
      beginAtZero?: boolean;
      title?: {
        display: boolean;
        text: string;
      };
      grid?: {
        color?: string;
        drawOnChartArea?: boolean;
      };
    };
    y1?: {
      type: 'linear';
      display: boolean;
      position?: 'left' | 'right';
      grid?: {
        drawOnChartArea?: boolean;
      };
      title?: {
        display: boolean;
        text: string;
      };
    };
  };
}

export function AdvancedAnalytics() {
  const { data: customers, isError: isCustomersError, error: customersError } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error(`Error fetching customers: ${response.statusText}`);
      }
      return response.json() as Promise<Customer[]>;
    },
  });

  const { data: opportunities, isError: isOpportunitiesError, error: opportunitiesError } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      if (!response.ok) {
        throw new Error(`Error fetching opportunities: ${response.statusText}`);
      }
      return response.json() as Promise<Opportunity[]>;
    },
  });

  // Calculate service territory coverage
  interface TerritoryCoverage {
    customers: number;
    machines: number;
    revenue: number;
  }

  // Type guard for machine type
  function isMachineType(value: unknown): value is { type: string; quantity?: number } | string {
    if (typeof value === 'string') return true;
    if (typeof value === 'object' && value !== null) {
      return 'type' in value && typeof (value as { type: unknown }).type === 'string';
    }
    return false;
  }

  const territoryCoverage = customers?.reduce<Record<string, TerritoryCoverage>>((acc, customer) => {
    const territory = customer.serviceTerritory;
    if (typeof territory === 'string') {
      const currentTerritory = acc[territory] || { customers: 0, machines: 0, revenue: 0 };
      const customerOpportunities = opportunities?.filter(opp => opp.customerId === customer.id) || [];
      const opportunityRevenue = customerOpportunities.reduce((sum, opp) => 
        sum + Number(opp.value?.toString() || '0'), 0);
      
      const machineCount = Array.isArray(customer.machineTypes)
        ? customer.machineTypes.reduce((count, machine) => {
            if (isMachineType(machine)) {
              if (typeof machine === 'object' && 'quantity' in machine) {
                return count + (machine.quantity || 1);
              }
              return count + 1;
            }
            return count;
          }, 0)
        : 0;
      
      acc[territory] = {
        customers: currentTerritory.customers + 1,
        machines: currentTerritory.machines + machineCount,
        revenue: currentTerritory.revenue + opportunityRevenue
      };
    }
    return acc;
  }, {});

  // Calculate sales performance by quarter
  interface QuarterlyMetrics {
    revenue: number;
    count: number;
    conversion: number;
  }

  const quarterlyPerformance = opportunities?.reduce<Record<string, QuarterlyMetrics>>((acc, opp) => {
    const createdAt = opp.createdAt;
    if (createdAt) {
      const date = new Date(createdAt);
      const quarter = `Q${Math.floor((date.getMonth() + 3) / 3)} ${date.getFullYear()}`;
      const currentMetrics = acc[quarter] || { revenue: 0, count: 0, conversion: 0 };
      
      acc[quarter] = {
        revenue: currentMetrics.revenue + Number(opp.value || 0),
        count: currentMetrics.count + 1,
        conversion: currentMetrics.conversion
      };

      // Calculate conversion rate
      if (opportunities) {
        const quarterlyOpps = opportunities.filter(o => {
          if (!o.createdAt) return false;
          const oppDate = new Date(o.createdAt);
          return oppDate.getFullYear() === date.getFullYear() && 
                 Math.floor(oppDate.getMonth() / 3) === Math.floor(date.getMonth() / 3);
        });

        const closedOpps = quarterlyOpps.filter(o => o.status === 'closed');
        acc[quarter].conversion = quarterlyOpps.length > 0 
          ? (closedOpps.length / quarterlyOpps.length) * 100 
          : 0;
      }
    }
    return acc;
  }, {});

  const territoryData: ChartData<'bar'> = {
    labels: Object.keys(territoryCoverage || {}),
    datasets: [
      {
        type: 'bar',
        label: 'Customers',
        data: Object.values(territoryCoverage || {}).map(t => t.customers),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderWidth: 1,
      },
      {
        type: 'bar',
        label: 'Machines',
        data: Object.values(territoryCoverage || {}).map(t => t.machines),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 1,
      },
    ],
  };

  const performanceData: ChartData<'line'> = {
    labels: Object.keys(quarterlyPerformance || {}),
    datasets: [
      {
        type: 'line',
        label: 'Revenue',
        data: Object.values(quarterlyPerformance || {}).map(q => q.revenue),
        borderColor: 'rgb(75, 192, 192)',
        yAxisID: 'y',
        tension: 0.4,
      },
      {
        type: 'line',
        label: 'Conversion Rate (%)',
        data: Object.values(quarterlyPerformance || {}).map(q => q.conversion),
        borderColor: 'rgb(255, 99, 132)',
        yAxisID: 'y1',
        tension: 0.4,
      },
    ],
  };

  if (isCustomersError || isOpportunitiesError) {
    return (
      <div className="p-4 text-red-500">
        {isCustomersError && `Error loading customers: ${customersError?.message}`}
        {isOpportunitiesError && `Error loading opportunities: ${opportunitiesError?.message}`}
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

  const handleExportData = () => {
    if (!customers || !opportunities) return;
    const analyticsData = prepareAnalyticsData(customers, opportunities, 'territory');
    exportToCSV(analyticsData, 'territory-performance-analysis');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Advanced Analytics Dashboard</h2>
        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Export Data
        </button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Territory Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Bar
              data={territoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Customer and Machine Distribution by Territory'
                  },
                },
                scales: {
                  y: {
                    type: 'linear' as const,
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(148, 163, 184, 0.1)',
                      drawOnChartArea: true,
                    },
                    border: {
                      display: false
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quarterly Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line
              data={performanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index' as const,
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Revenue and Conversion Rate Trends'
                  },
                },
                scales: {
                  y: {
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                    title: {
                      display: true,
                      text: 'Revenue ($)'
                    }
                  },
                  y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    title: {
                      display: true,
                      text: 'Conversion Rate (%)'
                    },
                    grid: {
                      drawOnChartArea: false,
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
