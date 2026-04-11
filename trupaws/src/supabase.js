import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://httjixdxrkwtrtzqwukj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dGppeGR4cmt3dHJ0enF3dWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzczODgsImV4cCI6MjA5MTUxMzM4OH0.41JWMotLI4XvG0mtY1NHpL4z0VYnFND1GvQmOgMAMi0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
