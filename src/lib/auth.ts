import { supabase } from './supabaseClient'

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error
}

export async function signOut() {
  await supabase.auth.signOut()
}
