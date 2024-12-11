import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.js";
import { Toaster } from "./components/ui/toaster";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Customers from "./pages/Customers.jsx";
import Products from "./pages/Products.jsx";
import Sales from "./pages/Sales.jsx";
import Analytics from "./pages/Analytics.jsx";
import Timeline from "./pages/Timeline.jsx";
import Maintenance from "./pages/Maintenance.jsx";

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
