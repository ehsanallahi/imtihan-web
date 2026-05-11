import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-in fade-in duration-500">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        <div className="absolute inset-0 bg-teal-400/20 blur-xl rounded-full" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-teal-900 font-display font-bold text-lg">Preparing your dashboard</p>
        <p className="text-zinc-400 text-sm animate-pulse">Syncing your progress...</p>
      </div>
    </div>
  );
}
