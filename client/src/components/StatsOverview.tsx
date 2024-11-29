import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Customer } from "@db/schema";
import { Users, Box, Map, UserPlus } from "lucide-react";

export function StatsOverview() {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      return response.json() as Promise<Customer[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-8 w-1/2 bg-gray-200 rounded" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const totalCustomers = customers?.length || 0;
  const totalMachines = customers?.reduce((acc, customer) => 
    acc + (customer.machineTypes?.length || 0), 0) || 0;
  const territories = new Set(customers?.map(c => c.serviceTerritory)).size;
  const recentCustomers = customers
    ?.filter(c => c.createdAt ? new Date(c.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : false)
    .length || 0;

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: Users,
      description: "Active customer accounts",
    },
    {
      title: "Machines Deployed",
      value: totalMachines,
      icon: Box,
      description: "Total machines in service",
    },
    {
      title: "Service Territories",
      value: territories,
      icon: Map,
      description: "Active service areas",
    },
    {
      title: "Recent Additions",
      value: recentCustomers,
      icon: UserPlus,
      description: "New customers (7 days)",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
