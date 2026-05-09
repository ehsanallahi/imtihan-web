"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/actions/waitlist";
import { Rocket, CheckCircle2, Loader2, Sparkles, ChevronDown } from "lucide-react";

export default function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.target);
    const result = await joinWaitlist(formData);

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error || "Something went wrong");
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="space-y-3 md:space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <Input
                name="name"
                placeholder="Full Name"
                required
                className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-white/50 border-teal-900/10 focus:ring-teal-600 text-base md:text-lg font-medium"
              />
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-white/50 border-teal-900/10 focus:ring-teal-600 text-base md:text-lg font-medium"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <Input
                name="phone"
                placeholder="WhatsApp (Optional)"
                className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-white/50 border-teal-900/10 focus:ring-teal-600 text-base md:text-lg font-medium"
              />
              <div className="relative">
                <select
                  name="grade"
                  className="w-full h-12 md:h-14 px-4 rounded-xl md:rounded-2xl bg-white/50 border border-teal-900/10 focus:outline-none focus:ring-2 focus:ring-teal-600 text-base md:text-lg font-medium appearance-none"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>Select Your Grade</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="MDCAT/ECAT">MDCAT/ECAT</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-600/30 transition-all flex gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> Joining...
                </>
              ) : (
                <>
                  Join the Waitlist <Rocket className="w-5 h-5 md:w-6 md:h-6" />
                </>
              )}
            </Button>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 font-bold text-center bg-red-50 p-2 md:p-3 rounded-lg md:rounded-xl border border-red-100 text-sm md:text-base"
              >
                {error}
              </motion.p>
            )}
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 md:p-12 glass rounded-[2rem] md:rounded-[3rem] border border-teal-200 bg-white/80 shadow-2xl space-y-3 md:space-y-4"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-teal-600" />
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-black text-teal-900">You're on the list!</h3>
            <p className="text-base md:text-lg text-teal-900/60 font-medium">
              Thank you for joining. We'll notify you as soon as early access begins!
            </p>
            <div className="pt-4 md:pt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gold-100 text-gold-700 font-bold text-xs md:text-sm uppercase tracking-wider">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" /> Priority Access Unlocked
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
