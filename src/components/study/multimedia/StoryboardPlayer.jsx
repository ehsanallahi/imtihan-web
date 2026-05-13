'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  RefreshCcw,
  Sparkles,
  Layout,
  MessageCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const StoryboardPlayer = ({ slides, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const slide = slides[currentSlide];

  useEffect(() => {
    if (isPlaying) {
      speakCurrentSlide();
    } else {
      synthRef.current?.cancel();
    }
    return () => synthRef.current?.cancel();
  }, [currentSlide, isPlaying]);

  const speakCurrentSlide = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(slide.narration);
    utterance.rate = 0.9;
    utterance.onend = () => {
      if (isPlaying && currentSlide < slides.length - 1) {
        setTimeout(() => setCurrentSlide(prev => prev + 1), 1000);
      } else {
        setIsPlaying(false);
      }
    };
    synthRef.current.speak(utterance);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const next = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-5xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[600px]">
        
        {/* Visual Section */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
            <div className="space-y-6">
              <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center mx-auto shadow-2xl mb-8 animate-bounce">
                <Layout className="w-12 h-12 text-white" />
              </div>
              <p className="text-slate-400 font-bold italic text-sm">
                "{slide.visualDescription}"
              </p>
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Illustration Placeholder</p>
            </div>
          </div>
          
          {/* Progress Overlay */}
          <div className="absolute top-8 left-8 right-8 flex gap-2">
            {slides.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx <= currentSlide ? 'bg-indigo-600' : 'bg-slate-200'}`}
              />
            ))}
          </div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-[400px] p-8 sm:p-12 flex flex-col bg-white border-l border-slate-100">
          <div className="flex-1 space-y-8">
            <div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 block">
                Slide {currentSlide + 1} of {slides.length}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-800 leading-tight">
                {slide.title}
              </h2>
            </div>

            <ul className="space-y-4">
              {slide.points.map((point, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3 text-sm font-medium text-slate-600"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  {point}
                </motion.li>
              ))}
            </ul>

            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
              <div className="flex gap-3">
                <MessageCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-1" />
                <p className="text-xs font-bold text-indigo-900 leading-relaxed italic">
                  {slide.narration}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-12 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={prev} disabled={currentSlide === 0} className="rounded-xl">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={next} disabled={currentSlide === slides.length - 1} className="rounded-xl">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setIsMuted(!isMuted)}
              className={`rounded-xl ${isMuted ? 'text-rose-500' : 'text-slate-400'}`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryboardPlayer;
