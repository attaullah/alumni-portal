'use client'
import { useRef } from 'react';

export default function AdminAlumniCard({ alumni }: { alumni: any }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = cardRef.current?.innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow?.document.write(`
      <html>
        <head>
          <style>
            @page { size: 3.4in 2.2in; margin: 0; }
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; font-family: sans-serif; }
            .card { 
              width: 3.4in; 
              height: 2.2in; 
              border: 1px solid #eee;
              position: relative;
              overflow: hidden;
              box-sizing: border-box;
            }
            .bg-blue { background-color: #002147; }
            .bg-maroon { background-color: #800000; }
            .text-blue { color: #002147; }
            .text-maroon { color: #800000; }
          </style>
        </head>
        <body>
          <div className="card">
            ${printContent}
          </div>
          <script>
            window.onload = () => { 
              window.print(); 
              setTimeout(() => window.close(), 500); 
            }
          </script>
        </body>
      </html>
    `);
    printWindow?.document.close();
  };

  const photoUrl = alumni.avatar_url 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${alumni.avatar_url}`
    : 'https://via.placeholder.com/150?text=No+Photo';

  return (
    <>
      {/* Visual representation in Admin Dashboard (Not the actual print size) */}
      <button 
        onClick={handlePrint}
        className="bg-uni-maroon hover:bg-uni-blue text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
        Print ID Card
      </button>

      {/* Hidden DOM content optimized for the 3.4x2.2 template */}
      <div className="hidden">
        <div ref={cardRef}>
          <div className="bg-blue w-full h-8 flex items-center px-3">
             <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>ALUMNI ASSOCIATION</span>
          </div>
          <div style={{ display: 'flex', padding: '12px', gap: '15px' }}>
            <img src={photoUrl} style={{ width: '0.85in', height: '1.1in', objectFit: 'cover', borderRadius: '4px', border: '2px solid #800000' }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 className="text-blue" style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{alumni.full_name}</h2>
              <p className="text-maroon" style={{ margin: '2px 0', fontSize: '10px', fontWeight: '600' }}>{alumni.degree}</p>
              <p style={{ margin: 0, fontSize: '9px', color: '#666' }}>Class of {alumni.graduation_year}</p>
              <div style={{ marginTop: '8px', fontSize: '8px', color: '#999' }}>
                ID: {alumni.id.substring(0, 10).toUpperCase()}
              </div>
            </div>
          </div>
          <div className="bg-maroon" style={{ position: 'absolute', bottom: 0, width: '100%', height: '4px' }}></div>
        </div>
      </div>
    </>
  );
}