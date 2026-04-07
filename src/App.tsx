import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import ForPhotographers from "./pages/ForPhotographers";
import Blog from "./pages/Blog";
import AuthGuard from "./components/dashboard/AuthGuard";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/app/Dashboard";
import Galleries from "./pages/app/Galleries";
import GalleryNew from "./pages/app/GalleryNew";
import GalleryDetail from "./pages/app/GalleryDetail";
import Portfolios from "./pages/app/Portfolios";
import PortfolioEdit from "./pages/app/PortfolioEdit";
import Bookings from "./pages/app/Bookings";
import Clients from "./pages/app/Clients";
import Analytics from "./pages/app/Analytics";
import SettingsPage from "./pages/app/SettingsPage";
import PublicGallery from "./pages/PublicGallery";
import PublicPortfolio from "./pages/PublicPortfolio";

const queryClient = new QueryClient();

const AppRoute = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <DashboardLayout>{children}</DashboardLayout>
  </AuthGuard>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/for-photographers" element={<ForPhotographers />} />
          <Route path="/blog" element={<Blog />} />

          {/* Dashboard */}
          <Route path="/app/dashboard" element={<AppRoute><Dashboard /></AppRoute>} />
          <Route path="/app/galleries" element={<AppRoute><Galleries /></AppRoute>} />
          <Route path="/app/galleries/new" element={<AppRoute><GalleryNew /></AppRoute>} />
          <Route path="/app/galleries/:id" element={<AppRoute><GalleryDetail /></AppRoute>} />
          <Route path="/app/portfolios" element={<AppRoute><Portfolios /></AppRoute>} />
          <Route path="/app/portfolios/:id/edit" element={<AppRoute><PortfolioEdit /></AppRoute>} />
          <Route path="/app/bookings" element={<AppRoute><Bookings /></AppRoute>} />
          <Route path="/app/clients" element={<AppRoute><Clients /></AppRoute>} />
          <Route path="/app/analytics" element={<AppRoute><Analytics /></AppRoute>} />
          <Route path="/app/settings" element={<AppRoute><SettingsPage /></AppRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
