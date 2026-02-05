{verifiedUsers.map(user => (
  <div key={user.id} className="flex items-center justify-between p-4 bg-white shadow-sm mb-2 rounded border-l-4 border-uni-blue">
    <div>
      <p className="font-bold text-uni-blue">{user.full_name}</p>
      <p className="text-sm text-gray-500">{user.degree}</p>
    </div>
    <div className="flex gap-2">
      <AlumniCard alumni={user} />
      {/* Other admin actions like 'Edit' or 'Revoke' */}
    </div>
  </div>
))}