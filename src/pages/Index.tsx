import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedBars from "@/components/FeaturedBars";
import SearchFilters from "@/components/SearchFilters";
import Footer from "@/components/Footer";
import QuestionnaireButton from "@/components/QuestionnaireButton";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SG Bars",
  "alternateName": "Singapore Bar Guide",
  "url": "https://singapore-sip-guide.lovable.app",
  "description": "Singapore's Premier Bar Guide featuring Asia's 50 Best Bars, cocktail bars, speakeasies, rooftop bars and nightlife.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://singapore-sip-guide.lovable.app/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header />
      <main>
        <HeroSection />
        <SearchFilters />
        <FeaturedBars />
      </main>
      <Footer />
      <QuestionnaireButton />
    </div>
  );
};

export default Index;
