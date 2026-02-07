export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p>You do not have administrative privileges.</p>
    </div>
  )
}