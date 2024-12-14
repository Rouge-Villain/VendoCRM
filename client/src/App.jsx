import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Analytics from './pages/Analytics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto p-8">
          <Analytics />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;