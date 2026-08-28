import { Link } from "react-router-dom";
import logo from "@/assets/vpa-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Top: Logo + Links */}
        <div className="py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Veteran Podcast Awards" className="h-10 w-10" />
            <div>
              <h3 className="font-serif text-base text-primary">Veteran Podcast Awards</h3>
              <p className="text-xs text-muted-foreground">National Military Podcast Day</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/about" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/network" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Podcast Directory
            </Link>
            <Link to="/livestream" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Livestream
            </Link>
            <Link to="/podcast-day" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Podcast Day
            </Link>
            <a href="mailto:hello@veteranpodcastawards.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>
        </div>

        {/* Disclaimer — inline, no box */}
        <p className="text-[11px] leading-relaxed text-muted-foreground border-t border-border/50 pt-4 pb-2 max-w-4xl">
          <span className="font-medium text-foreground/70">Disclaimer:</span> The podcasts featured in this directory are independently owned and operated by their respective creators.
          The Veteran Podcast Awards, National Military Podcast Day, and the Military & Veteran Podcast Directory do not claim ownership of any podcast content.
          Inclusion does not constitute endorsement of views or opinions expressed. In partnership with OHIOWA Management Group LLC.
        </p>

        {/* Bottom bar */}
        <div className="border-t border-border/50 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-muted-foreground">
            &copy; 2026 Veteran Podcast Awards. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
