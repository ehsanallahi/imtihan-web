import AdminSidebar from "@/components/admin/AdminSidebar";
import { User, ShieldCheck } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";

export default async function AdminLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  const adminRoles = ["super_admin", "moderator", "marketer", "content_editor", "finance_manager", "support_agent", "institution_admin", "admin"];
  
  if (!adminRoles.includes(session.user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 max-w-md mb-8">
          You do not have permission to access the Admin Panel. 
          If you recently became an admin, please try signing out and signing back in to refresh your permissions.
        </p>
        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl px-8 h-12 font-bold border-slate-200 hover:bg-slate-100 text-slate-700 transition-all active:scale-95">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background w-full">
        <ImpersonationBanner />
        <div className="flex flex-1">
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
      </div>
    </SidebarProvider>
  );
}
