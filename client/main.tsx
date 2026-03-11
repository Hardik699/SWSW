import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppWithDBCheck } from "@/components/AppWithDBCheck";
import App from "./App";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppWithDBCheck>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <App />
        </BrowserRouter>
      </AppWithDBCheck>
    </TooltipProvider>
  </QueryClientProvider>,
);
