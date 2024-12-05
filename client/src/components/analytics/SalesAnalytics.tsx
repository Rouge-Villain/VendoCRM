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
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Opportunity } from "@db/schema";
import { addMonths, format, startOfMonth } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export function SalesAnalytics() {
  const { data: opportunities } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      return response.json() as Promise<Opportunity[]>;
    },
  });

  // Calculate win/loss ratio and reasons
  const winLossData = opportunities?.reduce((acc, opp) => {
    if (opp.stage === 'closed-won') {
      acc.won++;
      acc.wonValue += Number(opp.value);
    } else if (opp.stage === 'closed-lost') {
      acc.lost++;
      acc.lostValue += Number(opp.value);
      acc.reasons[opp.lostReason || 'Other'] = (acc.reasons[opp.lostReason || 'Other'] || 0) + 1;
    }
    return acc;
  }, { won: 0, lost: 0, wonValue: 0, lostValue: 0, reasons: {} as Record<string, number> });

  // Calculate monthly performance (last 12 months)
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = addMonths(new Date(), -i);
    return startOfMonth(date);
  }).reverse();

  const monthlyPerformance = last12Months.reduce((acc, month) => {
    const monthStr = format(month, 'MMM yyyy');
    acc[monthStr] = {
      deals: 0,
      value: 0,
      won: 0,
      lost: 0,
    };
    return acc;
  }, {} as Record<string, { deals: number; value: number; won: number; lost: number; }>);

  opportunities?.forEach(opp => {
    if (opp.createdAt) {
      const monthStr = format(new Date(opp.createdAt), 'MMM yyyy');
      if (monthlyPerformance[monthStr]) {
        monthlyPerformance[monthStr].deals++;
        monthlyPerformance[monthStr].value += Number(opp.value);
        if (opp.stage === 'closed-won') monthlyPerformance[monthStr].won++;
        if (opp.stage === 'closed-lost') monthlyPerformance[monthStr].lost++;
      }
    }
  });

  // Calculate yearly projections based on last 3 months trend
  const last3MonthsData = Object.values(monthlyPerformance).slice(-3);
  const averageMonthlyValue = last3MonthsData.reduce((sum, month) => sum + month.value, 0) / 3;
  const projectedYearlyValue = averageMonthlyValue * 12;

  // Chart data
  const total = (winLossData?.won || 0) + (winLossData?.lost || 0);
  const winPercentage = total > 0 ? ((winLossData?.won || 0) / total) * 100 : 0;
  const lossPercentage = total > 0 ? ((winLossData?.lost || 0) / total) * 100 : 0;

  const winLossChartData = {
    labels: [`Won (${winPercentage.toFixed(1)}%)`, `Lost (${lossPercentage.toFixed(1)}%)`],
    datasets: [
      {
        data: [winLossData?.won || 0, winLossData?.lost || 0],
        backgroundColor: ['rgba(34, 197, 94, 0.5)', 'rgba(239, 68, 68, 0.5)'],
        borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
      },
    ],
  };

  const monthlyPerformanceData = {
    labels: Object.keys(monthlyPerformance),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(monthlyPerformance).map(m => m.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Projected Revenue',
        data: Object.keys(monthlyPerformance).map((_, i) => 
          i >= Object.keys(monthlyPerformance).length - 3 ? averageMonthlyValue : null
        ),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        borderDashOffset: 5,
        borderDash: [5, 5],
        tension: 0.3,
      },
    ],
  };

  const lostReasonsData = {
    labels: Object.keys(winLossData?.reasons || {}),
    datasets: [
      {
        data: Object.values(winLossData?.reasons || {}),
        backgroundColor: [
          'rgba(239, 68, 68, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(168, 85, 247, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Pie
                data={winLossChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label?.split(' (')[0];
                          const value = context.raw as number;
                          const moneyValue = label === 'Won' ? winLossData?.wonValue : winLossData?.lostValue;
                          return [
                            `${label}: ${value} deals`,
                            `Value: $${(moneyValue || 0).toLocaleString()}`
                          ];
                        },
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Total Won: ${(winLossData?.wonValue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Lost: ${(winLossData?.lostValue || 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lost Deal Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Pie
                data={lostReasonsData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance & Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line
              data={monthlyPerformanceData}
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
                    ticks: {
                      callback: (value) => `$${Number(value).toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium">Projected Annual Revenue:</p>
            <p className="text-2xl font-bold">${projectedYearlyValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              Based on last 3 months average: ${averageMonthlyValue.toLocaleString()}/month
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
