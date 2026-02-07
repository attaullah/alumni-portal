'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Clock, Info, ArrowLeft, Loader2, CheckCircle2, XCircle, Clock4 } from 'lucide-react'
import Link from 'next/link'

export default function CreateEvent() {
  const router = useRouter()
  const [mySubmissions, setMySubmissions] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [formData, setFormData] = useState({
    title: '', description: '', event_date: '', event_time: '', location: '', image_url: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchMyEvents()
  }, [])

  async function fetchMyEvents() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })
      setMySubmissions(data || [])
    }
    setLoadingHistory(false)
  }

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  
  // 1. Get the current session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    alert('You must be logged in to propose an event.');
    return;
  }

  // 2. Prepare the payload
  const eventPayload = {
    title: formData.title,
    description: formData.description,
    event_date: formData.event_date,
    event_time: formData.event_time,
    location: formData.location,
    image_url: formData.image_url || null,
    organizer_id: user.id, // Must match the policy
    status: 'pending'      // For the status badge logic
  };

  // 3. Insert into Supabase
  const { error } = await supabase
    .from('events')
    .insert([eventPayload]);

  if (error) {
    console.error("Submission Error:", error.message);
    alert(`Error: ${error.message}`);
  } else {
    alert("Proposal submitted successfully!");
    // Reset form
    setFormData({ title: '', description: '', event_date: '', event_time: '', location: '', image_url: '' });
    // Refresh history
    fetchMyEvents();
  }
}

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border border-green-100"><CheckCircle2 size={12}/> Approved</span>
      case 'rejected':
        return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border border-red-100"><XCircle size={12}/> Rejected</span>
      default:
        return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border border-amber-100"><Clock4 size={12}/> Pending</span>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-2">
          <Link href="/events" className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-slate-800 transition-all text-sm">
            <ArrowLeft size={16} /> Back to Events
          </Link>

          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Propose a Reunion</h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Event Title</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none font-bold" onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Date</label>
                  <input required type="date" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none font-bold" onChange={e => setFormData({...formData, event_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Time</label>
                  <input required type="time" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none font-bold" onChange={e => setFormData({...formData, event_time: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-xs">
                Submit Proposal
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: STATUS TRACKER */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 sticky top-10">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
              <Clock4 size={16} className="text-blue-500"/> Your Submissions
            </h3>

            {loadingHistory ? (
              <Loader2 className="animate-spin text-slate-300 mx-auto" />
            ) : mySubmissions.length === 0 ? (
              <p className="text-slate-400 text-sm italic">No events submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {mySubmissions.map(event => (
                  <div key={event.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-800 text-xs leading-tight line-clamp-1">{event.title}</span>
                      {getStatusBadge(event.status)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}