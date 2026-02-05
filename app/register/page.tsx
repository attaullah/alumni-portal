'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', degree: '', gradYear: '',
    contact: '', jobTitle: '', company: '', careerPath: '', feedback: '',
    interested: false
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          degree: formData.degree,
          graduation_year: parseInt(formData.gradYear),
          contact_number: formData.contact,
          job_title: formData.jobTitle,
          company: formData.company,
          career_path: formData.careerPath,
          feedback: formData.feedback,
          interested_in_events: formData.interested
        }
      }
    });
    if (error) alert(error.message);
    else alert('Success! Verification pending by University Admin.');
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-10 bg-white border-l-8 border-uni-maroon shadow-2xl">
      <h2 className="text-3xl font-bold text-uni-blue mb-6">Graduate Registration</h2>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Full Name" className="p-2 border" onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
          <input type="email" placeholder="Email Address" className="p-2 border" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="text" placeholder="Degree (e.g. BSCS)" className="p-2 border" onChange={(e) => setFormData({...formData, degree: e.target.value})} required />
          <input type="number" placeholder="Graduation Year" className="p-2 border" onChange={(e) => setFormData({...formData, gradYear: e.target.value})} required />
        </div>
        
        <input type="text" placeholder="Job Title" className="w-full p-2 border" onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} />
        <input type="text" placeholder="Company" className="w-full p-2 border" onChange={(e) => setFormData({...formData, company: e.target.value})} />
        
        <textarea placeholder="Tell us about your Career Path..." className="w-full p-2 border h-24" onChange={(e) => setFormData({...formData, careerPath: e.target.value})} />
        <textarea placeholder="Feedback for the University..." className="w-full p-2 border h-20" onChange={(e) => setFormData({...formData, feedback: e.target.value})} />

        <div className="flex items-center gap-2">
          <input type="checkbox" onChange={(e) => setFormData({...formData, interested: e.target.checked})} />
          <label className="text-uni-blue font-medium">Interested in participating in alumni events?</label>
        </div>

        <button type="submit" className="w-full bg-uni-blue text-white font-bold py-3 hover:bg-uni-maroon transition-all shadow-lg">
          SUBMIT FOR VERIFICATION
        </button>
      </form>
    </div>
  );
}