import { getInstitutions } from "@/actions/adminActions";
import { School, MapPin, Phone, Users, Search, MoreVertical } from "lucide-react";
import InstitutionForm from "@/components/admin/InstitutionForm";
import InstitutionDeleteButton from "@/components/admin/InstitutionDeleteButton";

export const dynamic = 'force-dynamic';

export default async function AdminInstitutionsPage() {
  const { data: institutions, error } = await getInstitutions();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading institutions: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            Institution Management <School className="w-8 h-8 text-teal-600" />
          </h1>
          <p className="text-slate-500 font-medium italic">Manage partner schools, colleges, and educational organizations.</p>
        </div>
        <InstitutionForm />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions?.map((inst) => (
          <div key={inst.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-teal-50 rounded-3xl flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                {inst.logo ? <img src={inst.logo} alt="" className="w-full h-full object-cover" /> : <School className="w-8 h-8" />}
              </div>
              <InstitutionDeleteButton id={inst.id} name={inst.name} />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight">{inst.name}</h3>
                <div className="flex items-center gap-2 mt-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-tight">{inst.city || "No Address Provided"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Teachers</span>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span className="font-black text-slate-900">{inst._count.teachers}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</span>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700 text-xs truncate max-w-[80px]">{inst.contact || "N/A"}</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 bg-slate-50 text-slate-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-50 hover:text-teal-600 transition-all border border-transparent hover:border-teal-100">
                View Full Roster
              </button>
            </div>
          </div>
        ))}
        
        {institutions?.length === 0 && (
          <div className="md:col-span-3 py-24 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
             <School className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <p className="font-black text-slate-900">No institutions registered yet</p>
             <p className="text-sm text-slate-400 font-medium">Add your first partner institution to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
