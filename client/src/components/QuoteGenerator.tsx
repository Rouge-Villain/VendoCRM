import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  BlobProvider,
} from "@react-pdf/renderer";
import { format, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import type { Customer, Product, Opportunity } from "@db/schema";
import { useQuery } from "@tanstack/react-query";

// PDF styles
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
  },
  sectionTitle: {
    fontSize: 14,
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
    color: '#374151',
  },
  totalAmount: {
    fontSize: 12,
    color: '#1a56db',
    marginLeft: 4,
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

// Extend the Opportunity type with UI-specific needs
interface QuoteOpportunity extends Omit<Opportunity, 'value'> {
  value: string;
}

interface QuoteGeneratorProps {
  opportunity: QuoteOpportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface QuoteDocumentProps {
  opportunity: QuoteOpportunity;
  customer?: Customer;
  product?: Product;
}

const QuoteDocument: React.FC<QuoteDocumentProps> = ({ opportunity, customer, product }) => (
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
        <Text style={styles.text}>Company: {customer?.company || 'N/A'}</Text>
        <Text style={styles.text}>Contact: {customer?.contact || 'N/A'}</Text>
        <Text style={styles.text}>Email: {customer?.email || 'N/A'}</Text>
        <Text style={styles.text}>Phone: {customer?.phone || 'N/A'}</Text>
        <Text style={styles.text}>Address: {customer?.address || 'N/A'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipment Details</Text>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{product?.name || 'N/A'}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{product?.description || 'N/A'}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>1</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>
              ${Number(product?.price || 0).toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total Investment:</Text>
          <Text style={styles.totalAmount}>
            ${Number(opportunity.value).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for considering our vending solutions.</Text>
      </View>
    </Page>
  </Document>
);

export function QuoteGenerator({ opportunity, open, onOpenChange }: QuoteGeneratorProps) {
  const { data: customer } = useQuery<Customer>({
    queryKey: ["customers", opportunity.customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${opportunity.customerId}`);
      if (!response.ok) {
        throw new Error(`Error fetching customer: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!opportunity.customerId,
  });

  const { data: product } = useQuery<Product>({
    queryKey: ["products", opportunity.productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${opportunity.productId}`);
      if (!response.ok) {
        throw new Error(`Error fetching product: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!opportunity.productId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Quote/Proposal Generator</DialogTitle>
          <DialogDescription>Generate a detailed quote for this opportunity</DialogDescription>
        </DialogHeader>
        <div className="p-4">
          {typeof window !== 'undefined' && (
            <div className="space-y-4">
              <BlobProvider
                document={
                  <QuoteDocument 
                    opportunity={opportunity} 
                    customer={customer} 
                    product={product}
                  />
                }
              >
                {({ url, loading, error }) => (
                  <Button 
                    className="w-full"
                    disabled={loading || !!error}
                    onClick={() => {
                      if (url) {
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    {loading ? 'Generating PDF...' : error ? 'Error generating PDF' : 'Download Quote PDF'}
                  </Button>
                )}
              </BlobProvider>
              <div className="p-4 border rounded-lg bg-muted">
                <p className="text-center text-sm text-muted-foreground">
                  Click the button above to download the quote as a PDF
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <PDFViewer style={{ width: "100%", height: "500px" }}>
                  <QuoteDocument
                    opportunity={opportunity}
                    customer={customer}
                    product={product}
                  />
                </PDFViewer>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
