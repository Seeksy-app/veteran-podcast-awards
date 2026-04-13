import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Livestream from "./pages/Livestream";
import Categories from "./pages/Categories";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import VotePage from "./pages/VotePage";
import AwardsProgramsPage from "./pages/AwardsProgramsPage";
import AwardsProgramCategoriesPage from "./pages/AwardsProgramCategoriesPage";
import AwardsCategoryNomineesPage from "./pages/AwardsCategoryNomineesPage";
import AwardTicketsPage from "./pages/AwardTicketsPage";
import TicketPassPage from "./pages/TicketPassPage";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Network from "./pages/Network";
import Auth from "./pages/Auth";
import Sponsors from "./pages/Sponsors";
import PodcastDay from "./pages/PodcastDay";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Dashboard from "./pages/Dashboard";
import PodcasterProfile from "./pages/PodcasterProfile";
import NotFound from "./pages/NotFound";
import Opportunity from "./pages/Opportunity";
import InvestorPage from "./pages/InvestorPage";
import VPADeck from "./pages/VPADeck";
import ExportData from "./pages/ExportData";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/livestream" element={<Livestream />} />
              <Route path="/categories/:categorySlug" element={<CategoryDetailPage />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/awards" element={<AwardsProgramsPage />} />
              <Route path="/awards/:programId/categories" element={<AwardsProgramCategoriesPage />} />
              <Route path="/awards/:programId/categories/:categoryId" element={<AwardsCategoryNomineesPage />} />
              <Route path="/awards/:programId/tickets" element={<AwardTicketsPage />} />
              <Route path="/ticket/:token" element={<TicketPassPage />} />
              <Route path="/vote/:nominationId" element={<VotePage />} />
              <Route path="/network" element={<Network />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/podcast-day" element={<PodcastDay />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/podcaster/:username" element={<PodcasterProfile />} />
              <Route path="/opportunity" element={<Opportunity />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/prospectus" element={<InvestorPage />} />
              <Route path="/vpa-deck" element={<VPADeck />} />
              <Route path="/export-data" element={<ExportData />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
