'use client'

import { useRef, useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Download, 
  Loader2, 
  GraduationCap, 
  User, 
  ShieldCheck, 
  HeartHandshake,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function AlumniCardPage() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  const downloadCard = async () => {
    if (!cardRef.current || !profile) return
    setIsDownloading(true)

    try {
      // DYNAMIC IMPORT: Fixes "window is not defined"
      const { domToPng } = await import('modern-screenshot')
      
      // Ensure fonts are loaded before capture
      await document.fonts.ready

      const dataUrl = await domToPng(cardRef.current, {
        quality: 1,
        scale: 4, // High resolution for printing
        backgroundColor: '#ffffff',
      })
      
      const link = document.createElement('a')
      link.download = `SAU-Alumni-${profile.full_name.replace(/\s+/g, '_')}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Capture Error:", err)
      alert("Failed to generate image. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-[#800000]" size={40} />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-md mb-8 flex justify-between items-center">
        <Link href="/profile" className="flex items-center gap-2 text-slate-500 hover:text-[#000080] font-bold text-sm transition-colors">
          <ArrowLeft size={16} /> Back to Profile
        </Link>
        <h1 className="text-[#000080] font-black uppercase text-xs tracking-widest">Digital Alumni ID</h1>
      </div>

      {/* THE CARD DESIGN */}
      <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-slate-300 mb-10">
        <div 
          ref={cardRef} 
          id="id-card"
          style={{ 
            width: '400px', 
            height: '250px', 
            backgroundColor: '#ffffff',
            borderTop: '12px solid #800000', // SAU Maroon
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '1.5rem'
          }}
        >
          <div className="p-6 h-full flex flex-col justify-between relative z-10">
            {/* Top Section */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div style={{ backgroundColor: '#000080' }} className="w-10 h-10 rounded-full flex items-center justify-center text-white">
                  <GraduationCap size={22} />
                </div>
                <div className="flex flex-col">
                  <span style={{ color: '#800000' }} className="text-[10px] font-black uppercase leading-none">The Shaikh Ayaz</span>
                  <span style={{ color: '#000080' }} className="text-[10px] font-black uppercase leading-none">University</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 items-end">
                {profile?.is_verified && (
                  <div className="flex items-center gap-1 border border-green-200 bg-green-50 px-2 py-1 rounded-full">
                    <ShieldCheck size={10} className="text-green-600" />
                    <span className="text-[7px] font-black text-green-600 uppercase">Verified</span>
                  </div>
                )}
                {profile?.is_mentor && (
                  <div className="flex items-center gap-1 border border-blue-200 bg-blue-50 px-2 py-1 rounded-full">
                    <HeartHandshake size={10} className="text-blue-600" />
                    <span className="text-[7px] font-black text-blue-600 uppercase">Mentor</span>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Content */}
            <div className="flex gap-5 items-center">
              <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-slate-100 overflow-hidden flex items-center justify-center shadow-inner">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    crossOrigin="anonymous" 
                    className="w-full h-full object-cover" 
                    alt="User"
                  />
                ) : (
                  <User size={40} className="text-slate-200" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-slate-800 uppercase leading-tight tracking-tighter">
                  {profile?.full_name}
                </h2>
                <p style={{ color: '#800000' }} className="text-[11px] font-bold uppercase tracking-[0.15em] mt-1">
                  {profile?.degree}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 italic">
                  Batch of {profile?.graduation_year}
                </p>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
              <div>
                <p className="text-[7px] font-black text-slate-300 uppercase">Membership ID</p>
                <p className="text-xs font-mono font-bold text-slate-600 uppercase">
                  SAU-{profile?.id?.slice(0,8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-[#000080] uppercase">Shikarpur, Sindh</p>
              </div>
            </div>
          </div>
          
          {/* Subtle Background Decoration */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full z-0 opacity-50" />
        </div>
      </div>

      {/* ACTION BUTTON */}
      <button 
        onClick={downloadCard}
        disabled={isDownloading}
        className="group relative bg-[#000080] hover:bg-[#800000] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl hover:shadow-red-200 disabled:opacity-70"
      >
        {isDownloading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
        )}
        {isDownloading ? 'Generating Image...' : 'Download Alumni Card'}
      </button>

      <p className="mt-6 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
        Official University Alumni Network
      </p>
    </div>
  )
}