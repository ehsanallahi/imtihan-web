'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, CheckCircle2, Share2, Users, Trophy, Award, Gift } from "lucide-react"
import { getReferralStats, updateReferralCode, getTopReferrers } from "@/actions/referralActions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

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
    return <div className="animate-pulse h-48 bg-slate-100 rounded-xl"></div>
  }

  if (!stats) return null

  const referralLink = `${window.location.origin}/auth/signup?ref=${stats.referralCode}`
  
  // Calculate progress to next milestone (10 for premium)
  const progressToNextReward = stats.totalCompleted % 10
  const progressPercent = (progressToNextReward / 10) * 100

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveCode = async () => {
    setError("")
    const res = await updateReferralCode(newCode)
    if (res.success) {
      setStats({...stats, referralCode: newCode})
      setEditingCode(false)
    } else {
      setError(res.error)
    }
  }

  const shareText = encodeURIComponent("Join Imtihan and get 50 Free AI Credits! Sign up using my link:")
  const whatsappUrl = `https://wa.me/?text=${shareText} ${referralLink}`

  return (
    <div className="space-y-6">
      {/* Referral Progress Card */}
      <Card className="border-teal-100/60 shadow-md bg-gradient-to-br from-white to-teal-50/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="text-xl font-display text-teal-900 flex items-center gap-2">
            <Gift className="h-5 w-5 text-teal-600" />
            Invite Friends, Get Premium Free!
          </CardTitle>
          <CardDescription>
            For every 10 friends who sign up and complete their profile, you get 1 Month of Pro for free. They also get 50 AI Credits!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-teal-800">Your Progress ({progressToNextReward}/10)</span>
              <span className="text-teal-600 font-bold">{10 - progressToNextReward} more needed</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-teal-100 [&>div]:bg-gradient-to-r [&>div]:from-teal-400 [&>div]:to-emerald-500" />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>{stats.totalPending} Pending</span>
              <span>{stats.rewardsClaimed} Rewards Claimed</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-teal-100 shadow-sm space-y-3">
            <Label className="text-teal-800 font-semibold">Your Referral Link</Label>
            {editingCode ? (
              <div className="flex gap-2">
                <Input value={newCode} onChange={e => setNewCode(e.target.value)} className="font-mono text-sm" />
                <Button size="sm" onClick={handleSaveCode} className="bg-teal-600 hover:bg-teal-700 text-white">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingCode(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input readOnly value={referralLink} className="font-mono text-xs sm:text-sm bg-slate-50 text-slate-600" />
                <Button size="icon" variant="outline" onClick={handleCopy} className="shrink-0 border-teal-200 text-teal-700 hover:bg-teal-50">
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            
            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setEditingCode(true)} className="text-xs text-teal-600 hover:underline">
                Customize Code
              </button>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-full transition-colors">
                <Share2 className="h-3 w-3" /> Share via WhatsApp
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Card className="border-amber-100 shadow-sm bg-gradient-to-b from-white to-amber-50/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display text-amber-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user, idx) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-200 text-amber-800' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-200 text-orange-800' : 'bg-transparent text-slate-400'}`}>
                      {idx + 1}
                    </div>
                    <span className="font-medium text-sm text-slate-700">{user.name}</span>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-none font-semibold">
                    {user.completedCount} refs
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
