// supabaseClient.js

const SUPABASE_URL = 'https://oblyqmrjbiyjzpmbvxbu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibHlxbXJqYml5anpwbWJ2eGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODU5MTIsImV4cCI6MjA2Njk2MTkxMn0.FKiRdWqxpMq-ZIzWoEiUMVvtygRVR55z2G2ZTL8PkZA';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);