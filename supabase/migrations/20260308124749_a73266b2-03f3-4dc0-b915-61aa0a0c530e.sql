
-- Create student_results table
CREATE TABLE public.student_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_number text NOT NULL,
  student_name text NOT NULL,
  grade text NOT NULL,
  exam_name text NOT NULL DEFAULT 'Annual Exam',
  subjects jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_marks numeric,
  max_marks numeric,
  percentage numeric,
  result text DEFAULT 'Pass',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.student_results ENABLE ROW LEVEL SECURITY;

-- Anyone can view results (public lookup by roll number)
CREATE POLICY "Anyone can view results" ON public.student_results
  FOR SELECT USING (true);

-- Admins can insert results
CREATE POLICY "Admins can insert results" ON public.student_results
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update results
CREATE POLICY "Admins can update results" ON public.student_results
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete results
CREATE POLICY "Admins can delete results" ON public.student_results
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for roll number lookups
CREATE INDEX idx_student_results_roll ON public.student_results(roll_number);
