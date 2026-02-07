import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import AdGroups from "./pages/AdGroups";
import Creatives from "./pages/Creatives";
import BiddingOptimization from "./pages/BiddingOptimization";
import AnalyticsReports from "./pages/AnalyticsReports";
import BudgetBilling from "./pages/BudgetBilling";
import ConversionsEvents from "./pages/ConversionsEvents";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DashboardProvider>
        <BrowserRouter>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/ad-groups" element={<AdGroups />} />
              <Route path="/creatives" element={<Creatives />} />
              <Route path="/bidding" element={<BiddingOptimization />} />
              <Route path="/analytics" element={<AnalyticsReports />} />
              <Route path="/budget" element={<BudgetBilling />} />
              <Route path="/conversions" element={<ConversionsEvents />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </BrowserRouter>
      </DashboardProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
