'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Hash,
  MessageSquare,
  Sparkles,
  Medal,
  TrendingUp,
  Star,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createTribe, joinTribe } from '@/actions/tribeActions';
import { toast } from 'sonner';

const TribeDashboard = ({ tribe, allTribes }) => {
  const [tribeName, setTribeName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!tribeName.trim()) return;
    setLoading(true);
    const res = await createTribe(tribeName);
    setLoading(false);
    if (res.success) {
      toast.success("Tribe founded! Your legend begins now.");
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
      toast.success("Joined the tribe! Glory awaits.");
      window.location.reload();
    } else {
      toast.error(res.error);
    }
  };

  if (!tribe) {
    return (
      <div className="max-w-6xl mx-auto space-y-16 pb-20">
        <div className="text-center space-y-6 pt-10">
          <div className="w-24 h-24 rounded-[2.5rem] bg-teal-500 flex items-center justify-center mx-auto shadow-2xl shadow-teal-500/20 mb-8 border-4 border-white">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 tracking-tight">
            Unite. Compete. Conquer.
          </h1>
          <p className="text-slate-500 font-medium text-xl max-w-2xl mx-auto leading-relaxed">
            Every great success is achieved by a Tribe. Join your peers, share knowledge, and dominate the national rankings together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Create Tribe */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-[3.5rem] border-2 border-slate-100 p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-10 -mt-10 group-hover:w-40 group-hover:h-40 transition-all duration-500" />
            <div className="relative z-10 space-y-8">
               <div className="space-y-2">
                  <Badge className="bg-teal-50 text-teal-600 border-teal-100 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                    LEADERSHIP
                  </Badge>
                  <h2 className="text-3xl font-display font-black text-slate-800 flex items-center gap-3">
                    Found a Tribe
                  </h2>
               </div>
               <p className="text-slate-500 font-medium leading-relaxed">
                 Start your own legacy. Invite your school or board mates to build the strongest study collective in Pakistan.
               </p>
               <div className="space-y-4">
                  <Input 
                    placeholder="Enter an Epic Tribe Name..." 
                    value={tribeName}
                    onChange={(e) => setTribeName(e.target.value)}
                    className="h-16 rounded-2xl border-2 border-slate-100 focus:border-teal-500 transition-all font-black text-lg px-6"
                  />
                  <Button 
                    onClick={handleCreate}
                    disabled={loading || !tribeName}
                    className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xl shadow-xl transition-all border-b-[6px] border-black active:border-b-0 active:translate-y-1"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "CREATE TRIBE"}
                  </Button>
               </div>
            </div>
          </motion.div>

          {/* Join Tribe */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-white rounded-[3.5rem] border-2 border-amber-100 p-10 shadow-2xl shadow-amber-200/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-10 -mt-10 group-hover:w-40 group-hover:h-40 transition-all duration-500" />
            <div className="relative z-10 space-y-8">
               <div className="space-y-2">
                  <Badge className="bg-amber-50 text-amber-600 border-amber-100 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                    LEGENDS
                  </Badge>
                  <h2 className="text-3xl font-display font-black text-slate-800 flex items-center gap-3">
                    Join the Elite
                  </h2>
               </div>
               <p className="text-slate-500 font-medium leading-relaxed">
                 The top tribes are looking for talent. Join an existing powerhouse and contribute to their national glory.
               </p>
               <div className="space-y-3">
                 {allTribes.slice(0, 4).map((t, idx) => (
                   <div key={t.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-amber-200 transition-all group/item">
                     <div className="flex items-center gap-4">
                       <span className="text-sm font-black text-amber-500 w-4">{idx + 1}</span>
                       <div>
                         <p className="font-black text-slate-800">{t.name}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           {t._count.members} Warriors • {t.xp} XP
                         </p>
                       </div>
                     </div>
                     <Button 
                       size="sm" 
                       onClick={() => handleJoin(t.id)}
                       className="rounded-xl bg-white border-2 border-slate-100 text-slate-600 font-black hover:bg-amber-50 hover:border-amber-200 shadow-sm"
                     >
                       Join
                     </Button>
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const xpForNextLevel = tribe.level * 1000;
  const progress = (tribe.xp % 1000) / 10;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Immersive Tribe Header */}
      <div className="bg-slate-900 rounded-[4rem] p-10 sm:p-16 text-white shadow-3xl relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl flex items-center justify-center border-2 border-white/10 shadow-2xl relative">
              <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              <div className="absolute -bottom-3 -right-3 bg-amber-400 text-amber-950 p-2 rounded-xl border-4 border-slate-900">
                <Crown className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight">{tribe.name}</h1>
                <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-500/30 rounded-2xl">
                   <Zap className="w-4 h-4 text-teal-400 fill-teal-400" />
                   <span className="text-sm font-black text-teal-400 uppercase tracking-widest">LVL {tribe.level}</span>
                </div>
              </div>
              <p className="text-slate-400 font-medium text-lg max-w-xl italic leading-relaxed">
                "{tribe.description || "Forging paths to success through collective effort and discipline."}"
              </p>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 min-w-[280px] space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">Tribe Progress</p>
                 <span className="text-2xl font-black">Leveling Up</span>
              </div>
              <span className="text-3xl font-black tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 shadow-[0_0_20px_rgba(45,212,191,0.4)] rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-white/30 tracking-widest uppercase">
                 <span>{tribe.xp} XP Earned</span>
                 <span>{xpForNextLevel} Next</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         <StatsBox icon={Users} label="Total Warriors" value={tribe.members.length} sub="/ 50 Capacity" />
         <StatsBox icon={Trophy} label="Global Rank" value="#4" sub="Top 1% National" color="text-amber-500" />
         <StatsBox icon={Target} label="Daily Goal" value="84%" sub="Tribe Completion" color="text-teal-500" />
         <StatsBox icon={TrendingUp} label="Weekly Growth" value="+12%" sub="Active Study" color="text-emerald-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
               <h2 className="text-2xl font-display font-black text-slate-800 uppercase tracking-widest">The Warrior Circle</h2>
            </div>
            <Button variant="ghost" className="text-teal-600 font-black text-xs hover:bg-teal-50 rounded-xl">
               Invite Member <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-white rounded-[3.5rem] border-2 border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-50 bg-slate-50/50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Warrior</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prestige</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50">
                  {tribe.members.sort((a, b) => b.student.tribeXp - a.student.tribeXp).map((member, idx) => (
                    <tr key={member.id} className="group hover:bg-teal-50/30 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${idx < 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'} group-hover:scale-110`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-xl group-hover:shadow-teal-500/20 transition-all">
                              {member.student.user.avatar ? (
                                <img src={member.student.user.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xl">
                                  {member.student.user.name[0]}
                                </div>
                              )}
                            </div>
                            {member.role === 'LEADER' && (
                              <div className="absolute -top-2 -right-2 bg-amber-400 p-1.5 rounded-xl border-2 border-white shadow-lg">
                                <Crown className="w-4 h-4 text-amber-900" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-lg">{member.student.user.name}</p>
                            <div className="flex items-center gap-2">
                               <Badge className={member.role === 'LEADER' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-500'}>
                                 {member.role}
                               </Badge>
                               <span className="w-1 h-1 bg-slate-200 rounded-full" />
                               <span className="text-[10px] font-black text-slate-300 uppercase">LVL {Math.floor(member.student.tribeXp / 500) + 1}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex gap-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                               <Medal key={i} className={`w-4 h-4 ${i < (idx < 2 ? 3 : idx < 5 ? 2 : 1) ? 'text-amber-400' : 'text-slate-100'}`} />
                            ))}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="space-y-1">
                           <div className="flex items-center justify-end gap-2">
                              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="font-black text-xl text-slate-800 tabular-nums">{member.student.tribeXp}</span>
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total XP</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Global Rankings & Activity */}
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
              <h2 className="text-2xl font-display font-black text-slate-800 uppercase tracking-widest">Top National Tribes</h2>
            </div>
            <Card className="rounded-[3rem] border-2 border-slate-100 p-8 shadow-2xl shadow-slate-200/30 space-y-4">
              {allTribes.map((t, idx) => (
                <div key={t.id} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${t.id === tribe.id ? 'bg-teal-50 border-teal-100 shadow-md ring-4 ring-teal-500/5' : 'bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20' : 'bg-white border-2 border-slate-100 text-slate-400'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{t.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LVL {t.level} • {t.xp} XP</p>
                    </div>
                  </div>
                  {idx === 0 && <Medal className="w-5 h-5 text-amber-400" />}
                </div>
              ))}
              <Button variant="ghost" className="w-full h-14 rounded-2xl text-slate-400 font-black hover:text-teal-600 group">
                FULL LEADERBOARD <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>
          </div>

          {/* Social Proof */}
          <div className="bg-indigo-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
             <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                   <Sparkles className="w-6 h-6 text-indigo-200" />
                </div>
                <h3 className="text-2xl font-black leading-tight">Your Tribe is on Fire!</h3>
                <p className="text-indigo-200 font-medium leading-relaxed">
                   The {tribe.name} has increased its collective XP by 15% this week. Keep up the momentum to reach Level {tribe.level + 1}!
                </p>
                <Button className="w-full h-14 rounded-2xl bg-white text-indigo-900 font-black hover:bg-indigo-50 shadow-xl shadow-white/10">
                   CHALLENGE A TRIBE
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatsBox({ icon: Icon, label, value, sub, color = "text-slate-900" }) {
   return (
      <Card className="rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-xl bg-white group hover:border-teal-500/30 transition-all duration-300">
         <div className={`w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-slate-400 group-hover:text-teal-500" />
         </div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
         <h4 className={`text-3xl font-black tracking-tight ${color}`}>{value}</h4>
         <p className="text-xs font-bold text-slate-400 mt-1">{sub}</p>
      </Card>
   )
}

export default TribeDashboard;
