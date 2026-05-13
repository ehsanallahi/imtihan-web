'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Zap, 
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { submitFlashcardResult } from '@/actions/flashcardActions';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
} from '@/components/ui/card';

const FlashcardPlayer = ({ cards }) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <Card className="max-w-md mx-auto overflow-hidden border-2 border-slate-100 shadow-2xl rounded-[3rem] bg-white">
        <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500 w-full" />
        <CardContent className="pt-12 pb-16 px-8 text-center">
          <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Sparkles className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-3xl font-display font-black text-slate-800 mb-4 tracking-tight">Mission Accomplished!</h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
            You've cleared your review deck. Your brain is now officially 1% more awesome than it was 10 minutes ago.
          </p>
          <Link href="/study" className="block w-full">
            <Button className="w-full h-16 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xl shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98]">
              RETURN TO HUB
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleRate = async (quality) => {
    setLoading(true);
    const res = await submitFlashcardResult(currentCard.id, quality);
    setLoading(false);

    if (res.success) {
      setIsFlipped(false);
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        router.push("/study/analytics");
      }
    } else {
      toast.error("Failed to save progress");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 px-4 pb-12">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-8 px-3 rounded-full border-teal-100 bg-teal-50 text-teal-700 font-black text-[10px] uppercase tracking-widest">
            SRS REVIEW
          </Badge>
          <Badge variant="outline" className="h-8 px-3 rounded-full border-slate-100 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest">
            {cards.length} CARDS TOTAL
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-400 tabular-nums">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative pt-2">
        <Progress value={progress} className="h-3 rounded-full bg-slate-100" />
        <motion.div 
          initial={false}
          animate={{ left: `${progress}%` }}
          className="absolute -top-1 transition-all duration-500"
        >
          <div className="w-3 h-3 bg-white border-2 border-teal-500 rounded-full shadow-md" />
        </motion.div>
      </div>

      {/* Card Container */}
      <div className="perspective-2000 relative h-[65vh] min-h-[450px] max-h-[600px] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (isFlipped ? '-back' : '-front')}
            initial={{ rotateY: isFlipped ? -180 : 180, opacity: 0, scale: 0.9 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: isFlipped ? 180 : -180, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 90, damping: 15 }}
            className="absolute inset-0 w-full h-full cursor-pointer touch-none"
            onClick={() => !loading && setIsFlipped(!isFlipped)}
          >
            <Card className={`
              w-full h-full overflow-hidden border-b-[12px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)]
              rounded-[3.5rem] flex flex-col transition-all duration-500
              ${isFlipped 
                ? 'bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 border-teal-950 text-white' 
                : 'bg-white border-slate-200 text-slate-800'
              }
            `}>
              <CardContent className="flex-1 flex flex-col p-8 sm:p-12 overflow-hidden">
                {isFlipped ? (
                  <div className="h-full flex flex-col">
                    <div className="flex-shrink-0 flex flex-col items-center mb-8">
                      <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] backdrop-blur-md flex items-center justify-center mb-4 ring-4 ring-white/5">
                        <Zap className="w-8 h-8 text-amber-300 fill-amber-300" />
                      </div>
                      <Badge className="bg-white/10 hover:bg-white/20 text-teal-100 border-white/20 px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">
                        EXPLANATION
                      </Badge>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-4 custom-scrollbar-hidden">
                      <div className="space-y-6">
                        <div className="text-center">
                           <span className="text-xs font-black text-teal-200/50 uppercase tracking-widest block mb-2">The Correct Answer</span>
                           <h4 className="text-3xl sm:text-4xl font-black tracking-tight">{currentCard.mcq.correctAnswer}</h4>
                        </div>
                        <div className="h-px bg-white/10 w-24 mx-auto" />
                        <p className="text-lg sm:text-xl font-medium leading-relaxed text-teal-50 text-center italic opacity-90">
                          {currentCard.mcq.explanation || "This concept is fundamental to your understanding of the subject. Reviewing it regularly will cement it in your long-term memory."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 pt-6 text-center">
                       <p className="text-[10px] font-black text-teal-200/40 uppercase tracking-[0.3em] animate-pulse">Tap to see question</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="flex-shrink-0 flex flex-col items-center mb-8">
                      <div className="w-16 h-16 bg-teal-50 rounded-[1.5rem] border-2 border-teal-100 flex items-center justify-center mb-4 shadow-sm">
                        <HelpCircle className="w-8 h-8 text-teal-600" />
                      </div>
                      <Badge className="bg-slate-50 text-slate-400 border-slate-100 px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">
                        QUESTION
                      </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 custom-scrollbar-hidden space-y-10">
                      <h3 className="text-2xl sm:text-4xl font-display font-black leading-tight tracking-tight text-slate-900 text-center">
                        {currentCard.mcq.question}
                      </h3>
                      
                      {currentCard.mcq.questionUrdu && (
                        <div className="relative">
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-100" />
                          <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Urdu Translation</span>
                          </div>
                          <div className="mt-8 p-8 bg-slate-50/50 rounded-[3rem] border-2 border-slate-50">
                            <p className="text-2xl sm:text-4xl font-bold text-slate-700 dir-rtl font-urdu leading-[2] text-center">
                              {currentCard.mcq.questionUrdu}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 pt-6 text-center">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Tap to reveal answer</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modern Controls */}
      <div className="pt-8">
        {!isFlipped ? (
          <Button 
            onClick={() => setIsFlipped(true)}
            className="w-full h-24 rounded-[2.5rem] bg-teal-600 hover:bg-teal-700 text-white font-black text-2xl shadow-[0_20px_40px_-10px_rgba(13,122,87,0.3)] border-b-[10px] border-teal-900 active:border-b-0 active:translate-y-2 transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
            SHOW ANSWER 
            <ChevronRight className="ml-3 w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </Button>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <RatingButton 
              label="Again" 
              sublabel="1m" 
              icon={RotateCcw} 
              color="bg-rose-500 hover:bg-rose-600 border-rose-800 shadow-rose-500/20" 
              onClick={() => handleRate(0)}
              disabled={loading}
            />
            <RatingButton 
              label="Hard" 
              sublabel="2d" 
              icon={XCircle} 
              color="bg-amber-500 hover:bg-amber-600 border-amber-800 shadow-amber-500/20" 
              onClick={() => handleRate(2)}
              disabled={loading}
            />
            <RatingButton 
              label="Good" 
              sublabel="4d" 
              icon={CheckCircle2} 
              color="bg-teal-500 hover:bg-teal-600 border-teal-800 shadow-teal-500/20" 
              onClick={() => handleRate(4)}
              disabled={loading}
            />
            <RatingButton 
              label="Easy" 
              sublabel="7d" 
              icon={Sparkles} 
              color="bg-emerald-500 hover:bg-emerald-600 border-emerald-800 shadow-emerald-500/20" 
              onClick={() => handleRate(5)}
              disabled={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const RatingButton = ({ label, sublabel, icon: Icon, color, onClick, disabled }) => (
  <Button 
    onClick={onClick}
    disabled={disabled}
    className={`h-32 rounded-[2.5rem] flex flex-col items-center justify-center gap-1 text-white shadow-xl border-b-[6px] transition-all active:border-b-0 active:translate-y-1.5 ${color}`}
  >
    <Icon className="w-10 h-10 mb-1" />
    <span className="font-black text-xs uppercase tracking-[0.15em]">{label}</span>
    <div className="bg-black/10 px-3 py-1 rounded-full mt-2">
      <span className="text-[10px] font-black text-white/80 tabular-nums">{sublabel}</span>
    </div>
  </Button>
);

export default FlashcardPlayer;
