import { useQuery } from "@tanstack/react-query";
import { exportToCSV, prepareAnalyticsData } from '@/lib/exportData';
import type {
  ChartData,
  ChartOptions,
  ChartDataset,
} from 'chart.js';
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
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Customer, type Opportunity } from "@db/schema";

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

  interface TerritoryCoverageMap {
    [territory: string]: TerritoryCoverage;
  }

  const territoryCoverage = customers?.reduce<TerritoryCoverageMap>((acc, customer) => {
    const territory = customer.serviceTerritory;
    if (territory) {
      const territoryRevenue = opportunities?.reduce((sum, opp) => 
        opp.customerId === customer.id ? sum + Number(opp.value) : sum
      , 0) ?? 0;

      const currentTerritory = acc[territory] ?? {
        customers: 0,
        machines: 0,
        revenue: 0
      };

      acc[territory] = {
        customers: currentTerritory.customers + 1,
        machines: currentTerritory.machines + 
          (Array.isArray(customer.machineTypes) ? customer.machineTypes.length : 0),
        revenue: currentTerritory.revenue + territoryRevenue
      };
    }
    return acc;
  }, {}) ?? {};

  // Calculate sales performance by quarter
  interface QuarterlyPerformance {
    revenue: number;
    count: number;
    conversion: number;
  }

  type QuarterlyPerformanceMap = Record<string, QuarterlyPerformance>;

  const calculateQuarterlyOpportunities = (
    opportunities: Opportunity[], 
    date: Date
  ): Opportunity[] => {
    return opportunities.filter(opp => {
      const createdAt = opp.createdAt;
      if (!createdAt) return false;
      
      const oppDate = new Date(createdAt);
      return oppDate.getFullYear() === date.getFullYear() && 
             Math.floor(oppDate.getMonth() / 3) === Math.floor(date.getMonth() / 3);
    });
  };

  const quarterlyPerformance = opportunities?.reduce<QuarterlyPerformanceMap>((acc, opp) => {
    const createdAt = opp.createdAt;
    if (!createdAt) return acc;

    const date = new Date(createdAt);
    const quarter = `Q${Math.floor((date.getMonth() + 3) / 3)} ${date.getFullYear()}`;
    
    // Get all opportunities for this quarter
    const quarterlyOpps = calculateQuarterlyOpportunities(opportunities, date);
    const closedOpps = quarterlyOpps.filter(o => o.status === 'closed');
    const conversionRate = quarterlyOpps.length > 0 
      ? (closedOpps.length / quarterlyOpps.length) * 100 
      : 0;

    const currentQuarter = acc[quarter] ?? {
      revenue: 0,
      count: 0,
      conversion: 0
    };

    acc[quarter] = {
      revenue: currentQuarter.revenue + Number(opp.value),
      count: currentQuarter.count + 1,
      conversion: conversionRate
    };
    
    return acc;
  }, {}) ?? {};

  const territoryData: ChartData<'bar'> = {
    labels: Object.keys(territoryCoverage),
    datasets: [
      {
        label: 'Customers',
        data: Object.values(territoryCoverage).map(t => t.customers),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Machines',
        data: Object.values(territoryCoverage).map(t => t.machines),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
      },
      {
        type: 'line',
        label: 'Conversion Rate (%)',
        data: Object.values(quarterlyPerformance || {}).map(q => q.conversion),
        borderColor: 'rgb(255, 99, 132)',
        yAxisID: 'y1',
      },
    ] as ChartDataset<'line'>[],
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
    const analyticsData = prepareAnalyticsData(customers, opportunities);
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
                    beginAtZero: true,
                  },
                },
              } satisfies ChartOptions<'bar'>}
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
              } satisfies ChartOptions<'line'>}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}