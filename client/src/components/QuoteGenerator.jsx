import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { format, addDays } from "date-fns";
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';

const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), {
  ssr: false
});

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const styles = StyleSheet.create({
  // ... styles remain unchanged ...
});

export function QuoteGenerator({ opportunity, open, onOpenChange }) {
  const { data: customer } = useQuery({
    queryKey: ["customers", opportunity.customerId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${opportunity.customerId}`);
      return response.json();
    },
  });

  const { data: product } = useQuery({
    queryKey: ["products", opportunity.productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${opportunity.productId}`);
      return response.json();
    },
  });

  // Rest of the component implementation remains unchanged...
}

QuoteGenerator.propTypes = {
  opportunity: PropTypes.shape({
    id: PropTypes.number.isRequired,
    customerId: PropTypes.number.isRequired,
    productId: PropTypes.number.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};
