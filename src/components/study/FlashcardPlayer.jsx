'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { submitFlashcardResult } from '@/actions/flashcardActions';
import { toast } from 'sonner';

const FlashcardPlayer = ({ cards, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-[#E5E5E5] shadow-[0_4px_0_0_#E5E5E5]">
        <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-black text-slate-800 mb-2">All Caught Up!</h2>
        <p className="text-slate-500 font-medium px-8">No flashcards due for review right now. Come back later!</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleRate = async (quality) => {
    setLoading(true);
    const res = await submitFlashcardResult(currentCard.id, quality);
    setLoading(false);

    if (res.success) {
      setIsFlipped(false);
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onComplete();
      }
    } else {
      toast.error("Failed to save progress");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-4 flex-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <motion.div 
            className="h-full bg-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Card Container */}
      <div className="perspective-1000 relative h-[400px] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (isFlipped ? '-back' : '-front')}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.4, type: 'spring', damping: 20 }}
            className={`
              absolute inset-0 w-full h-full cursor-pointer
              rounded-[2.5rem] border-b-[8px] p-8 sm:p-12
              flex flex-col items-center justify-center text-center
              shadow-xl transition-colors
              ${isFlipped ? 'bg-teal-600 border-teal-800 text-white' : 'bg-white border-[#E5E5E5] text-slate-800'}
            `}
            onClick={() => !loading && setIsFlipped(!isFlipped)}
          >
            {isFlipped ? (
              <div className="space-y-6">
                <div className="bg-teal-500/30 p-3 rounded-2xl inline-block mb-4">
                  <Zap className="w-8 h-8 text-amber-300 fill-amber-300" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-teal-100">Explanation</p>
                <div className="text-lg sm:text-xl font-bold leading-relaxed max-h-[200px] overflow-y-auto px-4 custom-scrollbar">
                  {currentCard.mcq.explanation || "No explanation provided for this question."}
                  {currentCard.mcq.correctAnswer && (
                    <div className="mt-4 pt-4 border-t border-teal-500/50">
                      <span className="text-sm font-black text-teal-100">CORRECT OPTION:</span>
                      <p className="text-2xl font-black mt-1">{currentCard.mcq.correctAnswer}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-teal-200/60 animate-pulse mt-4">Click to see question</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 p-3 rounded-2xl inline-block mb-4">
                  <HelpCircle className="w-8 h-8 text-teal-500" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Question</p>
                <h3 className="text-xl sm:text-2xl font-display font-black leading-tight">
                  {currentCard.mcq.question}
                </h3>
                {currentCard.mcq.questionUrdu && (
                  <p className="text-xl font-bold text-slate-600 dir-rtl font-urdu">
                    {currentCard.mcq.questionUrdu}
                  </p>
                )}
                <p className="text-xs font-bold text-slate-300 animate-pulse mt-4">Click to reveal answer</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-12">
        {!isFlipped ? (
          <Button 
            onClick={() => setIsFlipped(true)}
            className="w-full h-16 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-lg shadow-lg shadow-teal-600/20"
          >
            Show Answer
          </Button>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <RatingButton 
              label="Again" 
              sublabel="1m" 
              icon={RotateCcw} 
              color="bg-rose-500 hover:bg-rose-600" 
              onClick={() => handleRate(0)}
              disabled={loading}
            />
            <RatingButton 
              label="Hard" 
              sublabel="2d" 
              icon={XCircle} 
              color="bg-amber-500 hover:bg-amber-600" 
              onClick={() => handleRate(2)}
              disabled={loading}
            />
            <RatingButton 
              label="Good" 
              sublabel="4d" 
              icon={CheckCircle2} 
              color="bg-teal-500 hover:bg-teal-600" 
              onClick={() => handleRate(4)}
              disabled={loading}
            />
            <RatingButton 
              label="Easy" 
              sublabel="7d" 
              icon={Sparkles} 
              color="bg-emerald-500 hover:bg-emerald-600" 
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
    className={`h-24 rounded-2xl flex flex-col items-center justify-center gap-1 text-white shadow-lg transition-all active:scale-95 ${color}`}
  >
    <Icon className="w-6 h-6 mb-1" />
    <span className="font-black text-sm uppercase">{label}</span>
    <span className="text-[10px] font-bold opacity-70">{sublabel}</span>
  </Button>
);

export default FlashcardPlayer;
