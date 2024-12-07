import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import { Route, Switch } from 'wouter';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { CustomerAnalytics } from '@/components/analytics/CustomerAnalytics';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Switch>
          <Route path="/analytics/advanced" component={AdvancedAnalytics} />
          <Route path="/analytics/customers" component={CustomerAnalytics} />
        </Switch>
      </Layout>
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
);
