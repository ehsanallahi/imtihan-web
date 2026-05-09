export default function AdminPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
        <span className="text-4xl">🛠️</span>
      </div>
      <div>
        <h1 className="text-2xl font-black text-slate-900">Feature Coming Soon</h1>
        <p className="text-slate-500 font-medium">We're currently building this management module.</p>
      </div>
    </div>
  );
}
