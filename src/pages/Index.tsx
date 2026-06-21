import { Helmet } from "react-helmet-async";
import HeroSection from "@/components/HeroSection";
import FeaturedBars from "@/components/FeaturedBars";
import SearchFilters from "@/components/SearchFilters";
import Footer from "@/components/Footer";
import QuestionnaireButton from "@/components/QuestionnaireButton";

const OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/590cf2dc-7ec5-49bb-a029-7934c9a3335a/id-preview-adfa6c3f--f876734b-e0f2-48c3-acb9-15b595e030b5.lovable.app-1771667031143.png";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SG Bars",
  "alternateName": "Singapore Bar Guide",
  "url": "https://bars.sg",
  "description": "Singapore's Premier Bar Guide featuring Asia's 50 Best Bars, cocktail bars, speakeasies, rooftop bars and nightlife.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://bars.sg/bars?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>SG Bars — Singapore's Premier Bar &amp; Cocktail Guide</title>
        <meta name="description" content="Discover Singapore's finest cocktail bars, speakeasies and award-winning venues — from Asia's 50 Best to hidden rooftop gems." />
        <link rel="canonical" href="https://bars.sg/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bars.sg/" />
        <meta property="og:title" content="SG Bars — Singapore's Premier Bar & Cocktail Guide" />
        <meta property="og:description" content="Discover Singapore's finest cocktail bars, speakeasies and award-winning venues — from Asia's 50 Best to hidden rooftop gems." />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sgbars" />
        <meta name="twitter:title" content="SG Bars — Singapore's Premier Bar & Cocktail Guide" />
        <meta name="twitter:description" content="Discover Singapore's finest cocktail bars, speakeasies and award-winning venues — from Asia's 50 Best to hidden rooftop gems." />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
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
