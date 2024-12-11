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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { type Customer, type Product, type Opportunity } from "@db/schema";
import { useQuery } from "@tanstack/react-query";

// PDF styles
const styles = StyleSheet.create({
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
  table: {
    display: "flex",
    width: "auto",
    marginVertical: 15,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  tableCol: {
    width: "25%",
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 10,
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
  customer: Customer | undefined;
  product: Product | undefined;
}

interface QuoteGeneratorProps {
  opportunity: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BlobProviderRenderProps = {
  blob: Blob | null;
  url: string | null;
  loading: boolean;
  error: Error | null;
}

const QuoteDocument = ({
  opportunity,
  customer,
  product,
}: QuoteDocumentProps): React.ReactElement => (
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
        <Text style={styles.text}>Name: {customer?.name || "N/A"}</Text>
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
          Total Amount: ${Number(opportunity?.value).toLocaleString()}
        </Text>
      </View>
    </Page>
  </Document>
);

export function QuoteGenerator({
  opportunity,
  open,
  onOpenChange,
}: QuoteGeneratorProps) {
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
              <BlobProvider
                document={
                  <QuoteDocument
                    opportunity={opportunity}
                    customer={customer}
                    product={product}
                  />
                }
              >
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