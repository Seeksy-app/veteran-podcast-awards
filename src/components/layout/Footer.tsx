import { Link } from "react-router-dom";
import logo from "@/assets/vpa-logo.png";
import { PodcastDisclaimer } from "@/components/podcasts/PodcastDisclaimer";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Top: Logo + Links */}
        <div className="py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Veteran Podcast Awards" className="h-14 w-14" />
            <div>
              <h3 className="font-serif text-lg text-primary">Veteran Podcast Awards</h3>
              <p className="text-xs text-muted-foreground">National Military Podcast Day</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/network" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Podcast Network
            </Link>
            <Link to="/sponsors" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Sponsors
            </Link>
            <Link to="/livestream" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Livestream
            </Link>
            <Link to="/podcast-day" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Podcast Day
            </Link>
            <a href="mailto:hello@veteranpodcastawards.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-border/50 py-8">
          <PodcastDisclaimer />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Veteran Podcast Awards. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
