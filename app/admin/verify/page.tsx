'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminAlumniCard from '@/components/AdminAlumniCard';
import { CheckCircle, Clock, Search, ShieldCheck } from 'lucide-react';

export default function VerifyAlumniPage() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, []);

  async function fetchAlumni() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('is_verified', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching alumni:', error);
    else setAlumni(data || []);
    setLoading(false);
  }

  async function toggleVerification(id: string, status: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: status })
      .eq('id', id);

    if (error) alert(error.message);
    else fetchAlumni(); // Refresh list
  }

  const filteredAlumni = alumni.filter(a => 
    a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.degree.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-uni-blue flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-uni-maroon" />
            Admin Verification Portal
          </h1>
          <p className="text-gray-600">Approve new registrations and issue Alumni ID Cards</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by name or degree..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uni-blue outline-none w-full md:w-64"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs uppercase font-bold text-gray-600">Alumni Details</th>
              <th className="p-4 text-xs uppercase font-bold text-gray-600">Status</th>
              <th className="p-4 text-xs uppercase font-bold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={3} className="p-10 text-center text-gray-400">Loading alumni records...</td></tr>
            ) : filteredAlumni.length === 0 ? (
              <tr><td colSpan={3} className="p-10 text-center text-gray-400">No records found.</td></tr>
            ) : filteredAlumni.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-uni-blue text-white flex items-center justify-center font-bold">
                      {person.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-uni-blue">{person.full_name}</div>
                      <div className="text-sm text-gray-500">{person.degree} • Class of {person.graduation_year}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {person.is_verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    {!person.is_verified ? (
                      <button 
                        onClick={() => toggleVerification(person.id, true)}
                        className="bg-uni-blue hover:bg-uni-maroon text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors"
                      >
                        Approve
                      </button>
                    ) : (
                      <>
                        <AdminAlumniCard alumni={person} />
                        <button 
                          onClick={() => toggleVerification(person.id, false)}
                          className="text-gray-400 hover:text-red-600 px-2 py-1.5 text-xs transition-colors"
                        >
                          Revoke
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}