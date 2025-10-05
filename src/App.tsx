import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Explorer from "./pages/Explorer";
import Assistant from "./pages/Assistant";
import Knowledge from "./pages/Knowledge";
import Topics from "./pages/Topics";
import SpaceJourney from "./pages/SpaceJourney";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/space-journey" element={<SpaceJourney />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
