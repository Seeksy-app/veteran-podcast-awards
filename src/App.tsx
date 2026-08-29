import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { ThemeProvider } from "@/hooks/useTheme";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Livestream from "./pages/Livestream";
import Categories from "./pages/Categories";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import VotePage from "./pages/VotePage";
import VoteLanding from "./pages/VoteLanding";
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
import InvestorSharePage from "./pages/InvestorSharePage";
import VPADeck from "./pages/VPADeck";
import ExportData from "./pages/ExportData";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";

const queryClient = new QueryClient();

/** Surfaces OAuth errors that Supabase sends back via URL query or hash on any route. */
const OAuthErrorCatcher = () => {
  const location = useLocation();
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(window.location.search);
    const errDesc =
      hashParams.get("error_description") ||
      queryParams.get("error_description") ||
      hashParams.get("error") ||
      queryParams.get("error");
    if (errDesc) {
      toast.error(`Sign-in failed: ${decodeURIComponent(errDesc).replace(/\+/g, " ")}`, { duration: 10000 });
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [location]);
  return null;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <OAuthErrorCatcher />
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
              <Route path="/vote" element={<VoteLanding />} />
              <Route path="/vote/:nominationId" element={<VotePage />} />
              <Route path="/network" element={<Network />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/podcast-day" element={<PodcastDay />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/podcaster/:username" element={<PodcasterProfile />} />
              <Route path="/opportunity" element={<Opportunity />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/prospectus" element={<InvestorPage />} />
              <Route path="/invest/:token" element={<InvestorSharePage />} />
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
