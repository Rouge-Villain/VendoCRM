import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText, BarChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { type Opportunity } from "@db/schema";
import { QuoteGenerator } from "./QuoteGenerator";

const stages = [
  { id: "prospecting", name: "Prospecting" },
  { id: "qualification", name: "Qualification" },
  { id: "needs-analysis", name: "Needs Analysis" },
  { id: "proposal", name: "Proposal" },
  { id: "negotiation", name: "Negotiation" },
  { id: "closed-won", name: "Closed Won" },
  { id: "closed-lost", name: "Closed Lost" }
];

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

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      return response.json();
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      return response.json();
    },
  });

  const isLoading = isLoadingOpps || !customers || !products;
  const isError = isErrorOpps;

  // Calculate stage statistics
  const stageStats = stages.reduce((acc, stage) => {
    const stageOpps = opportunities?.filter(opp => opp.stage === stage.id) || [];
    acc[stage.id] = {
      count: stageOpps.length,
      value: stageOpps.reduce((sum, opp) => sum + Number(opp.value), 0),
      avgProbability: stageOpps.length ? 
        stageOpps.reduce((sum, opp) => sum + (opp.probability || 0), 0) / stageOpps.length : 
        0
    };
    return acc;
  }, {} as Record<string, { count: number; value: number; avgProbability: number }>);

  const updateStageMutation = useMutation({
  mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
    const response = await fetch(`/api/opportunities/${id}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (!response.ok) {
      throw new Error("Failed to update opportunity stage");
    }
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["opportunities"] });
  },
});

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    updateStageMutation.mutate({
      id: parseInt(draggableId),
      stage: destination.droppableId,
    });
  };

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

  if (!opportunities) {
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

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities?.filter((opp) => opp.stage === stage) || [];
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto p-4">
          {stages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <div className="bg-secondary p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">{stage.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {stageStats[stage.id]?.count || 0} deals · ${stageStats[stage.id]?.value.toLocaleString()}
                  </div>
                </div>
                <div className="h-1 bg-primary/20 rounded mb-4">
                  <div 
                    className="h-full bg-primary rounded" 
                    style={{ 
                      width: `${stageStats[stage.id]?.avgProbability || 0}%` 
                    }} 
                  />
                </div>
                <Droppable droppableId={stage.id} key={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-4 min-h-[100px] ${
                        snapshot.isDraggingOver ? 'bg-secondary/50' : ''
                      }`}
                    >
                      {getOpportunitiesByStage(stage.id).map((opp, index) => (
                        <Draggable
                          key={opp.id}
                          draggableId={opp.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-background"
                            >
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="font-medium">
                                      ${parseFloat(opp.value.toString()).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium">
                                    {customers?.find(c => c.id === opp.customerId)?.company}
                                  </div>
                                  <div className="text-sm text-primary">
                                    {products?.find(p => p.id === opp.productId)?.name}
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
                                        // TODO: Show analytics
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
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>

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
    </>
  );
}
