
'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Camera, Save, Loader2, CheckCircle, ArrowLeft, HeartHandshake } from 'lucide-react'
import Link from 'next/link'

export default function EditProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const degrees = ["BSCS", "BSIT", "BSCommerce", "BBA", "BSMath", "BED", "BSENG"]
  const years = Array.from({ length: new Date().getFullYear() - 2017 }, (_, i) => 2018 + i).reverse()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)

      // 3. Update Profile State (don't save to DB yet, wait for 'Save' button or do it now)
      setProfile({ ...profile, avatar_url: publicUrl })
      
      // Optional: Auto-save the URL to DB immediately
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)

    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const { error } = await supabase.from('profiles').update(profile).eq('id', profile.id)
    
    if (!error) alert("Profile synchronized!")
    setIsSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#800000]" /></div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/profile" className="flex items-center gap-2 text-slate-400 hover:text-[#000080] font-bold text-xs mb-8 transition-colors">
          <ArrowLeft size={14} /> BACK TO DASHBOARD
        </Link>

        <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}`} 
                  className="w-full h-full object-cover" 
                  alt="Profile" 
                />
              </div>
              <label className="absolute bottom-2 right-2 p-3 bg-[#800000] text-white rounded-2xl cursor-pointer shadow-xl hover:scale-110 transition-all">
                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
              </label>
            </div>
            <h2 className="mt-4 font-black text-[#000080] uppercase tracking-widest text-sm">Profile Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Full Name</label>
              <input 
                value={profile?.full_name || ''} 
                onChange={e => setProfile({...profile, full_name: e.target.value})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-[#800000]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Current Employer</label>
              <input 
                value={profile?.current_company || ''} 
                onChange={e => setProfile({...profile, current_company: e.target.value})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-[#800000]"
                placeholder="Where do you work?"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Degree Program</label>
              <select 
                value={profile?.degree || ''} 
                onChange={e => setProfile({...profile, degree: e.target.value})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none appearance-none"
              >
                {degrees.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Graduation Year</label>
              <select 
                value={profile?.graduation_year || ''} 
                onChange={e => setProfile({...profile, graduation_year: e.target.value})}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none appearance-none"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Mentorship Toggle */}
          <div className="mt-8 p-6 bg-blue-50 rounded-[2rem] flex items-center justify-between border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm"><HeartHandshake size={20} /></div>
              <div>
                <p className="text-xs font-black text-blue-800 uppercase leading-none">Alumni Mentorship</p>
                <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase">Willing to guide students?</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setProfile({...profile, is_mentor: !profile.is_mentor})}
              className={`w-14 h-8 rounded-full relative transition-colors ${profile?.is_mentor ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${profile?.is_mentor ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full mt-10 bg-[#800000] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-100 flex items-center justify-center gap-2 hover:bg-[#000080] transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isSaving ? 'Synchronizing...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}