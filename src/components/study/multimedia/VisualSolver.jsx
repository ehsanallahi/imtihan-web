'use client'

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Loader2, 
  X, 
  BrainCircuit,
  Eye,
  RotateCcw,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { solveVisualProblem } from '@/actions/visualActions';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const VisualSolver = () => {
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState(null);
  const [mimeType, setMimeType] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setMimeType(file.type);
        // Extract base64 without prefix
        const base64String = reader.result.split(',')[1];
        setBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!base64) return;
    setLoading(true);
    setResult(null);
    
    const res = await solveVisualProblem(base64, mimeType, prompt);
    setLoading(false);
    
    if (res.success) {
      setResult(res.explanation);
    } else {
      toast.error(res.error);
    }
  };

  const reset = () => {
    setImage(null);
    setBase64(null);
    setMimeType(null);
    setResult(null);
    setPrompt("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border-b-4 border-indigo-100">
          <Eye className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-display font-black text-slate-800">Visual Problem Solver</h1>
        <p className="text-slate-500 font-medium max-w-md mx-auto">
          Snap a photo of any diagram, circuit, or handwritten problem to get a step-by-step solution.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left: Upload/Preview */}
        <div className="space-y-6">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-[3rem] border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
            >
              <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-10 h-10 text-indigo-500" />
              </div>
              <p className="font-black text-slate-800">Tap to Upload or Capture</p>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">PNG, JPG up to 10MB</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="relative aspect-square rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl">
              <img src={image} alt="Problem Preview" className="w-full h-full object-cover" />
              <button 
                onClick={reset}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="space-y-4">
            <textarea
              placeholder="Any specific question about this image? (Optional)"
              className="w-full h-24 rounded-2xl border-2 border-slate-100 p-4 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button 
              onClick={handleSolve}
              disabled={loading || !base64}
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg shadow-indigo-600/20 gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Solve Problem
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right: Result */}
        <div className="h-full">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[3rem] border-2 border-indigo-100 p-8 sm:p-10 shadow-xl h-full flex flex-col"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-black text-slate-800">AI Analysis</h2>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Step-by-step Solution</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div className="prose prose-sm prose-indigo max-w-none">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                  <Button variant="outline" onClick={reset} className="flex-1 h-12 rounded-xl font-bold gap-2">
                    <RotateCcw className="w-4 h-4" />
                    New Problem
                  </Button>
                  <Button variant="ghost" className="h-12 w-12 rounded-xl border-2 border-slate-100 flex items-center justify-center">
                    <Send className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-12 text-slate-300">
                <BrainCircuit className="w-20 h-20 mb-6 opacity-20" />
                <p className="font-bold">The AI's step-by-step solution will appear here after analysis.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VisualSolver;
