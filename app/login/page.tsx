'use client'

import { Suspense, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Loader2, GraduationCap, AlertCircle } from 'lucide-react'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  // const searchParams = useSearchParams()
  // const message = searchParams.get('message') // Grabs messages from the URL (like "Confirm email")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl border-t-4 border-uni-blue">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-uni-blue/10 p-3 rounded-full mb-4">
            <GraduationCap className="w-10 h-10 text-uni-blue" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Alumni Portal</h1>
          <p className="text-slate-500">Welcome back! Please sign in.</p>
        </div>

        {/* Success messages from Registration */}
        {/* {message && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-md flex items-center gap-2">
            <AlertCircle size={16} /> {message}
          </div>
        )} */}

        {/* Error messages */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin text-[#000080] mb-2" />
          <p className="text-xs font-bold text-slate-400">Loading Secure Portal...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Need an account?{' '}
            <Link href="/register" className="text-uni-blue font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}