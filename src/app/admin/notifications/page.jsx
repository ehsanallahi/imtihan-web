import BroadcastForm from "@/components/admin/BroadcastForm";
import { Megaphone } from "lucide-react";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
           Global Announcements <Megaphone className="w-8 h-8 text-teal-600" />
        </h1>
        <p className="text-slate-500 font-medium italic">Broadcast important updates and alerts to every student on the platform.</p>
      </div>

      <BroadcastForm />
    </div>
  );
}
