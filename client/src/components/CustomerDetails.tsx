import { Phone, Mail, Plus, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { type Customer } from "@db/schema";

interface CustomerDetailsProps {
  customerId: number;
  onBack: () => void;
}

export function CustomerDetails({ customerId, onBack }: CustomerDetailsProps) {
  const { data: customer, isLoading } = useQuery({
    queryKey: ["customers", customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}`);
      return response.json() as Promise<Customer>;
    },
  });

  const QuickAction = ({ icon: Icon, label, onClick }) => (
    <Button 
      variant="outline" 
      className="flex flex-col items-center p-3 h-auto gap-1 flex-1"
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs">{label}</span>
    </Button>
  );

  if (isLoading || !customer) {
    return <div>Loading...</div>;
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
            <QuickAction icon={Phone} label="Call" onClick={() => {}} />
            <QuickAction icon={Mail} label="Email" onClick={() => {}} />
            <QuickAction icon={FileText} label="Add Note" onClick={() => {}} />
            <QuickAction icon={Calendar} label="Schedule" onClick={() => {}} />
            <QuickAction icon={Plus} label="Create Lead" onClick={() => {}} />
          </div>

          {customer.relatedLeads?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Related Leads</h4>
              <div className="space-y-2">
                {customer.relatedLeads.map((lead) => (
                  <div 
                    key={lead.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <span className="text-sm">{lead.name}</span>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
