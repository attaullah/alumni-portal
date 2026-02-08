import { QRCodeSVG } from 'qrcode.react'

export default function AlumniQR({ userId }: { userId: string }) {
  // Use your actual domain here
  const verificationUrl = `${window.location.origin}/verify/${userId}`

  return (
    <div className="p-1 bg-white rounded-lg border border-slate-200">
      <QRCodeSVG 
        value={verificationUrl} 
        size={64}
        level={"H"} // High error correction
        includeMargin={false}
        fgColor="#000080" // Navy Blue
      />
    </div>
  )
}