'use client'

import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Download, Printer, Loader2, GraduationCap, User, ShieldCheck } from 'lucide-react'
import AlumniQR from '@/components/AlumniQR'
import { domToPng } from 'modern-screenshot'

export default function AlumniCardPage() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [profile, setProfile] = useState<any>(null) // Assume data is fetched here

  const downloadCard = async () => {
  // SAFETY: Don't allow download if profile data isn't loaded yet
  if (!cardRef.current || !profile) {
    alert("Profile data is still loading. Please wait a second.");
    return;
  }
  
  setIsDownloading(true);

  try {
    // 1. Wait for a micro-task to ensure React has finished painting the data
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. Use domToPng (Modern Screenshot) with specific settings
    const dataUrl = await domToPng(cardRef.current, {
      quality: 1,
      scale: 4,
      // This ensures that the styles and data are captured from the actual DOM
      features: {
        copyStyles: true,
      },
      // Force the library to wait for the profile image to load
      filter: (node) => {
        if (node.tagName === 'IMG') return true;
        return true;
      }
    });
    
    const link = document.createElement('a');
    link.download = `SAU-${profile.full_name.replace(/\s+/g, '_')}-Card.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Capture Error:", err);
  } finally {
    setIsDownloading(false);
  }
};
  

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 flex flex-col items-center">
      
      {/* FORCE PRINT COLORS CSS */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          #id-card { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
        }
      `}</style>

      {/* THE CARD WRAPPER */}
      <div className="bg-white p-4 rounded-3xl shadow-sm mb-8 no-print">
        <div 
          ref={cardRef} 
          id="id-card"
          // We use standard hex codes in 'style' to bypass PostCSS variable issues during capture
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
          <div className="p-6 h-full flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div   style={{ backgroundColor: '#000080' }} 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-navy-fix">
                    <GraduationCap size={22} />
                </div>
                <div className="flex flex-col">
                  <span style={{ color: '#800000' }} className="text-[10px] font-black uppercase leading-none">The Shaikh Ayaz</span>
                  <span style={{ color: '#000080' }} className="text-[10px] font-black uppercase leading-none">University</span>
                </div>
              </div>
              
              {profile?.is_verified && (
                <div className="flex items-center gap-1 border border-green-200 bg-green-50 px-2 py-1 rounded-full">
                  <ShieldCheck size={12} className="text-green-600" />
                  <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter">Verified</span>
                </div>
              )}
            </div>

            {/* Middle Content */}
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
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
                <h2 className="text-xl font-black text-slate-800 uppercase leading-tight">{profile?.full_name}</h2>
                <p style={{ color: '#800000' }} className="text-[10px] font-bold uppercase tracking-[0.2em]">{profile?.degree}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Batch of {profile?.graduation_year}</p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
              <div>
                <p className="text-[7px] font-black text-slate-300 uppercase">Registration ID</p>
                <p className="text-xs font-mono font-bold text-slate-600 uppercase italic">SAU-{profile?.id?.slice(0,8)}</p>
              </div>
              <AlumniQR userId={profile?.id} />
            </div>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-4 no-print">
        <button 
          onClick={downloadCard}
          disabled={isDownloading}
          className="bg-[#000080] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:bg-[#800000] transition-colors"
        >
          {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
          Download Photo
        </button>
        <button 
          onClick={() => window.print()}
          className="border-2 border-[#000080] text-[#000080] px-8 py-3 rounded-2xl font-black uppercase text-xs hover:bg-slate-50"
        >
          <Printer size={16} />
        </button>
      </div>
    </div>
  )
}