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
import { Bar, Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Opportunity, type Product } from "@db/schema";



const stages = [
  { id: "prospecting", name: "Prospecting" },
  { id: "qualification", name: "Qualification" },
  { id: "closed-won", name: "Closed Won" },
  { id: "closed-lost", name: "Closed Lost" }
] as const;

type Stage = typeof stages[number]['id'];
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

export function WinLossAnalytics() {
  const { data: opportunities } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      return response.json() as Promise<Opportunity[]>;
    },
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      return response.json();
    },
  });

  // Calculate win/loss ratio by stage with values
  const stageAnalysis = opportunities?.reduce<Record<Stage, {
    won: number;
    lost: number;
    total: number;
    wonValue: number;
    lostValue: number;
    totalValue: number;
    winRate: number;
    avgTimeInStage: number;
    conversionRate: number;
    productWins: Record<number, number>;
    productLosses: Record<number, number>;
  }>>((acc, opp) => {
    const stage = opp.stage as Stage;
    if (!stages.some(s => s.id === stage)) {
      return acc;
    }
    
    if (!acc[stage]) {
      acc[stage] = {
        won: 0,
        lost: 0,
        total: 0,
        wonValue: 0,
        lostValue: 0,
        totalValue: 0,
        winRate: 0,
        avgTimeInStage: 0,
        conversionRate: 0,
        productWins: {},
        productLosses: {}
      };
    }
    
    const value = Number(opp.value) || 0;
    acc[stage].totalValue += value;
    
    // Track wins and losses by product
    if (!acc[stage].productWins[opp.productId]) {
      acc[stage].productWins[opp.productId] = 0;
    }
    if (!acc[stage].productLosses[opp.productId]) {
      acc[stage].productLosses[opp.productId] = 0;
    }
    if (opp.status === 'closed-won') {
      acc[stage].won++;
      acc[stage].wonValue += value;
      acc[stage].productWins[opp.productId]++;
    } else if (opp.status === 'closed-lost') {
      acc[stage].lost++;
      acc[stage].lostValue += value;
      acc[stage].productLosses[opp.productId]++;
    }
    
    // Calculate time in stage
    if (opp.updatedAt && opp.createdAt) {
      const timeInStage = new Date(opp.updatedAt).getTime() - new Date(opp.createdAt).getTime();
      const currentTotal = acc[stage].total;
      const currentAvg = acc[stage].avgTimeInStage;
      acc[stage].avgTimeInStage = (currentAvg * currentTotal + timeInStage) / (currentTotal + 1);
    }
    
    acc[stage].total++;
    acc[stage].winRate = acc[stage].total > 0 ? 
      (acc[stage].won / acc[stage].total) * 100 : 0;
    
    return acc;
  }, {} as Record<string, { 
    won: number; 
    lost: number; 
    total: number;
    wonValue: number;
    lostValue: number;
    totalValue: number;
    winRate: number;
    avgTimeInStage: number;
    conversionRate: number;
    productWins: Record<number, number>;
    productLosses: Record<number, number>;
  }>);

  // Calculate monthly performance and projections with year-over-year comparison
  interface MonthlyMetrics {
    totalValue: number;
    wonValue: number;
    count: number;
    winRate: number;
    target: number;
    yearOverYear: number;
  }

  const monthlyPerformance = opportunities?.reduce<Record<string, MonthlyMetrics>>((acc, opp) => {
    if (opp.createdAt) {
      const date = new Date(opp.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      const year = date.getFullYear();
      
      if (!acc[monthYear]) {
        // Set monthly target as 10% more than last year's same month
        const lastYear = new Date(date);
        lastYear.setFullYear(year - 1);
        const lastYearMonth = lastYear.toLocaleString('default', { month: 'short', year: 'numeric' });
        const lastYearValue = acc[lastYearMonth]?.wonValue || 0;
        
        acc[monthYear] = {
          totalValue: 0,
          wonValue: 0,
          count: 0,
          winRate: 0,
          target: lastYearValue * 1.1, // 10% growth target
          yearOverYear: 0
        };
      }
      
      acc[monthYear].totalValue += Number(opp.value);
      if (opp.status === 'closed-won') {
        acc[monthYear].wonValue += Number(opp.value);
      }
      acc[monthYear].count++;
      acc[monthYear].winRate = (acc[monthYear].wonValue / acc[monthYear].totalValue) * 100;
      
      // Calculate year-over-year growth
      const lastYear = new Date(date);
      lastYear.setFullYear(year - 1);
      const lastYearMonth = lastYear.toLocaleString('default', { month: 'short', year: 'numeric' });
      const lastYearValue = acc[lastYearMonth]?.wonValue || 0;
      acc[monthYear].yearOverYear = lastYearValue ? ((acc[monthYear].wonValue - lastYearValue) / lastYearValue) * 100 : 0;
    }
    return acc;
  }, {} as Record<string, { 
    totalValue: number; 
    wonValue: number; 
    count: number; 
    winRate: number;
    target: number;
    yearOverYear: number;
  }>);

  // Calculate yearly projection based on last 3 months trend
  const monthKeys = Object.keys(monthlyPerformance ?? {});
  const lastThreeMonths = monthKeys.slice(-3);
  const avgMonthlyGrowth = monthlyPerformance ? lastThreeMonths.reduce((acc, month, index) => {
    if (index === 0) return acc;
    const prevMonth = lastThreeMonths[index - 1];
    const currentValue = monthlyPerformance[month]?.wonValue ?? 0;
    const prevValue = monthlyPerformance[prevMonth]?.wonValue ?? 1; // Prevent division by zero
    const growth = currentValue / prevValue - 1;
    return acc + growth;
  }, 0) / (lastThreeMonths.length - 1) : 0;

  // Project next 6 months
  const lastMonth = monthKeys[monthKeys.length - 1];
  const lastMonthData = monthlyPerformance?.[lastMonth];
  const baseValue = lastMonthData?.wonValue ?? 0;

  type ProjectedMonth = {
    projectedValue: number;
    isProjection: boolean;
  };

  const projectedMonths = Array.from({ length: 6 }).reduce<Record<string, ProjectedMonth>>((acc, _, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() + index + 1);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    const projectedValue = baseValue * Math.pow(1 + (avgMonthlyGrowth || 0), index + 1);
    acc[monthYear] = {
      projectedValue,
      isProjection: true
    };
    return acc;
  }, {});

  const winLossData = {
    labels: Object.keys(stageAnalysis || {}),
    datasets: [
      {
        label: 'Won',
        data: Object.values(stageAnalysis || {}).map(stage => stage.won),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Lost',
        data: Object.values(stageAnalysis || {}).map(stage => stage.lost),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const performanceData = {
    labels: [
      ...Object.keys(monthlyPerformance || {}),
      ...Object.keys(projectedMonths),
    ],
    datasets: [
      {
        label: 'Actual Revenue',
        data: Object.values(monthlyPerformance || {}).map(m => m.wonValue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        segment: {
          borderDash: undefined,
        },
      },
      {
        label: 'Target',
        data: Object.values(monthlyPerformance || {}).map(m => m.target),
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        borderWidth: 2,
        borderDash: [5, 5],
      },
      {
        label: 'Projected Revenue',
        data: [
          ...Array(Object.keys(monthlyPerformance || {}).length).fill(null),
          ...Object.values(projectedMonths).map((m: { projectedValue: number }) => m.projectedValue),
        ],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stageAnalysis || {}).map(([stage, data]) => (
          <Card key={stage}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">{stage}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Win Rate</span>
                  <span className="font-medium">{data.winRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Won Deals</span>
                  <span className="text-green-600 font-medium">{data.won}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Lost Deals</span>
                  <span className="text-red-600 font-medium">{data.lost}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <span className="font-medium">${data.totalValue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Win/Loss Analysis by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar
              data={winLossData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                },
                scales: {
                  x: {
                    stacked: true,
                  },
                  y: {
                    stacked: true,
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stage Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stages.map((stage) => {
              type StageMetrics = {
                avgTimeInStage: number;
                total: number;
                won: number;
                lost: number;
                conversionRate: number;
                winRate: number;
                wonValue: number;
                lostValue: number;
                totalValue: number;
                productWins: Record<number, number>;
                productLosses: Record<number, number>;
              };

              const metrics: StageMetrics = stageAnalysis?.[stage.id] || {
                avgTimeInStage: 0,
                total: 0,
                won: 0,
                lost: 0,
                conversionRate: 0,
                winRate: 0,
                wonValue: 0,
                lostValue: 0,
                totalValue: 0,
                productWins: {},
                productLosses: {}
              };
              
              const timeInDays = Math.round(metrics.avgTimeInStage / (1000 * 60 * 60 * 24));
              const previousStageTotal = stage.id === stages[0].id ? metrics.total :
                stageAnalysis?.[stages[stages.findIndex(s => s.id === stage.id) - 1].id]?.total || 0;
              const conversionRate = previousStageTotal > 0 ? (metrics.total / previousStageTotal) * 100 : 0;
              
              return (
                <div key={stage.id} className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold mb-2">{stage.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Time in Stage</span>
                      <span className="font-medium">{timeInDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <span className="font-medium">{conversionRate.toFixed(1)}%</span>
                    </div>
                    {stage.id.startsWith('closed-') && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Win Rate</span>
                        <span className={`font-medium ${metrics.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.winRate.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {products?.map((product) => {
              const productStats = Object.values(stageAnalysis || {}).reduce(
                (acc, stage) => {
                  acc.wins += stage.productWins[product.id] || 0;
                  acc.losses += stage.productLosses[product.id] || 0;
                  return acc;
                },
                { wins: 0, losses: 0 }
              );
              
              const total = productStats.wins + productStats.losses;
              const winRate = total > 0 ? (productStats.wins / total) * 100 : 0;
              
              return (
                <div key={product.id} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{product.name}</h4>
                    <span className={`text-sm font-semibold ${winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {winRate.toFixed(1)}% Win Rate
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Won Deals</div>
                      <div className="text-lg font-semibold text-green-600">{productStats.wins}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Lost Deals</div>
                      <div className="text-lg font-semibold text-red-600">{productStats.losses}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance & Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line
              data={performanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Revenue ($)',
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
          <CardTitle>Year-over-Year Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(monthlyPerformance || {}).slice(-3).map(([month, data]) => (
              <div key={month} className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">{month}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <span className="font-medium">${data.wonValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">vs Target</span>
                    <span className={`font-medium ${data.wonValue >= data.target ? 'text-green-600' : 'text-red-600'}`}>
                      {((data.wonValue / data.target - 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">YoY Growth</span>
                    <span className={`font-medium ${data.yearOverYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.yearOverYear.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
