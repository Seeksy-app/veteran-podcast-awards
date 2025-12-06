import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactFormDialog } from "@/components/contact/ContactFormDialog";
import logo from "@/assets/vpa-logo.png";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Livestream", href: "/livestream" },
  { label: "Network", href: "/network" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Veteran Podcast Awards" className="h-14 w-14" />
              <span className="hidden sm:block font-serif text-lg text-gold-gradient font-semibold">
                VPA 2026
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-sm font-medium transition-colors duration-300 hover:text-primary ${
                    location.pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4">
              <Button variant="gold" size="sm" onClick={() => setIsContactOpen(true)}>
                Get Notified
              </Button>
            </div>

            <button
              className="lg:hidden text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isOpen && (
            <div className="lg:hidden py-4 border-t border-border animate-fade-in">
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-sm font-medium transition-colors duration-300 hover:text-primary ${
                      location.pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Button 
                    variant="gold" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setIsOpen(false);
                      setIsContactOpen(true);
                    }}
                  >
                    Get Notified
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <ContactFormDialog
        open={isContactOpen}
        onOpenChange={setIsContactOpen}
        type="general"
      />
    </>
  );
};
