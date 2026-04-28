import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/RequireAuth";
import HomePage from "./pages/Home.tsx";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/Auth.tsx";
import DashboardBuyPage from "./pages/DashboardBuy.tsx";
import DashboardTrackPage from "./pages/DashboardTrack.tsx";
import DashboardAgentPage from "./pages/DashboardAgent.tsx";
import DashboardProfilePage from "./pages/DashboardProfile.tsx";
import AdminPage from "./pages/Admin.tsx";
import AgentDashboardPage from "./pages/AgentDashboard.tsx";
import AgentStorePage from "./pages/AgentStore.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<RequireAuth><Index /></RequireAuth>} />
            <Route path="/dashboard/buy" element={<RequireAuth><DashboardBuyPage /></RequireAuth>} />
            <Route path="/dashboard/track" element={<RequireAuth><DashboardTrackPage /></RequireAuth>} />
            <Route path="/dashboard/agent" element={<RequireAuth><DashboardAgentPage /></RequireAuth>} />
            <Route path="/dashboard/profile" element={<RequireAuth><DashboardProfilePage /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>} />
                        <Route path="/agent" element={<RequireAuth role="agent"><AgentDashboardPage /></RequireAuth>} />
                        <Route path="/store/:slug" element={<AgentStorePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
