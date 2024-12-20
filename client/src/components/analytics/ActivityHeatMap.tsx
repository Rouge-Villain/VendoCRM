import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Activity {
  id: number;
  customerId: number;
  type: string;
  createdAt: string;
  contactMethod: string;
}

type TimeFrame = 'daily' | 'weekly' | 'monthly';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const getDayLabel = (index: number): string => {
  // Ensure index is within bounds and convert to valid day index
  const safeIndex = ((index % 7) + 7) % 7 as DayIndex;
  return DAYS[safeIndex];
};

export function ActivityHeatMap() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await fetch('/api/activities');
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  interface ChartData {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      tension: number;
    }>;
  }

  const processData = (rawData: Activity[] | undefined, frame: TimeFrame): ChartData => {
    if (!rawData) return { labels: [], datasets: [] };

    const activityCounts = new Map<string, number>();
    const timeLabels: string[] = [];

    // Generate time labels based on selected frame
    const maxCount = frame === 'daily' ? 24 : frame === 'weekly' ? 7 : 30;
    for (let i = 0; i < maxCount; i++) {
      const label = frame === 'daily'
        ? `${i}:00`
        : frame === 'weekly'
          ? getDayLabel(i)
          : `Day ${i + 1}`;

      timeLabels.push(label);
      activityCounts.set(label, 0);
    }

    // Count activities
    rawData.forEach(activity => {
      if (!activity.createdAt) return;
      
      const date = new Date(activity.createdAt);
      const getLabel = (): string => {
        const hour = date.getHours();
        const dayIndex = date.getDay();
        const dayOfMonth = date.getDate();

        if (frame === 'daily') {
          return `${hour}:00`;
        }
        if (frame === 'weekly') {
          return getDayLabel(dayIndex);
        }
        return `Day ${dayOfMonth}`;
      };

      const label = getLabel();
      if (activityCounts.has(label)) {
        activityCounts.set(label, (activityCounts.get(label) ?? 0) + 1);
      }
    });

    return {
      labels: timeLabels,
      datasets: [
        {
          label: 'Activity Count',
          data: timeLabels.map(label => activityCounts.get(label) ?? 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const chartData = processData(activities, timeFrame);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Customer Activity Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Activities',
        },
      },
      x: {
        title: {
          display: true,
          text: timeFrame === 'daily' ? 'Hour' : timeFrame === 'weekly' ? 'Day of Week' : 'Day of Month',
        },
      },
    },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Heat Map</CardTitle>
          <Select value={timeFrame} onValueChange={(value: TimeFrame) => setTimeFrame(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily View</SelectItem>
              <SelectItem value="weekly">Weekly View</SelectItem>
              <SelectItem value="monthly">Monthly View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
