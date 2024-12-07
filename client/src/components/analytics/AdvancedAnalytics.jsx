import { useQuery } from "@tanstack/react-query";
import { exportToCSV, prepareAnalyticsData } from '@/lib/exportData';
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
import PropTypes from 'prop-types';

// Define PropTypes for the component
const customerShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  serviceTerritory: PropTypes.string,
  machineTypes: PropTypes.arrayOf(PropTypes.string),
});

const opportunityShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  customerId: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
});

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
      return response.json();
    },
  });

  const { data: opportunities, isError: isOpportunitiesError, error: opportunitiesError } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      if (!response.ok) {
        throw new Error(`Error fetching opportunities: ${response.statusText}`);
      }
      return response.json();
    },
  });

  // Calculate service territory coverage
  const territoryCoverage = customers?.reduce((acc, customer) => {
    if (customer.serviceTerritory) {
      acc[customer.serviceTerritory] = {
        customers: (acc[customer.serviceTerritory]?.customers || 0) + 1,
        machines: (acc[customer.serviceTerritory]?.machines || 0) + (Array.isArray(customer.machineTypes) ? customer.machineTypes.length : 0),
        revenue: opportunities?.reduce((sum, opp) => 
          opp.customerId === customer.id ? sum + Number(opp.value) : sum
        , 0) || 0
      };
    }
    return acc;
  }, {});

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
        const oppDate = new Date(o.createdAt);
        return oppDate.getFullYear() === date.getFullYear() && 
               Math.floor(oppDate.getMonth() / 3) === Math.floor(date.getMonth() / 3);
      });
      acc[quarter].conversion = (quarterlyOpps.filter(o => o.status === 'closed').length / quarterlyOpps.length) * 100;
    }
    return acc;
  }, {});

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
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Customer and Machine Distribution by Territory'
                  },
                },
                scales: {
                  y: {
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
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Revenue and Conversion Rate Trends'
                  },
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Revenue ($)'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
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

AdvancedAnalytics.propTypes = {
  customers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      serviceTerritory: PropTypes.string,
      machineTypes: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  opportunities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      customerId: PropTypes.number.isRequired,
      value: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ),
};
