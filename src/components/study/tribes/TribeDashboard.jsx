'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Trophy, 
  Plus, 
  Search, 
  Zap, 
  Crown,
  ChevronRight,
  Loader2,
  AlertCircle,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createTribe, joinTribe } from '@/actions/tribeActions';
import { toast } from 'sonner';

const TribeDashboard = ({ tribe, allTribes }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [tribeName, setTribeName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!tribeName.trim()) return;
    setLoading(true);
    const res = await createTribe(tribeName);
    setLoading(false);
    if (res.success) {
      toast.success("Tribe created!");
      window.location.reload();
    } else {
      toast.error(res.error);
    }
  };

  const handleJoin = async (id) => {
    setLoading(true);
    const res = await joinTribe(id);
    setLoading(false);
    if (res.success) {
      toast.success("Joined tribe!");
      window.location.reload();
    } else {
      toast.error(res.error);
    }
  };

  if (!tribe) {
    return (
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-teal-50 flex items-center justify-center mx-auto border-b-4 border-teal-100 mb-6">
            <Shield className="w-10 h-10 text-teal-600" />
          </div>
          <h1 className="text-4xl font-display font-black text-slate-800">Unite and Conquer</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Join a tribe to compete together, share progress, and climb the national leaderboard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Tribe */}
          <div className="bg-white rounded-[2.5rem] border-2 border-[#E5E5E5] p-8 shadow-[0_4px_0_0_#E5E5E5]">
            <h2 className="text-2xl font-display font-black text-slate-800 mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-teal-500" />
              Found a Tribe
            </h2>
            <div className="space-y-4">
              <Input 
                placeholder="Unique Tribe Name" 
                value={tribeName}
                onChange={(e) => setTribeName(e.target.value)}
                className="h-14 rounded-2xl border-2 border-slate-100 focus:border-teal-500 transition-all font-bold"
              />
              <Button 
                onClick={handleCreate}
                disabled={loading || !tribeName}
                className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-lg shadow-lg shadow-teal-600/20"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Create Tribe"}
              </Button>
            </div>
          </div>

          {/* Top Tribes */}
          <div className="bg-white rounded-[2.5rem] border-2 border-[#E5E5E5] p-8 shadow-[0_4px_0_0_#E5E5E5]">
            <h2 className="text-2xl font-display font-black text-slate-800 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Join a Tribe
            </h2>
            <div className="space-y-3">
              {allTribes.map((t, idx) => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-teal-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-400 w-4">{idx + 1}</span>
                    <div>
                      <p className="font-bold text-slate-800">{t.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {t._count.members} Members • {t.xp} XP
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleJoin(t.id)}
                    className="rounded-xl text-teal-600 font-bold hover:bg-teal-100"
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Level Progress
  const xpForNextLevel = tribe.level * 1000;
  const progress = (tribe.xp % 1000) / 10;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Tribe Header */}
      <div className="bg-gradient-to-br from-teal-900 to-teal-800 rounded-[3rem] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-[2rem] bg-white/10 backdrop-blur-md flex items-center justify-center border-2 border-white/20 shadow-2xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight">{tribe.name}</h1>
                <div className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                  LVL {tribe.level}
                </div>
              </div>
              <p className="text-teal-100/70 font-medium">{tribe.description || "No description provided."}</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 min-w-[200px]">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-teal-100/50">Next Level</span>
              <span className="text-xl font-black">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
              />
            </div>
            <p className="text-[10px] font-bold text-teal-100/50 mt-2 text-right">
              {tribe.xp} / {xpForNextLevel} TOTAL XP
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-display font-black text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-teal-500" />
              Warriors
            </h2>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
              {tribe.members.length} / 50
            </span>
          </div>

          <div className="bg-white rounded-[2.5rem] border-2 border-[#E5E5E5] overflow-hidden shadow-[0_4px_0_0_#E5E5E5]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[#F0F0F0] bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Rank</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Warrior</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">XP Contrib.</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#F0F0F0]">
                {tribe.members.sort((a, b) => b.student.tribeXp - a.student.tribeXp).map((member, idx) => (
                  <tr key={member.id} className="group hover:bg-teal-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full font-black text-sm bg-slate-100 text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                            {member.student.user.avatar ? (
                              <img src={member.student.user.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">
                                {member.student.user.name[0]}
                              </div>
                            )}
                          </div>
                          {member.role === 'LEADER' && (
                            <div className="absolute -top-2 -right-2 bg-amber-400 p-1 rounded-full border-2 border-white shadow-sm">
                              <Crown className="w-3 h-3 text-amber-900" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{member.student.user.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-black text-slate-800">{member.student.tribeXp}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tribe Rankings */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-black text-slate-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Global Tribes
          </h2>
          <div className="bg-white rounded-[2.5rem] border-2 border-[#E5E5E5] p-6 shadow-[0_4px_0_0_#E5E5E5] space-y-3">
            {allTribes.map((t, idx) => (
              <div key={t.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${t.id === tribe.id ? 'bg-teal-50 border-teal-100 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{t.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">LVL {t.level} • {t.xp} XP</p>
                  </div>
                </div>
                {idx === 0 && <Crown className="w-4 h-4 text-amber-400" />}
              </div>
            ))}
            <Button variant="ghost" className="w-full mt-2 rounded-xl text-slate-400 font-bold hover:text-teal-600">
              View All Rankings <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TribeDashboard;
