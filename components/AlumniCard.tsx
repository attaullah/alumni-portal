import { GraduationCap } from 'lucide-react'

export default function AlumniCard({ profile }: { profile: any }) {
  if (!profile) return null;

  return (
    <div className="print-only-container hidden print:block">
      <div className="w-[3.375in] h-[2.125in] border shadow-lg rounded-xl overflow-hidden bg-white relative font-sans text-slate-900 border-slate-200 mx-auto my-4">
        {/* Header with Logo */}
        <div className="bg-uni-blue p-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-uni-gold" />
            <span className="text-xs font-bold uppercase tracking-wider">University Alumni</span>
          </div>
          <div className="text-[10px] opacity-80 italic">Official Member</div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex gap-4">
          <div className="w-20 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <GraduationCap size={32} />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-sm font-bold leading-tight">{profile.full_name}</h2>
            <p className="text-[10px] text-uni-blue font-semibold">{profile.degree}</p>
            <p className="text-[9px] text-slate-500 mb-2">Class of {profile.graduation_year}</p>
            
            <div className="mt-1 pt-1 border-t border-slate-100">
              <p className="text-[8px] text-slate-400 uppercase font-bold">Member ID</p>
              <p className="text-[9px] font-mono">{profile.id.substring(0, 12)}</p>
            </div>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-uni-gold"></div>
      </div>
    </div>
  )
}