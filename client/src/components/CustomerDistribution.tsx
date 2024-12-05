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
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background via-background/95 to-secondary/5 border border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-primary">
                Territory Distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Service areas overview</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {Object.entries(territoryDistribution || {}).map(([territory, count], index) => {
              const percentage = ((count / (customers?.length || 1)) * 100);
              return (
              <div key={territory} 
                className="group hover:bg-secondary/5 p-2.5 rounded-lg transition-all duration-300 border border-transparent hover:border-border/50">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <span className="font-semibold text-xs text-primary">{percentage.toFixed(0)}%</span>
                    </div>
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">{territory}</span>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full shadow-sm group-hover:shadow-md transition-all">
                    {count} customers
                  </span>
                </div>
                <div className="relative w-full bg-secondary/20 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 via-primary to-primary/90 rounded-full transition-all duration-500 ease-out transform origin-left group-hover:scale-x-[1.02] group-hover:from-primary/90 group-hover:to-primary"
                    style={{
                      width: `${percentage}%`,
                      transitionDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/5"></div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background via-background/95 to-secondary/5 border border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-primary">
                Machine Types
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Equipment distribution</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {Object.entries(machineTypesDistribution || {}).map(([type, count], index) => {
              const totalMachines = Object.values(machineTypesDistribution || {}).reduce((sum, c) => sum + c, 0);
              const percentage = ((count / totalMachines) * 100);
              return (
              <div key={type} 
                className="group hover:bg-secondary/5 p-2.5 rounded-lg transition-all duration-300 border border-transparent hover:border-border/50">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <span className="font-semibold text-xs text-primary">{percentage.toFixed(0)}%</span>
                    </div>
                    <span className="font-medium text-sm capitalize group-hover:text-primary transition-colors">{type}</span>
                  </div>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full shadow-sm group-hover:shadow-md transition-all">
                    {count} units
                  </span>
                </div>
                <div className="relative w-full bg-secondary/20 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 via-primary to-primary/90 rounded-full transition-all duration-500 ease-out transform origin-left group-hover:scale-x-[1.02] group-hover:from-primary/90 group-hover:to-primary"
                    style={{
                      width: `${percentage}%`,
                      transitionDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/5"></div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
