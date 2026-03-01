import { Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import sgLogo from "@/assets/sg-bars-logo.png";
const navItems = [
  { label: "Bars", to: "/bars" },
  { label: "Rankings", to: "#" },
  { label: "Map", to: "#" },
  { label: "Neighborhoods", to: "#" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  return (
    <>
      {/* Promo banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-accent text-center overflow-hidden"
          >
            <div className="py-2 px-4">
              <p className="text-xs font-medium text-accent-foreground tracking-wide">
                Discover Singapore's award-winning cocktail bars.{" "}
                <Link to="/bars" className="underline underline-offset-2 hover:opacity-80">
                  Explore now →
                </Link>
              </p>
              <button
                onClick={() => setShowBanner(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-foreground/60 hover:text-accent-foreground transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
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
              <img src={sgLogo} alt="SG Bars" className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-accent/20 transition-all duration-300 group-hover:shadow-accent/40 group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="text-base font-bold text-foreground tracking-tight leading-none">
                  SG Bars
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 leading-none mt-0.5">
                  Singapore
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="relative px-4 py-2 text-sm font-medium text-foreground hover:text-foreground transition-colors duration-300 rounded-lg hover:bg-foreground/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <button className="hidden md:flex items-center gap-2 px-3.5 py-2 text-xs text-muted-foreground bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors border border-border/40">
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
                <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-background/80 rounded border border-border/50 text-muted-foreground/50">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
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
                      className="py-3 px-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
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
