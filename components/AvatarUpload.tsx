'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AvatarUpload({ uid, onUpload }: { uid: string, onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)

  async function uploadPhoto(event: any) {
    try {
      setUploading(true)
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      // 1. Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Update the profile table with the new URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', uid)

      if (updateError) throw updateError
      
      onUpload(filePath)
      alert('Photo updated successfully!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <label className="bg-uni-maroon text-white px-4 py-2 rounded cursor-pointer hover:bg-uni-blue transition-colors">
        {uploading ? 'Uploading...' : 'Upload Profile Photo'}
        <input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploading} className="hidden" />
      </label>
    </div>
  )
}