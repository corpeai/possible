import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SolanaWalletProvider } from '@/contexts/WalletProvider';
import Index from './pages/Index';
import Agent from './pages/Agent';
import X402Scan from './pages/X402Scan';
import X402Payments from './pages/X402Payments';
import Placeholder from './pages/Placeholder';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SolanaWalletProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agent" element={<Agent />} />
            <Route path="/x402scan" element={<X402Scan />} />
            <Route path="/x402payments" element={<X402Payments />} />
            <Route path="*" element={<Placeholder />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SolanaWalletProvider>
  </QueryClientProvider>
);

export default App;
