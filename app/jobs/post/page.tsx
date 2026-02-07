'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function PostJob() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', type: 'Full-time', description: '', apply_url: '', salary_range: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return alert('Please log in to post a job')

    const { error } = await supabase.from('jobs').insert([{ ...formData, posted_by: user.id }])

    if (error) alert(error.message)
    else router.push('/jobs')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 mb-8">Post an Opportunity</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-1">Job Title</label>
            <input required placeholder="Software Engineer" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-1">Company</label>
            <input required placeholder="Tech Corp" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, company: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-1">Location</label>
            <input required placeholder="Remote / New York" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-1">Type</label>
            <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, type: e.target.value})}>
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <label className="text-xs font-black uppercase text-slate-400 ml-1">Application Link / URL</label>
          <input required placeholder="https://company.com/careers" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, apply_url: e.target.value})} />
        </div>

        <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest">
          List Opportunity
        </button>
      </form>
    </div>
  )
}