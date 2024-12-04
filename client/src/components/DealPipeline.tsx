import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, FileText, BarChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { type Opportunity, type Customer, type Product } from "@db/schema";
import { QuoteGenerator } from "./QuoteGenerator";

const stages = [
  { id: "prospecting", name: "Prospecting" },
  { id: "qualification", name: "Qualification" },
  { id: "needs-analysis", name: "Needs Analysis" },
  { id: "proposal", name: "Proposal" },
  { id: "negotiation", name: "Negotiation" },
  { id: "closed-won", name: "Closed Won" },
  { id: "closed-lost", name: "Closed Lost" }
] as const;

type Stage = typeof stages[number]['id'];

export function DealPipeline() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showQuoteGenerator, setShowQuoteGenerator] = useState(false);

  const { data: opportunities, isLoading: isLoadingOpps, isError: isErrorOpps } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }
      return response.json() as Promise<Opportunity[]>;
    },
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      return response.json();
    },
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      return response.json();
    },
  });

  const isLoading = isLoadingOpps || !customers || !products;
  const isError = isErrorOpps;

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: Stage }) => {
      console.log('Updating stage:', { id, stage });
      const response = await fetch(`/api/opportunities/${id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update stage');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({
        title: "Success",
        description: `Deal moved to ${data.stage}`,
      });
    },
    onError: (error: Error) => {
      console.error('Stage update error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto p-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className="bg-secondary p-4 rounded-lg">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!opportunities?.length) {
    return (
      <div className="flex gap-4 overflow-x-auto p-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className="bg-secondary p-4 rounded-lg">
              <div className="font-semibold mb-4">{stage.name}</div>
              <div className="min-h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">No opportunities</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !opportunities) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load opportunities. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {stages.map((stage) => (
        <div key={stage.id} className="flex-shrink-0 w-80">
          <div className="bg-secondary p-4 rounded-lg">
            <div className="font-semibold mb-4">{stage.name}</div>
            <div className="space-y-4 min-h-[200px]">
              {opportunities
                .filter((opp) => opp.stage === stage.id)
                .map((opp) => (
                  <Card key={opp.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Select
                          value={opp.stage}
                          onValueChange={(newStage) => {
                            updateStageMutation.mutate({
                              id: opp.id,
                              stage: newStage as Stage,
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {stages.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex justify-between items-center">
                          <div className="font-medium">
                            ${parseFloat(opp.value.toString()).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {customers?.find((c) => c.id === opp.customerId)?.company}
                        </div>
                        <div className="text-sm text-primary">
                          {products?.find((p) => p.id === opp.productId)?.name}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {opp.notes}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setSelectedOpportunity(opp);
                              setShowQuoteGenerator(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Quote
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              // Show analytics
                            }}
                          >
                            <BarChart className="h-4 w-4 mr-1" />
                            Stats
                          </Button>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>
                            {opp.expectedCloseDate ? 
                              format(new Date(opp.expectedCloseDate), 'MMM d, yyyy') : 
                              'No close date'}
                          </span>
                          <span>{opp.assignedTo || 'Unassigned'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      ))}
      {selectedOpportunity && (
        <QuoteGenerator
          opportunity={selectedOpportunity}
          open={showQuoteGenerator}
          onOpenChange={(open) => {
            setShowQuoteGenerator(open);
            if (!open) setSelectedOpportunity(null);
          }}
        />
      )}
    </div>
  );
}