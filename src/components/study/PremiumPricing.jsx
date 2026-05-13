'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Trophy, 
  ShieldCheck, 
  Users, 
  BrainCircuit,
  MessageSquare,
  Award,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for casual learners",
    icon: <Sparkles className="w-6 h-6 text-slate-400" />,
    features: [
      "5 AI Credits daily",
      "Chapter Practice MCQs",
      "Basic Performance Stats",
      "Public Study Tribes"
    ],
    cta: "Current Plan",
    featured: false,
    color: "slate"
  },
  {
    name: "Student PRO",
    price: "499",
    period: "/mo",
    description: "Our most popular plan for toppers",
    icon: <Crown className="w-6 h-6 text-amber-500" />,
    features: [
      "UNLIMITED AI Tutor",
      "UNLIMITED Visual Solving",
      "National Mock Exams",
      "AI Chapter Storyboards",
      "Advanced Study Roadmap",
      "No Ads (Coming Soon)"
    ],
    cta: "Go Premium",
    featured: true,
    color: "amber"
  },
  {
    name: "Institution",
    price: "Custom",
    description: "For schools and coaching centers",
    icon: <Users className="w-6 h-6 text-indigo-500" />,
    features: [
      "Everything in PRO",
      "Teacher Dashboard",
      "Bulk Student Licensing",
      "Custom Exam Creation",
      "Advanced School Analytics"
    ],
    cta: "Contact Sales",
    featured: false,
    color: "indigo"
  }
];

const PremiumPricing = () => {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleUpgrade = (planName) => {
    if (planName === "Free") return;
    setLoadingPlan(planName);
    
    // Simulate checkout
    setTimeout(() => {
      setLoadingPlan(null);
      toast.success(`Welcome to ${planName}! Your premium features are now active.`);
      // In a real app, this would redirect to Stripe/EasyPaisa
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-indigo-500">Pricing Plans</h2>
        <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900">
          Supercharge your <span className="text-indigo-600 underline decoration-indigo-200">learning</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Choose the plan that fits your study goals. Join thousands of students already using Imtihan PRO.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`
              relative flex flex-col p-8 rounded-[3rem] border-2 transition-all duration-300
              ${plan.featured 
                ? 'bg-gradient-to-br from-indigo-900 to-indigo-800 border-indigo-700 text-white shadow-2xl scale-105 z-10' 
                : 'bg-white border-slate-100 text-slate-800 hover:border-indigo-100'}
            `}
          >
            {plan.featured && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Zap className="w-3 h-3 fill-current" />
                MOST POPULAR
              </div>
            )}

            <div className="mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-b-4 ${plan.featured ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'}`}>
                {plan.icon}
              </div>
              <h3 className="text-2xl font-display font-black">{plan.name}</h3>
              <p className={`text-sm font-medium mt-1 ${plan.featured ? 'text-indigo-200' : 'text-slate-400'}`}>
                {plan.description}
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">
                  {plan.price !== "Custom" && "Rs."}{plan.price}
                </span>
                {plan.period && <span className={`text-sm font-bold ${plan.featured ? 'text-indigo-300' : 'text-slate-400'}`}>{plan.period}</span>}
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-10">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-1 rounded-full p-0.5 flex-shrink-0 ${plan.featured ? 'bg-indigo-400/20 text-indigo-300' : 'bg-emerald-50 text-emerald-500'}`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-sm font-bold ${plan.featured ? 'text-indigo-50' : 'text-slate-600'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleUpgrade(plan.name)}
              disabled={loadingPlan === plan.name || plan.name === "Free"}
              className={`
                w-full h-14 rounded-2xl font-black text-lg transition-all border-b-4
                ${plan.featured 
                  ? 'bg-white text-indigo-900 hover:bg-teal-50 border-indigo-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-800'}
                ${plan.name === "Free" ? 'opacity-50 cursor-default grayscale' : ''}
              `}
            >
              {loadingPlan === plan.name ? "Processing..." : plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: "AI Tutor", icon: <BrainCircuit /> },
          { label: "Secure", icon: <ShieldCheck /> },
          { label: "Community", icon: <MessageSquare /> },
          { label: "Results", icon: <Trophy /> }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2 opacity-30">
            <div className="text-slate-900">{item.icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumPricing;
