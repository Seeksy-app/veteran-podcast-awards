import { Link } from "react-router-dom";
import logo from "@/assets/vpa-logo.png";

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
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About VPA
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Get Notified
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-primary mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sponsors
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Veteran Podcast Awards. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            A property of National Military Podcast Day
          </p>
        </div>
      </div>
    </footer>
  );
};
