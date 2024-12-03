import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Page, Text, View, Document, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Opportunity, type Customer, type Product } from "@db/schema";

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
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

  const QuoteDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>Proposal for {customer?.company}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.text}>Date: {new Date().toLocaleDateString()}</Text>
          <Text style={styles.text}>Quote #: Q-{opportunity.id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>Customer Information:</Text>
          <Text style={styles.text}>Company: {customer?.company}</Text>
          <Text style={styles.text}>Contact: {customer?.name}</Text>
          <Text style={styles.text}>Email: {customer?.email}</Text>
          <Text style={styles.text}>Phone: {customer?.phone}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>Product Details:</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Product</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Description</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Quantity</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Price</Text>
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
                <Text style={styles.tableCell}>${product?.price}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>Total Value: ${opportunity.value}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>Terms and Conditions:</Text>
          <Text style={styles.text}>1. This quote is valid for 30 days</Text>
          <Text style={styles.text}>2. Delivery timeline: 2-4 weeks</Text>
          <Text style={styles.text}>3. Payment terms: Net 30</Text>
        </View>
      </Page>
    </Document>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Quote/Proposal Generator</DialogTitle>
          <DialogDescription>Generate a detailed quote for this opportunity</DialogDescription>
        </DialogHeader>
        <div className="h-[80vh]">
          {(() => {
            try {
              return (
                <PDFViewer width="100%" height="100%">
                  <QuoteDocument />
                </PDFViewer>
              );
            } catch (error) {
              console.error('Error generating PDF:', error);
              toast({
                title: 'Error',
                description: 'Failed to generate quote. Please try again.',
                variant: 'destructive',
              });
              return (
                <div className="flex items-center justify-center h-full">
                  <p className="text-destructive">Failed to generate quote. Please try again.</p>
                </div>
              );
            }
          })()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
