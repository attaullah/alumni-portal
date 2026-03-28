'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Menu, X, User, Trophy, Users, 
  Briefcase, HeartHandshake, LogOut, 
  Settings, CreditCard, LayoutDashboard 
} from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const pathname = usePathname()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
      }
    }
    getData()
  }, [])

  const navLinks = [
    { name: 'Wall of Fame', href: '/stories', icon: Trophy },
    { name: 'Directory', href: '/directory', icon: Users },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* LOGO SECTION */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#800000] rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-100">
              <span className="font-black text-xl">S</span>
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-black text-[#800000] uppercase leading-none tracking-tighter">The Shaikh Ayaz</p>
              <p className="text-[10px] font-black text-[#000080] uppercase leading-none tracking-tighter">University Portal</p>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  pathname === link.href 
                  ? 'bg-slate-50 text-[#800000]' 
                  : 'text-slate-400 hover:text-[#000080]'
                }`}
              >
                <link.icon size={14} />
                {link.name}
              </Link>
            ))}
          </div>

          {/* USER ACTIONS */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                {/* Admin Quick Link */}
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="p-2 text-slate-400 hover:text-[#800000] transition-colors">
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                
                {/* Profile Circle */}
                <Link href="/profile" className="flex items-center gap-2 group">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-800 uppercase leading-none">{profile?.full_name?.split(' ')[0]}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">View Profile</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden group-hover:border-[#800000] transition-all">
                    <img 
                      src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                <button onClick={handleSignOut} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-[#000080] text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#800000] transition-all shadow-xl shadow-blue-100">
                Alumni Login
              </Link>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-50 p-4 space-y-2 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-[#000080] font-black uppercase text-xs"
            >
              <link.icon size={18} /> {link.name}
            </Link>
          ))}
          {user && (
            <>
              <div className="h-px bg-slate-100 my-4" />
              <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 text-slate-600 font-bold text-xs uppercase">
                <Settings size={18} /> Account Settings
              </Link>
              <Link href="/profile/card" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 text-slate-600 font-bold text-xs uppercase">
                <CreditCard size={18} /> Digital ID Card
              </Link>
              <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-4 text-red-600 font-bold text-xs uppercase">
                <LogOut size={18} /> Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}