import { Link } from "react-router-dom";
import logo from "@/assets/vpa-logo.png";
import { PodcastDisclaimer } from "@/components/podcasts/PodcastDisclaimer";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Veteran Podcast Awards" className="h-16 w-16" />
              <div>
                <h3 className="font-serif text-lg text-primary">Veteran Podcast Awards</h3>
                <p className="text-sm text-muted-foreground">National Military Podcast Day</p>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Celebrating the impactful voices of veteran podcasters. Join us October 5th, 2026
              for the annual Veteran Podcast Awards livestream ceremony.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-primary mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/network" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Podcast Network
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About VPA
                </Link>
              </li>
              <li>
                <Link to="/#pre-register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Get Notified
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-primary mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/sponsors" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sponsors
                </Link>
              </li>
              <li>
                <Link to="/livestream" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Livestream
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="mt-8">
          <PodcastDisclaimer />
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Veteran Podcast Awards. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms & Conditions
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            A property of National Military Podcast Day
          </p>
        </div>
      </div>
    </footer>
  );
};
