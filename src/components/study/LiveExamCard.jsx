'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Users, 
  Zap, 
  ChevronRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { joinLiveExam } from '@/actions/liveExamActions';
import { toast } from 'sonner';
import { formatDistanceToNow, isPast, isFuture } from 'date-fns';

const LiveExamCard = ({ exam }) => {
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      if (isFuture(new Date(exam.startTime))) {
        setTimeLeft(`Starts in ${formatDistanceToNow(new Date(exam.startTime))}`);
      } else if (isFuture(new Date(exam.endTime))) {
        setTimeLeft(`Ends in ${formatDistanceToNow(new Date(exam.endTime))}`);
      } else {
        setTimeLeft("Ended");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [exam]);

  const handleJoin = async () => {
    setLoading(true);
    const res = await joinLiveExam(exam.id);
    setLoading(false);
    if (res.success) {
      window.location.href = `/study/quiz/${res.sessionId}`;
    } else {
      toast.error(res.error);
    }
  };

  const isActive = !isFuture(new Date(exam.startTime)) && !isPast(new Date(exam.endTime));
  const isFinished = isPast(new Date(exam.endTime));

  return (
    <div className={`
      relative rounded-[2.5rem] border-2 p-6 sm:p-8 overflow-hidden transition-all duration-300
      ${isActive ? 'bg-gradient-to-br from-indigo-900 to-indigo-800 border-indigo-700 text-white shadow-xl shadow-indigo-900/20' : 'bg-white border-[#E5E5E5] text-slate-800 shadow-[0_4px_0_0_#E5E5E5]'}
      ${isFinished ? 'opacity-70 grayscale' : ''}
    `}>
      {isActive && (
        <div className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          LIVE NOW
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-b-4 ${isActive ? 'bg-white/10 border-white/20' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-indigo-100/50' : 'text-slate-400'}`}>
              {exam.subject.name} • National Mock
            </p>
            <h3 className="text-xl font-display font-black leading-tight">{exam.title}</h3>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-2xl flex flex-col gap-1 ${isActive ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-100'}`}>
            <div className="flex items-center gap-2 opacity-60">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Duration</span>
            </div>
            <p className="font-black">{exam.durationMinutes} MIN</p>
          </div>
          <div className={`p-4 rounded-2xl flex flex-col gap-1 ${isActive ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-100'}`}>
            <div className="flex items-center gap-2 opacity-60">
              <Users className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Competing</span>
            </div>
            <p className="font-black">{exam._count.sessions} STUDENTS</p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-300'}`}></div>
            <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
              {timeLeft}
            </span>
          </div>
          
          {!isFinished && (
            <Button 
              onClick={handleJoin}
              disabled={loading || (!isActive && isFuture(new Date(exam.startTime)))}
              className={`
                rounded-2xl font-black px-8 transition-all
                ${isActive 
                  ? 'bg-white text-indigo-900 hover:bg-teal-50 shadow-lg shadow-white/10' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'}
              `}
            >
              {loading ? <Loader2 className="animate-spin" /> : isActive ? "Enter Exam" : "Set Reminder"}
              {!loading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveExamCard;
