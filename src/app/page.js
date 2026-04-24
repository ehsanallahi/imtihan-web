import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Target, Trophy, ArrowRight, Star, Sparkles, Check } from "lucide-react";
import { auth } from "@/auth";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans flex flex-col selection:bg-teal-200">
      
      {/* 
        ========================================
        MARKETING NAVIGATION BAR
        ========================================
      */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#00CD9C] border-b-4 border-[#00A880] flex items-center justify-center text-white font-black text-xl group-hover:-translate-y-1 transition-transform">
              I
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-[#3C3C3C]">
              imtihan
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-bold text-[#777777]">
            <Link href="#features" className="hover:text-[#00CD9C] transition-colors">Why Imtihan?</Link>
            <Link href="#pricing" className="hover:text-[#00CD9C] transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/study">
                <Button className="h-10 px-6 rounded-xl font-bold uppercase tracking-wide bg-[#00CD9C] hover:bg-[#00D9A6] text-white border-b-4 border-[#00A880] active:border-b-0 active:translate-y-1 transition-all">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="h-10 px-4 rounded-xl font-bold uppercase tracking-wide text-[#1CB0F6] hover:bg-[#E5F6FF]">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="h-10 px-6 rounded-xl font-bold uppercase tracking-wide bg-[#00CD9C] hover:bg-[#00D9A6] text-white border-b-4 border-[#00A880] active:border-b-0 active:translate-y-1 transition-all">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* 
          ========================================
          HERO SECTION
          ========================================
        */}
        <section className="w-full max-w-6xl mx-auto px-4 py-16 sm:py-24 lg:py-32 flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
          
          <div className="flex-1 space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFE4E1] border-2 border-[#FFC4C4] text-[#FF4B4B] font-bold text-sm uppercase tracking-wide animate-bounce">
              <Sparkles className="w-4 h-4" /> The fun way to ace your exams
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-[#3C3C3C] leading-tight">
              Learn, Practice, and <span className="text-[#00CD9C]">Score High.</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-[#777777] font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Imtihan is the smartest way to prepare for your board exams. Bite-sized AI notes and interactive quizzes that feel like a game.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link href="/study" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black text-lg uppercase tracking-wider bg-[#00CD9C] hover:bg-[#00D9A6] text-white border-b-[6px] border-[#00A880] active:border-b-0 active:translate-y-[6px] transition-all">
                  Start Learning Now
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black text-lg uppercase tracking-wider text-[#1CB0F6] border-2 border-[#E5E5E5] hover:bg-[#F0F0F0] border-b-[6px] active:border-b-[2px] active:translate-y-[4px] transition-all">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-none relative">
            {/* Playful Hero Illustration Placeholder */}
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-[#00CD9C] rounded-[3rem] rotate-6 opacity-20"></div>
              <div className="absolute inset-0 bg-[#1CB0F6] rounded-[3rem] -rotate-3 opacity-20"></div>
              <div className="relative h-full w-full bg-white rounded-[3rem] border-4 border-[#E5E5E5] shadow-[0_12px_0_0_#E5E5E5] flex items-center justify-center p-8 overflow-hidden">
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="w-32 h-32 bg-[#FFD900] rounded-full border-4 border-[#E5C300] flex items-center justify-center shadow-[0_8px_0_0_#E5C300]">
                    <Trophy className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="font-display font-extrabold text-2xl text-[#3C3C3C]">Daily Streak!</h3>
                  <div className="w-full max-w-xs h-4 bg-[#E5E5E5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00CD9C] w-3/4 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    <div className="bg-[#E5F6FF] border-2 border-[#B3E5FF] rounded-2xl p-4 font-bold text-[#1CB0F6]">
                      Option A
                    </div>
                    <div className="bg-[#00CD9C] border-b-4 border-[#00A880] rounded-2xl p-4 font-bold text-white shadow-[0_4px_0_0_#00A880]">
                      Option B
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 
          ========================================
          FEATURES SECTION
          ========================================
        */}
        <section id="features" className="w-full py-24 bg-white border-y-2 border-slate-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-extrabold tracking-tight text-[#3C3C3C]">
                Why you'll love studying with us
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BrainCircuit,
                  color: "bg-[#FF4B4B]",
                  borderColor: "border-[#D93838]",
                  textColor: "text-[#FF4B4B]",
                  title: "AI-Powered Notes",
                  desc: "Say goodbye to boring textbooks. Our AI summarizes chapters into easy-to-digest, bilingual notes."
                },
                {
                  icon: Target,
                  color: "bg-[#1CB0F6]",
                  borderColor: "border-[#1899D6]",
                  textColor: "text-[#1CB0F6]",
                  title: "Bite-Sized Quizzes",
                  desc: "Practice with hundreds of MCQs tailored to your specific board and grade. Learn from your mistakes instantly."
                },
                {
                  icon: Star,
                  color: "bg-[#FFD900]",
                  borderColor: "border-[#E5C300]",
                  textColor: "text-[#D9A300]",
                  title: "Stay Motivated",
                  desc: "Build your streak, earn badges, and watch your scores climb as you master each subject."
                }
              ].map((feature, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-8 rounded-[2rem] border-2 border-[#E5E5E5] hover:-translate-y-2 transition-transform duration-300">
                  <div className={`w-20 h-20 rounded-2xl ${feature.color} border-b-[6px] ${feature.borderColor} flex items-center justify-center mb-6`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className={`text-2xl font-display font-extrabold mb-4 ${feature.textColor}`}>
                    {feature.title}
                  </h3>
                  <p className="text-[#777777] font-medium leading-relaxed text-lg">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 
          ========================================
          PRICING SECTION
          ========================================
        */}
        <section id="pricing" className="w-full py-24 bg-[#F7F7F7]">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-extrabold tracking-tight text-[#3C3C3C] mb-4">
                Simple, straightforward pricing
              </h2>
              <p className="text-[#777777] font-medium text-xl">Start for free, upgrade when you're ready to ace your exams.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white rounded-[2rem] border-2 border-[#E5E5E5] p-8 flex flex-col shadow-[0_8px_0_0_#E5E5E5]">
                <h3 className="text-2xl font-display font-extrabold text-[#3C3C3C] mb-2">Basic</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black text-[#3C3C3C]">Rs. 0</span>
                  <span className="text-[#777777] font-bold">/ forever</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {[
                    "Access to Chapter 1 of all subjects",
                    "Basic AI study notes",
                    "Limited daily practice questions"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 font-medium text-[#777777] text-lg">
                      <div className="w-6 h-6 rounded-full bg-[#E5F6FF] flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-[#1CB0F6] stroke-[3]" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-lg uppercase tracking-wider text-[#1CB0F6] border-2 border-[#E5E5E5] hover:bg-[#F0F0F0] border-b-[6px] active:border-b-[2px] active:translate-y-[4px] transition-all">
                    Create Free Account
                  </Button>
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="bg-[#1CB0F6] rounded-[2rem] border-2 border-[#1899D6] p-8 flex flex-col shadow-[0_8px_0_0_#1899D6] relative transform md:-translate-y-4">
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <div className="bg-[#FFD900] text-[#D9A300] text-sm font-black uppercase tracking-wider py-1 px-4 rounded-full border-2 border-[#E5C300]">
                    Most Popular
                  </div>
                </div>
                
                <h3 className="text-2xl font-display font-extrabold text-white mb-2">Imtihan Super</h3>
                <div className="flex items-baseline gap-1 mb-6 text-white">
                  <span className="text-5xl font-black">Rs. 999</span>
                  <span className="opacity-80 font-bold">/ month</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {[
                    "Unlimited access to all chapters",
                    "Unlimited practice quizzes",
                    "Full Mock Exams & Past Papers",
                    "Detailed performance analytics",
                    "Priority AI support"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 font-medium text-white text-lg">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <Link href="/pricing">
                  <Button className="w-full h-14 rounded-2xl font-black text-lg uppercase tracking-wider bg-white hover:bg-[#F0F0F0] text-[#1CB0F6] border-b-[6px] border-[#E5E5E5] active:border-b-[2px] active:translate-y-[4px] transition-all">
                    Get Super
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 
        ========================================
        MARKETING FOOTER
        ========================================
      */}
      <footer className="w-full bg-[#3C3C3C] py-12 text-center text-[#AFAFAF]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#00CD9C] flex items-center justify-center text-white font-black">
              I
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-white">
              imtihan
            </span>
          </div>
          <p className="font-medium mb-6">© {new Date().getFullYear()} Imtihan. Building the future of education in Pakistan.</p>
        </div>
      </footer>
    </div>
  );
}
