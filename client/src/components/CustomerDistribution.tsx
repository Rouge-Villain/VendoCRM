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
      (customer.machineTypes as Array<{ type: string; quantity: number }>).forEach(machine => {
        acc[machine.type] = (acc[machine.type] || 0) + machine.quantity;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background via-background/95 to-secondary/5 border-primary/10">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
            Territory Distribution
          </CardTitle>
          <p className="text-sm text-muted-foreground">Customer distribution across service areas</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-5">
            {Object.entries(territoryDistribution || {}).map(([territory, count], index) => (
              <div key={territory} className="space-y-2 group hover:bg-secondary/5 p-3 rounded-lg transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">{territory}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((count / (customers?.length || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full shadow-sm group-hover:shadow-md transition-all">
                    {count}
                  </span>
                </div>
                <div className="relative w-full bg-secondary/20 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 via-primary to-primary/90 rounded-full transition-all duration-500 ease-out transform origin-left group-hover:scale-x-[1.02] group-hover:from-primary/90 group-hover:to-primary"
                    style={{
                      width: `${(count / (customers?.length || 1)) * 100}%`,
                      transitionDelay: `${index * 75}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background via-background/95 to-secondary/5 border-primary/10">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
            Machine Types Distribution
          </CardTitle>
          <p className="text-sm text-muted-foreground">Distribution of machine categories</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-5">
            {Object.entries(machineTypesDistribution || {}).map(([type, count], index) => (
              <div key={type} className="space-y-2 group hover:bg-secondary/5 p-3 rounded-lg transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm capitalize group-hover:text-primary transition-colors">{type}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((count / (customers?.length || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full shadow-sm group-hover:shadow-md transition-all">
                    {count} machines
                  </span>
                </div>
                <div className="relative w-full bg-secondary/20 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 via-primary to-primary/90 rounded-full transition-all duration-500 ease-out transform origin-left group-hover:scale-x-[1.02] group-hover:from-primary/90 group-hover:to-primary"
                    style={{
                      width: `${(count / (customers?.length || 1)) * 100}%`,
                      transitionDelay: `${index * 75}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/5"></div>
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
