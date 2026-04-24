"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    // Simulate sending reset email (no real SMTP configured)
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50/60 to-slate-100 px-4 py-8">
      <Card className="w-full max-w-md border-teal-100 shadow-xl shadow-teal-900/5">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
              <Mail className="w-7 h-7 text-teal-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display font-bold text-center">
            {sent ? "Check your email" : "Forgot Password?"}
          </CardTitle>
          <CardDescription className="text-center">
            {sent
              ? `We sent a reset link to ${email}`
              : "Enter your email and we'll send you a reset link"}
          </CardDescription>
        </CardHeader>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="focus-visible:ring-teal-500"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Link href="/auth/signin" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-teal-700 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="text-center space-y-6 pb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              If an account exists for <strong>{email}</strong>, you will receive a password reset email within a few minutes. Check your spam folder too.
            </p>
            <Link href="/auth/signin">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
