import { SwapProvider } from "@/contexts/SwapContext";
import { VacationProvider } from "@/contexts/VacationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import BackupPage from "./pages/BackupPage";
import CSVImportPage from "./pages/CSVImportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SwapProvider>
          <VacationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-center" />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/backup" element={<BackupPage />} />
                  <Route path="/csv-import" element={<CSVImportPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </VacationProvider>
        </SwapProvider>
      </AuthProvider>
    </QueryClientProvider>
    <Analytics />
  </ThemeProvider>
);

export default App;
