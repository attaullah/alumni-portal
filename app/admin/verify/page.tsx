// app/admin/verify/page.tsx
import AdminAlumniCard from '@/components/AdminAlumniCard';

// ... Inside your alumni.map() ...
<div className="flex items-center gap-4 p-4 bg-white border rounded">
  <div className="flex-1">
    <p className="font-bold">{user.full_name}</p>
    <p className="text-sm text-gray-500">{user.email}</p>
  </div>
  {user.is_verified && <AdminAlumniCard alumni={user} />}
</div>