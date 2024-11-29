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
    customer.machineTypes?.forEach(type => {
      acc[type] = (acc[type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Territory Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(territoryDistribution || {}).map(([territory, count]) => (
              <div key={territory} className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{
                      width: `${(count / (customers?.length || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium min-w-[100px]">
                  {territory}: {count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Machine Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(machineTypesDistribution || {}).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{
                      width: `${(count / (customers?.length || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium min-w-[100px]">
                  {type}: {count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
