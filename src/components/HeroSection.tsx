import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-singapore-bar.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Singapore rooftop bar with Marina Bay Sands skyline"
          className="w-full h-full object-cover object-[center_25%]"
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative z-10 text-center text-white max-w-3xl mx-auto px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/60 mb-6 font-medium">
          Singapore Bar Guide
        </p>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
          The Best Bars<br />in Singapore
        </h1>
        <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
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
