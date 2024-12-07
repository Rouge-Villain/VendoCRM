import React from 'react';
import { useQuery } from "@tanstack/react-query";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { format, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PropTypes from 'prop-types';

// Define types for clarity even though we're using PropTypes
const opportunityType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  customerId: PropTypes.number.isRequired,
  productId: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
}).isRequired;

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

function QuoteDocument({ opportunity, customer, product }) {
  return (
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
          <Text style={styles.text}>Contact: {customer?.name || 'N/A'}</Text>
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
}

QuoteDocument.propTypes = {
  opportunity: PropTypes.shape({
    id: PropTypes.number.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  customer: PropTypes.shape({
    company: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
  }),
  product: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
  }),
};

export function QuoteGenerator({ opportunity, open, onOpenChange }) {
  const { data: customer } = useQuery({
    queryKey: ["customers", opportunity.customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${opportunity.customerId}`);
      if (!response.ok) {
        throw new Error(`Error fetching customer: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const { data: product } = useQuery({
    queryKey: ["products", opportunity.productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${opportunity.productId}`);
      if (!response.ok) {
        throw new Error(`Error fetching product: ${response.statusText}`);
      }
      return response.json();
    },
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
              <PDFDownloadLink
                document={
                  <QuoteDocument 
                    opportunity={opportunity} 
                    customer={customer} 
                    product={product}
                  />
                }
                fileName={`quote-${opportunity.id}.pdf`}
                style={{ textDecoration: 'none' }}
              >
                {({ url, loading, error }) => (
                  <Button 
                    className="w-full"
                    disabled={loading || !!error}
                    asChild
                  >
                    <a
                      href={url || '#'}
                      className="w-full inline-flex items-center justify-center"
                      download={`quote-${opportunity.id}.pdf`}
                    >
                      {loading ? 'Generating PDF...' : error ? 'Error generating PDF' : 'Download Quote PDF'}
                    </a>
                  </Button>
                )}
              </PDFDownloadLink>
              <div className="p-4 border rounded-lg bg-muted">
                <p className="text-center text-sm text-muted-foreground">
                  Click the button above to download the quote as a PDF
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

QuoteGenerator.propTypes = {
  opportunity: PropTypes.shape({
    id: PropTypes.number.isRequired,
    customerId: PropTypes.number.isRequired,
    productId: PropTypes.number.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};
