'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { CheckCircle2, XCircle, GraduationCap, ShieldCheck } from 'lucide-react'

export default function PublicVerifyPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function checkAlumnus() {
      // Fetch only public info: name, degree, and verification status
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, degree, graduation_year, is_verified, role')
        .eq('id', params.id)
        .single()
      
      setData(profile)
      setLoading(false)
    }
    checkAlumnus()
  }, [params.id])

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#000080]">Authenticating...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-8 border-[#800000]">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 bg-[#000080] rounded-full flex items-center justify-center text-white">
                <GraduationCap size={32} />
             </div>
          </div>

          {data?.is_verified ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle2 size={48} className="text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Verified Alumnus</h1>
              <p className="text-slate-500 font-bold mb-8">Access Granted</p>
              
              <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</p>
                <p className="text-lg font-bold text-slate-800 mb-4">{data.full_name}</p>
                
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Record</p>
                <p className="text-sm font-bold text-[#800000]">{data.degree} — {data.graduation_year}</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle size={48} className="text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Invalid ID</h1>
              <p className="text-red-600 font-bold mb-4">Verification Failed</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                This ID is either not verified or does not exist in the official Shaikh Ayaz University Alumni database.
              </p>
            </>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100">
            <p className="text-[10px] font-black text-[#000080] uppercase tracking-tighter">
              The Shaikh Ayaz University Shikarpur
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}