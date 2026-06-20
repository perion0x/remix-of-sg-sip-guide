import sgLogo from "@/assets/sg-bars-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2.5 mb-4">
              <img src={sgLogo} alt="SG Bars" className="w-7 h-7 object-contain" />
              <span className="text-lg font-display font-semibold text-foreground">SG Bars</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Singapore's premier guide to cocktail bars, speakeasies, and award-winning establishments.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-accent/60 font-semibold mb-5">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/bars" className="text-muted-foreground hover:text-accent transition-colors duration-300">All Bars</a></li>
              <li><a href="/guides/rooftop-bars-singapore" className="text-muted-foreground hover:text-accent transition-colors duration-300">Best Rooftop Bars</a></li>
              <li><a href="/bars?category=Cocktail+Bar" className="text-muted-foreground hover:text-accent transition-colors duration-300">Cocktail Bars</a></li>
              <li><a href="/bars?category=Speakeasy" className="text-muted-foreground hover:text-accent transition-colors duration-300">Speakeasies</a></li>
              <li><a href="/bars?category=Wine+Bar" className="text-muted-foreground hover:text-accent transition-colors duration-300">Wine Bars</a></li>
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-accent/60 font-semibold mb-5">Areas</h3>
            <ul className="space-y-3 text-sm">
              {["Marina Bay", "Clarke Quay", "Orchard Road", "Chinatown", "Tanjong Pagar"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-accent/60 font-semibold mb-5">Connect</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Submit your bar for consideration.
            </p>
            <a href="#" className="inline-block px-5 py-2.5 border border-accent/30 text-accent text-xs font-semibold tracking-[0.15em] uppercase hover:bg-accent hover:text-accent-foreground transition-all duration-300">
              Add Your Bar
            </a>
          </div>
        </div>

        <div className="border-t border-border/30 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground/60">
            © {currentYear} SG Bars. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a key={item} href="#" className="text-muted-foreground/60 hover:text-accent transition-colors duration-300">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
