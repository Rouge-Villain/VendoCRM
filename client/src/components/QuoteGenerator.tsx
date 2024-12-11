import React from "react";
import type { Customer, Opportunity, Product } from "@/types/db";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  BlobProvider,
  type PDFProps,
  type StyleProp,
} from "@react-pdf/renderer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";

// Define PDF style types
type StyleKeys = 'page' | 'header' | 'companyInfo' | 'section' | 'sectionTitle' | 'text' | 'total';
type PDFStyles = Record<StyleKeys, StyleProp>;

// PDF styles
const styles = StyleSheet.create<PDFStyles>({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
  },
  header: {
    fontSize: 24,
    marginBottom: 30,
    color: "#1a56db",
  },
  companyInfo: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "right",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    color: "#374151",
    paddingBottom: 5,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
  },
  text: {
    fontSize: 11,
    marginBottom: 8,
    color: "#4b5563",
  },
  total: {
    fontSize: 14,
    marginTop: 20,
    textAlign: "right",
    color: "#1a56db",
  },
});

interface QuoteDocumentProps {
  opportunity: Opportunity;
  customer?: Customer | null;
  product?: Product | null;
}

const QuoteDocument: React.FC<QuoteDocumentProps> = ({ opportunity, customer, product }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.companyInfo}>
        <Text>VendoCRM Solutions</Text>
        <Text>123 Business Street</Text>
        <Text>contact@vendocrm.com</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        <Text style={styles.text}>Company: {customer?.company || "N/A"}</Text>
        <Text style={styles.text}>Contact: {customer?.contact || "N/A"}</Text>
        <Text style={styles.text}>Email: {customer?.email || "N/A"}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Details</Text>
        <Text style={styles.text}>Product: {product?.name || "N/A"}</Text>
        <Text style={styles.text}>Description: {product?.description || "N/A"}</Text>
        <Text style={styles.text}>Specifications: {product?.specs || "N/A"}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.total}>
          Total Amount: ${Number(opportunity?.value || 0).toLocaleString()}
        </Text>
      </View>
    </Page>
  </Document>
);

interface QuoteGeneratorProps {
  opportunity: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BlobProviderRenderProps {
  url: string | null;
  loading: boolean;
  error: Error | null;
}

export const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ opportunity, open, onOpenChange }) => {
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
          <DialogTitle>Quote Generator</DialogTitle>
          <DialogDescription>Generate a quote for this opportunity</DialogDescription>
        </DialogHeader>
        <div className="p-4">
          {typeof window !== "undefined" && (
            <div className="space-y-4">
              <BlobProvider document={<QuoteDocument opportunity={opportunity} customer={customer} product={product} />}>
                {({ url, loading, error }: BlobProviderRenderProps) => (
                  <Button
                    className="w-full"
                    disabled={loading || !!error}
                    onClick={() => {
                      if (url) {
                        window.open(url, "_blank");
                      }
                    }}
                  >
                    {loading
                      ? "Generating PDF..."
                      : error
                      ? "Error generating PDF"
                      : "Download Quote PDF"}
                  </Button>
                )}
              </BlobProvider>
              <div className="border rounded-lg p-4">
                <PDFViewer style={{ width: "100%", height: "500px" }}>
                  <QuoteDocument opportunity={opportunity} customer={customer} product={product} />
                </PDFViewer>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
