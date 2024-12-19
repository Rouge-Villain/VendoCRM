import { useState, useEffect } from 'react';
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

  const processData = (rawData: Activity[] | undefined, frame: TimeFrame) => {
    if (!rawData) return { labels: [], datasets: [] };

    const activityCounts: Record<string, number> = {};
    const now = new Date();
    const timeLabels: string[] = [];

    // Generate time labels based on selected frame
    for (let i = 0; i < (frame === 'daily' ? 24 : frame === 'weekly' ? 7 : 30); i++) {
      const label = frame === 'daily' 
        ? `${i}:00`
        : frame === 'weekly'
          ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]
          : `Day ${i + 1}`;
      timeLabels.push(label);
      activityCounts[label] = 0;
    }

    // Count activities
    rawData.forEach(activity => {
      const date = new Date(activity.createdAt);
      let label: string;

      if (frame === 'daily') {
        label = `${date.getHours()}:00`;
      } else if (frame === 'weekly') {
        label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      } else {
        label = `Day ${date.getDate()}`;
      }

      activityCounts[label] = (activityCounts[label] || 0) + 1;
    });

    return {
      labels: timeLabels,
      datasets: [
        {
          label: 'Activity Count',
          data: timeLabels.map(label => activityCounts[label]),
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
