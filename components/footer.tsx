'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { MapPin, Globe, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const [isAdmin, setIsAdmin] = useState(false)
  const currentYear = new Date().getFullYear()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    }
    
    // Listen for auth changes to hide/show admin link immediately
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAdmin(false)
      } else {
        checkAdmin()
      }
    })

    checkAdmin()
    return () => subscription.unsubscribe()
  }, [])

  return (
    <footer className="bg-[#000080] text-white mt-auto border-t-8 border-[#800000]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#000080]">
                {/* <GraduationCap size={22} /> */}
                 <img src="/logo.png" alt="SAUS" width={30} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm leading-none tracking-tight">
                  THE SHAIKH AYAZ UNIVERSITY
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-300">
                  Shikarpur, Sindh
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (Conditional) */}
          <div className="flex flex-col space-y-2">
            <h4 className="text-[#800000] font-black text-xs uppercase tracking-widest mb-2 bg-white/10 w-fit px-2 py-1 rounded">
              Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link href="/directory" className="hover:text-slate-300 transition-colors">Directory</Link>
              <Link href="/jobs" className="hover:text-slate-300 transition-colors">Jobs</Link>
              <Link href="/events" className="hover:text-slate-300 transition-colors">Events</Link>
              
              {/* ONLY SHOW ADMIN IF ISADMIN IS TRUE */}
              {isAdmin && (
                <Link href="/admin" className="text-[#800000] hover:text-white transition-colors">
                  Admin Console
                </Link>
              )}
            </div>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-3 text-[11px] text-slate-300">
             <h4 className="text-[#800000] font-black text-xs uppercase tracking-widest mb-2 bg-white/10 w-fit px-2 py-1 rounded">
              Contact Us
            </h4>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#800000]" />
              <span>Old NHA Road, Shikarpur, Sindh</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-[#800000]" />
              <a href="https://saus.edu.pk" className="hover:text-white">saus.edu.pk</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
          © {currentYear} The Shaikh Ayaz University. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}