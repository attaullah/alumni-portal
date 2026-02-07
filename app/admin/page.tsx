'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Users, Trash2, ShieldCheck, Search, Loader2, Printer, 
  ExternalLink, GraduationCap, Download, BarChart3, TrendingUp, AlertCircle, Layers 
} from 'lucide-react'
import Link from 'next/link'

interface Profile {
  id: string
  full_name: string
  degree: string
  graduation_year: string
  role: string
  created_at: string
  avatar_url: string | null
  job_title: string
  job_company: string
  contact_number: string
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedForPrint, setSelectedForPrint] = useState<Profile[] | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [pendingJobs, setPendingJobs] = useState<any[]>([])
async function fetchPendingJobs() {
  const { data } = await supabase.from('jobs').select('*').eq('is_approved', false)
  setPendingJobs(data || [])
}
const [pendingEvents, setPendingEvents] = useState<any[]>([])

async function approveJob(id: string) {
  const { error } = await supabase.from('jobs').update({ is_approved: true }).eq('id', id)
  if (!error) {
    setPendingJobs(pendingJobs.filter(j => j.id !== id))
    // Optionally refresh the main profiles list if needed
  }
}

async function fetchPendingEvents() {
  const { data } = await supabase.from('events').select('*').eq('is_approved', false)
  setPendingEvents(data || [])
}

async function approveEvent(id: string) {
  const { error } = await supabase.from('events').update({ is_approved: true }).eq('id', id)
  if (!error) setPendingEvents(pendingEvents.filter(e => e.id !== id))
}

  useEffect(() => {
    fetchProfiles(),
    fetchPendingJobs(),
    fetchPendingEvents()
  }, [])
  // 1. Add this function inside your AdminDashboard component
const exportAttendees = async (event: any) => {
  setLoading(true);
  
  // Fetch all RSVPs for this specific event, joining with profile data
  const { data, error } = await supabase
    .from('event_rsvps')
    .select(`
      user_id,
      profiles (
        full_name,
        degree,
        graduation_year,
        contact_number
      )
    `)
    .eq('event_id', event.id);

  if (error || !data) {
    alert("Error fetching attendees");
    setLoading(false);
    return;
  }

  // Define CSV headers
  const headers = ["Full Name", "Degree", "Batch", "Contact Number"];
  
  // Map data into rows
  const rows = data.map((rsvp: any) => [
    `"${rsvp.profiles.full_name}"`,
    `"${rsvp.profiles.degree}"`,
    rsvp.profiles.graduation_year,
    rsvp.profiles.contact_number || 'N/A'
  ]);

  // Create CSV string
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  // Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Attendees_${event.title.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setLoading(false);
};

  async function fetchProfiles() {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (!error) setProfiles(data || [])
    setLoading(false)
  }
  // is_verify update
  // 1. Add state for unverified users
const [unverifiedUsers, setUnverifiedUsers] = useState<any[]>([])

// 2. Add to your existing fetch logic
async function fetchUnverified() {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_verified', false)
    .order('created_at', { ascending: false })
  setUnverifiedUsers(data || [])
}

// 3. Verification function
async function toggleVerification(userId: string, currentStatus: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_verified: !currentStatus })
    .eq('id', userId)

  if (!error) {
    // Refresh lists
    fetchUnverified()
    // Optional: Send notification to user
    await supabase.from('notifications').insert({
      user_id: userId,
      message: "Your alumni profile has been verified! You are now visible in the directory.",
      link: '/directory'
    })
  } else {
    alert("Error: " + error.message)
  }
}
  // Effect to trigger print only after DOM state has updated
  useEffect(() => {
    if (selectedForPrint && selectedForPrint.length > 0) {
      const timer = setTimeout(() => {
        window.print()
        setSelectedForPrint(null)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [selectedForPrint])

  // --- ACTIONS ---
  const handlePrintSingle = (user: Profile) => setSelectedForPrint([user])
  const handlePrintBatch = () => {
    // Prints the top 4 profiles currently in view
    const toPrint = filtered.slice(0, 4)
    if (toPrint.length > 0) setSelectedForPrint(toPrint)
  }

  const exportToCSV = () => {
    const headers = ["ID", "Full Name", "Degree", "Class Of", "Role", "Company"]
    const rows = profiles.map(p => [p.id, `"${p.full_name}"`, p.degree, p.graduation_year, p.role, `"${p.job_company}"`])
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `Alumni_Registry_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this alumni record permanently?")) return
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (!error) setProfiles(profiles.filter(p => p.id !== id))
  }
  
  // --- STATS LOGIC ---
  const degreeStats = profiles.reduce((acc: {[key: string]: number}, curr) => {
    const d = curr.degree || 'Other'; acc[d] = (acc[d] || 0) + 1; return acc
  }, {})
  const sortedStats = Object.entries(degreeStats).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCount = Math.max(...Object.values(degreeStats), 1)

  const filtered = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.degree?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Loader2 className="animate-spin text-uni-blue w-12 h-12" />
      <p className="mt-4 text-slate-400 font-bold tracking-widest text-xs uppercase">Initializing Admin View...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      
      {/* --- HIDDEN PRINT ZONE --- */}
      <div id="printable-area" className="hidden print:block">
        <div className="card-grid">
          {selectedForPrint?.map((user) => (
            <div key={user.id} className="w-[3.375in] h-[2.125in] border border-slate-300 rounded-xl overflow-hidden bg-white relative shadow-none"
        style={{ breakInside: 'avoid' }}>
              <div className="bg-[#1e3a8a] p-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="SAUS" width={30} />
                  <span className="text-[9px] font-black uppercase tracking-widest">The Shaikh Ayaz University Shikarpur</span> <GraduationCap size={50} className="text-[#d4af37]" />
                </div>
                <div className="text-[7px] opacity-70 uppercase font-bold">Alumni Card</div>
              </div>
              <div className="p-3 flex gap-3">
                <div className="w-20 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Users size={32} /></div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-[12px] font-black leading-tight text-slate-900 uppercase">{user.full_name}</h2>
                  <p className="text-[10px] text-blue-900 font-bold mt-1 leading-none">{user.degree}</p>
                  <p className="text-[9px] text-slate-500 mt-1">Class of {user.graduation_year}</p>
                  <div className="mt-4 pt-1.5 border-t border-slate-100">
                    <p className="text-[7px] font-mono text-slate-400 truncate tracking-tighter">{user.id}</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#800000]"></div>
            </div>
          ))}
        </div>
      </div>

      {/* --- DASHBOARD UI --- */}
      <div className="max-w-7xl mx-auto print:hidden">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
              <ShieldCheck className="text-uni-blue w-10 h-10" />
              Admin Portal
            </h1>
            <p className="text-slate-500 mt-1 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              System Management Console
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handlePrintBatch}
              className="flex items-center gap-2 bg-uni-blue text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg active:scale-95 text-sm"
            >
              <Layers size={18} />
              Print 4 Cards
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-slate-800 font-bold hover:shadow-lg transition-all active:scale-95 text-sm"
            >
              <Download size={18} className="text-green-600" />
              Export Directory
            </button>
          </div>
        </div>

        {/* STATS DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Alumni Network</p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{profiles.length}</h2>
            <div className="flex items-center gap-2 text-green-600 text-sm font-black mt-4">
              <TrendingUp size={16} />
              <span>Real-time Active</span>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-8">
              <BarChart3 size={20} className="text-uni-blue" />
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Enrollment by Degree</h3>
            </div>
            <div className="space-y-5">
              {sortedStats.map(([degree, count]) => (
                <div key={degree} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <span>{degree}</span>
                    <span className="text-uni-blue">{count} Members</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-uni-blue to-blue-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {pendingJobs.length > 0 && (
  <div className="mb-10 bg-amber-50 border border-amber-200 rounded-[2rem] p-8">
    <h3 className="text-amber-800 font-black flex items-center gap-2 mb-4">
      <AlertCircle size={20} /> Pending Job Approvals ({pendingJobs.length})
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pendingJobs.map(job => (
        <div key={job.id} className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100">
          <p className="font-bold text-slate-800">{job.title}</p>
          <p className="text-xs text-slate-500">{job.company}</p>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => approveJob(job.id)}
              className="flex-1 bg-green-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-green-700"
            >
              Approve
            </button>
            <button 
              onClick={() => deleteJob(job.id)} // Reuse your delete function
              className="flex-1 bg-white border border-red-200 text-red-600 text-xs py-2 rounded-lg font-bold"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{pendingEvents.length > 0 && (
  <div className="mb-10 bg-blue-50 border border-blue-200 rounded-[2rem] p-8">
    <h3 className="text-blue-800 font-black mb-4">Pending Events ({pendingEvents.length})</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pendingEvents.map(event => (
        <div key={event.id} className="bg-white p-4 rounded-2xl flex justify-between items-center">
          <div>
            <p className="font-bold">{event.title}</p>
            <p className="text-xs text-slate-500">{event.event_date} at {event.location}</p>
          </div>
          <button onClick={() => approveEvent(event.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Approve</button>
          {/* NEW: Download Attendee List Button */}
  <button 
    onClick={() => exportAttendees(event)}
    className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-all text-xs"
    title="Download Guest List"
  >
    <Download size={14} className="text-blue-600" />
    Attendees
  </button>
        </div>
      ))}
    </div>
  </div>
)}
        {/* REGISTRY TABLE */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <h3 className="font-black text-slate-800">Alumni Registry</h3>
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Filter by name or degree..."
                  className="pl-12 pr-6 py-3 border-2 border-slate-50 rounded-2xl w-full md:w-80 outline-none focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue/20 transition-all font-medium text-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                  <th className="p-6 text-center w-20">Avatar</th>
                  <th className="p-6">Member Name</th>
                  <th className="p-6">Education</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm mx-auto">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><Users size={20} /></div>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-black text-slate-800 tracking-tight">{user.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 tracking-tighter">{user.id.substring(0, 14)}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm font-bold text-slate-700">{user.degree}</div>
                      <div className="text-[10px] text-slate-400 font-black tracking-widest mt-0.5 uppercase">Batch {user.graduation_year}</div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        user.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-6 text-right">
  <div className="flex justify-end items-center gap-2">
    {/* NEW: View Profile Link */}
    <Link 
      href={`/directory/${user.id}`}
      className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
      title="View Public Profile"
    >
      <ExternalLink size={18} />
    </Link>

    {/* Print ID Card Button */}
    <button 
      onClick={() => handlePrintSingle(user)}
      className="p-2.5 text-slate-400 hover:text-uni-blue hover:bg-blue-50 rounded-xl transition-all"
      title="Print ID Card"
    >
      <Printer size={18} />
    </button>

    {/* Delete Button */}
    <button 
      onClick={() => deleteUser(user.id)}
      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
      title="Delete Account"
    >
      <Trash2 size={18} />
    </button>
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filtered.length === 0 && (
            <div className="p-24 text-center">
               <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No matching alumni found</p>
            </div>
          )}
          
        </div>

        {/* added new  */}
          <div className="mb-10 bg-white rounded-[2rem] border-2 border-[#000080]/10 overflow-hidden shadow-sm">
  <div className="p-6 bg-[#000080] text-white flex justify-between items-center">
    <h3 className="font-black flex items-center gap-2 uppercase tracking-widest text-sm">
      <ShieldCheck size={20} /> Pending User Verifications
    </h3>
    <span className="bg-[#800000] px-3 py-1 rounded-full text-[10px] font-black">
      {unverifiedUsers.length} NEW
    </span>
  </div>
  
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="text-[10px] uppercase font-black text-slate-400 bg-slate-50 border-b">
          <th className="p-4">Alumnus Name</th>
          <th className="p-4">Batch/Degree</th>
          <th className="p-4 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {unverifiedUsers.map(profile => (
          <tr key={profile.id} className="hover:bg-slate-50/50 transition-all">
            <td className="p-4">
              <p className="font-bold text-slate-800">{profile.full_name}</p>
              <p className="text-[10px] text-slate-500">{profile.email || 'No email provided'}</p>
            </td>
            <td className="p-4">
              <p className="text-xs font-bold text-slate-600 uppercase">{profile.degree}</p>
              <p className="text-[10px] text-slate-400">Class of {profile.graduation_year}</p>
            </td>
            <td className="p-4 text-right">
              <button 
                onClick={() => toggleVerification(profile.id, profile.is_verified)}
                className="bg-[#000080] text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#800000] transition-colors shadow-lg shadow-blue-100"
              >
                Verify Member
              </button>
            </td>
          </tr>
        ))}
        {unverifiedUsers.length === 0 && (
          <tr>
            <td colSpan={3} className="p-10 text-center text-slate-400 italic text-sm">
              All registered users are currently verified.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
          {/* add new ends here */}
      </div>
      
    </div>
  )
}