"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { 
  BookOpen, LogOut, User, GraduationCap,
  BarChart, Menu, X, FileText, Settings, Trophy
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function StudyLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-teal-50/30">Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  const isQuizMode = pathname.includes("/quiz/") && !pathname.includes("/results/");

  const navItems = [
    { href: "/study", label: "Dashboard", icon: LayoutDashboardIcon, exact: true },
    { href: "/study/analytics", label: "Analytics", icon: BarChart },
    { href: "/study/past-papers", label: "Past Papers", icon: FileText },
    { href: "/study/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const isActive = (item) => item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar - Hidden in Quiz Mode */}
      {!isQuizMode && (
        <header className="h-16 border-b border-teal-100 bg-white sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/study" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">I</div>
                <span className="font-display font-bold text-xl tracking-tight text-teal-950">IMTIHAN</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item) ? "secondary" : "ghost"}
                      className={isActive(item) ? "bg-teal-50 text-teal-700" : "text-zinc-600"}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex flex-col items-end mr-1">
                <span className="text-sm font-medium text-teal-900">{session?.user?.name}</span>
                <span className="text-xs text-zinc-500 capitalize">{session?.user?.role}</span>
              </div>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="icon" className="rounded-full border-teal-100 text-teal-600 hover:bg-teal-50" title="Settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline" size="sm"
                className="hidden md:flex items-center gap-1.5 border-rose-100 text-rose-600 hover:bg-rose-50 text-xs"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost" size="icon"
                className="md:hidden text-teal-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Overlay */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-b border-teal-100 p-4 space-y-2 animate-in slide-in-from-top-4 duration-200">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={isActive(item) ? "secondary" : "ghost"}
                    className={`w-full justify-start ${isActive(item) ? "bg-teal-50 text-teal-700" : "text-zinc-600"}`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Link href="/dashboard/settings" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-zinc-600">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Button>
              </Link>
              <div className="pt-2 border-t border-teal-50 flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-teal-900">{session?.user?.name}</span>
                  <span className="text-xs text-zinc-500 capitalize">{session?.user?.role}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="text-rose-600 hover:bg-rose-50">
                  Sign Out
                </Button>
              </div>
            </div>
          )}
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
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
