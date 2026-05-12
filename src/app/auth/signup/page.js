"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerUser } from "@/actions/authActions";
import { getSubjectsByGradeAndBoard } from "@/actions/subjectActions";
import { signIn } from "next-auth/react";

const GRADES = [
  { value: "nine", label: "Grade 9" },
  { value: "ten", label: "Grade 10" },
  { value: "eleven", label: "Grade 11" },
  { value: "twelve", label: "Grade 12" },
];

const BOARDS = [
  { value: "punjab", label: "Punjab Board" },
  { value: "sindh", label: "Sindh Board" },
  { value: "kpk", label: "KPK Board" },
  { value: "federal", label: "Federal Board" },
  { value: "aku", label: "AKU" },
  { value: "private", label: "Private" },
];

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams?.get("ref") || null;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", grade: "", board: "", subjectIds: [] });
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    async function loadSubjects() {
      if (form.grade && form.board) {
        setLoadingSubjects(true);
        const fetched = await getSubjectsByGradeAndBoard(form.grade, form.board);
        setSubjects(fetched);
        setForm((f) => ({ ...f, subjectIds: [] }));
        setLoadingSubjects(false);
      } else {
        setSubjects([]);
      }
    }
    loadSubjects();
  }, [form.grade, form.board]);

  const toggleSubject = (id) => {
    setForm((f) => ({
      ...f,
      subjectIds: f.subjectIds?.includes(id)
        ? f.subjectIds.filter((s) => s !== id)
        : [...(f.subjectIds || []), id],
    }));
  };
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const pick = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleStep1 = (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const result = await registerUser({ name: form.name, email: form.email, password: form.password, grade: form.grade || null, board: form.board || null, subjectIds: form.subjectIds, referralCode: refCode });
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    // Auto sign in
    const signInResult = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    if (signInResult?.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/study"), 1500);
    } else {
      router.push("/auth/signin");
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50/60 to-slate-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-teal-900 mb-2">Account Created!</h2>
          <p className="text-zinc-500">Redirecting you to your study area...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50/60 to-slate-100 px-4 py-8">
      <Card className="w-full max-w-md border-teal-100 shadow-xl shadow-teal-900/5">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent font-display">
              IMTIHAN
            </div>
          </div>
          <CardTitle className="text-2xl font-display font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? "Enter your details to get started" : "Tell us about your studies (optional)"}
          </CardDescription>
          {/* Step indicator */}
          <div className="flex gap-2 pt-2">
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? "bg-teal-500" : "bg-slate-200"}`} />
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? "bg-teal-500" : "bg-slate-200"}`} />
          </div>
        </CardHeader>

        {step === 1 ? (
          <form onSubmit={handleStep1}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-100">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Ahmed Khan" value={form.name} onChange={update("name")} required className="focus-visible:ring-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" value={form.email} onChange={update("email")} required className="focus-visible:ring-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={update("password")} required className="focus-visible:ring-teal-500 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={update("confirmPassword")} required className="focus-visible:ring-teal-500 pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20">
                Continue →
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-teal-600 hover:text-teal-700 font-semibold">Sign in</Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-100">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Your Grade</Label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADES.map((g) => (
                    <button key={g.value} type="button" onClick={() => pick("grade", g.value)}
                      className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${form.grade === g.value ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-zinc-600 hover:border-teal-300"}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Your Board</Label>
                <div className="grid grid-cols-2 gap-2">
                  {BOARDS.map((b) => (
                    <button key={b.value} type="button" onClick={() => pick("board", b.value)}
                      className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${form.board === b.value ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-zinc-600 hover:border-teal-300"}`}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              {loadingSubjects ? (
                <div className="flex items-center justify-center py-2 text-zinc-400 text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading subjects...
                </div>
              ) : subjects.length > 0 ? (
                <div className="space-y-2">
                  <Label>Select Subjects (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <button key={s.id} type="button" onClick={() => toggleSubject(s.id)}
                        className={`py-1.5 px-3 rounded-full border text-xs font-semibold transition-all ${form.subjectIds?.includes(s.id) ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-zinc-600 hover:border-teal-300"}`}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <p className="text-xs text-zinc-400 text-center">You can change these later in Settings.</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : "Create Account 🎉"}
              </Button>
              <Button type="button" variant="ghost" className="w-full text-zinc-500" onClick={() => setStep(1)}>← Back</Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-6 h-6 animate-spin text-teal-600" /></div>}>
      <SignUpContent />
    </Suspense>
  );
}
