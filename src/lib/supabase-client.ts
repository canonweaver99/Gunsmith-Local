import { createClient } from '@supabase/supabase-js'

// Validate environment variables (no placeholders to avoid 406/headers issues)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create a more robust Supabase client with retry logic
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-application-name': 'gunsmithlocal',
      'x-my-custom-header': 'my-app-name',
      // Let postgrest-js manage Accept/Content-Type per request (.single/.maybeSingle)
      // Setting them globally can cause 406 with single/object responses
      // Ensure PostgREST receives the API key explicitly
      'apikey': supabaseAnonKey,
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper function to check Supabase connection
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1)
    return !error
  } catch {
    return false
  }
}

// Helper function with retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  
  throw lastError
}
