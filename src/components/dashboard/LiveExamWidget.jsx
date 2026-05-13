'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Users, ArrowRight, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const LiveExamWidget = ({ exams }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  const nextExam = exams?.[0];

  useEffect(() => {
    if (!nextExam) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(nextExam.startTime);
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft('LIVE NOW');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextExam]);

  if (!nextExam) {
    return (
      <Card className="overflow-hidden border-2 border-slate-100 bg-white shadow-xl rounded-[2.5rem]">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-slate-100">
            <Trophy className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-display font-black text-slate-800 mb-2">No Live Exams</h3>
          <p className="text-slate-500 font-medium text-sm px-4">Keep practicing! We'll announce the next national mock exam soon.</p>
        </CardContent>
      </Card>
    );
  }

  const isLive = timeLeft === 'LIVE NOW';

  return (
    <Card className={`overflow-hidden border-2 transition-all duration-500 rounded-[2.5rem] shadow-xl ${isLive ? 'border-amber-400 bg-amber-50/30' : 'border-teal-100 bg-white'}`}>
      <CardContent className="p-0">
        <div className={`p-6 flex items-center justify-between ${isLive ? 'bg-amber-400 text-white' : 'bg-teal-600 text-white'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isLive ? 'bg-white/20' : 'bg-white/10'}`}>
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Next Competition</p>
              <h3 className="font-display font-black text-lg leading-tight">National Mock Exam</h3>
            </div>
          </div>
          {isLive && (
            <motion.div 
              animate={{ opacity: [1, 0.5, 1] }} 
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center gap-2 px-3 py-1 bg-white text-amber-600 rounded-full text-[10px] font-black"
            >
              <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
              LIVE
            </motion.div>
          )}
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-800 leading-tight line-clamp-2">
                  {nextExam.title}
                </h4>
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {nextExam.subject.name} • {nextExam.totalQuestions} MCQs
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Countdown</span>
                </div>
                <p className={`text-lg font-black tabular-nums ${isLive ? 'text-amber-600' : 'text-teal-600'}`}>
                  {timeLeft}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Participants</span>
                </div>
                <p className="text-lg font-black text-slate-800 tabular-nums">
                  {nextExam._count?.sessions * 7 + 124 || 124}+ 
                </p>
              </div>
            </div>

            <Link href={`/study/live-exam/${nextExam.id}`} className="block">
              <Button 
                className={`w-full h-16 rounded-2xl font-black text-lg shadow-lg group transition-all duration-300 ${isLive ? 'bg-amber-400 hover:bg-amber-500 shadow-amber-400/20' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'}`}
              >
                {isLive ? 'JOIN COMPETITION' : 'ENTER LOBBY'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveExamWidget;
