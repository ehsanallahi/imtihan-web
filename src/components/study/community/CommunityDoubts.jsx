'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  Users,
  Award,
  BookOpen,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { answerDoubt, resolveDoubt } from '@/actions/p2pActions';
import { toast } from 'sonner';

const CommunityDoubts = ({ initialDoubts }) => {
  const [doubts, setDoubts] = useState(initialDoubts);
  const [activeDoubt, setActiveDoubt] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnswer = async (threadId) => {
    if (!answer.trim()) return;
    setLoading(true);
    const res = await answerDoubt(threadId, answer);
    setLoading(false);
    if (res.success) {
      toast.success("Answer posted! You'll earn points if it's resolved.");
      setAnswer("");
      setActiveDoubt(null);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-500" />
            Study Community
          </h1>
          <p className="text-slate-500 font-medium">Help others and earn Knowledge Points!</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl px-4 py-2 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-black text-amber-900 tracking-tight">Earn 50 KP per solution</span>
        </div>
      </div>

      <div className="grid gap-6">
        {doubts.length === 0 ? (
          <div className="bg-white rounded-[2rem] border-2 border-[#E5E5E5] p-12 text-center shadow-[0_4px_0_0_#E5E5E5]">
            <Sparkles className="w-16 h-16 text-indigo-100 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-800">Peace and Quiet!</h2>
            <p className="text-slate-400 font-medium mt-2">No community doubts at the moment. Check back later!</p>
          </div>
        ) : (
          doubts.map((doubt) => (
            <Card 
              key={doubt.id} 
              className="rounded-[2rem] border-2 border-[#E5E5E5] overflow-hidden shadow-[0_4px_0_0_#E5E5E5] hover:shadow-[0_8px_0_0_#E5E5E5] transition-all"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border-b-4 border-indigo-100">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{doubt.mcq.subject.name}</p>
                      <h3 className="font-display font-black text-slate-800 leading-tight">{doubt.mcq.question.substring(0, 80)}...</h3>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                      {doubt.student.user.avatar ? (
                        <img src={doubt.student.user.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-black text-slate-400">{doubt.student.user.name[0]}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 mb-6">
                  <div className="flex gap-3">
                    <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-slate-700 italic">
                      "{doubt.messages[0]?.content}"
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {activeDoubt === doubt.id ? (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4"
                    >
                      <textarea
                        placeholder="Write your explanation here... be clear and helpful!"
                        className="w-full h-32 rounded-2xl border-2 border-indigo-100 p-4 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all resize-none"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                      />
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          onClick={() => setActiveDoubt(null)}
                          className="rounded-xl font-bold text-slate-400"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => handleAnswer(doubt.id)}
                          disabled={loading || !answer.trim()}
                          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : "Post Answer"}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        Be the first to help
                      </span>
                      <Button 
                        onClick={() => setActiveDoubt(doubt.id)}
                        className="rounded-xl bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-black shadow-sm transition-all px-6"
                      >
                        Answer Doubt
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityDoubts;
