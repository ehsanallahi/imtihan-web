"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { 
  BookOpen, 
  LogOut, 
  User,
  GraduationCap,
  ChevronLeft,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudyLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-teal-50/30">Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  const isQuizMode = pathname.includes("/quiz/") && !pathname.includes("/results/");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar - Hidden in Quiz Mode to reduce distractions */}
      {!isQuizMode && (
        <header className="h-16 border-b border-teal-100 bg-white sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/study" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
                  I
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-teal-950">IMTIHAN</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link href="/study">
                  <Button variant={pathname === "/study" ? "secondary" : "ghost"} className={pathname === "/study" ? "bg-teal-50 text-teal-700" : "text-zinc-600"}>
                    <LayoutDashboardIcon className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/study/analytics">
                  <Button variant={pathname.startsWith("/study/analytics") ? "secondary" : "ghost"} className={pathname.startsWith("/study/analytics") ? "bg-teal-50 text-teal-700" : "text-zinc-600"}>
                    <BarChart className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-zinc-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Exit Study Mode
                  </Button>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-teal-900">{session?.user?.name}</span>
                <span className="text-xs text-zinc-500 capitalize">{session?.user?.role}</span>
              </div>
              <Button variant="outline" size="icon" className="rounded-full border-teal-100 text-teal-600">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}

function LayoutDashboardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
