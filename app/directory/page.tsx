'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [filterDegree, setFilterDegree] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, [filterDegree, filterCompany]);

  async function fetchAlumni() {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('is_verified', true);

    if (filterDegree) query = query.ilike('degree', `%${filterDegree}%`);
    if (filterCompany) query = query.ilike('company', `%${filterCompany}%`);

    const { data } = await query;
    setAlumni(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 border-b-4 border-uni-maroon pb-4">
        <h1 className="text-4xl font-bold text-uni-blue">Alumni Directory</h1>
        <p className="text-uni-maroon font-semibold">Connecting our Graduates</p>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Filter by Degree/Major..." 
          className="p-3 border-2 border-uni-blue rounded-md focus:outline-uni-maroon"
          onChange={(e) => setFilterDegree(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Filter by Company..." 
          className="p-3 border-2 border-uni-blue rounded-md focus:outline-uni-maroon"
          onChange={(e) => setFilterCompany(e.target.value)}
        />
      </div>

      {/* Directory Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {alumni.map((person) => (
          <div key={person.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-uni-blue hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold text-uni-blue">{person.full_name}</h3>
            <p className="text-uni-maroon font-medium">{person.degree} | Class of {person.graduation_year}</p>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Current Role:</strong> {person.job_title}</p>
              <p><strong>Company:</strong> {person.company}</p>
            </div>
            <button className="mt-4 w-full bg-uni-blue text-white py-2 rounded hover:bg-uni-maroon transition-colors">
              View Career Path
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}