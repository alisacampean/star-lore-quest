-- Add missing columns to publications table for filtering and display
ALTER TABLE public.publications
ADD COLUMN IF NOT EXISTS abstract TEXT,
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS authors TEXT,
ADD COLUMN IF NOT EXISTS research_area TEXT,
ADD COLUMN IF NOT EXISTS organism TEXT,
ADD COLUMN IF NOT EXISTS experiment_type TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_publications_year ON public.publications(year);
CREATE INDEX IF NOT EXISTS idx_publications_research_area ON public.publications(research_area);
CREATE INDEX IF NOT EXISTS idx_publications_organism ON public.publications(organism);
CREATE INDEX IF NOT EXISTS idx_publications_experiment_type ON public.publications(experiment_type);