'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Loader2, Camera, GraduationCap, Briefcase, Phone } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    degree: '',
    graduationYear: '',
    contactNumber: '',
    jobTitle: '',
    company: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.fullName }
        }
      })

      if (authError) throw authError
      const user = authData.user
      if (!user) throw new Error("Signup failed.")

      // 2. Handle Photo Upload (if selected)
      let publicUrl = null
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile)

        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
          publicUrl = data.publicUrl
        }
      }

      // 3. Update Profile with all fields
      // The trigger created the row; now we fill it with the extra info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          degree: formData.degree,
          graduation_year: formData.graduationYear,
          contact_number: formData.contactNumber,
          job_title: formData.jobTitle,
          company: formData.company,
          avatar_url: publicUrl
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      router.push('/login?message=Account created! Please sign in.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto card bg-white shadow-xl border-t-4 border-uni-blue p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Alumni Registration</h1>
          <p className="text-slate-500">Join your university's global network</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">{error}</div>}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Profile Photo - Full Width */}
          <div className="md:col-span-2 flex flex-col items-center pb-4 border-b border-slate-100">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <Camera className="text-slate-400 w-8 h-8" />
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-slate-500 mt-2">Click to upload profile photo</span>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-uni-blue flex items-center gap-2"><UserPlus size={18}/> Account Info</h3>
            <input name="fullName" placeholder="Full Name" required className="input-field" onChange={handleChange} />
            <input name="email" type="email" placeholder="Email Address" required className="input-field" onChange={handleChange} />
            <input name="password" type="password" placeholder="Password" required className="input-field" onChange={handleChange} />
            <input name="contactNumber" placeholder="Contact Number" className="input-field" onChange={handleChange} />
          </div>

          {/* Academic & Professional */}
          <div className="space-y-4">
            <h3 className="font-semibold text-uni-blue flex items-center gap-2"><GraduationCap size={18}/> Education & Career</h3>
            <input name="degree" placeholder="Degree (e.g. BSCS)" required className="input-field" onChange={handleChange} />
            <input name="graduationYear" placeholder="Graduation Year" required className="input-field" onChange={handleChange} />
            <input name="jobTitle" placeholder="Current Job Title" className="input-field" onChange={handleChange} />
            <input name="company" placeholder="Company Name" className="input-field" onChange={handleChange} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 btn-primary py-4 mt-4 flex justify-center bg-uni-blue"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Complete Registration'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600 text-sm">
          Already a member? <Link href="/login" className="text-uni-blue font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}