'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Quote } from 'lucide-react'
import StoryForm from '@/components/StoryForm'

export default function SuccessWall() {
    const [user, setUser] = useState<any>(null) // This is the 'user' variable
  const [showForm, setShowForm] = useState(false)
  const [stories, setStories] = useState<any[]>([])
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

 useEffect(() => {
  async function fetchStories() {
    // Start with a simple select to see if data comes through
    const { data, error } = await supabase
      .from('success_stories')
      .select(`
        id,
        title,
        content,
        full_name,
        category,
        status,
        profiles (
          avatar_url,
          degree,
          graduation_year
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Stories fetch error:", error.message);
    } else {
      console.log("Approved stories found:", data); // Check your console!
      setStories(data || []);
    }
  }
  fetchStories();
}, []);
  const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-[#000080] uppercase tracking-tight">Wall of Fame</h1>
          <p className="text-slate-500 font-bold mt-2">Celebrating the achievements of SAU Shikarpur Alumni</p>
        </div>

        {/* THE OPTION BUTTON */}
          <button 
            onClick={() => setShowForm(true)}
            className="bg-[#800000] text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg shadow-red-100"
          >
            + Share My Story
          </button>
        </div>

        {/* MODAL OVERLAY FOR FORM */}
        {showForm && (
          <div className="fixed inset-0 bg-[#000080]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg">
              <button 
                onClick={() => setShowForm(false)}
                className="absolute -top-12 right-0 text-white font-bold flex items-center gap-2"      >
                Close 
              </button>
              <StoryForm user={user} onComplete={() => setShowForm(false)} />
            </div>
          </div>
        )}

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {stories.map(story => (
            <div key={story.id} className="break-inside-avoid bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <Quote className="text-slate-100 group-hover:text-[#800000]/10 transition-colors mb-2" size={40} />
              <h3 className="text-lg font-black text-[#000080] leading-tight mb-3">{story.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{story.content}"</p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
      <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden">
        {/* Accessing via story.profiles instead of user_id if you used the alias */}
        <img src={story.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${story.full_name}`} alt="" />
      </div>
      <div>
        <p className="text-xs font-black text-slate-800 uppercase">{story.full_name}</p>
        <p className="text-[10px] font-bold text-[#800000] uppercase mt-1">
          {story.profiles?.degree} • Class of {story.profiles?.graduation_year}
        </p>
      </div>
    </div>
            </div>
          ))}
        </div>
      </div>
    // </div>
  )
}