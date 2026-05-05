"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function MarketingHeader({ session }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#00CD9C] border-b-4 border-[#00A880] flex items-center justify-center text-white font-black text-xl group-hover:-translate-y-1 transition-transform">
            I
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-[#3C3C3C]">
            imtihan
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 font-bold text-[#777777]">
          <Link href="#features" className="hover:text-[#00CD9C] transition-colors">Why Imtihan?</Link>
          <Link href="#pricing" className="hover:text-[#00CD9C] transition-colors">Pricing</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
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

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-[#3C3C3C] hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b-2 border-slate-200 py-6 px-4 space-y-6 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4 font-bold text-[#777777]">
            <Link 
              href="#features" 
              className="hover:text-[#00CD9C] transition-colors text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Why Imtihan?
            </Link>
            <Link 
              href="#pricing" 
              className="hover:text-[#00CD9C] transition-colors text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
            {session ? (
              <Link href="/study" className="w-full">
                <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-wide bg-[#00CD9C] hover:bg-[#00D9A6] text-white border-b-4 border-[#00A880] active:border-b-0 active:translate-y-1 transition-all">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className="w-full">
                  <Button variant="ghost" className="w-full h-12 rounded-xl font-bold uppercase tracking-wide text-[#1CB0F6] hover:bg-[#E5F6FF]">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-wide bg-[#00CD9C] hover:bg-[#00D9A6] text-white border-b-4 border-[#00A880] active:border-b-0 active:translate-y-1 transition-all">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
