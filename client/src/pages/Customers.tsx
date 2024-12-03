import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CustomerForm } from "../components/CustomerForm";
import { CustomerHistory } from "../components/CustomerHistory";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { type Customer } from "@db/schema";
import { StatsOverview } from "../components/StatsOverview";
import { CustomerDistribution } from "../components/CustomerDistribution";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: number; name: string } | null>(null);

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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <StatsOverview />
        <CustomerDistribution />
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
      </div>

      <StatsOverview />
      
      <div className="flex justify-end px-4">
        <Button 
          onClick={() => setIsOpen(true)}
          className="px-4 py-1.5 hover:scale-105 transition-transform duration-200"
        >
          Add Customer
        </Button>
      </div>

      <CustomerDistribution />

      <div className="rounded-lg border shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.company}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.address}</TableCell>
                <TableCell>{customer.city}</TableCell>
                <TableCell>{customer.state}</TableCell>
                <TableCell>{customer.notes}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCustomer({ id: customer.id, name: customer.name })}
                  >
                    View History
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete {customer.company}'s
                          account and remove their data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(customer.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          console.log('Dialog onOpenChange:', open); // Debug log
          setIsOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <CustomerForm 
            onSuccess={() => {
              console.log('Customer form submitted successfully'); // Debug log
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
