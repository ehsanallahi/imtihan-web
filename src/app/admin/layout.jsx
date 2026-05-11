import AdminSidebar from "@/components/admin/AdminSidebar";
import { User } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  const adminRoles = ["super_admin", "moderator", "marketer", "content_editor", "finance_manager", "support_agent", "institution_admin", "admin"];
  if (!adminRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-teal-50 flex items-center justify-between px-6 bg-white/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-teal-50" />
              <div className="h-4 w-[1px] bg-teal-100 hidden sm:block" />
              <h2 className="font-display font-medium text-teal-900 hidden sm:block">
                Welcome back, {session?.user?.name || "Admin"}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link href="/admin/settings">
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
