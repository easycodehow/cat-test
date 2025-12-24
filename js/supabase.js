// Supabase 클라이언트 설정
const SUPABASE_URL = 'https://yokquhkzmzwavlcbiyoy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlva3F1aGt6bXp3YXZsY2JpeW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NzU2NzcsImV4cCI6MjA4MjE1MTY3N30.Xi54iepxAQGyyEg8yN4zkSyv35nYB-IUzUMdGr5GpGE';

// Supabase 클라이언트 초기화
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 전역 변수로 설정
window.supabaseClient = supabaseClient;
