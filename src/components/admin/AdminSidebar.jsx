"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ListOrdered, 
  Settings, 
  LogOut,
  ShieldCheck,
  Sparkles,
  Megaphone,
  CreditCard,
  History
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";

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
  { 
    title: "Audit Logs", 
    href: "/admin/logs", 
    icon: History 
  },
  { 
    title: "AI Monitor", 
    href: "/admin/ai", 
    icon: Sparkles 
  },
  { 
    title: "Staff", 
    href: "/admin/staff", 
    icon: ShieldCheck 
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <Sidebar className="border-r border-teal-50">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
            I
          </div>
          <span className="font-display font-bold text-xl tracking-tight">IMTIHAN</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-2">
        <SidebarMenu>
          {sidebarLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <SidebarMenuItem key={link.title}>
                <SidebarMenuButton asChild tooltip={link.title}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${
                      active
                        ? "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                        : "text-muted-foreground hover:bg-teal-50 hover:text-teal-700"
                    }`}
                  >
                    <link.icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-white" : ""}`} />
                    <span>{link.title}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
        
        <div className="mt-auto pt-4 px-2 space-y-1">
          <button 
            onClick={() => signOut()} 
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-crimson-600 hover:bg-crimson-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
