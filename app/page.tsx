import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-uni-blue">
      <GraduationCap className="w-20 h-20 text-uni-maroon mb-6" />
      <h1 className="text-5xl font-black mb-4">University Alumni Portal</h1>
      <p className="text-xl text-slate-500 mb-8">Connect with your legacy.</p>
      
      <div className="flex gap-4">
        <Link href="/login" className="px-8 py-3 bg-uni-blue text-white rounded-full font-bold hover:bg-opacity-90 transition-all">
          Login
        </Link>
        <Link href="/register" className="px-8 py-3 border-2 border-uni-blue rounded-full font-bold hover:bg-slate-50 transition-all">
          Register
        </Link>
      </div>
    </div>
  )
}