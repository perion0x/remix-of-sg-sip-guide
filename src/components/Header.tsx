import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@/assets/sg-bars-logo.png";
const navItems = [
  { label: "Bars", to: "/bars" },
  { label: "Rankings", to: "#" },
  { label: "Neighborhoods", to: "#" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 border-b border-primary/30 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-2.5 flex items-center justify-center gap-3 text-sm">
              <span className="text-foreground font-medium tracking-tight">
                Discover Singapore's award-winning cocktail bars
              </span>
              <Link to="/bars" className="text-primary font-semibold hover:underline">
                Explore now →
              </Link>
              <button
                onClick={() => setShowBanner(false)}
                aria-label="Dismiss banner"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logoImage}
                alt="SG Bars"
                className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-base font-bold text-foreground tracking-tight leading-none">
                SG Bars
              </span>
            </Link>

            {/* Desktop nav - centered */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="relative px-4 py-2 text-base font-bold tracking-tight text-foreground hover:text-foreground transition-colors duration-300 rounded-lg hover:bg-foreground/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden"
              >
                <nav className="flex flex-col py-4 border-t border-border/30">
                  {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="py-3 px-2 text-base font-bold tracking-tight text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
};

export default Header;
