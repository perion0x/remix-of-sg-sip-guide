import { X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
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
            className="relative bg-accent border-b border-accent overflow-hidden"
          >
            <div className="container mx-auto px-6 py-2.5 flex items-center justify-center gap-3 text-sm">
              <span className="text-accent-foreground font-medium tracking-tight">
                Discover Singapore's award-winning cocktail bars
              </span>
              <Link to="/bars" className="text-accent-foreground font-semibold underline">
                Explore now →
              </Link>
              <button
                onClick={() => setShowBanner(false)}
                aria-label="Dismiss banner"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-foreground/70 hover:text-accent-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
