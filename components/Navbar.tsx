'use client'

import { useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Briefcase, Calendar, Users, ShieldCheck, LogOut, Menu, X, 
  GraduationCap, User, ChevronDown, Settings 
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false) // Mobile menu
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false) // Profile dropdown
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      handleUserChange(session?.user ?? null)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserChange(session?.user ?? null)
      if (_event === 'SIGNED_OUT') router.push('/login')
    })

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    initializeAuth()
    return () => {
      subscription.unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function handleUserChange(currentUser: any) {
    setUser(currentUser)
    if (currentUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()
      setIsAdmin(profile?.role === 'admin')
    }
  }

  const navLinks = user ? [
    { name: 'Directory', href: '/directory', icon: Users },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Events', href: '/events', icon: Calendar },
  ] : []

  return (
    <nav className="bg-white border-b-4 border-[#800000] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#000080] rounded-full flex items-center justify-center text-white">
                {/* <GraduationCap size={24} /> */}
                 <img src="/logo.png" alt="SAUS" width={30} />
              </div>
              <div className="hidden lg:flex flex-col leading-tight">
                <span className="text-[#800000] font-black text-base uppercase">The Shaikh Ayaz University</span>
                <span className="text-[#000080] font-bold text-[10px] tracking-[0.2em] uppercase">Shikarpur- Alumni Portal</span>
              </div>
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={`flex items-center px-4 py-2 text-xs font-black uppercase transition-all rounded-xl ${pathname === link.href ? 'bg-[#000080] text-white' : 'text-[#000080] hover:bg-slate-50'}`}>
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="relative ml-4" ref={dropdownRef}>
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 pl-4 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-full hover:border-[#800000] transition-all"
                >
                  <div className="w-7 h-7 bg-[#800000] rounded-full flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{user.email}</p>
                    </div>
                    
                    <Link href={`/directory/${user.id}`} onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#000080]">
                      <User size={18} /> My Profile
                    </Link>

                    {isAdmin && (
                      <Link href="/admin" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#800000] hover:bg-red-50">
                        <ShieldCheck size={18} /> Admin Console
                      </Link>
                    )}

                    <button 
                      onClick={() => { supabase.auth.signOut(); setIsUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50 mt-1"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !pathname.includes('/login') && (
                <Link href="/login" className="bg-[#000080] text-white px-6 py-2 rounded-xl font-black uppercase text-xs tracking-widest">Login</Link>
              )
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#000080]">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}