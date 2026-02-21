import { Search, MapPin, Star, Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">SG Bars</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-accent transition-colors font-medium">Bars</a>
            <a href="#" className="text-foreground hover:text-accent transition-colors font-medium">Rankings</a>
            <a href="#" className="text-foreground hover:text-accent transition-colors font-medium">Map</a>
            <a href="#" className="text-foreground hover:text-accent transition-colors font-medium">Neighborhoods</a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-accent transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in-up">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-foreground hover:text-accent transition-colors font-medium">Bars</a>
              <a href="#" className="text-foreground hover:text-accent transition-colors font-medium">Rankings</a>
              <a href="#" className="text-foreground hover:text-accent transition-colors font-medium">Map</a>
              <a href="#" className="text-foreground hover:text-accent transition-colors font-medium">Neighborhoods</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;