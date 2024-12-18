import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import Analytics from './pages/Analytics';

const App: React.FC = () => {
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
