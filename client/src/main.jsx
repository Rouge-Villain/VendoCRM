import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Analytics from "./pages/Analytics";
import Timeline from "./pages/Timeline";
import Maintenance from "./pages/Maintenance";

function AppRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/">
          <Dashboard />
        </Route>
        <Route path="/customers">
          <Customers />
        </Route>
        <Route path="/products">
          <Products />
        </Route>
        <Route path="/sales">
          <Sales />
        </Route>
        <Route path="/analytics">
          <Analytics />
        </Route>
        <Route path="/timeline">
          <Timeline />
        </Route>
        <Route path="/maintenance">
          <Maintenance />
        </Route>
        <Route>
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
);
