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
import { type Opportunity } from "@db/schema";

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

  // Calculate win/loss ratio by stage with values
  const stageAnalysis = opportunities?.reduce((acc, opp) => {
    if (!acc[opp.stage]) {
      acc[opp.stage] = { 
        won: 0, 
        lost: 0, 
        total: 0,
        wonValue: 0,
        lostValue: 0,
        totalValue: 0,
        winRate: 0
      };
    }
    const value = Number(opp.value) || 0;
    acc[opp.stage].totalValue += value;
    
    if (opp.status === 'closed-won') {
      acc[opp.stage].won++;
      acc[opp.stage].wonValue += value;
    } else if (opp.status === 'closed-lost') {
      acc[opp.stage].lost++;
      acc[opp.stage].lostValue += value;
    }
    acc[opp.stage].total++;
    acc[opp.stage].winRate = acc[opp.stage].total > 0 ? 
      (acc[opp.stage].won / acc[opp.stage].total) * 100 : 0;
    
    return acc;
  }, {} as Record<string, { 
    won: number; 
    lost: number; 
    total: number;
    wonValue: number;
    lostValue: number;
    totalValue: number;
    winRate: number;
  }>);

  // Calculate monthly performance and projections
  const monthlyPerformance = opportunities?.reduce((acc, opp) => {
    if (opp.createdAt) {
      const date = new Date(opp.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          totalValue: 0,
          wonValue: 0,
          count: 0,
          winRate: 0
        };
      }
      
      acc[monthYear].totalValue += Number(opp.value);
      if (opp.status === 'closed-won') {
        acc[monthYear].wonValue += Number(opp.value);
      }
      acc[monthYear].count++;
      acc[monthYear].winRate = (acc[monthYear].wonValue / acc[monthYear].totalValue) * 100;
    }
    return acc;
  }, {} as Record<string, { totalValue: number; wonValue: number; count: number; winRate: number }>);

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
    </div>
  );
}
