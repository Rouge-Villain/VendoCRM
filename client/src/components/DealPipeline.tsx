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
] as const;

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

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      const response = await fetch(`/api/opportunities/${id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stage');
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
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const oppId = parseInt(result.draggableId);
    
    if (isNaN(oppId)) {
      console.error('Invalid opportunity ID');
      return;
    }

    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return;
    }

    updateStageMutation.mutate({
      id: oppId,
      stage: result.destination.droppableId,
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

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter((opp) => opp.stage === stageId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className="bg-secondary p-4 rounded-lg">
              <div className="font-semibold mb-4">{stage.name}</div>
              <Droppable droppableId={stage.id} key={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-4 min-h-[200px] ${
                      snapshot.isDraggingOver ? 'bg-secondary/50' : ''
                    }`}
                  >
                    {getOpportunitiesByStage(stage.id).map((opp, index) => (
                      <Draggable
                        key={opp.id.toString()}
                        draggableId={opp.id.toString()}
                        index={index}
                        isDragDisabled={updateStageMutation.isPending}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-background ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            } ${updateStageMutation.isPending ? 'opacity-50' : ''}`}
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
    </DragDropContext>
  );
}
