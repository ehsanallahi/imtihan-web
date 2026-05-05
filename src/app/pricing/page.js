'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Star, Loader2, CreditCard, ChevronLeft } from "lucide-react"
import { simulateSubscriptionPurchase } from "@/actions/subscriptionActions"

export default function PricingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSimulatedPayment = async (plan) => {
    if (status !== "authenticated") {
      router.push("/auth/signin?callbackUrl=/pricing")
      return
    }

    setIsProcessing(true)
    const result = await simulateSubscriptionPurchase(plan)
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push("/study")
      }, 2000)
    } else {
      alert("Payment failed: " + result.error)
      setIsProcessing(false)
    }
  }

  const [promoCode, setPromoCode] = useState("")
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState("")
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)

  const handleApplyPromo = async () => {
    if (!promoCode) return
    setIsValidatingPromo(true)
    setPromoError("")
    
    try {
      const { validatePromoCode } = await import("@/actions/promoActions")
      const result = await validatePromoCode(promoCode)
      if (result.success) {
        setPromoDiscount(result.discountPercent)
        setPromoCode(promoCode.toUpperCase())
      } else {
        setPromoError(result.error)
        setPromoDiscount(0)
      }
    } catch (err) {
      setPromoError("Failed to validate code")
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const calculatePrice = (basePrice) => {
    if (promoDiscount === 0) return basePrice
    const discounted = basePrice * (1 - promoDiscount / 100)
    return Math.floor(discounted)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[2rem] shadow-xl text-center max-w-md w-full border-2 border-emerald-100">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-emerald-500 stroke-[3]" />
          </div>
          <h2 className="text-3xl font-display font-black text-slate-800 mb-2">Payment Successful!</h2>
          <p className="text-slate-500 font-medium mb-6">Welcome to Imtihan Premium. Redirecting you to your dashboard...</p>
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans flex flex-col selection:bg-teal-200">
      <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center">
          <Link href="/study" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFF5CC] border-2 border-[#FFD900] text-[#D9A300] font-bold text-sm uppercase tracking-wide mb-6">
            <Star className="w-4 h-4" /> Unlock Your Potential
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-[#3C3C3C] mb-4">
            Level up your exam prep.
          </h1>
          <p className="text-[#777777] font-medium text-xl max-w-2xl mx-auto">
            Get unlimited access to AI study notes, endless practice quizzes, and full mock exams to guarantee your success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Monthly Plan */}
          <div className="bg-white rounded-[2rem] border-2 border-[#E5E5E5] p-8 flex flex-col shadow-[0_8px_0_0_#E5E5E5] hover:-translate-y-1 hover:shadow-[0_12px_0_0_#E5E5E5] transition-all">
            <h3 className="text-2xl font-display font-extrabold text-[#3C3C3C] mb-2">Monthly Super</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <div className="flex flex-col">
                {promoDiscount > 0 && (
                  <span className="text-lg text-slate-400 line-through font-bold">Rs. 999</span>
                )}
                <span className="text-5xl font-black text-[#3C3C3C]">Rs. {calculatePrice(999)}</span>
              </div>
              <span className="text-[#777777] font-bold">/ month</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Unlimited access to all chapters",
                "Unlimited practice quizzes",
                "Full Mock Exams & Past Papers",
                "Detailed performance analytics",
                "Cancel anytime"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium text-[#777777] text-lg">
                  <div className="w-6 h-6 rounded-full bg-[#E5F6FF] flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-[#1CB0F6] stroke-[3]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            
            <Button 
              onClick={() => handleSimulatedPayment('student_monthly')}
              disabled={isProcessing}
              className="w-full h-14 rounded-2xl font-black text-lg uppercase tracking-wider bg-[#1CB0F6] hover:bg-[#1899D6] text-white border-b-[6px] border-[#1582B7] active:border-b-[2px] active:translate-y-[4px] transition-all flex items-center gap-2"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              Subscribe Monthly
            </Button>
            <p className="text-center text-xs text-slate-400 mt-4 font-bold uppercase tracking-wider">Simulated Payment</p>
          </div>

          {/* Yearly Plan */}
          <div className="bg-[#FFD900] rounded-[2rem] border-2 border-[#E5C300] p-8 flex flex-col shadow-[0_8px_0_0_#E5C300] relative transform md:-translate-y-4 hover:-translate-y-5 hover:shadow-[0_12px_0_0_#E5C300] transition-all">
            <div className="absolute -top-4 right-8">
              <div className="bg-[#FF4B4B] text-white text-sm font-black uppercase tracking-wider py-1.5 px-4 rounded-xl border-2 border-[#D93838] shadow-sm transform rotate-3">
                Save 20%
              </div>
            </div>
            
            <h3 className="text-2xl font-display font-extrabold text-[#D9A300] mb-2">Yearly Super</h3>
            <div className="flex items-baseline gap-1 mb-6 text-[#806000]">
              <div className="flex flex-col">
                {promoDiscount > 0 && (
                  <span className="text-lg opacity-60 line-through font-bold">Rs. 9,999</span>
                )}
                <span className="text-5xl font-black">Rs. {calculatePrice(9999)}</span>
              </div>
              <span className="opacity-80 font-bold">/ year</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Everything in Monthly",
                "2 months entirely free",
                "Priority AI tutor support",
                "Exclusive exam tips & tricks guide"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium text-[#806000] text-lg">
                  <div className="w-6 h-6 rounded-full bg-white/40 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-[#D9A300] stroke-[3]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            
            <Button 
              onClick={() => handleSimulatedPayment('student_yearly')}
              disabled={isProcessing}
              className="w-full h-14 rounded-2xl font-black text-lg uppercase tracking-wider bg-white hover:bg-[#F0F0F0] text-[#D9A300] border-b-[6px] border-[#E5E5E5] active:border-b-[2px] active:translate-y-[4px] transition-all flex items-center gap-2"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              Subscribe Yearly
            </Button>
            <p className="text-center text-xs text-[#B38800] mt-4 font-bold uppercase tracking-wider">Simulated Payment</p>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-[0_4px_0_0_#E5E5E5]">
          <h4 className="text-lg font-display font-bold text-slate-700 mb-4">Have a promo code?</h4>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="ENTER CODE" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 font-black tracking-wider focus:border-teal-400 focus:outline-none transition-colors"
                disabled={promoDiscount > 0}
              />
              {promoDiscount > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
              )}
            </div>
            {promoDiscount === 0 ? (
              <Button 
                onClick={handleApplyPromo}
                disabled={isValidatingPromo || !promoCode}
                className="h-12 px-6 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                {isValidatingPromo ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply"}
              </Button>
            ) : (
              <Button 
                onClick={() => { setPromoDiscount(0); setPromoCode("") }}
                className="h-12 px-6 rounded-xl font-bold bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors"
              >
                Remove
              </Button>
            )}
          </div>
          {promoError && (
            <p className="mt-2 text-rose-500 text-sm font-bold">{promoError}</p>
          )}
          {promoDiscount > 0 && (
            <p className="mt-2 text-emerald-600 text-sm font-bold flex items-center gap-1">
              <Star className="w-4 h-4 fill-emerald-600" /> {promoDiscount}% discount applied!
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
