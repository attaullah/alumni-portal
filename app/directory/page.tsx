'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Search, GraduationCap, Briefcase, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

// Define the shape of our Alumni data
interface Profile {
  id: string
  full_name: string
  degree: string
  graduation_year: string
  job_title: string
  job_company: string
  avatar_url: string | null
  contact_number: string
}

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })

    if (!error && data) {
      setProfiles(data)
    }
    setLoading(false)
  }

  // Filter profiles based on search term (name, degree, or company)
  const filteredProfiles = profiles.filter((p) =>
    `${p.full_name} ${p.degree} ${p.job_company}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header Section */}
      <div className="bg-uni-blue text-white py-12 px-4 shadow-lg mb-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Alumni Directory</h1>
          <p className="text-blue-100 text-lg">Connect with fellow graduates and professionals</p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, degree, or company..."
              className="w-full pl-12 pr-4 py-4 rounded-full border-none text-slate-900 focus:ring-4 focus:ring-uni-gold/50 outline-none shadow-xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-uni-blue">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} className="card hover:shadow-md transition-shadow flex flex-col items-center text-center group">
                {/* Profile Image */}
                <div className="w-24 h-24 rounded-full border-4 border-slate-50 overflow-hidden mb-4 shadow-sm group-hover:border-uni-blue/20 transition-colors">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                      <GraduationCap size={40} />
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold text-slate-800">{profile.full_name}</h2>
                <p className="text-uni-blue font-semibold text-sm mb-4">Class of {profile.graduation_year}</p>

                <div className="w-full space-y-3 text-sm text-slate-600 border-t pt-4">
                  <div className="flex items-center justify-center gap-2">
                    <GraduationCap size={16} className="text-slate-400" />
                    <span>{profile.degree}</span>
                  </div>
                  
                  {profile.job_title && (
                    <div className="flex items-center justify-center gap-2">
                      <Briefcase size={16} className="text-slate-400" />
                      <span>{profile.job_title} at <strong>{profile.job_company}</strong></span>
                    </div>
                  )}

                  {profile.contact_number && (
                    <div className="flex items-center justify-center gap-2">
                      <Phone size={16} className="text-slate-400" />
                      <span>{profile.contact_number}</span>
                    </div>
                  )}
                </div>
                
<Link 
  href={`/directory/${profile.id}`} 
  className="mt-6 w-full py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-uni-blue hover:text-white transition-colors text-center"
>
  View Profile
</Link>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProfiles.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-xl">No alumni found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  )
}