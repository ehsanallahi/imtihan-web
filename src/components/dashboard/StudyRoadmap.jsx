'use client'

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  ChevronRight, 
  BookOpen, 
  Zap, 
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { getStudyRoadmap } from '@/actions/roadmapActions';
import { Button } from '@/components/ui/button';

const StudyRoadmap = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadRoadmap() {
      const res = await getStudyRoadmap();
      if (res.success) {
        setData(res);
      } else {
        setError(res.error);
      }
      setLoading(false);
    }
    loadRoadmap();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] border-2 border-[#E5E5E5] p-8 flex flex-col items-center justify-center min-h-[300px] shadow-[0_4px_0_0_#E5E5E5]">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Charting your path...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 rounded-[2rem] border-2 border-rose-200 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-4" />
        <p className="text-rose-600 font-bold">Could not load roadmap</p>
      </div>
    );
  }

  const { recommendations, aiSummary } = data;

  return (
    <div className="bg-white rounded-[2rem] border-2 border-[#E5E5E5] p-6 sm:p-8 shadow-[0_4px_0_0_#E5E5E5] h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border-b-4 border-teal-100">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-slate-800">Study Roadmap</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Powered by AI</p>
          </div>
        </div>
      </div>

      {/* AI Advice */}
      <div className="bg-teal-50 rounded-2xl p-4 border-2 border-teal-100 mb-6 relative">
        <div className="absolute -top-3 -left-3 bg-white p-1.5 rounded-full border-2 border-teal-100">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
        <p className="text-sm font-bold text-teal-900 leading-relaxed italic">
          "{aiSummary}"
        </p>
      </div>

      <div className="flex-1 space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="font-bold text-slate-500">You're doing great! No urgent weak areas detected.</p>
          </div>
        ) : (
          recommendations.map((rec, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={rec.chapterId}
              className="group relative pl-8 pb-6 last:pb-0"
            >
              {/* Timeline Line */}
              {idx !== recommendations.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-0 w-1 bg-slate-100 group-hover:bg-teal-100 transition-colors"></div>
              )}
              
              {/* Timeline Node */}
              <div className={`
                absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-white
                ${idx === 0 ? 'border-amber-400' : 'border-slate-200'}
              `}>
                <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-amber-400 animate-ping' : 'bg-slate-200'}`}></div>
              </div>

              <div className="bg-slate-50 border-2 border-transparent group-hover:border-teal-100 group-hover:bg-teal-50/30 rounded-2xl p-4 transition-all duration-300">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                      {rec.subjectName} • Chapter {rec.chapterNumber}
                    </span>
                    <h3 className="font-display font-black text-slate-800 truncate mb-2">
                      {rec.chapterName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-400" 
                          style={{ width: `${rec.mastery}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-rose-500">{rec.mastery}% Mastery</span>
                    </div>
                  </div>
                  
                  <Link href={`/study/subject/${rec.subjectId}/chapter/${rec.chapterId}`}>
                    <Button 
                      size="sm" 
                      className="rounded-xl bg-white hover:bg-teal-600 hover:text-white text-teal-600 border-2 border-teal-100 hover:border-teal-600 shadow-sm transition-all"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-6">
          <Link href="/study/analytics">
            <Button variant="ghost" className="w-full rounded-2xl text-slate-400 font-bold hover:text-teal-600 hover:bg-teal-50 gap-2">
              View Detailed Heatmap <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudyRoadmap;
