import { useQuery } from "@tanstack/react-query";
import { 
  Page, 
  Text, 
  View, 
  Document, 
  StyleSheet,
  BlobProvider
} from "@react-pdf/renderer";
import { format, addDays } from "date-fns";
import type { ReactElement } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Opportunity, type Customer, type Product } from "@db/schema";

interface BlobProviderRenderProps {
  blob: Blob | null;
  url: string | null;
  loading: boolean;
  error: Error | null;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    fontSize: 24,
    marginBottom: 30,
    color: '#1a56db',
    fontWeight: 'bold',
  },
  companyInfo: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'right',
  },
  section: {
    margin: 10,
    padding: 10,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#374151',
    paddingBottom: 5,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
  },
  text: {
    fontSize: 11,
    marginBottom: 8,
    color: '#4b5563',
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginVertical: 15,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  tableCol: {
    width: '25%',
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 10,
    color: '#4b5563',
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  total: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a56db',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});

interface QuoteGeneratorProps {
  opportunity: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuoteGenerator({ opportunity, open, onOpenChange }: QuoteGeneratorProps) {
  const { data: customer } = useQuery({
    queryKey: ["customers", opportunity.customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${opportunity.customerId}`);
      return response.json() as Promise<Customer>;
    },
  });

  const { data: product } = useQuery({
    queryKey: ["products", opportunity.productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${opportunity.productId}`);
      return response.json() as Promise<Product>;
    },
  });

  const QuoteDocument = (): ReactElement => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.companyInfo}>
          <Text>Your Vending Solutions Company</Text>
          <Text>123 Business Street</Text>
          <Text>City, State 12345</Text>
          <Text>Tel: (555) 123-4567</Text>
        </View>

        <View style={styles.header}>
          <Text>Sales Proposal</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Information</Text>
          <Text style={styles.text}>Quote Number: Q-{opportunity.id}</Text>
          <Text style={styles.text}>Date: {format(new Date(), 'MMMM d, yyyy')}</Text>
          <Text style={styles.text}>Valid Until: {format(addDays(new Date(), 30), 'MMMM d, yyyy')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <Text style={styles.text}>Company: {customer?.company}</Text>
          <Text style={styles.text}>Contact: {customer?.name}</Text>
          <Text style={styles.text}>Email: {customer?.email}</Text>
          <Text style={styles.text}>Phone: {customer?.phone}</Text>
          <Text style={styles.text}>Address: {customer?.address}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Details</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>Product</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>Description</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>Quantity</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>Price</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{product?.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{product?.description}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>1</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>${parseFloat(product?.price?.toString() || '0').toLocaleString()}</Text>
              </View>
            </View>
          </View>
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total Investment: </Text>
            <Text style={styles.totalAmount}> ${parseFloat(opportunity.value.toString()).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Agreement</Text>
          <Text style={styles.text}>• Equipment Installation and Setup</Text>
          <Text style={styles.text}>• Preventive Maintenance Schedule</Text>
          <Text style={styles.text}>• 24/7 Technical Support</Text>
          <Text style={styles.text}>• Product Restocking Services</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          <Text style={styles.text}>1. This proposal is valid for 30 days from the date of issue</Text>
          <Text style={styles.text}>2. Standard delivery and installation: 2-4 weeks from order confirmation</Text>
          <Text style={styles.text}>3. Payment terms: Net 30 days from invoice date</Text>
          <Text style={styles.text}>4. Warranty: 12 months parts and labor</Text>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for considering our vending solutions. We look forward to serving your refreshment needs.</Text>
        </View>
      </Page>
    </Document>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Quote/Proposal Generator</DialogTitle>
          <DialogDescription>Generate a detailed quote for this opportunity</DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <BlobProvider document={<QuoteDocument />}>
              {({ loading, url, error }: BlobProviderRenderProps) => {
                if (error) {
                  return (
                    <div className="text-destructive text-sm text-center p-2">
                      Failed to generate PDF. Please try again.
                    </div>
                  );
                }

                return (
                  <Button
                    asChild
                    className="w-full"
                    disabled={loading || !url}
                  >
                    <a
                      href={url || '#'}
                      download={`quote-${opportunity.id}.pdf`}
                      className="w-full text-center"
                      style={{ textDecoration: 'none' }}
                    >
                      {loading ? 'Generating PDF...' : 'Download Quote PDF'}
                    </a>
                  </Button>
                );
              }}
            </BlobProvider>
          <div className="mt-4 p-4 border rounded-lg bg-muted">
            <p className="text-center text-sm text-muted-foreground">
              Click the button above to download the quote as a PDF
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}