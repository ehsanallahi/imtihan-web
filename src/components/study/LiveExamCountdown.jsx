'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { joinLiveExam } from '@/actions/liveExamActions';
import { toast } from 'sonner';

const LiveExamCountdown = ({ startTime, endTime, examId, sessionId }) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [status, setStatus] = useState('upcoming'); // 'upcoming', 'live', 'ended'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const interval = setInterval(() => {
      const now = new Date();
      
      if (now < start) {
        const diff = start - now;
        setTimeLeft({
          h: Math.floor(diff / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000)
        });
        setStatus('upcoming');
      } else if (now >= start && now <= end) {
        setStatus('live');
      } else {
        setStatus('ended');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const handleJoin = async () => {
    if (sessionId) {
      router.push(`/study/live-exam/room/${sessionId}`);
      return;
    }

    setLoading(true);
    const res = await joinLiveExam(examId);
    setLoading(false);

    if (res.success) {
      router.push(`/study/live-exam/room/${res.sessionId}`);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Card className={`rounded-[2.5rem] border-2 shadow-2xl transition-all duration-500 overflow-hidden ${status === 'live' ? 'border-amber-400 ring-4 ring-amber-400/10' : 'border-teal-100'}`}>
      <CardContent className="p-10 text-center space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
            {status === 'upcoming' ? 'Competition Starts In' : status === 'live' ? 'Competition Status' : 'Competition Status'}
          </p>
          
          {status === 'upcoming' ? (
            <div className="flex justify-center gap-4">
              <TimeUnit value={timeLeft.h} label="HRS" />
              <div className="text-3xl font-black text-slate-300 self-center mb-6">:</div>
              <TimeUnit value={timeLeft.m} label="MIN" />
              <div className="text-3xl font-black text-slate-300 self-center mb-6">:</div>
              <TimeUnit value={timeLeft.s} label="SEC" />
            </div>
          ) : status === 'live' ? (
            <div className="py-4">
               <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-400 text-white rounded-2xl font-black text-xl animate-pulse">
                 <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                 LIVE NOW
               </div>
            </div>
          ) : (
            <div className="py-4 text-2xl font-black text-rose-500">EXAM ENDED</div>
          )}
        </div>

        <div className="pt-4">
          {status === 'ended' ? (
            <Button disabled className="w-full h-16 rounded-2xl bg-slate-100 text-slate-400 font-black">
               TIME EXPIRED
            </Button>
          ) : (
            <Button 
              onClick={handleJoin}
              disabled={loading || (status === 'upcoming' && !sessionId)}
              className={`w-full h-20 rounded-2xl font-black text-xl shadow-xl transition-all group ${status === 'live' ? 'bg-amber-400 hover:bg-amber-500 shadow-amber-400/20' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20 opacity-50'}`}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : status === 'live' || sessionId ? (
                <>
                  {sessionId ? 'CONTINUE EXAM' : 'START COMPETITION'}
                  <Play className="ml-3 w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                </>
              ) : (
                'WAITING FOR START...'
              )}
            </Button>
          )}
          
          {status === 'upcoming' && !sessionId && (
            <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Button unlocks at start time
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-20 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center shadow-inner">
        <span className="text-3xl font-black text-slate-800 tabular-nums">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="mt-2 text-[10px] font-black text-slate-400 tracking-widest">{label}</span>
    </div>
  );
}

export default LiveExamCountdown;
