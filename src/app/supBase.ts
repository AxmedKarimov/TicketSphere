import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://zvosznogxmdkucflqsha.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2b3N6bm9neG1ka3VjZmxxc2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTAxODMsImV4cCI6MjA1NDE4NjE4M30.Wjo54sxnELTGmvMuuVwHDVqLOpPVqBxus4r-R1CQAlI"
);
