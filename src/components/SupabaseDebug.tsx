'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function SupabaseDebug() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)
  
  // Read public env vars for direct REST test (client-safe)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  const testConnection = async () => {
    setTesting(true)
    setResults(null)
    
    const testResults: any = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    try {
      // Guard: ensure Supabase client was created
      if (!supabase || typeof (supabase as any).from !== 'function') {
        console.error('Supabase client not initialized')
        testResults.tests.push({
          name: 'Supabase Client',
          success: false,
          data: null,
          error: 'Supabase client not initialized'
        })
        setResults(testResults)
        setTesting(false)
        return
      }

      // Test 1: Get current user
      // console.log('🧪 Testing Supabase auth...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      testResults.tests.push({
        name: 'Auth - Get User',
        success: !userError,
        data: user ? { id: user.id, email: user.email } : null,
        error: userError?.message
      })
      // console.log('Current user:', user)
      // console.log('User error:', userError)

      // Test 2: Test listings table read
      // console.log('🧪 Testing listings table read...')
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('id, business_name, status')
        .limit(1)
      
      testResults.tests.push({
        name: 'Database - Read Listings',
        success: !listingsError,
        data: listingsData,
        error: listingsError?.message
      })
      // console.log('Listings query result:', { data: listingsData, error: listingsError })

      // Test 3: Test profiles table read
      // console.log('🧪 Testing profiles table read...')
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(1)
      
      testResults.tests.push({
        name: 'Database - Read Profiles',
        success: !profilesError,
        data: profilesData,
        error: profilesError?.message
      })
      // console.log('Profiles query result:', { data: profilesData, error: profilesError })

      // Test 4: Test connection with custom headers via a temporary client
      // console.log('🧪 Testing with custom headers...')
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!url || !key) {
          console.error('Missing environment variables for custom headers test')
          testResults.tests.push({
            name: 'Custom Headers Client',
            success: false,
            data: null,
            error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
          })
        } else {
          const customClient = createClient(url, key, {
            global: {
              headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          })

          const { data: chData, error: chError } = await customClient
            .from('listings')
            .select('id')
            .limit(1)

          // console.log('Custom headers test:', { data: chData, error: chError })
          testResults.tests.push({
            name: 'Custom Headers Client',
            success: !chError,
            data: chData,
            error: chError?.message || null
          })
        }
      } catch (err: any) {
        console.error('Custom headers test failed:', err)
        testResults.tests.push({
          name: 'Custom Headers Client',
          success: false,
          data: null,
          error: err.message
        })
      }

      // Test 5: Environment variables
      testResults.tests.push({
        name: 'Environment Variables',
        success: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        data: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
        },
        error: (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ? 'Missing environment variables' : null
      })

    } catch (err: any) {
      console.error('Connection test failed:', err)
      testResults.tests.push({
        name: 'General Error',
        success: false,
        data: null,
        error: err.message
      })
    } finally {
      setResults(testResults)
      setTesting(false)
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">SUPABASE CONNECTION DEBUG</h2>
      
      <button 
        onClick={testConnection}
        disabled={testing}
        className="btn-primary mb-4 flex items-center gap-2"
      >
        {testing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Testing Connection...
          </>
        ) : (
          'Test Supabase Connection'
        )}
      </button>

      {results && (
        <div className="space-y-4">
          <div className="bg-gunsmith-accent/20 p-4 rounded">
            <p className="text-sm text-gunsmith-text-secondary mb-2">Test Results ({results.timestamp})</p>
            
            {results.tests.map((test: any, index: number) => (
              <div key={index} className="border-b border-gunsmith-border last:border-b-0 pb-3 last:pb-0 mb-3 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  {test.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium text-gunsmith-text">{test.name}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    test.success ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {test.success ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                
                {test.error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-2 mb-2">
                    <p className="text-red-500 text-sm font-mono">{test.error}</p>
                  </div>
                )}
                
                {test.data && (
                  <div className="bg-gunsmith-accent/10 rounded p-2">
                    <pre className="text-xs text-gunsmith-text-secondary overflow-x-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
