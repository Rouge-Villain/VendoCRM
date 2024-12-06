import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalCustomers = customers?.length || 0;
  const totalMachines = customers?.reduce((acc, customer) => 
    acc + (Array.isArray(customer.machineTypes) ? customer.machineTypes.length : 0), 0) || 0;
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background via-background/95 to-secondary/5 border border-border/50 group"
        >
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                {stat.title}
              </h3>
              <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                {stat.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
