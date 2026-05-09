"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ArrowRight, 
  Bell, 
  Rocket, 
  GraduationCap, 
  CheckCircle2,
  Trophy,
  Zap,
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import WaitlistForm from "@/components/landing/WaitlistForm";

// Custom Social Icons
const InstagramIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const TwitterIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const FacebookIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const LinkedinIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

// App Logo Component
const ImtihanLogo = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 96
  };
  
  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg shadow-teal-600/20 ${className}`} style={{ width: sizes[size], height: sizes[size] }}>
      <Image 
        src="/logo.png" 
        alt="Imtihan Logo" 
        width={sizes[size]} 
        height={sizes[size]} 
        className="object-contain"
      />
    </div>
  );
};

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { q: "Which boards are supported?", a: "We currently support FBISE, BISE Lahore, BISE Karachi, BISE Peshawar, and all major provincial boards in Pakistan." },
    { q: "Is the AI tutor available in Urdu?", a: "Yes! Our AI tutor is fully bilingual and can explain complex scientific concepts in both English and Urdu." },
    { q: "Can I use it for MDCAT and ECAT?", a: "Absolutely. Imtihan includes specialized modules for competitive exams like MDCAT, ECAT, and CSS with past paper analysis." },
    { q: "How much does it cost?", a: "During our development phase, joining the waitlist gives you early bird access and special discounts when we launch!" }
  ];

  const scrollToWaitlist = () => {
    document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-mesh selection:bg-teal-200 relative overflow-x-hidden w-full">
      {/* Subtle background decorative elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gold-200/20 rounded-full blur-[120px] animate-pulse-slow" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 md:gap-3"
        >
          <ImtihanLogo size="sm" className="md:hidden" />
          <ImtihanLogo size="md" className="hidden md:block" />
          <span className="font-display font-bold text-xl md:text-2xl tracking-tight text-teal-900">
            imtihan
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 md:gap-4"
        >
          <div className="hidden sm:flex items-center gap-3 md:gap-4 mr-2 md:mr-4 border-r border-teal-900/10 pr-2 md:pr-4">
            <Link href="https://instagram.com/imtihanapp" target="_blank" className="text-teal-900/40 hover:text-teal-600 transition-colors">
              <InstagramIcon className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
            <Link href="https://twitter.com/imtihanapp" target="_blank" className="text-teal-900/40 hover:text-teal-600 transition-colors">
              <TwitterIcon className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
            <Link href="https://linkedin.com/company/imtihanapp" target="_blank" className="text-teal-900/40 hover:text-teal-600 transition-colors">
              <LinkedinIcon className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
          <Button onClick={scrollToWaitlist} variant="ghost" className="text-teal-900 font-semibold text-sm md:text-base hover:bg-white/50 backdrop-blur-sm px-3 md:px-4">
            Contact Us
          </Button>
        </motion.div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 space-y-20 md:space-y-32 overflow-x-hidden">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:space-y-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/50 text-teal-600 font-bold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-pulse" /> Under Development
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-display font-extrabold tracking-tight text-teal-900 leading-[1.2] lg:leading-[1.1] break-words">
              The Future of <span className="text-gradient">Board Exam</span> Prep is Coming.
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-teal-900/70 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Personalized AI notes, interactive quizzes, and past paper insights. Specifically designed for students in Pakistan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Button onClick={scrollToWaitlist} size="lg" className="w-full sm:w-auto h-16 px-8 rounded-2xl font-bold text-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-600/30 transition-all hover:scale-105 active:scale-95 flex gap-2">
                Join the Waitlist <ArrowRight className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-2 text-teal-900/60 font-semibold">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-teal-100 flex items-center justify-center overflow-hidden">
                       <Image src={`https://i.pravatar.cc/150?u=${i}`} width={40} height={40} alt="User" />
                    </div>
                  ))}
                </div>
                <span className="text-sm md:text-base ml-2">Join 500+ students</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            className="relative mt-12 lg:mt-0"
          >
            <div className="relative aspect-square w-full max-w-[500px] lg:max-w-[600px] mx-auto animate-float">
              {/* Glass cards floating around - hidden or repositioned on small mobile */}
              <div className="absolute top-0 left-0 sm:-left-4 md:top-10 md:-left-10 z-20 glass p-3 md:p-6 rounded-2xl md:rounded-3xl border border-white/50 shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-gold-400 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 className="w-5 h-5 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-teal-900 text-xs md:text-base">Quiz Mastery</p>
                    <p className="text-[10px] md:text-sm text-teal-900/60 font-medium">98% Accuracy</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 sm:-right-4 md:-bottom-5 md:-right-5 z-20 glass p-3 md:p-6 rounded-2xl md:rounded-3xl border border-white/50 shadow-2xl animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-crimson-400 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Bell className="w-5 h-5 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-teal-900 text-xs md:text-base">Next Alert</p>
                    <p className="text-[10px] md:text-sm text-teal-900/60 font-medium">Launching Soon</p>
                  </div>
                </div>
              </div>

              <div className="relative w-full h-full rounded-[3rem] md:rounded-[4rem] overflow-hidden border-[6px] md:border-[8px] border-white shadow-2xl">
                <Image 
                  src="/hero-illustration.png" 
                  fill 
                  className="object-cover" 
                  alt="Imtihan App Preview" 
                  priority
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Meet Your AI Tutor Section */}
        <section className="space-y-8 md:space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-extrabold text-teal-900 break-words">Meet Your AI Study Buddy</h2>
            <p className="text-lg md:text-xl text-teal-900/60">Ask anything, anytime. Our AI understands your syllabus better than a textbook.</p>
          </div>
          
          <div className="max-w-4xl mx-auto glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border border-white/50 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6 md:mb-8 border-b border-teal-900/5 pb-4">
              <ImtihanLogo size="sm" />
              <div>
                <p className="font-bold text-teal-900">Imtihan AI Tutor</p>
                <p className="text-[10px] text-teal-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" /> Online
                </p>
              </div>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="flex justify-start">
                <div className="bg-white/50 rounded-2xl rounded-tl-none p-3 md:p-4 max-w-[90%] md:max-w-[80%] text-teal-900 text-sm md:text-base font-medium shadow-sm">
                  Can you explain the Law of Conservation of Momentum in simple Urdu?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-teal-600 text-white rounded-2xl rounded-tr-none p-3 md:p-4 max-w-[90%] md:max-w-[80%] shadow-lg">
                  <p className="font-urdu text-right text-base md:text-lg leading-relaxed mb-2">
                    بالکل! جب دو چیزیں آپس میں ٹکراتی ہیں، تو ان کا کل مومینٹم تبدیل نہیں ہوتا، بشرطیکہ کوئی باہر کی طاقت اثر نہ کرے۔
                  </p>
                  <p className="text-[10px] md:text-sm opacity-90">
                    Think of it like a game of marbles: the energy just gets passed from one to another! 🎱
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 items-center bg-white/50 rounded-2xl p-3 md:p-4 border border-teal-900/5">
              <div className="flex-1 text-teal-900/40 text-sm md:text-base font-medium">Ask a question...</div>
              <Button size="icon" className="bg-teal-600 rounded-xl w-10 h-10 md:w-12 md:h-12"><ArrowRight className="w-5 h-5" /></Button>
            </div>
          </div>
        </section>

        {/* Master Your Syllabus Section */}
        <section className="space-y-12 md:space-y-16 bg-white/30 -mx-6 px-6 py-16 md:py-24 rounded-[3rem] md:rounded-[4rem]">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-extrabold text-teal-900 break-words">Master Your Syllabus</h2>
            <p className="text-lg md:text-xl text-teal-900/60">Comprehensive coverage for all major boards and competitive exams.</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "FBISE", desc: "Federal Board" },
              { name: "BISE LHR", desc: "Punjab Board" },
              { name: "BISE KHI", desc: "Sindh Board" },
              { name: "BISE PEW", desc: "KPK Board" },
              { name: "MDCAT", desc: "Medical Entry" },
              { name: "ECAT", desc: "Engineering" },
              { name: "CSS", desc: "Competitive" },
              { name: "AKU-EB", desc: "Aga Khan Board" }
            ].map((board, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
                className="glass p-4 md:p-8 rounded-2xl md:rounded-3xl border border-white/50 text-center space-y-1 md:space-y-2 transition-all cursor-default shadow-sm hover:shadow-xl"
              >
                <p className="text-lg sm:text-xl md:text-2xl font-display font-black text-teal-900">{board.name}</p>
                <p className="text-[10px] md:text-sm font-bold text-teal-600/60 uppercase tracking-tighter">{board.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Gamified Learning Section */}
        <section className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-extrabold text-teal-900 leading-tight break-words">Learning That Feels Like a Game</h2>
            <p className="text-lg md:text-xl text-teal-900/60 leading-relaxed">
              Ditch the boring textbooks. Earn XP, build your streak, and unlock achievements as you master each chapter. Competition has never been this fun.
            </p>
            
            <ul className="space-y-6 text-left max-w-xl mx-auto lg:mx-0">
              {[
                { icon: Zap, color: "text-gold-400", title: "Daily Streaks", desc: "Build consistency and earn bonus rewards." },
                { icon: Trophy, color: "text-teal-500", title: "Global Leaderboards", desc: "Compete with students across Pakistan." },
                { icon: CheckCircle2, color: "text-crimson-400", title: "Skill Badges", desc: "Show off your mastery in specific topics." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-md flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-teal-900 text-base md:text-lg">{item.title}</p>
                    <p className="text-teal-900/50 text-sm md:text-base font-medium">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative group mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gold-400/20 blur-[60px] md:blur-[100px] rounded-full group-hover:bg-teal-400/20 transition-all duration-1000" />
            <div className="relative glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/50 shadow-2xl space-y-6 md:space-y-8 overflow-hidden">
               <div className="flex justify-between items-center border-b border-teal-900/5 pb-4 md:pb-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-2xl md:text-3xl">🔥</div>
                    <div>
                      <p className="text-2xl md:text-3xl font-display font-black text-teal-900">14 Days</p>
                      <p className="text-[10px] md:text-sm font-bold text-teal-600 uppercase">Current Streak</p>
                    </div>
                  </div>
                  <Trophy className="w-8 h-8 md:w-12 md:h-12 text-gold-400" />
               </div>
               
               <div className="space-y-4">
                  <p className="font-bold text-teal-900 text-sm md:text-base">Recent Achievements</p>
                  <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                      { icon: "🧪", label: "Chem Wizard" },
                      { icon: "📐", label: "Math Pro" },
                      { icon: "⚡", label: "Quick Solver" },
                      { icon: "📚", label: "Night Owl" }
                    ].map((badge, i) => (
                      <div key={i} className="flex-shrink-0 w-20 h-24 md:w-24 md:h-28 glass rounded-2xl flex flex-col items-center justify-center border border-white/50 shadow-sm">
                        <span className="text-2xl md:text-3xl mb-2">{badge.icon}</span>
                        <span className="text-[8px] md:text-[10px] font-black text-teal-900 uppercase text-center px-1">{badge.label}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-12 md:space-y-16 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-extrabold text-teal-900">Frequently Asked Questions</h2>
            <p className="text-lg md:text-xl text-teal-900/60">Everything you need to know about Imtihan.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className={`glass rounded-2xl md:rounded-3xl border border-white/50 overflow-hidden transition-all duration-300 ${activeFaq === i ? 'shadow-lg bg-white/80' : 'hover:bg-white/40'}`}
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-6 md:p-8 text-left flex justify-between items-center group"
                >
                  <span className="text-lg md:text-xl font-bold text-teal-900 group-hover:text-teal-600 transition-colors pr-4">{faq.q}</span>
                  <ChevronDown className={`flex-shrink-0 w-5 h-5 md:w-6 md:h-6 text-teal-400 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <motion.div 
                  initial={false}
                  animate={{ height: activeFaq === i ? 'auto' : 0, opacity: activeFaq === i ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 md:p-8 pt-0 text-teal-900/70 font-medium text-base md:text-lg leading-relaxed border-t border-teal-900/5 mt-2">
                    {faq.a}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA / Waitlist Form Section */}
        <section id="waitlist-form" className="relative glass rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 lg:p-24 overflow-hidden border border-white/50 shadow-2xl text-center space-y-8 md:space-y-12">
          <div className="absolute top-0 left-0 w-full h-full bg-teal-600 opacity-[0.03] pointer-events-none" />
          <ImtihanLogo size="lg" className="mx-auto" />
          <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-display font-extrabold text-teal-900">Ready to transform your preparation?</h2>
            <p className="text-lg md:text-xl lg:text-2xl text-teal-900/60 font-medium">Join the waitlist today and get exclusive early access to the smartest AI tutor in Pakistan.</p>
          </div>
          
          <WaitlistForm />
          
          <p className="text-teal-900/40 font-bold uppercase tracking-widest text-xs md:text-sm pt-4">Launching in Summer 2026</p>
        </section>
      </main>

      {/* Footer / Social Proof */}
      <footer className="relative z-10 w-full border-t border-teal-900/5 py-12 md:py-16 text-center px-6">
        <p className="text-teal-900/40 font-bold uppercase tracking-widest text-[10px] md:text-sm mb-8 md:mb-12">Building the future of Pakistani Education</p>
        
        <div className="flex justify-center gap-4 md:gap-6 mb-8 md:mb-12">
          {[
            { name: "Instagram", icon: InstagramIcon, url: "https://instagram.com/imtihanapp" },
            { name: "Twitter", icon: TwitterIcon, url: "https://twitter.com/imtihanapp" },
            { name: "Facebook", icon: FacebookIcon, url: "https://facebook.com/imtihanapp" },
            { name: "LinkedIn", icon: LinkedinIcon, url: "https://linkedin.com/company/imtihanapp" },
          ].map((social, i) => (
            <motion.a
              key={i}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5, scale: 1.1 }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl glass flex items-center justify-center text-teal-900/60 hover:text-teal-600 border border-white/50 shadow-lg transition-colors"
            >
              <social.icon className="w-5 h-5 md:w-6 md:h-6" />
            </motion.a>
          ))}
        </div>

        <p className="text-teal-900/30 font-medium text-sm">© {new Date().getFullYear()} Imtihan. All rights reserved.</p>
      </footer>
    </div>
  );
}
