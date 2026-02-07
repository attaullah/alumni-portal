'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  Plus, 
  Search,
  ChevronRight,
  Info
} from 'lucide-react'
import Link from 'next/link'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [userRsvps, setUserRsvps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    
    // Fetch all approved events and count their RSVPs
    const { data: eventsData, error } = await supabase
      .from('events')
      .select('*, event_rsvps(count)')
      .eq('status', 'approved') // Only show approved events
      .order('event_date', { ascending: true })

    if (error) console.error("Error fetching events:", error.message)

    // Check which events the current user has already joined
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: myRsvps } = await supabase
        .from('event_rsvps')
        .select('event_id')
        .eq('user_id', user.id)
      
      setUserRsvps(myRsvps?.map(r => r.event_id) || [])
    }

    setEvents(eventsData || [])
    setLoading(false)
  }

  async function handleRSVP(eventId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("Please log in to RSVP for events.")
      return
    }

    if (userRsvps.includes(eventId)) return

    const { error } = await supabase
      .from('event_rsvps')
      .insert({ event_id: eventId, user_id: user.id })

    if (error) {
      alert("Could not process RSVP: " + error.message)
    } else {
      setUserRsvps([...userRsvps, eventId])
      // Refresh to update the attendee count locally
      fetchData()
    }
  }

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Loader2 className="animate-spin text-uni-blue w-12 h-12" />
      <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Calendar...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">University Events</h1>
            <p className="text-slate-500 mt-2 font-semibold text-lg">Reunions, workshops, and networking gatherings.</p>
          </div>
          
          <Link 
            href="/events/create" 
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Propose an Event
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12 max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search events by title or location..." 
            className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-700 font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                {/* Event Image / Header */}
                <div className="h-52 bg-slate-200 relative">
                  {event.image_url ? (
                    <img src={event.image_url} className="w-full h-full object-cover" alt={event.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
                      <Calendar size={64} strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-center leading-none">
                      {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-xl font-black text-slate-900 text-center">
                      {new Date(event.event_date).getDate()}
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-black text-slate-800 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm uppercase tracking-wide">
                      <Clock size={18} className="text-blue-500" /> 
                      {event.event_time}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm uppercase tracking-wide">
                      <MapPin size={18} className="text-blue-500" /> 
                      {event.location}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm uppercase tracking-wide">
                      <Users size={18} className="text-blue-500" /> 
                      {event.event_rsvps[0]?.count || 0} Alumni Attending
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3">
                    {event.description}
                  </p>

                  <button 
                    onClick={() => handleRSVP(event.id)}
                    disabled={userRsvps.includes(event.id)}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                      userRsvps.includes(event.id) 
                      ? 'bg-green-50 text-green-600 border border-green-100 cursor-default' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95'
                    }`}
                  >
                    {userRsvps.includes(event.id) ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle2 size={16}/> You're Going
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        RSVP Now <ChevronRight size={14} />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Calendar className="text-slate-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No events found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or propose a new reunion!</p>
          </div>
        )}

        {/* Bottom Notice */}
        <div className="mt-16 bg-blue-50 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 border border-blue-100">
          <div className="p-4 bg-white rounded-2xl text-blue-600 shadow-sm">
            <Info size={32} />
          </div>
          <div>
            <h4 className="text-lg font-black text-blue-900">Hosting a batch reunion?</h4>
            <p className="text-blue-700 font-medium">Any alumnus can propose an event. Once submitted, our admins will review and publish it to the community calendar.</p>
          </div>
          <Link href="/events/create" className="md:ml-auto font-black text-blue-600 hover:text-blue-800 uppercase text-sm tracking-widest">
            Get Started →
          </Link>
        </div>

      </div>
    </div>
  )
}