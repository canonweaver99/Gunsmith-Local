import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  full_name?: string
  website?: string
  created_at: string
}

export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) throw error
  return data
}

export async function signIn(email: string, password: string, rememberMe: boolean = false) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  
  // Store remember me preference in localStorage
  if (typeof window !== 'undefined') {
    if (rememberMe) {
      // Store the user's email for convenience (pre-fill on next visit)
      localStorage.setItem('rememberedEmail', email)
      localStorage.setItem('rememberMe', 'true')
    } else {
      // Clear stored email if remember me is not checked
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('rememberMe')
    }
  }
  
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (error) throw error
}
