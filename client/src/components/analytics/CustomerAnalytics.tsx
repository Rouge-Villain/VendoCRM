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
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Customer } from "@db/schema";

type MachineDistribution = Record<string, number>;
type AcquisitionTrends = Record<string, number>;

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

  // Calculate customer acquisition trends (monthly)
  const acquisitionTrends: AcquisitionTrends = customers?.reduce<Record<string, number>>((acc, customer) => {
    if (customer.createdAt) {
      const date = new Date(customer.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    }
    return acc;
  }, {}) ?? {};

  // Calculate machine type distribution
  const machineDistribution: MachineDistribution = customers?.reduce<Record<string, number>>((acc, customer) => {
    if (Array.isArray(customer.machineTypes)) {
      customer.machineTypes.forEach(type => {
        if (typeof type === 'string') {
          acc[type] = (acc[type] || 0) + 1;
        }
      });
    }
    return acc;
  }, {}) ?? {};

  const acquisitionChartData: ChartData<'line', number[], string> = {
    labels: Object.keys(acquisitionTrends || {}),
    datasets: [
      {
        label: 'New Customers',
        data: Object.values(acquisitionTrends || {}),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const machineChartData: ChartData<'pie', number[], string> = {
    labels: Object.keys(machineDistribution || {}),
    datasets: [
      {
        data: Object.values(machineDistribution || {}),
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
                    position: 'top' as const,
                  },
                  tooltip: {
                    mode: 'index' as const,
                    intersect: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of New Customers'
                    }
                  }
                }
              } as ChartOptions<'line'>}
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
                    position: 'right' as const,
                  },
                },
              } as ChartOptions<'pie'>}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
