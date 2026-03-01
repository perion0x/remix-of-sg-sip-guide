import { Star, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  return (
    <>
      {/* Apple-style top banner */}
      {showBanner && (
        <div className="relative bg-secondary text-center py-2.5 px-4">
          <p className="text-xs text-muted-foreground">
            Discover Singapore's award-winning cocktail bars.{" "}
            <Link to="/bars" className="text-accent hover:underline underline-offset-2">
              Explore now →
            </Link>
          </p>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Star className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="text-lg font-display font-semibold text-foreground tracking-wide">SG Bars</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-10">
              {["Bars", "Rankings", "Map", "Neighborhoods"].map((item) => (
                <Link
                  key={item}
                  to={item === "Bars" ? "/bars" : "#"}
                  className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-300 tracking-wide"
                >
                  {item}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-accent transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-6 border-t border-border/50 animate-fade-in-up">
              <nav className="flex flex-col space-y-4">
                {["Bars", "Rankings", "Map", "Neighborhoods"].map((item) => (
                  <Link
                    key={item}
                    to={item === "Bars" ? "/bars" : "#"}
                    className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors tracking-wide"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
