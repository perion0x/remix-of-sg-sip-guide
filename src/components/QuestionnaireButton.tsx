import { useState, useEffect } from "react";
import { Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import CocktailQuestionnaire from "./CocktailQuestionnaire";

const QuestionnaireButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show the floating button after a short delay
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Floating button */}
      <div
        className={`fixed bottom-6 right-6 z-40 transition-all duration-500 ${
          showButton ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
        }`}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="btn-gold h-14 px-6 rounded-full shadow-gold group"
          size="lg"
        >
          <Wine className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
          <span className="font-medium">Find Your Cocktail</span>
        </Button>
      </div>

      {/* Questionnaire dialog */}
      <CocktailQuestionnaire open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default QuestionnaireButton;
