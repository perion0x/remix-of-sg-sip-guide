import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroVideo from "@/assets/hero-bar-video.mp4";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-background/70" />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute left-1/2 top-0 w-px h-24 bg-gradient-to-b from-transparent via-accent/30 to-transparent origin-top"
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xs uppercase tracking-[0.35em] text-accent/70 mb-8 font-medium"
        >
          Singapore Bar Guide
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-display text-6xl md:text-8xl font-bold leading-[0.95] mb-8 tracking-tight text-foreground"
        >
          The Best Bars
          <br />
          <span className="italic font-medium text-accent">in Singapore</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-base md:text-lg text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed"
        >
          503 bars across cocktail lounges, rooftop terraces,
          speakeasies, and neighbourhood pubs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <Link
            to="/bars"
            className="group inline-flex items-center gap-3 px-10 py-4 border border-accent/40 text-accent text-sm font-semibold tracking-[0.2em] uppercase hover:bg-accent hover:text-accent-foreground transition-all duration-500"
          >
            Explore All Bars
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-20 flex items-center justify-center gap-12 text-center"
        >
          {[
            { value: "503", label: "Bars Listed" },
            { value: "35", label: "Categories" },
            { value: "129", label: "Locations" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
              <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </section>
  );
};

export default HeroSection;
