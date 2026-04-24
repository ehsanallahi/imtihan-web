"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut, 
  User,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Subjects", href: "/dashboard/subjects" },
  { 
    icon: FileText, 
    label: "Content Management", 
    href: "/dashboard/content",
    roles: ["super_admin", "content_editor", "moderator"] 
  },
  { icon: GraduationCap, label: "Exams", href: "/dashboard/exams" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = session?.user?.role;

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item =>
    !item.roles || item.roles.includes(userRole)
  );

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
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
              {filteredMenuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${
                          active
                            ? "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                            : "text-muted-foreground hover:bg-teal-50 hover:text-teal-700"
                        }`}
                      >
                        <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-white" : ""}`} />
                        <span>{item.label}</span>
                        {active && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            
            <div className="mt-auto pt-4 border-t border-teal-50/50">
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-600 to-teal-400 text-white shadow-lg shadow-teal-600/20">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Pro Status</span>
                </div>
                <p className="text-sm font-medium">Free Plan</p>
                <Link href="/pricing">
                  <Button size="sm" variant="secondary" className="w-full mt-3 h-8 bg-white/20 hover:bg-white/30 border-none text-white text-xs">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-4 px-2 space-y-1">
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

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-teal-50 flex items-center justify-between px-6 bg-white/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-teal-50" />
              <div className="h-4 w-[1px] bg-teal-100 hidden sm:block" />
              <h2 className="font-display font-medium text-teal-900 hidden sm:block">
                Welcome back, {session?.user?.name || "Student"}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-teal-50" title="Settings">
                  <User className="h-5 w-5 text-teal-600" />
                </Button>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
