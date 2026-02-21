import { Search, MapPin, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-singapore-bar.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Singapore rooftop bar with Marina Bay Sands skyline"
          className="w-full h-full object-cover object-[center_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
          Singapore's
          <span className="block text-accent">Finest Bars</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in-up animate-stagger-1">
          Discover award-winning cocktail bars, rooftop lounges, and hidden speakeasies across the Lion City
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-10 animate-fade-in-up animate-stagger-2">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">500+</div>
            <div className="text-sm text-white/80">Bars Listed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">35</div>
            <div className="text-sm text-white/80">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">129</div>
            <div className="text-sm text-white/80">Locations</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto animate-fade-in-up animate-stagger-3">
          <div className="flex flex-col md:flex-row gap-4 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bars, cocktails, or neighborhoods..."
                className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-accent rounded-xl"
              />
            </div>
            <button className="btn-gold px-8 py-4 whitespace-nowrap">
              <MapPin className="w-5 h-5 mr-2" />
              Explore Bars
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;