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
      loadingToast.className = 'fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded shadow z-50';
      loadingToast.textContent = 'Generating PDF...';
      document.body.appendChild(loadingToast);
      
      // Helper function to capture chart with improved timing
      const captureChart = async (selector: string, name: string): Promise<string> => {
        const element = document.querySelector(selector);
        if (!element || !(element instanceof HTMLElement)) {
          throw new Error(`${name} chart element not found`);
        }
        
        // Give charts more time to fully render and stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Ensure the chart is visible in the viewport
        element.scrollIntoView({ behavior: 'auto', block: 'center' });
        
        // Wait for any potential scroll animations
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const canvas = await html2canvas(element, {
          scale: 2.5, // Higher quality for better resolution
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff', // Ensure white background
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          onclone: (clonedDoc) => {
            // Ensure the cloned element has proper dimensions
            const clonedElement = clonedDoc.querySelector(selector);
            if (clonedElement instanceof HTMLElement) {
              clonedElement.style.width = '100%';
              clonedElement.style.height = '400px';
            }
          }
        });
        
        return canvas.toDataURL('image/png');
      };

      // Capture both charts
      const [territoryChartDataUrl, performanceChartDataUrl] = await Promise.all([
        captureChart('.territory-chart', 'Territory'),
        captureChart('.performance-chart', 'Performance')
      ]);

      // Create and download PDF with enhanced styling
      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Territory Performance Analysis</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                line-height: 1.6;
                max-width: 1200px;
                margin: 0 auto;
                background-color: #ffffff;
              }
              .chart-container {
                margin: 30px 0;
                page-break-inside: avoid;
                text-align: center;
                background: #ffffff;
                padding: 20px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              h1 {
                color: #1a56db;
                font-size: 28px;
                margin-bottom: 30px;
                text-align: center;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 10px;
              }
              h2 {
                color: #1a56db;
                font-size: 22px;
                margin-top: 40px;
                margin-bottom: 20px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
              }
              h3 {
                color: #374151;
                font-size: 18px;
                margin-top: 25px;
                font-weight: 600;
              }
              .territory-data {
                margin: 25px 0;
                background: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
              }
              .chart-image {
                width: 100%;
                max-width: 1000px;
                margin: 20px auto;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                border-radius: 4px;
              }
              .data-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                padding: 10px;
              }
              .metric {
                font-size: 14px;
                color: #4b5563;
                padding: 8px;
                background: #ffffff;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
              }
              .metadata {
                font-size: 12px;
                color: #6b7280;
                text-align: right;
                margin-bottom: 20px;
              }
              @media print {
                .chart-image { max-width: 100%; margin: 15px 0; }
                body { padding: 20px; margin: 0; }
                .territory-data { break-inside: avoid; }
                .chart-container { break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="metadata">
              Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
            
            <h1>Territory Performance Analysis</h1>
            
            <h2>Territory Distribution Analysis</h2>
            <p>Analysis of customer and machine distribution across different service territories</p>
            <div class="chart-container">
              <img src="${territoryChartDataUrl}" alt="Territory Distribution Chart" class="chart-image" />
              <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
                Chart shows the distribution of customers and machines across different territories
              </p>
            </div>
            
            <div class="territory-data">
              ${Object.entries(territoryCoverage).map(([territory, data]) => `
                <h3>${territory}</h3>
                <div class="data-grid">
                  <div class="metric">
                    <strong>Customers:</strong><br/>
                    ${data.customers}
                  </div>
                  <div class="metric">
                    <strong>Machines:</strong><br/>
                    ${data.machines}
                  </div>
                  <div class="metric">
                    <strong>Revenue:</strong><br/>
                    $${data.revenue.toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>

            <h2>Quarterly Performance Metrics</h2>
            <p>Quarterly analysis of revenue and conversion rate trends</p>
            <div class="chart-container">
              <img src="${performanceChartDataUrl}" alt="Quarterly Performance Chart" class="chart-image" />
              <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
                Chart displays revenue trends and conversion rates across quarters
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Report Summary</strong></p>
              <p>This report provides a comprehensive analysis of territory performance and quarterly metrics.
                 It includes customer distribution, machine deployment, revenue analysis, and conversion rate trends.</p>
              <p>Generated by Vending CRM Analytics Dashboard on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
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
      errorToast.className = 'fixed top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded shadow z-50';
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