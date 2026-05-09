import { getAdminUsers } from "@/actions/adminActions";
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Users, 
  Lock,
  Globe,
  Save,
  Mail,
  Zap
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const { data: admins, error } = await getAdminUsers();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 font-medium italic">Configure global parameters and manage administrative access.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: General & Security */}
        <div className="lg:col-span-2 space-y-8">
           {/* Platform Configuration */}
           <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                 <Globe className="w-5 h-5 text-teal-600" />
                 <h2 className="text-xl font-black text-slate-900">General Configuration</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Platform Name</label>
                    <input type="text" defaultValue="Imtihan" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Support Email</label>
                    <input type="email" defaultValue="support@imtihan.app" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900" />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Maintenance Mode</label>
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <div>
                          <p className="text-sm font-bold text-slate-900">Enable Maintenance</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">Redirects all users except admins to a maintenance page.</p>
                       </div>
                       <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                 <button className="bg-teal-600 text-white px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-teal-700 transition-all">
                    <Save className="w-4 h-4" /> Save Changes
                 </button>
              </div>
           </div>

           {/* Security Settings */}
           <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                 <Shield className="w-5 h-5 text-teal-600" />
                 <h2 className="text-xl font-black text-slate-900">Security & Authentication</h2>
              </div>
              
              <div className="space-y-4">
                 {[
                   { label: "Two-Factor Authentication", desc: "Require 2FA for all admin accounts.", active: true },
                   { label: "Session Timeout", desc: "Automatically logout admins after 30 minutes of inactivity.", active: false },
                   { label: "IP Whitelisting", desc: "Restrict dashboard access to specific IP ranges.", active: false }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                         <p className="text-sm font-bold text-slate-900">{item.label}</p>
                         <p className="text-[10px] text-slate-400 font-medium italic">{item.desc}</p>
                      </div>
                      <div className={`w-12 h-6 ${item.active ? 'bg-teal-500' : 'bg-slate-200'} rounded-full relative cursor-pointer transition-colors`}>
                         <div className={`absolute ${item.active ? 'right-1' : 'left-1'} top-1 w-4 h-4 bg-white rounded-full shadow-sm`} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: Admin Team */}
        <div className="space-y-8">
           <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6 h-full">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                 <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-teal-600" />
                    <h2 className="text-xl font-black text-slate-900">Admin Team</h2>
                 </div>
                 <button className="text-teal-600 p-1.5 hover:bg-teal-50 rounded-lg transition-all">
                    <Plus size={20} className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-4">
                 {admins?.map((admin) => (
                   <div key={admin.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all group">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                            {admin.name?.[0] || "A"}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">{admin.name}</p>
                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-tighter">{admin.role.replace('_', ' ')}</p>
                         </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-slate-900 transition-all">
                         <Lock className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
              </div>

              <div className="pt-6 border-t border-slate-100">
                 <div className="bg-teal-50 p-4 rounded-2xl flex items-center gap-4">
                    <Zap className="w-5 h-5 text-teal-600 fill-teal-600" />
                    <p className="text-[10px] font-bold text-teal-800 leading-tight">
                       You have {admins?.length} active administrators managing the platform.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const Plus = ({ size, ...props }) => (
  <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
