import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { type InsertCustomer, insertCustomerSchema } from "@db/schema";

const MACHINE_TYPES = [
  { id: "cooler", label: "Cooler" },
  { id: "snack", label: "Snack" },
  { id: "soda", label: "Soda" },
  { id: "freezer", label: "Freezer" },
  { id: "coffee", label: "Coffee" },
  { id: "micro market", label: "Micro Market" },
];

interface CustomerFormProps {
  onSuccess: () => void;
}

export function CustomerForm({ onSuccess }: CustomerFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      notes: "",
      machineTypes: [],
      state: [],
      serviceTerritory: "",
      serviceHours: "",
      contractTerms: "",
      maintenanceHistory: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          machineTypes: Object.entries(form.getValues("machineTypes"))
            .filter(([_, checked]) => checked)
            .map(([type]) => ({
              type,
              quantity: parseInt(form.getValues(`${type}Quantity`) || "0", 10),
            })),
        }),
      });
      if (!response.ok) throw new Error("Failed to create customer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer created successfully" });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error('Customer form submission error:', error); // Debug log
      toast({ 
        title: "Failed to create customer", 
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive" 
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8 p-4 sm:p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} value={field.value || ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} value={field.value || ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} value={field.value || ""} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="col-span-2">
              <FormLabel>Machine Types</FormLabel>
              <FormDescription className="mt-1 mb-3">Select the types of machines and specify quantities</FormDescription>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 sm:p-4 bg-secondary/20 rounded-lg border border-secondary">
                {MACHINE_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center gap-2 bg-background p-2 rounded-md shadow-sm">
                    <FormField
                      control={form.control}
                      name={`machineTypes.${type.id}`}
                      render={({ field }) => (
                        <FormItem className="flex-1 flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                          </FormControl>
                          <FormLabel className="font-medium text-sm cursor-pointer flex-1 m-0">
                            {type.label}
                          </FormLabel>
                          {field.value && (
                            <FormField
                              control={form.control}
                              name={`${type.id}Quantity`}
                              render={({ field: quantityField }) => (
                                <FormItem className="space-y-0 flex-shrink-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...quantityField}
                                      placeholder="Qty"
                                      className="w-16 h-7 text-sm"
                                      min="1"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>States</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const currentValues = Array.isArray(field.value) ? field.value : [];
                      if (!currentValues.includes(value)) {
                        field.onChange([...currentValues, value]);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select states" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* US States */}
                      <SelectItem value="AL">Alabama</SelectItem>
                      <SelectItem value="AK">Alaska</SelectItem>
                      {/* ... other states ... */}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(field.value) && field.value.map((state) => (
                      <div key={state} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                        <span>{state}</span>
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(field.value.filter((s) => s !== state));
                          }}
                          className="text-secondary-foreground/50 hover:text-secondary-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            {/* Additional fields */}
            <FormField
              control={form.control}
              name="serviceTerritory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Territory</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Hours</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contractTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Terms</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full py-6 text-lg font-semibold hover:scale-[1.01] transition-transform duration-200"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Creating...
            </span>
          ) : (
            "Create Customer"
          )}
        </Button>
      </form>
    </Form>
  );
}
