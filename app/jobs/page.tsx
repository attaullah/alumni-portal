'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Briefcase, MapPin, Clock, ExternalLink, Plus, Search, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function JobBoard() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      fetchJobs()
    }
    initialize()
  }, [])

  async function fetchJobs() {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_approved', true) // Only show approved jobs
      .order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  async function deleteJob(id: string) {
    if (!confirm("Delete this job posting?")) return
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (!error) setJobs(jobs.filter(j => j.id !== id))
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black">Job Board</h1>
          <Link href="/jobs/post" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Post Job</Link>
        </div>

        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Briefcase /></div>
                <div>
                  <h3 className="text-xl font-bold">{job.title}</h3>
                  <p className="text-slate-500">{job.company}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* OWNER CONTROL: Delete button only for the person who posted it */}
                {user?.id === job.posted_by && (
                  <button onClick={() => deleteJob(job.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={20} />
                  </button>
                )}
                <a href={job.apply_url} target="_blank" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><ExternalLink size={20} /></a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}