import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { type Opportunity } from "@db/schema";

const stages = [
  { id: "prospecting", name: "Prospecting" },
  { id: "qualification", name: "Qualification" },
  { id: "needs-analysis", name: "Needs Analysis" },
  { id: "proposal", name: "Proposal" },
  { id: "negotiation", name: "Negotiation" },
  { id: "closed-won", name: "Closed Won" },
];

export function DealPipeline() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }
      return response.json() as Promise<Opportunity[]>;
    },
  });

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
      toast({ title: "Deal updated successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to update deal",
        variant: "destructive",
      });
    },
  });

  const onDragEnd = (result: any) => {
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
    return <div>Loading deals...</div>;
  }

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities?.filter((opp) => opp.stage === stage) || [];
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className="bg-secondary p-4 rounded-lg">
              <h3 className="font-semibold mb-4">{stage.name}</h3>
              <Droppable droppableId={stage.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
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
                                <div className="font-medium">
                                  Value: ${parseFloat(opp.value.toString()).toFixed(2)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {opp.notes}
                                </div>
                                {opp.probability && (
                                  <div className="text-sm">
                                    Probability: {opp.probability}%
                                  </div>
                                )}
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
  );
}
