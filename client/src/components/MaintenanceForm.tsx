import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { type Customer } from "@db/schema";

const maintenanceFormSchema = z.object({
  customerId: z.number().positive(),
  machineId: z.string().min(1, "Machine ID is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  machineType: z.string().min(1, "Machine type is required"),
  maintenanceType: z.string().min(1, "Maintenance type is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string().default("pending"),
  technicianNotes: z.string().optional(),
  partsUsed: z.array(z.object({
    name: z.string(),
    quantity: z.number()
  })).default([]),
  cost: z.string().regex(/^\d+\.?\d{0,2}$/, "Invalid cost format"),
  scheduledDate: z.date(),
});

type MaintenanceFormData = z.infer<typeof maintenanceFormSchema>;

interface MaintenanceFormProps {
  onSuccess: () => void;
}

export function MaintenanceForm({ onSuccess }: MaintenanceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      return response.json() as Promise<Customer[]>;
    },
  });

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      customerId: customers?.[0]?.id || 1,
      machineId: "",
      serialNumber: "",
      machineType: "",
      maintenanceType: "",
      description: "",
      status: "pending",
      technicianNotes: "",
      partsUsed: [],
      cost: "0.00",
      scheduledDate: new Date(),
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: MaintenanceFormData) => {
      const formattedData = {
        ...data,
        cost: data.cost,
        partsUsed: Array.isArray(data.partsUsed) ? data.partsUsed : [],
        scheduledDate: new Date(data.scheduledDate).toISOString(),
      };
      
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create maintenance record");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast({ title: "Maintenance scheduled successfully" });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error('Maintenance creation error:', error);
      toast({
        title: "Failed to schedule maintenance",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-6 p-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm transition-all duration-200"
      >
        <div className="border-b pb-4 mb-6">
          <h2 className="text-xl font-bold text-primary tracking-tight">Schedule Maintenance</h2>
          <p className="text-sm text-muted-foreground mt-1">Fill in the details to schedule new maintenance</p>
        </div>
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customer.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maintenanceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maintenance Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="machineType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Machine Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cooler">Cooler</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                  <SelectItem value="soda">Soda</SelectItem>
                  <SelectItem value="freezer">Freezer</SelectItem>
                  <SelectItem value="coffee">Coffee</SelectItem>
                  <SelectItem value="micro market">Micro Market</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="machineId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Machine ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter machine ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter machine serial number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter maintenance description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d.]/g, '');
                    const parsed = parseFloat(value);
                    field.onChange(isNaN(parsed) ? "0.00" : parsed.toFixed(2));
                  }}
                  placeholder="Enter cost"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Scheduled Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Scheduling..." : "Schedule Maintenance"}
        </Button>
      </form>
    </Form>
  );
}
