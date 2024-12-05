import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
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

  interface MachineType {
    selected: boolean;
    quantity: number;
  }

  type CustomerFormData = Omit<InsertCustomer, 'machineTypes'> & {
    machineTypes: Record<string, MachineType>;
    state: string[];
  };

  // Ensure machineTypes is included in the schema
  const extendedCustomerSchema = insertCustomerSchema.extend({
    machineTypes: z.record(z.object({
      selected: z.boolean(),
      quantity: z.number()
    })),
    state: z.array(z.string())
  });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(extendedCustomerSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      notes: "",
      machineTypes: MACHINE_TYPES.reduce((acc, type) => ({
        ...acc,
        [type.id]: { selected: false, quantity: 0 }
      }), {} as Record<string, MachineType>),
      state: [],
      serviceTerritory: "",
      maintenanceHistory: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const machineData = Object.entries(data.machineTypes)
        .filter(([_, value]) => value.selected)
        .map(([type, value]) => ({
          type,
          quantity: value.quantity || 0
        }));

      const totalMachines = machineData.reduce((sum, machine) => sum + machine.quantity, 0);

      // Convert the form data to match InsertCustomer type
      const customerData: InsertCustomer = {
        ...data,
        machineTypes: machineData
      };

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customerData,
          totalMachines,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create customer");
      }
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
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8 p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm transition-all duration-200">
        <div className="space-y-6">
          <div className="border-b pb-4 mb-6">
            <h3 className="text-xl font-bold text-primary tracking-tight">Basic Information</h3>
            <p className="text-sm text-muted-foreground mt-1">Enter customer details and machine preferences</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <div className="mb-4 p-3 bg-secondary/10 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Machines:</span>
                  <span className="text-lg font-bold">
                    {Object.values(form.watch("machineTypes"))
                      .reduce((sum, machine) => sum + (machine.selected ? (machine.quantity || 0) : 0), 0)}
                  </span>
                </div>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-secondary/10 rounded-lg border border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
                {MACHINE_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center gap-2 bg-background p-2 rounded-md shadow-sm">
                    <FormField
                      control={form.control}
                      name={`machineTypes.${type.id}`}
                      render={({ field }) => (
                        <FormItem className="flex-1 flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.selected}
                              onCheckedChange={(checked) => {
                                field.onChange({
                                  selected: checked,
                                  quantity: checked ? field.value?.quantity || 1 : 0
                                });
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                          </FormControl>
                          <FormLabel className="font-medium text-sm cursor-pointer flex-1 m-0">
                            {type.label}
                          </FormLabel>
                          {field.value?.selected && (
                            <FormItem className="space-y-0 flex-shrink-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value.quantity || ""}
                                  onChange={(e) => {
                                    const quantity = parseInt(e.target.value) || 0;
                                    field.onChange({
                                      selected: true,
                                      quantity: Math.max(0, quantity)
                                    });
                                  }}
                                  placeholder="Qty"
                                  className="w-16 h-7 text-sm"
                                  min="0"
                                />
                              </FormControl>
                            </FormItem>
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
                    onValueChange={(value: string) => {
                      const currentValues: string[] = Array.isArray(field.value) ? field.value : [];
                      if (!currentValues.includes(value)) {
                        field.onChange([...currentValues, value]);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-background">
                        <SelectValue placeholder="Select states" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      <SelectItem value="AL">Alabama</SelectItem>
                      <SelectItem value="AK">Alaska</SelectItem>
                      <SelectItem value="AZ">Arizona</SelectItem>
                      <SelectItem value="AR">Arkansas</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="CO">Colorado</SelectItem>
                      <SelectItem value="CT">Connecticut</SelectItem>
                      <SelectItem value="DE">Delaware</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="GA">Georgia</SelectItem>
                      <SelectItem value="HI">Hawaii</SelectItem>
                      <SelectItem value="ID">Idaho</SelectItem>
                      <SelectItem value="IL">Illinois</SelectItem>
                      <SelectItem value="IN">Indiana</SelectItem>
                      <SelectItem value="IA">Iowa</SelectItem>
                      <SelectItem value="KS">Kansas</SelectItem>
                      <SelectItem value="KY">Kentucky</SelectItem>
                      <SelectItem value="LA">Louisiana</SelectItem>
                      <SelectItem value="ME">Maine</SelectItem>
                      <SelectItem value="MD">Maryland</SelectItem>
                      <SelectItem value="MA">Massachusetts</SelectItem>
                      <SelectItem value="MI">Michigan</SelectItem>
                      <SelectItem value="MN">Minnesota</SelectItem>
                      <SelectItem value="MS">Mississippi</SelectItem>
                      <SelectItem value="MO">Missouri</SelectItem>
                      <SelectItem value="MT">Montana</SelectItem>
                      <SelectItem value="NE">Nebraska</SelectItem>
                      <SelectItem value="NV">Nevada</SelectItem>
                      <SelectItem value="NH">New Hampshire</SelectItem>
                      <SelectItem value="NJ">New Jersey</SelectItem>
                      <SelectItem value="NM">New Mexico</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="NC">North Carolina</SelectItem>
                      <SelectItem value="ND">North Dakota</SelectItem>
                      <SelectItem value="OH">Ohio</SelectItem>
                      <SelectItem value="OK">Oklahoma</SelectItem>
                      <SelectItem value="OR">Oregon</SelectItem>
                      <SelectItem value="PA">Pennsylvania</SelectItem>
                      <SelectItem value="RI">Rhode Island</SelectItem>
                      <SelectItem value="SC">South Carolina</SelectItem>
                      <SelectItem value="SD">South Dakota</SelectItem>
                      <SelectItem value="TN">Tennessee</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="UT">Utah</SelectItem>
                      <SelectItem value="VT">Vermont</SelectItem>
                      <SelectItem value="VA">Virginia</SelectItem>
                      <SelectItem value="WA">Washington</SelectItem>
                      <SelectItem value="WV">West Virginia</SelectItem>
                      <SelectItem value="WI">Wisconsin</SelectItem>
                      <SelectItem value="WY">Wyoming</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(field.value) && field.value.map((state) => (
                      <div key={state} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                        <span>{state}</span>
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange((field.value || []).filter((s: string) => s !== state));
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
