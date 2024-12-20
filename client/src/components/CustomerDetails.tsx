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
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="flex items-center gap-2 hover:bg-secondary/80 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Customers
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="hover:bg-secondary/80 transition-colors">
            Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90 transition-colors">
            Edit Customer
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 ring-2 ring-primary/10 bg-primary/5">
                <AvatarFallback className="text-xl font-medium bg-gradient-to-r from-primary/10 to-secondary/10">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-2xl font-semibold tracking-tight">{customer.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-70"><path d="M6 9H4.5a2.5 2.5 0 0 0 0 5h1.5"/><path d="M18 9h1.5a2.5 2.5 0 0 1 0 5H18"/><path d="M8 9h8"/><path d="M8 15h8"/></svg>
                  {customer.company}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
              <div className="space-y-3">
                <a 
                  href={`mailto:${customer.email}`} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-primary/5 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </a>
                {customer.phone && (
                  <a 
                    href={`tel:${customer.phone}`} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-primary/5 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCall}
                  className="flex items-center gap-2 h-auto py-3 hover:bg-primary/5 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Call</p>
                    <p className="text-xs text-muted-foreground">Start a call</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleEmail}
                  className="flex items-center gap-2 h-auto py-3 hover:bg-primary/5 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-muted-foreground">Send email</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleAddNote}
                  className="flex items-center gap-2 h-auto py-3 hover:bg-primary/5 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Note</p>
                    <p className="text-xs text-muted-foreground">Add note</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSchedule}
                  className="flex items-center gap-2 h-auto py-3 hover:bg-primary/5 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Schedule</p>
                    <p className="text-xs text-muted-foreground">Set meeting</p>
                  </div>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Activity Timeline</h4>
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border">
                {activities && activities.length > 0 ? (
                  activities.map((activity: any) => (
                    <div key={activity.id} className="relative flex gap-4">
                      <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-background ring-2 ring-border">
                        {activity.type === 'call' && (
                          <Phone className="h-4 w-4 text-primary" />
                        )}
                        {activity.type === 'email' && (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                        {activity.type === 'meeting' && (
                          <Calendar className="h-4 w-4 text-primary" />
                        )}
                        {activity.type === 'note' && (
                          <FileText className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 rounded-lg border bg-card p-4 ml-12">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {activity.type}
                              {activity.outcome && (
                                <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  activity.outcome === 'Positive' ? 'bg-green-100 text-green-700' :
                                  activity.outcome === 'Negative' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {activity.outcome}
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.description}
                            </p>
                          </div>
                          <time className="text-xs text-muted-foreground">
                            {format(new Date(activity.createdAt), 'MMM d, yyyy')}
                          </time>
                        </div>
                        {activity.nextSteps && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.7-7.4"/><path d="m9 11 1 9"/><path d="m15 11-1 9"/></svg>
                            Next Steps: {activity.nextSteps}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 rounded-lg border bg-card">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">No recent activities</p>
                      <Button variant="outline" className="mt-2" onClick={handleAddNote}>
                        Add Activity
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Add the Loyalty Card component */}
      <LoyaltyCard customerId={customerId} />
    </div>
  );
}
