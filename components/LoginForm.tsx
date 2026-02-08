'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { LogIn, Loader2, GraduationCap, AlertCircle } from 'lucide-react'

export default function LoginForm() {
    const [email, setEmail] = useState('')
      const [password, setPassword] = useState('')
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState<string | null>(null)
    
      const router = useRouter()
      const searchParams = useSearchParams()
      const message = searchParams.get('message') // Grabs messages from the URL (like "Confirm email")
    
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Fetch the user's role to determine where to send them
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      // Force a refresh so Middleware picks up the new cookie
      router.refresh()

      if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/directory')
      }
      
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
}


  // Your existing login UI and handleSubmit logic goes here...
  return (
    <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex justify-center items-center py-3 bg-uni-blue"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <span className="flex items-center gap-2 font-bold"><LogIn size={18} /> Sign In</span>
            )}
          </button>
        </form>
  )
}