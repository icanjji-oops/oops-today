import { createClient } from '@supabase/supabase-js'

// import.meta.env가 작동하지 않을 경우를 대비해 직접 문자열을 넣습니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jwavutqfcihwvdxsacie.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_9wlaWDy7squ99gzVAZosyw_rDvdEKmb';

export const supabase = createClient(supabaseUrl, supabaseKey)