import { useQuery } from "@tanstack/react-query";
import { exportToCSV, prepareAnalyticsData } from '@/lib/exportData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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

export function AdvancedAnalytics(): JSX.Element {
  const { data: customers, isError: isCustomersError, error: customersError } = useQuery<Customer[], Error>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error(`Error fetching customers: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    },
  });

  const { data: opportunities, isError: isOpportunitiesError, error: opportunitiesError } = useQuery<Opportunity[], Error>({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      if (!response.ok) {
        throw new Error(`Error fetching opportunities: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    },
  });

  // Calculate service territory coverage
  interface TerritoryCoverage {
    customers: number;
    machines: number;
    revenue: number;
  }

  type TerritoryCoverageMap = Record<string, TerritoryCoverage>;

  const territoryCoverage: TerritoryCoverageMap = customers?.reduce<TerritoryCoverageMap>((acc, customer) => {
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
  }, {} as TerritoryCoverageMap) ?? {} as TerritoryCoverageMap;

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

  const handleExportData = (): void => {
    if (!customers || !opportunities) return;
    const analyticsData = prepareAnalyticsData(customers, opportunities);
    exportToCSV(analyticsData, 'territory-performance-analysis');
  };

  const handleExportPDF = async (): Promise<void> => {
    if (!customers || !opportunities) return;
    
    let loadingToast: HTMLDivElement | null = null;
    
    try {
      // Import html2canvas dynamically to reduce initial bundle size
      const html2canvas = (await import('html2canvas')).default;
      
      // Show loading state
      loadingToast = document.createElement('div');
      loadingToast.className = 'fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded shadow';
      loadingToast.textContent = 'Generating PDF...';
      document.body.appendChild(loadingToast);
      
      // Capture territory chart
      const territoryChartElement = document.querySelector('.territory-chart');
      if (!territoryChartElement || !(territoryChartElement instanceof HTMLElement)) {
        throw new Error('Territory chart element not found');
      }
      
      const territoryChartImage = await html2canvas(territoryChartElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      const territoryChartDataUrl = territoryChartImage.toDataURL('image/png');

      // Capture performance chart
      const performanceChartElement = document.querySelector('.performance-chart');
      if (!performanceChartElement || !(performanceChartElement instanceof HTMLElement)) {
        throw new Error('Performance chart element not found');
      }
      
      const performanceChartImage = await html2canvas(performanceChartElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      const performanceChartDataUrl = performanceChartImage.toDataURL('image/png');

      // Create and download PDF
      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Territory Performance Analysis</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              .chart-container { margin: 20px 0; page-break-inside: avoid; }
              h1 { color: #1a56db; font-size: 24px; margin-bottom: 20px; }
              h2 { color: #1a56db; font-size: 20px; margin-top: 30px; margin-bottom: 15px; }
              h3 { color: #374151; font-size: 16px; margin-top: 20px; }
              .territory-data { margin: 20px 0; background: #f9fafb; padding: 15px; border-radius: 8px; }
              .chart-image { width: 100%; max-width: 800px; margin: 20px auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .data-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
              .metric { font-size: 14px; color: #4b5563; }
            </style>
          </head>
          <body>
            <h1>Territory Performance Analysis</h1>
            
            <h2>Territory Distribution Analysis</h2>
            <div class="chart-container">
              <img src="${territoryChartDataUrl}" alt="Territory Distribution Chart" class="chart-image" />
            </div>
            
            <div class="territory-data">
              ${Object.entries(territoryCoverage).map(([territory, data]) => `
                <h3>${territory}</h3>
                <div class="data-grid">
                  <div class="metric">Customers: ${data.customers}</div>
                  <div class="metric">Machines: ${data.machines}</div>
                  <div class="metric">Revenue: $${data.revenue.toLocaleString()}</div>
                </div>
              `).join('')}
            </div>

            <h2>Quarterly Performance Metrics</h2>
            <div class="chart-container">
              <img src="${performanceChartDataUrl}" alt="Quarterly Performance Chart" class="chart-image" />
            </div>
            
            <div style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
          </body>
        </html>
      `;

      // Create a new window/tab with the content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      printWindow.document.write(content);
      printWindow.document.close();
      
      // Wait for images to load before printing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Print/Save as PDF
      printWindow.print();
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Show error message to user
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded shadow';
      errorToast.textContent = 'Error generating PDF. Please try again.';
      document.body.appendChild(errorToast);
      setTimeout(() => document.body.removeChild(errorToast), 3000);
    } finally {
      // Clean up loading toast if it exists
      if (loadingToast && loadingToast.parentNode) {
        loadingToast.parentNode.removeChild(loadingToast);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Advanced Analytics Dashboard</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Export Data
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuItem 
              onClick={handleExportData}
              className="flex items-center cursor-pointer"
            >
              <span className="mr-2">📊</span> Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleExportPDF()}
              className="flex items-center cursor-pointer"
            >
              <span className="mr-2">📄</span> Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Territory Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] territory-chart">
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
          <div className="h-[400px] performance-chart">
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