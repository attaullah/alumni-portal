'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Loader2, Save, Camera, CheckCircle, UserCircle, Briefcase, Phone } from 'lucide-react'

export default function MyProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    company: '',
    contact_number: '',
    avatar_url: '',
    degree: '',
    graduation_year: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) setFormData(data)
    }
    setLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let currentAvatarUrl = formData.avatar_url

      // 1. Handle New Photo Upload if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
        currentAvatarUrl = data.publicUrl
      }

      // 2. Update Database Profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          job_title: formData.job_title,
          company: formData.company,
          contact_number: formData.contact_number,
          avatar_url: currentAvatarUrl
        })
        .eq('id', user.id)

      if (error) throw error
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="animate-spin text-uni-blue w-10 h-10" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Profile Header Decoration */}
        <div className="bg-uni-blue h-32 w-full relative">
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" alt="Preview" />
                ) : formData.avatar_url ? (
                  <img src={formData.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <UserCircle className="w-full h-full text-slate-300 p-2" />
                )}
              </div>
              <label className="absolute bottom-2 right-2 bg-uni-blue text-white p-2 rounded-lg shadow-xl cursor-pointer hover:scale-110 transition-all">
                <Camera size={18} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} 
                />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-16 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">{formData.full_name || 'My Profile'}</h1>
            <p className="text-slate-500 flex items-center gap-2 mt-1 text-sm font-medium">
              <CheckCircle size={16} className="text-green-500" /> 
              Verified Alumni Account
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <input 
                  className="input-field" 
                  value={formData.full_name} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    className="input-field pl-10" 
                    value={formData.contact_number} 
                    onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                  />
                </div>
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    className="input-field pl-10" 
                    placeholder="e.g. Software Engineer"
                    value={formData.job_title} 
                    onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                  />
                </div>
              </div>

              {/* Job Company */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Company</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Google"
                  value={formData.company} 
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>

              {/* Educational Info (Non-editable background) */}
              <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Education Background</p>
                <p className="text-slate-700 font-medium">
                   {formData.degree} • Class of {formData.graduation_year}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500 italic">Manage your profile visibility in the directory</p>
              
              <button 
                type="submit" 
                disabled={saving}
                className={`px-8 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg ${
                  success ? 'bg-green-600 text-white' : 'bg-uni-blue text-white hover:bg-blue-800 active:scale-95'
                }`}
              >
                {saving ? (
                  <Loader2 className="animate-spin" />
                ) : success ? (
                  <><CheckCircle size={20}/> Profile Updated</>
                ) : (
                  <><Save size={20}/> Save Changes</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}