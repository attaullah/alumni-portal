'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Trophy, Send, X } from 'lucide-react'

export default function StoryForm({ user, onComplete }: { user: any, onComplete: () => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const { error } = await supabase.from('success_stories').insert({
      user_id: user.id,
      full_name: user.user_metadata?.full_name || 'Anonymous Alumnus',
      title: formData.get('title'),
      category: formData.get('category'),
      content: formData.get('content'),
    })

    if (!error) {
      alert("Milestone shared! It will appear on the wall after admin approval.")
      onComplete()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Trophy size={20} /></div>
        <h3 className="font-black text-[#000080] uppercase text-sm">Share your Achievement</h3>
      </div>
      
      <input name="title" placeholder="Title (e.g. Joined Google as SE)" required className="w-full p-3 rounded-xl border border-slate-100 text-sm focus:ring-2 focus:ring-[#800000] outline-none" />
      
      <select name="category" className="w-full p-3 rounded-xl border border-slate-100 text-sm outline-none">
        <option value="Promotion">Promotion</option>
        <option value="Startup">Startup / Business</option>
        <option value="Award">Award / Recognition</option>
        <option value="Higher Education">Higher Education</option>
      </select>

      <textarea name="content" placeholder="Tell us more about this milestone..." rows={4} required className="w-full p-3 rounded-xl border border-slate-100 text-sm focus:ring-2 focus:ring-[#800000] outline-none" />

      <button disabled={loading} className="w-full bg-[#800000] text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#000080] transition-all flex items-center justify-center gap-2">
        {loading ? 'Processing...' : <><Send size={14} /> Submit for Approval</>}
      </button>
    </form>
  )
}