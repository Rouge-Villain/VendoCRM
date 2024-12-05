import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Customer } from "@db/schema";

export function CustomerDistribution() {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      return response.json() as Promise<Customer[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const territoryDistribution = customers?.reduce((acc, customer) => {
    const territory = customer.serviceTerritory || 'Unassigned';
    acc[territory] = (acc[territory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const machineTypesDistribution = customers?.reduce((acc, customer) => {
    if (Array.isArray(customer.machineTypes)) {
      (customer.machineTypes as string[]).forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl font-bold text-primary">Territory Distribution</CardTitle>
          <p className="text-sm text-muted-foreground">Customer distribution across service areas</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(territoryDistribution || {}).map(([territory, count]) => (
              <div key={territory} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{territory}</span>
                  <span className="text-sm font-bold text-primary">{count}</span>
                </div>
                <div className="relative w-full bg-secondary/30 rounded-lg h-3 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-lg transition-all duration-300 ease-in-out"
                    style={{
                      width: `${(count / (customers?.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl font-bold text-primary">Machine Types</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution of machine categories</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(machineTypesDistribution || {}).map(([type, count]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm capitalize">{type}</span>
                  <span className="text-sm font-bold text-primary">{count}</span>
                </div>
                <div className="relative w-full bg-secondary/30 rounded-lg h-3 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/90 to-primary/70 rounded-lg transition-all duration-300 ease-in-out"
                    style={{
                      width: `${(count / (customers?.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
