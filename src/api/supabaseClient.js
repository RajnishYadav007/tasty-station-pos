import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const supabaseUrl = 'https://bykkbkuknrzisjudsati.supabase.co'; // Your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5a2tia3VrbnJ6aXNqdWRzYXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzA4MTEsImV4cCI6MjA3Njk0NjgxMX0.d5wyq6ZSHDVvdF0WsLJkpRPGkUy0Kn0nRT1OY7LNoY8'; // Your Supabase anon/public key

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
