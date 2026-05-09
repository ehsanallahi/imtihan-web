"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ListOrdered, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Bell,
  Search,
  Sparkles,
  Megaphone,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const sidebarLinks = [
  { 
    title: "Dashboard", 
    href: "/admin", 
    icon: LayoutDashboard 
  },
  { 
    title: "Waitlist", 
    href: "/admin/waitlist", 
    icon: ListOrdered 
  },
  { 
    title: "Students", 
    href: "/admin/students", 
    icon: Users 
  },
  { 
    title: "Finance", 
    href: "/admin/finance", 
    icon: CreditCard 
  },
  { 
    title: "Teachers", 
    href: "/admin/teachers", 
    icon: ShieldCheck 
  },
  { 
    title: "Content", 
    href: "/admin/content", 
    icon: BookOpen 
  },
  { 
    title: "Review Queue", 
    href: "/admin/content/review", 
    icon: Sparkles 
  },
  { 
    title: "Announcements", 
    href: "/admin/notifications", 
    icon: Megaphone 
  },
  { 
    title: "Settings", 
    href: "/admin/settings", 
    icon: Settings 
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-lg shadow-teal-600/20">
          <Image 
            src="/logo.png" 
            alt="Imtihan Logo" 
            width={40} 
            height={40} 
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl tracking-tight text-teal-900">imtihan</h1>
          <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-8">
        <div className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Main Menu
        </div>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group",
                isActive 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-teal-600")} />
                <span className="font-bold text-sm">{link.title}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* User / Footer Section */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xs">
              AD
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Admin</p>
              <p className="text-[10px] text-slate-500 font-medium">admin@imtihan.app</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
