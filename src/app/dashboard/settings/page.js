"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, User, Lock, GraduationCap } from "lucide-react";
import { updateStudentProfile, changePassword, getStudentProfile } from "@/actions/authActions";
import { Target } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const GRADES = [
  { value: "nine", label: "Grade 9" },
  { value: "ten", label: "Grade 10" },
  { value: "eleven", label: "Grade 11" },
  { value: "twelve", label: "Grade 12" },
];
const BOARDS = [
  { value: "punjab", label: "Punjab" },
  { value: "sindh", label: "Sindh" },
  { value: "kpk", label: "KPK" },
  { value: "federal", label: "Federal" },
  { value: "aku", label: "AKU" },
  { value: "private", label: "Private" },
];

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [profileForm, setProfileForm] = useState({ name: "", grade: "", board: "", dailyGoalCount: 20 });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profileStatus, setProfileStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (session?.user) {
        setProfileForm((f) => ({ ...f, name: session.user.name || "" }));
        const profile = await getStudentProfile();
        if (profile) {
          setProfileForm((f) => ({
            ...f,
            grade: profile.grade || "",
            board: profile.board || "",
            dailyGoalCount: profile.dailyGoalCount || 20,
          }));
        }
      }
    }
    loadProfile();
  }, [session]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileStatus(null);
    const result = await updateStudentProfile(profileForm);
    setProfileStatus(result);
    if (result.success) await updateSession({ name: profileForm.name });
    setProfileLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ success: false, error: "New passwords do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ success: false, error: "Password must be at least 8 characters." });
      return;
    }
    setPasswordLoading(true);
    const result = await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
    setPasswordStatus(result);
    if (result.success) setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordLoading(false);
  };

  const pick = (field, val) => setProfileForm((f) => ({ ...f, [field]: val }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-teal-900">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your profile and account preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="border-teal-100/50 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 bg-teal-50 rounded-lg"><User className="w-5 h-5 text-teal-600" /></div>
          <CardTitle className="text-lg font-display font-bold text-teal-900">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-5">
            {profileStatus && (
              <Alert className={profileStatus.success ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
                {profileStatus.success ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                <AlertDescription className={profileStatus.success ? "text-emerald-700" : "text-red-700"}>
                  {profileStatus.success ? "Profile updated successfully!" : profileStatus.error}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                className="focus-visible:ring-teal-500" required />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-teal-500" />Grade</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GRADES.map((g) => (
                  <button key={g.value} type="button" onClick={() => pick("grade", g.value)}
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${profileForm.grade === g.value ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-zinc-600 hover:border-teal-300"}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Board</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BOARDS.map((b) => (
                  <button key={b.value} type="button" onClick={() => pick("board", b.value)}
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${profileForm.board === b.value ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-zinc-600 hover:border-teal-300"}`}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 font-display font-bold text-slate-700 uppercase tracking-tight">
                  <Target className="w-4 h-4 text-rose-500" />
                  Daily MCQ Goal
                </Label>
                <span className="text-lg font-black text-teal-700">{profileForm.dailyGoalCount}</span>
              </div>
              <div className="px-2">
                <Slider
                  value={[profileForm.dailyGoalCount]}
                  min={5}
                  max={100}
                  step={5}
                  onValueChange={(val) => setProfileForm((f) => ({ ...f, dailyGoalCount: val[0] }))}
                  className="py-4"
                />
              </div>
              <p className="text-[10px] text-zinc-400 font-medium italic">
                Set a target for how many practice questions you want to complete every day.
              </p>
            </div>
            <Button type="submit" disabled={profileLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
              {profileLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card className="border-teal-100/50 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 bg-teal-50 rounded-lg"><Lock className="w-5 h-5 text-teal-600" /></div>
          <CardTitle className="text-lg font-display font-bold text-teal-900">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordStatus && (
              <Alert className={passwordStatus.success ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
                {passwordStatus.success ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                <AlertDescription className={passwordStatus.success ? "text-emerald-700" : "text-red-700"}>
                  {passwordStatus.success ? "Password changed successfully!" : passwordStatus.error}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                required className="focus-visible:ring-teal-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" placeholder="Min. 8 characters" value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                required className="focus-visible:ring-teal-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                required className="focus-visible:ring-teal-500" />
            </div>
            <Button type="submit" disabled={passwordLoading} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
              {passwordLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-teal-100/50 shadow-sm bg-slate-50/50">
        <CardContent className="pt-5">
          <div className="text-sm text-zinc-500 space-y-1">
            <p><span className="font-medium text-zinc-700">Email:</span> {session?.user?.email}</p>
            <p><span className="font-medium text-zinc-700">Role:</span> <span className="capitalize">{session?.user?.role}</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
