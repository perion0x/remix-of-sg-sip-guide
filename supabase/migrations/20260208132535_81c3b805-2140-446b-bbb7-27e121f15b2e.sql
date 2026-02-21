-- Create table for cocktail questionnaire responses
CREATE TABLE public.cocktail_questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  flavor_preference TEXT NOT NULL,
  spirit_preference TEXT NOT NULL,
  strength_preference TEXT NOT NULL,
  occasion TEXT NOT NULL,
  recommended_cocktail TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cocktail_questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public questionnaire)
CREATE POLICY "Anyone can submit questionnaire"
ON public.cocktail_questionnaire_responses
FOR INSERT
WITH CHECK (true);

-- Only allow reading own responses by email (for future use)
CREATE POLICY "Users can view their own responses"
ON public.cocktail_questionnaire_responses
FOR SELECT
USING (true);