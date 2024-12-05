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
import { AlertCircle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { type Opportunity, type Customer, type Product } from "@db/schema";
import { QuoteGenerator } from "./QuoteGenerator";

const stages = [
  { id: "prospecting", name: "Prospecting" },
  { id: "qualification", name: "Qualification" },
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
  const [showQuoteGenerator, setShowQuoteGenerator] = useState(false);

  if (isDragging) return null;

  const customer = customers?.find((c) => c.id === opportunity.customerId);
  const product = products?.find((p) => p.id === opportunity.productId);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="touch-none"
    >
      <Card className="bg-white shadow-sm cursor-move relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
        <CardContent className="p-3">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="font-medium">
                ${parseFloat(opportunity.value.toString()).toLocaleString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-7 px-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowQuoteGenerator(true);
                }}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Quote</span>
              </Button>
            </div>
            <div className="text-sm font-medium truncate">
              {customer?.company}
            </div>
            <div className="text-sm text-primary truncate">
              {product?.name}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-1">
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
      {showQuoteGenerator && (
        <QuoteGenerator
          opportunity={opportunity}
          open={showQuoteGenerator}
          onOpenChange={setShowQuoteGenerator}
        />
      )}
    </div>
  );
}

function DroppableStage({ 
  stage, 
  opportunities, 
  customers, 
  products,
  metrics
}: { 
  stage: typeof stages[number];
  opportunities: Opportunity[];
  customers?: Customer[];
  products?: Product[];
  metrics: { count: number; totalValue: number; weightedValue: number; avgProbability: number; };
}) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  const stageOpportunities = opportunities.filter(opp => opp.stage === stage.id);
  const isClosingStage = stage.id.startsWith('closed-');
  const stageClass = stage.id === 'closed-won' 
    ? 'border-l-4 border-l-green-500'
    : stage.id === 'closed-lost'
    ? 'border-l-4 border-l-red-500'
    : '';

  return (
    <div className="flex-shrink-0 w-[280px]">
      <div className={`bg-card rounded-lg ${stageClass} border shadow-sm hover:bg-accent/50 transition-colors h-[calc(100vh-240px)] flex flex-col`}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-base">{stage.name}</div>
            <div className="text-sm text-muted-foreground">{metrics.count}</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Value:</span>
              <span className="font-medium">${metrics.totalValue.toLocaleString()}</span>
            </div>
            {!isClosingStage && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weighted Value:</span>
                  <span className="font-medium">${metrics.weightedValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Probability:</span>
                  <span className="font-medium">{Math.round(metrics.avgProbability)}%</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div 
          ref={setNodeRef}
          className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 min-h-0"
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
  const [draggedDeal, setDraggedDeal] = useState<Opportunity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
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
      <div className="h-full w-full overflow-x-auto">
        <div className="flex gap-6 p-4 min-w-max">
          {stages.map((stage) => (
            <div key={stage.id} className="w-[280px]">
              <div className="bg-card p-4 rounded-lg border">
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

  const stageMetrics = stages.reduce((acc, stage) => {
    const stageOpportunities = opportunities.filter(opp => opp.stage === stage.id);
    const totalValue = stageOpportunities.reduce((sum, opp) => sum + parseFloat(opp.value.toString()), 0);
    const avgProbability = stageOpportunities.length > 0
      ? stageOpportunities.reduce((sum, opp) => sum + (opp.probability || 0), 0) / stageOpportunities.length
      : 0;
    
    acc[stage.id] = {
      count: stageOpportunities.length,
      totalValue,
      weightedValue: totalValue * (avgProbability / 100),
      avgProbability
    };
    return acc;
  }, {} as Record<string, { count: number; totalValue: number; weightedValue: number; avgProbability: number; }>);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 h-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                ${opportunities.reduce((sum, opp) => sum + parseFloat(opp.value.toString()), 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Pipeline Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                ${opportunities
                  .reduce((sum, opp) => sum + (parseFloat(opp.value.toString()) * ((opp.probability || 0) / 100)), 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Weighted Pipeline Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {opportunities.filter(opp => opp.stage === 'closed-won').length}
              </div>
              <div className="text-sm text-muted-foreground">Won Deals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {Math.round(
                  (opportunities.filter(opp => opp.stage === 'closed-won').length /
                    Math.max(opportunities.filter(opp => ['closed-won', 'closed-lost'].includes(opp.stage)).length, 1)) * 100
                )}%
              </div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="h-[calc(100vh-240px)] overflow-x-auto">
          <div className="flex gap-6 px-4 min-w-max h-full">
            {stages.map((stage) => (
              <DroppableStage
                key={stage.id}
                stage={stage}
                opportunities={opportunities}
                customers={customers}
                products={products}
                metrics={stageMetrics[stage.id]}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {draggedDeal && (
            <div className="w-[280px]">
              <Card className="bg-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
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
      </div>
    </DndContext>
  );
}
