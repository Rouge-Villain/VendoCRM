import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto p-8">
          <h1>Vending CRM</h1>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
