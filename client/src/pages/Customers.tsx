import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type Customer } from "@db/schema";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { CustomerForm } from "../components/CustomerForm";
import { CustomerHistory } from "../components/CustomerHistory";
import { CustomerDetails } from "../components/CustomerDetails";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: number; name: string } | null>(null);
  const [viewingCustomerId, setViewingCustomerId] = useState<number | null>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      return response.json() as Promise<Customer[]>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (customerId: number) => {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete customer");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer deleted successfully" });
    },
    onError: (error) => {
      console.error('Customer deletion error:', error);
      toast({
        title: "Failed to delete customer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="h-16 w-full bg-gradient-to-r from-background to-muted rounded-lg animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (viewingCustomerId) {
    return (
      <CustomerDetails 
        customerId={viewingCustomerId} 
        onBack={() => setViewingCustomerId(null)} 
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="sticky top-0 z-10">
        <div className="bg-card shadow-sm rounded-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">Customers</h1>
              <p className="text-muted-foreground mt-1">Manage your customer relationships</p>
            </div>
            <Button 
              onClick={() => setIsOpen(true)}
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {customers?.map((customer) => (
          <Card 
            key={customer.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setViewingCustomerId(customer.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground">{customer.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div>{customer.email}</div>
                {customer.phone && <div>• {customer.phone}</div>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Fill out the form below to add a new customer to the system.</DialogDescription>
          </DialogHeader>
          <CustomerForm 
            onSuccess={() => {
              setIsOpen(false);
              queryClient.invalidateQueries({ queryKey: ["customers"] });
            }} 
          />
        </DialogContent>
      </Dialog>

      {selectedCustomer && (
        <CustomerHistory
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          open={!!selectedCustomer}
          onOpenChange={(open) => !open && setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}