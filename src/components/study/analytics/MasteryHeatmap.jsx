'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

const MasteryHeatmap = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Mastery color function
  const getMasteryColor = (mastery) => {
    if (mastery === 0) return 'bg-slate-100 border-slate-200';
    if (mastery < 30) return 'bg-rose-100 border-rose-200 text-rose-700';
    if (mastery < 60) return 'bg-amber-100 border-amber-200 text-amber-700';
    if (mastery < 85) return 'bg-teal-100 border-teal-200 text-teal-700';
    return 'bg-emerald-400 border-emerald-500 text-emerald-950';
  };

  const getMasteryLevel = (mastery) => {
    if (mastery === 0) return 'Not Started';
    if (mastery < 30) return 'Weak';
    if (mastery < 60) return 'Developing';
    if (mastery < 85) return 'Strong';
    return 'Mastered';
  };

  return (
    <div className="bg-white rounded-[2rem] border-2 border-[#E5E5E5] p-6 sm:p-8 shadow-[0_4px_0_0_#E5E5E5] mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-800 flex items-center gap-2">
            Mastery Heatmap
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Visualize your progress across all chapters. Colors represent your average accuracy in each topic.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <p className="text-slate-500 font-medium">Your learning journey at a glance</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div>
            <span>New</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-rose-200 border border-rose-300"></div>
            <span>Weak</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-200 border border-amber-300"></div>
            <span>Fair</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-teal-200 border border-teal-300"></div>
            <span>Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-400 border border-emerald-500"></div>
            <span>Pro</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {data.map((subject) => (
          <div key={subject.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{subject.name}</h3>
              <div className="h-px flex-1 bg-slate-100"></div>
            </div>

            <div className="flex flex-wrap gap-3">
              {subject.chapters.map((chapter) => (
                <TooltipProvider key={chapter.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1, y: -2 }}
                        className={`
                          w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-b-4 flex items-center justify-center 
                          font-black transition-all cursor-help
                          ${getMasteryColor(chapter.mastery)}
                        `}
                      >
                        {chapter.number}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="p-3 rounded-2xl border-2 border-slate-100 shadow-xl">
                      <div className="space-y-1">
                        <p className="font-black text-slate-800">Chapter {chapter.number}</p>
                        <p className="text-xs font-bold text-slate-500 leading-tight mb-2">{chapter.name}</p>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-50">
                          <span className="text-[10px] font-black uppercase text-slate-400">Mastery</span>
                          <span className="text-sm font-black text-teal-600">{chapter.mastery}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[10px] font-black uppercase text-slate-400">Attempts</span>
                          <span className="text-xs font-bold text-slate-600">{chapter.correctAttempts}/{chapter.totalAttempts}</span>
                        </div>
                        <div className="mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-center border border-slate-100">
                          {getMasteryLevel(chapter.mastery)}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasteryHeatmap;
