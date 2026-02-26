import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section
      className="relative h-[80vh] flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0a0e1a 0%, #0d1b2a 40%, #0a0f1e 70%, #050810 100%)" }}
    >
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

      <div className="relative z-10 text-center text-white max-w-3xl mx-auto px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-6 font-medium">
          Singapore Bar Guide
        </p>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
          The Best Bars<br />in Singapore
        </h1>
        <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
          503 bars across cocktail lounges, rooftop terraces, speakeasies, and neighbourhood pubs.
        </p>
        <Link
          to="/bars"
          className="inline-block px-10 py-4 bg-white text-black text-sm font-semibold tracking-widest uppercase hover:bg-white/90 transition-colors"
        >
          Explore All Bars
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
