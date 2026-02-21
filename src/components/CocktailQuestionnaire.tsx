import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wine, Sparkles, Mail, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

interface CocktailQuestionnaireProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "flavor" | "spirit" | "strength" | "occasion" | "mood" | "result";

interface CocktailRecommendation {
  name: string;
  description: string;
  ingredients: string[];
}

const cocktailRecommendations: Record<string, CocktailRecommendation> = {
  "sweet-vodka-light-celebration": {
    name: "Cosmopolitan",
    description: "A sophisticated pink cocktail that's sweet, tangy, and perfect for celebrations.",
    ingredients: ["Vodka", "Triple Sec", "Cranberry Juice", "Fresh Lime"],
  },
  "sweet-rum-light-relaxing": {
    name: "Piña Colada",
    description: "A tropical escape in a glass with creamy coconut and pineapple.",
    ingredients: ["White Rum", "Coconut Cream", "Pineapple Juice", "Ice"],
  },
  "citrus-gin-medium-social": {
    name: "Singapore Sling",
    description: "A classic Singapore cocktail with a perfect balance of sweet and citrus.",
    ingredients: ["Gin", "Cherry Heering", "Benedictine", "Pineapple Juice"],
  },
  "bitter-whiskey-strong-relaxing": {
    name: "Old Fashioned",
    description: "A timeless classic for whiskey lovers who appreciate depth and complexity.",
    ingredients: ["Bourbon", "Angostura Bitters", "Sugar Cube", "Orange Peel"],
  },
  "citrus-tequila-medium-celebration": {
    name: "Margarita",
    description: "Refreshingly tangy with the perfect kick for any celebration.",
    ingredients: ["Tequila", "Triple Sec", "Fresh Lime Juice", "Salt Rim"],
  },
  "herbal-gin-light-social": {
    name: "Gin & Tonic",
    description: "Crisp, botanical, and endlessly refreshing for social gatherings.",
    ingredients: ["Premium Gin", "Tonic Water", "Lime", "Cucumber"],
  },
  "sweet-rum-medium-adventurous": {
    name: "Mai Tai",
    description: "An adventurous tropical blend that transports you to island paradise.",
    ingredients: ["Dark Rum", "Light Rum", "Orange Curaçao", "Lime Juice", "Orgeat"],
  },
  "bitter-gin-strong-sophisticated": {
    name: "Negroni",
    description: "Bold, bitter, and beautifully balanced for the sophisticated palate.",
    ingredients: ["Gin", "Campari", "Sweet Vermouth", "Orange Peel"],
  },
  "citrus-vodka-light-energetic": {
    name: "Moscow Mule",
    description: "Zingy and refreshing with a spicy ginger kick to keep you energized.",
    ingredients: ["Vodka", "Ginger Beer", "Fresh Lime", "Mint"],
  },
  "herbal-whiskey-medium-relaxing": {
    name: "Mint Julep",
    description: "A cooling, aromatic whiskey cocktail perfect for unwinding.",
    ingredients: ["Bourbon", "Fresh Mint", "Simple Syrup", "Crushed Ice"],
  },
  "default": {
    name: "Espresso Martini",
    description: "The perfect pick-me-up cocktail with rich coffee flavor and a velvety finish.",
    ingredients: ["Vodka", "Coffee Liqueur", "Fresh Espresso", "Simple Syrup"],
  },
};

const getCocktailRecommendation = (flavor: string, spirit: string, strength: string, occasion: string, mood: string): CocktailRecommendation => {
  const keys = [
    `${flavor}-${spirit}-${strength}-${occasion}`,
    `${flavor}-${spirit}-${strength}-${mood}`,
    `${flavor}-${spirit}-${mood}-${occasion}`,
  ];
  
  for (const key of keys) {
    if (cocktailRecommendations[key]) {
      return cocktailRecommendations[key];
    }
  }
  return cocktailRecommendations["default"];
};

const CocktailQuestionnaire = ({ open, onOpenChange }: CocktailQuestionnaireProps) => {
  const [step, setStep] = useState<Step>("flavor");
  const [email, setEmail] = useState("");
  const [flavorPreference, setFlavorPreference] = useState("");
  const [spiritPreference, setSpiritPreference] = useState("");
  const [strengthPreference, setStrengthPreference] = useState("");
  const [occasion, setOccasion] = useState("");
  const [mood, setMood] = useState("");
  const [recommendation, setRecommendation] = useState<CocktailRecommendation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setStep("flavor");
    setEmail("");
    setFlavorPreference("");
    setSpiritPreference("");
    setStrengthPreference("");
    setOccasion("");
    setMood("");
    setRecommendation(null);
    setShowEmailForm(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const generateRecommendation = () => {
    const cocktail = getCocktailRecommendation(flavorPreference, spiritPreference, strengthPreference, occasion, mood);
    setRecommendation(cocktail);
    setStep("result");
  };

  const handleSaveEmail = async () => {
    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("cocktail_questionnaire_responses")
        .insert({
          email: email.trim().toLowerCase(),
          flavor_preference: flavorPreference,
          spirit_preference: spiritPreference,
          strength_preference: strengthPreference,
          occasion: occasion,
          recommended_cocktail: recommendation?.name || null,
        });

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "We'll send you more cocktail recommendations.",
      });
      setShowEmailForm(false);
    } catch (error) {
      console.error("Error saving email:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case "flavor":
        return flavorPreference !== "";
      case "spirit":
        return spiritPreference !== "";
      case "strength":
        return strengthPreference !== "";
      case "occasion":
        return occasion !== "";
      case "mood":
        return mood !== "";
      default:
        return false;
    }
  };

  const nextStep = () => {
    const steps: Step[] = ["flavor", "spirit", "strength", "occasion", "mood"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    } else if (step === "mood") {
      generateRecommendation();
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["flavor", "spirit", "strength", "occasion", "mood"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const getProgress = () => {
    const steps: Step[] = ["flavor", "spirit", "strength", "occasion", "mood", "result"];
    return ((steps.indexOf(step) + 1) / steps.length) * 100;
  };

  const getQuestionNumber = () => {
    const steps: Step[] = ["flavor", "spirit", "strength", "occasion", "mood"];
    return steps.indexOf(step) + 1;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-lg overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${getProgress()}%` }}
          />
        </div>

        <DialogHeader className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Wine className="w-6 h-6 text-accent" />
            <DialogTitle className="text-xl font-semibold text-foreground">
              {step === "result" ? "Your Perfect Cocktail" : `Question ${getQuestionNumber()} of 5`}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {step === "flavor" && "What flavor profile do you prefer?"}
            {step === "spirit" && "What's your preferred base spirit?"}
            {step === "strength" && "How strong do you like your drinks?"}
            {step === "occasion" && "What's the occasion?"}
            {step === "mood" && "What's your current mood?"}
            {step === "result" && "Based on your answers, we recommend..."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === "flavor" && (
            <RadioGroup value={flavorPreference} onValueChange={setFlavorPreference} className="space-y-3">
              {[
                { value: "sweet", label: "Sweet", desc: "Fruity, dessert-like cocktails" },
                { value: "citrus", label: "Citrus", desc: "Bright, tangy, refreshing" },
                { value: "bitter", label: "Bitter", desc: "Complex, sophisticated flavors" },
                { value: "herbal", label: "Herbal", desc: "Botanical, aromatic notes" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-accent/50 transition-colors cursor-pointer" onClick={() => setFlavorPreference(option.value)}>
                  <RadioGroupItem value={option.value} id={`flavor-${option.value}`} />
                  <div>
                    <Label htmlFor={`flavor-${option.value}`} className="text-foreground font-medium cursor-pointer">{option.label}</Label>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}

          {step === "spirit" && (
            <RadioGroup value={spiritPreference} onValueChange={setSpiritPreference} className="space-y-3">
              {[
                { value: "vodka", label: "Vodka", desc: "Clean, versatile base" },
                { value: "gin", label: "Gin", desc: "Juniper-forward, botanical" },
                { value: "rum", label: "Rum", desc: "Sweet, tropical vibes" },
                { value: "whiskey", label: "Whiskey", desc: "Rich, warming, complex" },
                { value: "tequila", label: "Tequila", desc: "Earthy, agave-forward" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-accent/50 transition-colors cursor-pointer" onClick={() => setSpiritPreference(option.value)}>
                  <RadioGroupItem value={option.value} id={`spirit-${option.value}`} />
                  <div>
                    <Label htmlFor={`spirit-${option.value}`} className="text-foreground font-medium cursor-pointer">{option.label}</Label>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}

          {step === "strength" && (
            <RadioGroup value={strengthPreference} onValueChange={setStrengthPreference} className="space-y-3">
              {[
                { value: "light", label: "Light", desc: "Refreshing, sessionable" },
                { value: "medium", label: "Medium", desc: "Balanced, approachable" },
                { value: "strong", label: "Strong", desc: "Spirit-forward, potent" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-accent/50 transition-colors cursor-pointer" onClick={() => setStrengthPreference(option.value)}>
                  <RadioGroupItem value={option.value} id={`strength-${option.value}`} />
                  <div>
                    <Label htmlFor={`strength-${option.value}`} className="text-foreground font-medium cursor-pointer">{option.label}</Label>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}

          {step === "occasion" && (
            <RadioGroup value={occasion} onValueChange={setOccasion} className="space-y-3">
              {[
                { value: "celebration", label: "Celebration", desc: "Festive, special occasions" },
                { value: "relaxing", label: "Relaxing", desc: "Unwinding after a long day" },
                { value: "social", label: "Social", desc: "Catching up with friends" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-accent/50 transition-colors cursor-pointer" onClick={() => setOccasion(option.value)}>
                  <RadioGroupItem value={option.value} id={`occasion-${option.value}`} />
                  <div>
                    <Label htmlFor={`occasion-${option.value}`} className="text-foreground font-medium cursor-pointer">{option.label}</Label>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}

          {step === "mood" && (
            <RadioGroup value={mood} onValueChange={setMood} className="space-y-3">
              {[
                { value: "adventurous", label: "Adventurous", desc: "Ready to try something new" },
                { value: "sophisticated", label: "Sophisticated", desc: "Seeking elegance and refinement" },
                { value: "energetic", label: "Energetic", desc: "Looking for a pick-me-up" },
                { value: "relaxing", label: "Chill", desc: "Just want to unwind" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-accent/50 transition-colors cursor-pointer" onClick={() => setMood(option.value)}>
                  <RadioGroupItem value={option.value} id={`mood-${option.value}`} />
                  <div>
                    <Label htmlFor={`mood-${option.value}`} className="text-foreground font-medium cursor-pointer">{option.label}</Label>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}

          {step === "result" && recommendation && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-accent">{recommendation.name}</h3>
              <p className="text-muted-foreground">{recommendation.description}</p>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Ingredients</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {recommendation.ingredients.map((ingredient, index) => (
                    <li key={index}>• {ingredient}</li>
                  ))}
                </ul>
              </div>
              
              {/* Email signup section */}
              {!showEmailForm ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowEmailForm(true)}
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Get more recommendations
                </Button>
              ) : (
                <div className="space-y-3 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground text-sm">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleSaveEmail}
                    disabled={isSubmitting || !validateEmail(email)}
                    className="w-full btn-gold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-3">
          {step !== "flavor" && step !== "result" && (
            <Button variant="outline" onClick={prevStep} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          {step === "flavor" && <div className="flex-1" />}
          {step !== "result" && (
            <Button 
              onClick={nextStep} 
              disabled={!canProceed()}
              className="flex-1 btn-gold"
            >
              {step === "mood" ? (
                <>
                  Get My Cocktail
                  <Sparkles className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          )}
          {step === "result" && (
            <Button onClick={handleClose} className="w-full btn-gold">
              Explore Singapore Bars
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CocktailQuestionnaire;
