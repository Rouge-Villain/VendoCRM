import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  useDraggable,
  useDroppable,
  MeasuringStrategy,
  CollisionDetection,
  pointerWithin,
} from "@dnd-kit/core";
import { FixedSizeList as List } from "react-window";
import { cn } from "@/lib/utils";
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
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

const DraggableDealCard = React.memo(({ 
  opportunity, 
  customers, 
  products 
}: { 
  opportunity: Opportunity; 
  customers?: Customer[];
  products?: Product[];
}) => {
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
      className="touch-none transform-gpu will-change-transform"
    >
      <Card className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-75 cursor-move relative overflow-hidden border border-border/50 hover:border-primary/20 group translate-gpu will-change-transform">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/80 group-hover:bg-primary transition-colors duration-75" />
        <CardContent className="p-4">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg text-primary">
                ${parseFloat(opportunity.value.toString()).toLocaleString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 h-8 px-3 opacity-80 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowQuoteGenerator(true);
                }}
              >
                <FileText className="h-4 w-4" />
                <span>Quote</span>
              </Button>
            </div>
            <div className="text-sm font-medium truncate">
              {customer?.company}
            </div>
            <div className="text-sm font-medium text-primary/90 truncate">
              {product?.name}
            </div>
            <div className="text-xs text-muted-foreground/90 line-clamp-2 min-h-[2.5em]">
              {opportunity.notes}
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border/40">
              <span>
                {opportunity.expectedCloseDate ? 
                  format(new Date(opportunity.expectedCloseDate), 'MMM d, yyyy') : 
                  'No close date'}
              </span>
              <span className="font-medium">{opportunity.assignedTo || 'Unassigned'}</span>
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
});

DraggableDealCard.displayName = "DraggableDealCard";

const DroppableStage = React.memo(({ 
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
}) => {
  const { setNodeRef, isOver: isDraggingOver } = useDroppable({
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
    <div className="flex-shrink-0 w-[320px]">
      <div className={`bg-card/50 backdrop-blur-sm rounded-xl ${stageClass} border shadow-md hover:shadow-lg hover:bg-accent/40 transition-all duration-200 h-full flex flex-col`}>
        <div className="p-5 space-y-4">
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
          className={cn(
            "flex-1 min-h-0 transition-all duration-200",
            "transform-gpu rounded-xl",
            isDraggingOver && "scale-[1.02] transition-transform duration-75 bg-primary/5"
          )}
        >
          <List
            height={600}
            itemCount={stageOpportunities.length}
            itemSize={180}
            width={280}
            itemData={{
              opportunities: stageOpportunities,
              customers,
              products
            }}
          >
            {({ index, style, data }) => (
              <div style={style}>
                <DraggableDealCard
                  opportunity={data.opportunities[index]}
                  customers={data.customers}
                  products={data.products}
                />
              </div>
            )}
          </List>
        </div>
      </div>
    </div>
  );
});

DroppableStage.displayName = "DroppableStage";

export function DealPipeline() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draggedDeal, setDraggedDeal] = useState<Opportunity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 0,
        tolerance: 5,
      },
    })
  );

  const collisionDetectionStrategy: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    return pointerCollisions.length > 0 ? [pointerCollisions[0]] : [];
  };

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const dealId = parseInt(active.id.toString());
    const deal = opportunities?.find(d => d.id === dealId);
    if (deal) setDraggedDeal(deal);
  }, [opportunities]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const dealId = parseInt(active.id.toString());
    const newStage = over.id.toString() as Stage;
    
    const deal = opportunities?.find(d => d.id === dealId);
    if (deal && deal.stage !== newStage) {
      updateStageMutation.mutate({ id: dealId, stage: newStage });
    }
    
    setDraggedDeal(null);
  }, [opportunities, updateStageMutation]);

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
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.BeforeDragging,
        },
      }}
    >
      <div className="space-y-6 h-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Total Pipeline Value</div>
                <div className="text-2xl font-bold text-primary">
                  ${opportunities.reduce((sum, opp) => sum + parseFloat(opp.value.toString()), 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  All active opportunities
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Weighted Pipeline Value</div>
                <div className="text-2xl font-bold text-primary">
                  ${opportunities
                    .reduce((sum, opp) => sum + (parseFloat(opp.value.toString()) * ((opp.probability || 0) / 100)), 0)
                    .toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Adjusted by probability
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Won Deals</div>
                <div className="text-2xl font-bold text-green-600">
                  {opportunities.filter(opp => opp.stage === 'closed-won').length}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Successfully closed deals
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Win Rate</div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(
                    (opportunities.filter(opp => opp.stage === 'closed-won').length /
                      Math.max(opportunities.filter(opp => ['closed-won', 'closed-lost'].includes(opp.stage)).length, 1)) * 100
                  )}%
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Of closed opportunities
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <div className="h-[calc(100vh-240px)] overflow-x-auto">
            <div className="flex gap-6 px-4 min-w-fit h-full pb-4">
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
        </div>

        <DragOverlay>
          {draggedDeal && (
            <div className="w-[280px]">
              <Card className="bg-white/95 shadow-lg relative overflow-hidden translate-gpu scale-100">
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
