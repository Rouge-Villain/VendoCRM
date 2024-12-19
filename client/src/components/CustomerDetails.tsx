import { Phone, Mail, Plus, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { type Customer } from "@db/schema";
import { format } from "date-fns";
import { LoyaltyCard } from "./LoyaltyCard";

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

interface CustomerDetailsProps {
  customerId: number;
  onBack: () => void;
}

export function CustomerDetails({ customerId, onBack }: CustomerDetailsProps) {
  const { data: customer, isLoading, isError, error } = useQuery({
    queryKey: ["customers", customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }
      return response.json() as Promise<Customer>;
    },
  });

  const { data: activities } = useQuery({
    queryKey: ["activities", customerId],
    queryFn: async () => {
      const response = await fetch(`/api/activities?customerId=${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    },
  });

  const handleCall = () => {
    if (customer?.phone) {
      window.location.href = `tel:${customer.phone}`;
    }
  };

  const handleEmail = () => {
    if (customer?.email) {
      window.location.href = `mailto:${customer.email}`;
    }
  };

  const handleAddNote = () => {
    // This would typically open a modal to add a note
    alert("Add note functionality coming soon!");
  };

  const handleSchedule = () => {
    // This would typically open a calendar modal
    alert("Schedule meeting functionality coming soon!");
  };

  const handleCreateLead = () => {
    // This would typically navigate to the new lead form
    alert("Create lead functionality coming soon!");
  };

  const QuickAction = ({ icon: Icon, label, onClick }: QuickActionProps) => (
    <Button 
      variant="outline" 
      className="flex flex-col items-center p-3 h-auto gap-1 flex-1"
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs">{label}</span>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          ← Back to Customers
        </Button>
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-1/3 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          ← Back to Customers
        </Button>
        <Card className="p-6">
          <div className="text-red-500">
            Error loading customer details: {(error as Error).message}
          </div>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          ← Back to Customers
        </Button>
        <Card className="p-6">
          <div className="text-muted-foreground">
            No customer found
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        ← Back to Customers
      </Button>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.company}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                {customer.email}
              </a>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${customer.phone}`} className="text-sm hover:underline">
                  {customer.phone}
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2">
            <QuickAction icon={Phone} label="Call" onClick={handleCall} />
            <QuickAction icon={Mail} label="Email" onClick={handleEmail} />
            <QuickAction icon={FileText} label="Add Note" onClick={handleAddNote} />
            <QuickAction icon={Calendar} label="Schedule" onClick={handleSchedule} />
            <QuickAction icon={Plus} label="Create Lead" onClick={handleCreateLead} />
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-4">Activity History</h4>
            <div className="space-y-3">
              {activities && activities.length > 0 ? (
                activities.map((activity: any) => (
                  <div 
                    key={activity.id}
                    className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No recent activities
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Add the Loyalty Card component */}
      <LoyaltyCard customerId={customerId} />
    </div>
  );
}