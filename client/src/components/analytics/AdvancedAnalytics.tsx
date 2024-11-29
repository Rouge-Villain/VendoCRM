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
import { Line, Bar, Pie } from 'react-chartjs-2';
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
  const territoryCoverage = customers?.reduce((acc, customer) => {
    if (customer.serviceTerritory) {
      acc[customer.serviceTerritory] = {
        customers: (acc[customer.serviceTerritory]?.customers || 0) + 1,
        machines: (acc[customer.serviceTerritory]?.machines || 0) + (customer.machineTypes?.length || 0),
        revenue: opportunities?.reduce((sum, opp) => 
          opp.customerId === customer.id ? sum + Number(opp.value) : sum
        , 0) || 0
      };
    }
    return acc;
  }, {} as Record<string, { customers: number; machines: number; revenue: number }>);

  // Calculate sales performance by quarter
  const quarterlyPerformance = opportunities?.reduce((acc, opp) => {
    if (opp.createdAt) {
      const date = new Date(opp.createdAt);
      const quarter = `Q${Math.floor((date.getMonth() + 3) / 3)} ${date.getFullYear()}`;
      acc[quarter] = {
        revenue: (acc[quarter]?.revenue || 0) + Number(opp.value),
        count: (acc[quarter]?.count || 0) + 1,
        conversion: acc[quarter]?.conversion || 0
      };
      // Calculate conversion rate
      const quarterlyOpps = opportunities.filter(o => {
        const oppDate = new Date(o.createdAt!);
        return oppDate.getFullYear() === date.getFullYear() && 
               Math.floor(oppDate.getMonth() / 3) === Math.floor(date.getMonth() / 3);
      });
      acc[quarter].conversion = (quarterlyOpps.filter(o => o.status === 'closed').length / quarterlyOpps.length) * 100;
    }
    return acc;
  }, {} as Record<string, { revenue: number; count: number; conversion: number }>);

  const territoryData = {
    labels: Object.keys(territoryCoverage || {}),
    datasets: [
      {
        label: 'Customers',
        data: Object.values(territoryCoverage || {}).map(t => t.customers),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Machines',
        data: Object.values(territoryCoverage || {}).map(t => t.machines),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const performanceData = {
    labels: Object.keys(quarterlyPerformance || {}),
    datasets: [
      {
        type: 'line' as const,
        label: 'Revenue',
        data: Object.values(quarterlyPerformance || {}).map(q => q.revenue),
        borderColor: 'rgb(75, 192, 192)',
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Conversion Rate (%)',
        data: Object.values(quarterlyPerformance || {}).map(q => q.conversion),
        borderColor: 'rgb(255, 99, 132)',
        yAxisID: 'y1',
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

  return (
    <div className="space-y-6">
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