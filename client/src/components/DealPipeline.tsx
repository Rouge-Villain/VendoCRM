import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText, BarChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

function DraggableDealCard({ opportunity, customers, products }: { 
  opportunity: Opportunity; 
  customers?: Customer[];
  products?: Product[];
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: opportunity.id.toString(),
  });

  if (isDragging) return null;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="touch-none"
    >
      <Card className="bg-white shadow-sm cursor-move">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="font-medium">
                ${parseFloat(opportunity.value.toString()).toLocaleString()}
              </div>
            </div>
            <div className="text-sm font-medium">
              {customers?.find((c) => c.id === opportunity.customerId)?.company}
            </div>
            <div className="text-sm text-primary">
              {products?.find((p) => p.id === opportunity.productId)?.name}
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {opportunity.notes}
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {opportunity.expectedCloseDate ? 
                  format(new Date(opportunity.expectedCloseDate), 'MMM d, yyyy') : 
                  'No close date'}
              </span>
              <span>{opportunity.assignedTo || 'Unassigned'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DroppableStage({ 
  stage, 
  opportunities, 
  customers, 
  products 
}: { 
  stage: typeof stages[number];
  opportunities: Opportunity[];
  customers?: Customer[];
  products?: Product[];
}) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  const stageOpportunities = opportunities.filter(opp => opp.stage === stage.id);

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-secondary p-4 rounded-lg">
        <div className="font-semibold mb-4">{stage.name}</div>
        <div 
          ref={setNodeRef}
          className="space-y-4 min-h-[200px]"
        >
          {stageOpportunities.map((opp) => (
            <DraggableDealCard
              key={opp.id}
              opportunity={opp}
              customers={customers}
              products={products}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DealPipeline() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showQuoteGenerator, setShowQuoteGenerator] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState<Opportunity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: Stage }) => {
      const response = await fetch(`/api/opportunities/${id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update stage');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({
        title: "Success",
        description: `Deal moved to ${stages.find(s => s.id === data.stage)?.name}`,
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dealId = parseInt(active.id.toString());
    const deal = opportunities?.find(d => d.id === dealId);
    if (deal) setDraggedDeal(deal);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const dealId = parseInt(active.id.toString());
    const newStage = over.id.toString() as Stage;
    
    const deal = opportunities?.find(d => d.id === dealId);
    if (deal && deal.stage !== newStage) {
      updateStageMutation.mutate({ id: dealId, stage: newStage });
    }
    
    setDraggedDeal(null);
  };

  if (isLoadingOpps || !customers || !products) {
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

  if (isErrorOpps || !opportunities) {
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto p-4">
        {stages.map((stage) => (
          <DroppableStage
            key={stage.id}
            stage={stage}
            opportunities={opportunities}
            customers={customers}
            products={products}
          />
        ))}
      </div>

      <DragOverlay>
        {draggedDeal && (
          <div className="w-80">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      ${parseFloat(draggedDeal.value.toString()).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {customers?.find((c) => c.id === draggedDeal.customerId)?.company}
                  </div>
                  <div className="text-sm text-primary">
                    {products?.find((p) => p.id === draggedDeal.productId)?.name}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DragOverlay>

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
    </DndContext>
  );
}
