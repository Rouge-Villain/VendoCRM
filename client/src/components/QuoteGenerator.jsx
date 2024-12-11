import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  PDFViewer,
} from "@react-pdf/renderer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { type Customer, type Product, type Opportunity } from "@db/schema";

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  companyInfo: {
    fontSize: 12,
    marginBottom: 20,
  },
  customerInfo: {
    fontSize: 12,
    marginBottom: 20,
  },
  productDetails: {
    fontSize: 12,
    marginBottom: 20,
  },
  total: {
    fontSize: 14,
    marginTop: 30,
    textAlign: "right",
  },
});

// Quote PDF Document Component
function QuoteDocument({ opportunity, customer, product }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Quote</Text>
          <View style={styles.companyInfo}>
            <Text>VendoCRM Solutions</Text>
            <Text>123 Business Street</Text>
            <Text>contact@vendocrm.com</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text>To:</Text>
            <Text>{customer?.company}</Text>
            <Text>{customer?.contact}</Text>
            <Text>{customer?.email}</Text>
          </View>
          <View style={styles.productDetails}>
            <Text>Product Details:</Text>
            <Text>{product?.name}</Text>
            <Text>{product?.description}</Text>
            <Text>Specifications: {product?.specs}</Text>
          </View>
          <Text style={styles.total}>
            Total Amount: ${Number(opportunity?.value).toLocaleString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

interface QuoteDocumentProps {
  opportunity: Opportunity;
  customer?: Customer;
  product?: Product;
}

export function QuoteGenerator({ opportunity, open, onOpenChange }) {
  const [customer, setCustomer] = useState(null);
  const [product, setProduct] = useState(null);

  React.useEffect(() => {
    if (opportunity) {
      // Fetch customer data
      fetch(`/api/customers/${opportunity.customerId}`)
        .then((res) => res.json())
        .then(setCustomer)
        .catch(console.error);

      // Fetch product data
      fetch(`/api/products/${opportunity.productId}`)
        .then((res) => res.json())
        .then(setProduct)
        .catch(console.error);
    }
  }, [opportunity]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Generate Quote</DialogTitle>
          <DialogDescription>
            Review and download the quote for this opportunity
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <PDFDownloadLink
              document={
                <QuoteDocument
                  opportunity={opportunity}
                  customer={customer}
                  product={product}
                />
              }
              fileName={`quote-${opportunity?.id}.pdf`}
              className="w-full"
              style={{ textDecoration: "none" }}
            >
              {({ loading, error }) => (
                <Button className="w-full" disabled={loading || !!error}>
                  {loading
                    ? "Generating PDF..."
                    : error
                    ? "Error generating PDF"
                    : "Download Quote PDF"}
                </Button>
              )}
            </PDFDownloadLink>

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
        </div>
      </DialogContent>
    </Dialog>
  );
}

QuoteGenerator.propTypes = {
  opportunity: PropTypes.shape({
    id: PropTypes.number.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    customerId: PropTypes.number.isRequired,
    productId: PropTypes.number.isRequired,
    stage: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};
