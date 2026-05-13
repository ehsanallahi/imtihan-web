'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { 
  Copy, 
  CheckCircle2, 
  Share2, 
  Trophy, 
  Gift, 
  Star, 
  ArrowRight,
  Zap,
  Medal,
  Bell,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Users
} from "lucide-react"
import { getReferralStats, updateReferralCode, getTopReferrers } from "@/actions/referralActions"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function ReferralWidget() {
  const [stats, setStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [editingCode, setEditingCode] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      const [s, l] = await Promise.all([getReferralStats(), getTopReferrers()])
      if (s) {
        setStats(s)
        setNewCode(s.referralCode)
      }
      setLeaderboard(l)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-[2.5rem] animate-pulse" />
      </div>
    )
  }

  if (!stats) return null

  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/auth/signup?ref=${stats.referralCode}` : ""
  
  const totalCompleted = stats.totalCompleted || 0
  const nextMilestone = totalCompleted < 5 ? 5 : 10
  const progressPercent = (totalCompleted / nextMilestone) * 100

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success("Referral link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveCode = async () => {
    setError("")
    const res = await updateReferralCode(newCode)
    if (res.success) {
      setStats({...stats, referralCode: newCode})
      setEditingCode(false)
      toast.success("Referral code updated!")
    } else {
      setError(res.error)
    }
  }

  const shareText = encodeURIComponent("🚀 Join Imtihan and get 50 FREE AI Credits! Use my link to start your journey to success:")
  const whatsappUrl = `https://wa.me/?text=${shareText} ${referralLink}`

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-0">
      {/* Premium Referral Hero */}
      <Card className="rounded-[3rem] border-2 border-teal-100 shadow-2xl overflow-hidden bg-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        
        <CardContent className="p-0">
          <div className="bg-teal-600 p-8 sm:p-14 text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-700 opacity-90" />
             <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
                         <Gift className="w-8 h-8" />
                      </div>
                      <Badge className="bg-white/20 hover:bg-white/30 text-teal-50 border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                         REWARDS PROGRAM
                      </Badge>
                   </div>
                   <h2 className="text-4xl sm:text-6xl font-display font-black tracking-tight leading-[1.1]">
                     Earn While <br className="hidden sm:block" /> They Learn
                   </h2>
                   <p className="text-teal-50/70 font-medium text-lg sm:text-xl max-w-xl leading-relaxed">
                     Invite your friends to Imtihan. They get 50 credits, you unlock premium perks. Win-win.
                   </p>
                </div>
                
                <div className="flex-shrink-0">
                   <div className="bg-white/10 p-10 rounded-[3.5rem] border-2 border-white/10 backdrop-blur-3xl text-center shadow-2xl">
                      <p className="text-[10px] font-black text-teal-200 uppercase tracking-[0.2em] mb-4">Successful Referrals</p>
                      <div className="relative inline-block">
                         <p className="text-8xl font-black text-white tabular-nums tracking-tighter">{totalCompleted}</p>
                         <Sparkles className="absolute -top-4 -right-8 w-8 h-8 text-amber-300 animate-pulse" />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="p-8 sm:p-14 space-y-16">
            {/* Milestones */}
            <div className="space-y-10 max-w-4xl">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-2">
                  <div className="space-y-2">
                     <h3 className="font-black text-slate-900 text-2xl tracking-tight">Your Road to Pro</h3>
                     <p className="text-sm font-bold text-slate-400">Next reward: <span className="text-teal-600 font-black uppercase tracking-widest ml-1">{nextMilestone === 5 ? "100 AI Credits" : "1 Month Premium"}</span></p>
                  </div>
                  <Badge variant="outline" className="border-teal-100 bg-teal-50 text-teal-600 font-black px-6 py-2 rounded-2xl uppercase tracking-tighter text-sm shadow-sm">
                     {totalCompleted} / {nextMilestone} COMPLETED
                  </Badge>
               </div>
               
               <div className="relative pt-16 px-4">
                   <Progress value={progressPercent} className="h-4 rounded-full bg-slate-50 border border-slate-100 shadow-inner overflow-hidden" />
                   
                   {/* Milestone Markers */}
                   <div className="absolute top-0 left-0 w-full px-4 flex justify-between pointer-events-none">
                      <div className="w-0 relative">
                         <MilestoneDot active={totalCompleted >= 5} label="5 Refs" reward="100 Credits" pos="-translate-x-1/2" left="left-[50%]" />
                      </div>
                      <div className="w-0 relative">
                         <MilestoneDot active={totalCompleted >= 10} label="10 Refs" reward="Premium" pos="-translate-x-full" left="left-full" />
                      </div>
                   </div>
                </div>
            </div>

            {/* Sharing Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                     <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Your Elite Link</h4>
                  </div>
                  <div className="flex gap-4">
                     <div className="relative flex-1 group">
                        <Input 
                           readOnly 
                           value={referralLink} 
                           className="h-16 pl-6 pr-14 rounded-2xl bg-slate-50 border-2 border-slate-100 font-mono text-xs sm:text-sm focus:ring-0 focus:border-teal-500 transition-all shadow-inner group-hover:bg-white"
                        />
                        <button 
                           onClick={handleCopy}
                           className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg border border-slate-100 text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-all"
                        >
                           {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                     <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Quick Share</h4>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                     <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex-1 h-16 rounded-2xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-4 font-black transition-all shadow-xl shadow-green-500/20 group">
                        <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        WHATSAPP
                     </a>
                     <Button 
                        onClick={() => setEditingCode(!editingCode)}
                        variant="outline"
                        className="h-16 w-full sm:w-16 rounded-2xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all text-slate-400 hover:text-teal-600 shadow-sm"
                      >
                        <Star className="w-6 h-6" />
                     </Button>
                  </div>
               </div>
            </div>

            <AnimatePresence>
              {editingCode && (
                <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden"
                >
                   <div className="p-10 bg-slate-50 rounded-[3rem] border-2 border-slate-100 space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                            <Star className="w-4 h-4 fill-current" />
                         </div>
                         <h4 className="font-black text-slate-900 text-xl tracking-tight">Customize Your Code</h4>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                         <Input 
                           value={newCode} 
                           onChange={e => setNewCode(e.target.value.toUpperCase())} 
                           className="h-16 rounded-2xl border-2 border-slate-200 uppercase font-black tracking-[0.2em] text-center text-2xl bg-white shadow-inner focus:border-teal-500 transition-all" 
                           placeholder="ALI-123"
                         />
                         <Button onClick={handleSaveCode} className="h-16 px-10 rounded-2xl bg-teal-600 hover:bg-teal-700 font-black text-lg shadow-xl shadow-teal-600/20 transition-all">
                           SAVE CODE
                         </Button>
                      </div>
                      <p className="text-xs font-bold text-slate-400 text-center">Your custom code will be reflected in your referral link instantly.</p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Social Proof Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pt-8 items-start">
         <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            <div className="flex items-center gap-4 px-2">
               <div className="w-2 h-8 bg-amber-400 rounded-full shadow-lg shadow-amber-400/20" />
               <h3 className="text-2xl font-display font-black text-slate-900 uppercase tracking-widest">Global Referrers</h3>
            </div>
            <Card className="rounded-[4rem] border-2 border-slate-100 shadow-2xl overflow-hidden bg-white">
               <CardContent className="p-0">
                  <div className="bg-slate-50/50 p-6 border-b-2 border-slate-100 flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-8 sm:px-12">
                     <span>Rank & Student</span>
                     <span>Impact Score</span>
                  </div>
                  <div className="divide-y-2 divide-slate-50">
                    {leaderboard.length === 0 ? (
                      <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Waiting for legends...</div>
                    ) : leaderboard.map((user, idx) => (
                      <div key={user.id} className="flex items-center justify-between p-6 sm:p-10 hover:bg-slate-50/80 transition-all duration-300 px-8 sm:px-12 group">
                         <div className="flex items-center gap-6 sm:gap-10">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${idx === 0 ? 'bg-amber-400 text-amber-950 shadow-2xl shadow-amber-400/40 scale-110' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-300'}`}>
                               {idx === 0 ? <Medal className="w-6 h-6" /> : idx + 1}
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6">
                               <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-100 rounded-[1.8rem] flex items-center justify-center font-black text-slate-300 text-2xl border-2 border-white shadow-xl group-hover:shadow-teal-500/20 transition-all overflow-hidden">
                                  {user.avatar ? (
                                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    user.name[0]
                                  )}
                                </div>
                               <div>
                                  <span className="font-black text-slate-900 text-lg sm:text-2xl block mb-1 group-hover:text-teal-600 transition-colors tracking-tight">{user.name}</span>
                                  <Badge className="bg-amber-50 text-amber-700 border-amber-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                                     ELITE REFERRER
                                  </Badge>
                               </div>
                            </div>
                         </div>
                         <div className="text-right space-y-2">
                            <div className="flex items-center justify-end gap-3">
                               <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                               <span className="font-black text-3xl sm:text-4xl text-slate-900 tabular-nums tracking-tighter">{user.completedCount}</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Factor</p>
                         </div>
                      </div>
                    ))}
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-5 xl:col-span-4 space-y-10">
            <div className="flex items-center gap-4 px-2">
               <div className="w-2 h-8 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20" />
               <h3 className="text-2xl font-display font-black text-slate-900 uppercase tracking-widest">Why Refer?</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
               <ReasonCard icon={Sparkles} color="bg-indigo-600" title="Free AI Credits" desc="Get 50 bonus credits instantly for every friend who joins. Use them for smart hints." />
               <ReasonCard icon={ShieldCheck} color="bg-teal-600" title="Pro Features" desc="Unlock unlimited mock exams and advanced analytics to scale your learning." />
               <ReasonCard icon={Users} color="bg-rose-600" title="Build a Tribe" desc="Studying together is proven to increase performance by 40%." />
            </div>

            <Card className="rounded-[4rem] bg-slate-900 p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
               <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-2xl border border-white/10 shadow-2xl group-hover:bg-indigo-500 transition-colors">
                     <Bell className="w-7 h-7 text-indigo-300 group-hover:text-white" />
                  </div>
                  <h4 className="text-2xl font-black leading-tight tracking-tight">Referral Expert?</h4>
                  <p className="text-slate-400 font-medium leading-relaxed text-sm">
                     Contact our support for special partnership opportunities and exclusive rewards.
                  </p>
                  <Button className="w-full h-16 rounded-[2rem] bg-white text-slate-900 font-black hover:bg-slate-100 transition-all border-b-4 border-slate-200 active:border-b-0 active:translate-y-1">
                     PARTNER WITH US
                  </Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  )
}

function MilestoneDot({ active, label, reward, pos, left }) {
   return (
      <div className={`absolute -top-4 ${left} ${pos} flex flex-col items-center gap-2 group z-20 pointer-events-auto`}>
         <div className={`w-10 h-10 rounded-2xl border-4 flex items-center justify-center transition-all shadow-xl ${active ? 'bg-teal-500 border-white text-white scale-110' : 'bg-white border-slate-200 text-slate-200'}`}>
            <Star className={`w-4 h-4 ${active ? 'fill-current' : ''}`} />
         </div>
         <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all absolute -bottom-12 whitespace-nowrap shadow-2xl pointer-events-none scale-90 group-hover:scale-100">
            {label}: {reward}
         </div>
      </div>
   )
}

function ReasonCard({ icon: Icon, color, title, desc }) {
   return (
      <Card className="rounded-[2.5rem] border-2 border-slate-100 p-8 space-y-5 hover:border-slate-200 hover:shadow-2xl transition-all group relative overflow-hidden bg-white">
         <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200 group-hover:scale-110 transition-transform`}>
            <Icon className="w-7 h-7 group-hover:rotate-12 transition-transform" />
         </div>
         <div className="space-y-2">
            <h4 className="font-black text-slate-900 text-xl tracking-tight group-hover:text-teal-600 transition-colors">{title}</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
         </div>
      </Card>
   )
}
