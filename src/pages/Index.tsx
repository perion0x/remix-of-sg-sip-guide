import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedBars from "@/components/FeaturedBars";
import SearchFilters from "@/components/SearchFilters";
import Footer from "@/components/Footer";
import QuestionnaireButton from "@/components/QuestionnaireButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
