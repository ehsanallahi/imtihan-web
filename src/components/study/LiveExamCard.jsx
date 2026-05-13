'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Users, 
  Zap, 
  ChevronRight,
  Loader2,
  Calendar,
  Star,
  Bell,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { joinLiveExam } from '@/actions/liveExamActions';
import { toast } from 'sonner';
import { formatDistanceToNow, isPast, isFuture } from 'date-fns';
import { useRouter } from 'next/navigation';

const LiveExamCard = ({ exam }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [reminded, setReminded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(exam.startTime);
      const end = new Date(exam.endTime);

      if (isFuture(start)) {
        setTimeLeft(`STARTS IN ${formatDistanceToNow(start).toUpperCase()}`);
      } else if (isFuture(end)) {
        setTimeLeft(`LIVE NOW • ENDS IN ${formatDistanceToNow(end).toUpperCase()}`);
      } else {
        setTimeLeft("COMPETITION ENDED");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [exam]);

  const handleAction = async () => {
    if (!isActive) {
      setReminded(!reminded);
      if (!reminded) toast.success("Reminder set! We'll notify you when the exam starts.");
      return;
    }

    setLoading(true);
    const res = await joinLiveExam(exam.id);
    setLoading(false);
    if (res.success) {
      router.push(`/study/live-exam/room/${res.sessionId}`);
    } else {
      toast.error(res.error);
    }
  };

  const isActive = !isFuture(new Date(exam.startTime)) && !isPast(new Date(exam.endTime));
  const isFinished = isPast(new Date(exam.endTime));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`
        relative rounded-[3rem] border-2 p-8 sm:p-10 overflow-hidden transition-all duration-500 group
        ${isActive 
          ? 'bg-slate-900 border-teal-500/30 text-white shadow-2xl shadow-teal-500/20' 
          : 'bg-white border-slate-100 text-slate-800 shadow-xl shadow-slate-200/50'
        }
        ${isFinished ? 'opacity-70 saturate-50' : ''}
      `}
    >
      {/* Background Glow for Live Exams */}
      {isActive && (
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 blur-[100px] rounded-full pointer-events-none" />
      )}

      {/* Live Badge */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-6 right-8 flex items-center gap-2"
          >
            <div className="flex items-center gap-2 bg-rose-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg shadow-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              LIVE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col h-full relative z-10">
        {/* Header Section */}
        <div className="flex items-start gap-5 mb-8">
          <div className={`
            w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-transform duration-500 group-hover:scale-110
            ${isActive 
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
              : 'bg-slate-50 border-slate-100 text-slate-400'
            }
          `}>
            <Trophy className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
               <Badge className={isActive ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' : 'bg-slate-100 text-slate-500'}>
                 {exam.subject.name.toUpperCase()}
               </Badge>
               <span className={`text-[10px] font-black tracking-[0.2em] ${isActive ? 'text-teal-500/60' : 'text-slate-300'}`}>
                 • NATIONAL MOCK
               </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-black leading-tight tracking-tight">
              {exam.title}
            </h3>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <InfoBox 
            icon={Clock} 
            label="Duration" 
            value={`${exam.durationMinutes} MIN`} 
            isActive={isActive} 
          />
          <InfoBox 
            icon={Users} 
            label="Competing" 
            value={`${exam._count.sessions * 7 + 124}+ STUDENTS`} 
            isActive={isActive} 
          />
        </div>

        {/* Footer Actions */}
        <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-current/5">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-teal-400 animate-pulse' : 'bg-slate-200'}`} />
            <span className={`text-xs font-black tracking-widest ${isActive ? 'text-teal-300' : 'text-slate-400'}`}>
              {timeLeft}
            </span>
          </div>
          
          {!isFinished && (
            <Button 
              onClick={handleAction}
              disabled={loading}
              className={`
                h-16 px-10 rounded-2xl font-black text-lg transition-all duration-300 shadow-2xl relative overflow-hidden group
                ${isActive 
                  ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/30 border-b-[6px] border-teal-950 active:border-b-0 active:translate-y-1' 
                  : reminded
                    ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-none'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/30 border-b-[6px] border-slate-950 active:border-b-0 active:translate-y-1'
                }
              `}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <>
                      ENTER COMPETITION
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </>
                  ) : reminded ? (
                    <>
                      <Star className="w-5 h-5 fill-current" />
                      REMINDER SET
                    </>
                  ) : (
                    <>
                      SET REMINDER
                      <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function InfoBox({ icon: Icon, label, value, isActive }) {
  return (
    <div className={`
      p-5 rounded-[2rem] flex flex-col gap-1 transition-colors
      ${isActive 
        ? 'bg-white/5 border border-white/5' 
        : 'bg-slate-50 border border-slate-100'
      }
    `}>
      <div className="flex items-center gap-2 opacity-50 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className={`font-black text-lg tabular-nums ${isActive ? 'text-white' : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  );
}

export default LiveExamCard;
