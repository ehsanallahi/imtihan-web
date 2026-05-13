'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  ShieldAlert, 
  ChevronRight, 
  ChevronLeft, 
  Flag, 
  CheckCircle2, 
  AlertTriangle,
  BrainCircuit,
  Eye,
  Users
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { submitMockExam } from '@/actions/examActions';

const LiveExamPlayer = ({ session, questions }) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(session.timeLimitMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const currentQuestion = questions[currentIndex];

  // Tab switching detection (Proctoring)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
             // Auto-submit if too many switches? 
             // For now just alert
          }
          return newCount;
        });
        setShowWarning(true);
        toast.warning("Window switch detected! This activity is being reported to the proctor.", {
           duration: 5000,
           icon: <ShieldAlert className="text-rose-500" />
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Prepare results
    const results = questions.map(q => ({
      mcqId: q.id,
      selectedAnswer: answers[q.id] || null,
      isCorrect: answers[q.id] === q.correctAnswer
    }));

    const res = await submitMockExam({
      sessionId: session.id,
      results,
      tabSwitches,
      timeTakenSeconds: (session.timeLimitMinutes * 60) - timeLeft
    });

    if (res.success) {
      toast.success("Exam submitted successfully!");
      router.push(`/study/analytics/${session.id}`);
    } else {
      toast.error("Submission failed. Please contact support.");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 font-sans selection:bg-teal-500/30">
      {/* Proctored Header */}
      <div className="h-20 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6 sm:px-12 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center border border-teal-500/30">
            <ShieldAlert className="w-6 h-6 text-teal-400" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Competition Mode</h2>
            <p className="text-[10px] font-bold text-slate-500">PROCTORING ACTIVE • ID: {session.id.slice(-8)}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                 <Users className="w-4 h-4 text-teal-400" />
                 <span className="text-xs font-black text-white tabular-nums">482 Participating</span>
              </div>
              <div className={`flex items-center gap-3 px-6 py-2 rounded-2xl border-2 transition-colors ${timeLeft < 300 ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' : 'bg-slate-800 border-white/10 text-white'}`}>
                <Timer className={`w-5 h-5 ${timeLeft < 300 ? 'animate-pulse' : ''}`} />
                <span className="text-xl font-black tabular-nums">{formatTime(timeLeft)}</span>
              </div>
           </div>
           <Button 
            onClick={() => { if(confirm("Are you sure you want to end the exam now?")) handleSubmit() }}
            className="hidden sm:flex bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl px-6 h-12 shadow-lg shadow-teal-600/20"
           >
             SUBMIT EXAM
           </Button>
        </div>
      </div>

      {/* Main Exam Area */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center p-4 sm:p-10 relative">
        <div className="max-w-4xl w-full h-full flex flex-col bg-slate-900/50 rounded-[3rem] border border-white/5 overflow-hidden backdrop-blur-3xl shadow-2xl">
          {/* Progress Indicator */}
          <div className="p-8 sm:p-12 space-y-8 flex-1 overflow-y-auto custom-scrollbar-hidden">
            <div className="flex justify-between items-end mb-2">
              <Badge variant="outline" className="bg-white/5 text-teal-400 border-teal-500/30 px-4 py-1 rounded-full text-[10px] font-black tracking-widest">
                QUESTION {currentIndex + 1} OF {questions.length}
              </Badge>
              <div className="flex gap-1">
                {questions.map((_, idx) => (
                  <div key={idx} className={`w-1 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-teal-400 h-5' : answers[questions[idx].id] ? 'bg-teal-900' : 'bg-white/5'}`} />
                ))}
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="space-y-6">
                   <h3 className="text-2xl sm:text-3xl font-display font-black leading-tight tracking-tight">
                     {currentQuestion.question}
                   </h3>
                   {currentQuestion.questionUrdu && (
                      <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                        <p className="text-2xl sm:text-4xl font-bold text-slate-300 dir-rtl font-urdu leading-[1.8] text-center">
                          {currentQuestion.questionUrdu}
                        </p>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: currentQuestion[`option${opt}`] }))}
                      className={`
                        group relative p-6 rounded-[2rem] text-left transition-all border-2
                        ${answers[currentQuestion.id] === currentQuestion[`option${opt}`]
                          ? 'bg-teal-600 border-teal-400 text-white shadow-[0_0_40px_-10px_rgba(13,122,87,0.5)] scale-[1.02]'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`
                           w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors
                           ${answers[currentQuestion.id] === currentQuestion[`option${opt}`] ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}
                         `}>
                           {opt}
                         </div>
                         <span className="font-bold text-lg">{currentQuestion[`option${opt}`]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="p-8 sm:p-10 bg-slate-900 border-t border-white/5 flex items-center justify-between flex-shrink-0">
             <Button
               variant="outline"
               disabled={currentIndex === 0}
               onClick={() => setCurrentIndex(prev => prev - 1)}
               className="h-14 rounded-2xl border-white/10 bg-transparent text-white font-black hover:bg-white/5 disabled:opacity-20"
             >
               <ChevronLeft className="mr-2 w-5 h-5" /> PREVIOUS
             </Button>

             <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="hidden sm:flex h-14 w-14 rounded-2xl border-white/10 bg-transparent text-white items-center justify-center hover:bg-white/5"
                >
                  <Flag className="w-5 h-5 text-rose-500" />
                </Button>
                
                {currentIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-14 px-10 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg shadow-lg shadow-amber-500/20"
                  >
                    FINISH COMPETITION
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="h-14 px-10 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-lg shadow-lg shadow-teal-600/20 group"
                  >
                    NEXT QUESTION
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Tab Warning Overlay */}
      <AnimatePresence>
        {showWarning && tabSwitches < 3 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-rose-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center"
          >
             <div className="max-w-md space-y-8">
                <div className="w-24 h-24 bg-rose-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-rose-500/50">
                   <ShieldAlert className="w-12 h-12 text-rose-500 animate-bounce" />
                </div>
                <div className="space-y-4">
                   <h2 className="text-3xl font-black text-white">SECURITY WARNING</h2>
                   <p className="text-rose-200 font-medium leading-relaxed">
                     Switching tabs or windows is strictly prohibited during national competitions. 
                     This incident has been recorded.
                   </p>
                   <div className="bg-rose-500/20 p-4 rounded-2xl border border-rose-500/30">
                      <p className="text-sm font-black text-rose-400 uppercase tracking-widest">
                        Infraction Count: {tabSwitches} / 3
                      </p>
                   </div>
                </div>
                <Button 
                  onClick={() => setShowWarning(false)}
                  className="w-full h-16 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-black text-xl"
                >
                  I UNDERSTAND
                </Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submitting Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl z-[60] flex flex-col items-center justify-center p-6 text-center space-y-6">
           <div className="w-20 h-20 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
           <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">SUBMITTING RESULTS</h2>
              <p className="text-slate-400 font-medium tracking-wide">Calculating your national rank...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default LiveExamPlayer;
