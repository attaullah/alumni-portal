'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams, useRouter } from 'next/navigation'
import { GraduationCap, Briefcase, Mail, Phone, ArrowLeft } from 'lucide-react'

export default function ProfileDetails() {
  const { id } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function getProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('is_verified', true) // <--- Only show verified
        .single()
      setProfile(data)
    }
    if (id) getProfile()
  }, [id])

  if (!profile) return <div className="p-20 text-center">Loading Profile...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-uni-blue mb-6">
        <ArrowLeft size={20} /> Back to Directory
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-32 bg-uni-blue"></div>
        <div className="px-8 pb-8">
          <div className="relative -top-12 flex flex-col md:flex-row md:items-end gap-6">
            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-slate-200 overflow-hidden shadow-lg">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <GraduationCap className="w-full h-full p-6 text-slate-400" />
              )}
            </div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-slate-800">{profile.full_name}</h1>
              <p className="text-uni-blue font-medium">Class of {profile.graduation_year} • {profile.degree}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Professional Experience</h3>
              <div className="flex items-start gap-3">
                <Briefcase className="text-slate-400 mt-1" />
                <div>
                  <p className="font-semibold text-slate-700">{profile.job_title || 'N/A'}</p>
                  <p className="text-slate-500">{profile.job_company || 'Seeking opportunities'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Contact Details</h3>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={18} /> <span>{profile.contact_number || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}