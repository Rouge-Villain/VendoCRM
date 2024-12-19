import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { type Opportunity } from "@db/schema";

export function SalesPipeline() {
  const { data: opportunities } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      return response.json() as Promise<Opportunity[]>;
    },
  });

  const stages = ["prospecting", "qualification", "proposal", "closed"];
  const stageColors = {
    prospecting: "bg-blue-100",
    qualification: "bg-yellow-100",
    proposal: "bg-purple-100",
    closed: "bg-green-100",
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {stages.map((stage) => {
        const stageOpportunities = opportunities?.filter(
          (opp) => opp.status === stage
        );
        const totalValue = stageOpportunities?.reduce(
          (sum, opp) => sum + parseFloat(opp.value.toString()),
          0
        );

        return (
          <Card
            key={stage}
            className={`p-4 ${stageColors[stage as keyof typeof stageColors]}`}
          >
            <h3 className="font-medium mb-2 capitalize">{stage}</h3>
            <div className="space-y-2">
              <p className="text-sm">
                {stageOpportunities?.length || 0} opportunities
              </p>
              <p className="font-bold">
                ${totalValue?.toLocaleString() || "0"}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
