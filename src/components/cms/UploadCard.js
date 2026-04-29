
"use client";

import { useState, useRef } from "react";
import {
  Upload, FileText, X, Loader2, Link2, BookOpen, BookMarked,
  CheckCircle2, AlertCircle, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";

// ─── Tabs ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: "file", label: "Upload File", icon: Upload },
  { id: "url",  label: "Paste URL",   icon: Link2 },
];

export function UploadCard({ onUploadComplete, subjects = [], chapters = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("file");
  const [isFullBook, setIsFullBook] = useState(false);

  // File mode
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // URL mode
  const [pdfUrl, setPdfUrl] = useState("");

  // Shared state
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState(null);
  const [result, setResult] = useState(null); // { uploads, detectedChapters }

  // ── Smart detection on file pick ──────────────────────────────────────────
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a valid PDF file.");
      return;
    }
    setFile(selectedFile);
    setResult(null);

    const fileName = selectedFile.name.toLowerCase();
    const matchedSubject = subjects.find((s) =>
      fileName.includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().split(" ").some((w) => w.length > 3 && fileName.includes(w))
    );

    if (matchedSubject) {
      setSelectedSubject(matchedSubject.id);
      toast.success(`Smart Match: ${matchedSubject.name} detected`, { duration: 2500 });

      const chapterMatch = fileName.match(/(?:ch|chapter|unit|unit-)\s*(\d+)/i);
      if (chapterMatch) {
        const num = parseInt(chapterMatch[1]);
        const matchedChapter = chapters.find(
          (c) => c.subjectId === matchedSubject.id && c.number === num
        );
        if (matchedChapter) setSelectedChapter(matchedChapter.id);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const isValid = () => {
    if (!selectedSubject) return false;
    if (!isFullBook && !selectedChapter) return false;
    if (activeTab === "file" && !file) return false;
    if (activeTab === "url" && !pdfUrl.trim()) return false;
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isValid()) {
      toast.error(
        isFullBook
          ? "Please select a subject and provide a PDF."
          : "Please select a subject, chapter, and provide a PDF."
      );
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setUploadStats(null);
    setResult(null);

    try {
      let response;

      // ── FILE UPLOAD ──
      if (activeTab === "file") {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("subjectId", selectedSubject);
        formData.append("isFullBook", String(isFullBook));
        if (!isFullBook) formData.append("chapterId", selectedChapter);

        response = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              setUploadProgress(Math.round((event.loaded / event.total) * 80)); // cap at 80% for AI processing
              setUploadStats({
                loaded: (event.loaded / (1024 * 1024)).toFixed(2),
                total: (event.total / (1024 * 1024)).toFixed(2)
              });
            }
          });
          xhr.addEventListener("load", () => {
            setUploadProgress(100);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              try { reject(new Error(JSON.parse(xhr.responseText).error || "Upload failed")); }
              catch { reject(new Error("Upload failed")); }
            }
          });
          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.open("POST", "/api/cms/upload");
          xhr.send(formData);
        });
      }

      // ── URL SUBMIT ──
      else {
        setUploadProgress(20);
        const res = await fetch("/api/cms/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfUrl: pdfUrl.trim(),
            subjectId: selectedSubject,
            chapterId: isFullBook ? undefined : selectedChapter,
            isFullBook,
          }),
        });
        setUploadProgress(100);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Processing failed");
        }
        response = await res.json();
      }

      // ── Success ──
      setResult(response);

      if (isFullBook) {
        const count = response.uploads?.length ?? 0;
        toast.success(`✅ ${count} chapter${count !== 1 ? "s" : ""} detected and saved!`, {
          description: "Each chapter is now ready for MCQ generation.",
          duration: 5000,
        });
      } else {
        toast.success("Upload successful! Processing has started.");
      }

      if (onUploadComplete) onUploadComplete(response);
      
      // Force Next.js to re-fetch server components so the table updates instantly
      router.refresh();

      // Reset file/URL but keep subject selection for quick re-upload
      setTimeout(() => {
        setFile(null);
        setPdfUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 4000);

    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredChapters = chapters.filter((c) => c.subjectId === selectedSubject);

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-teal-50 rounded-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); }}
              disabled={isProcessing}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-teal-600/70 hover:text-teal-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card className="border-dashed border-2 border-teal-100 hover:border-teal-300 transition-all bg-teal-50/10">
        <CardContent className="p-6 space-y-5">

          {/* ── Full Book Toggle ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-teal-100 bg-white/60">
            <div className="flex items-center gap-3">
              {isFullBook
                ? <BookOpen className="h-5 w-5 text-teal-600" />
                : <BookMarked className="h-5 w-5 text-teal-400" />}
              <div>
                <p className="text-sm font-semibold text-teal-900">
                  {isFullBook ? "Full Textbook Mode" : "Single Chapter Mode"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isFullBook
                    ? "AI will auto-detect & separate all chapters"
                    : "Upload one chapter at a time"}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setIsFullBook((v) => !v); setSelectedChapter(""); setResult(null); }}
              disabled={isProcessing}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none",
                isFullBook ? "bg-teal-500" : "bg-zinc-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300",
                  isFullBook && "translate-x-6"
                )}
              />
            </button>
          </div>

          {/* ── File Input (file tab) ──────────────────────────────────────── */}
          {activeTab === "file" && (
            !file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-full h-36 cursor-pointer rounded-xl bg-white/50 border border-teal-50 hover:bg-teal-50/50 transition-all group"
              >
                <div className="p-4 rounded-full bg-teal-100/50 text-teal-600 group-hover:scale-110 transition-transform">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="mt-3 text-sm font-medium text-teal-900">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF up to 50MB</p>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              </div>
            ) : (
              <div className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-teal-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-teal-900 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} disabled={isProcessing} className="text-muted-foreground hover:text-red-500">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          )}

          {/* ── URL Input (url tab) ────────────────────────────────────────── */}
          {activeTab === "url" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                PDF Link
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-400" />
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://example.com/textbook.pdf  or  Google Drive link"
                  disabled={isProcessing}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-teal-100 bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none placeholder:text-zinc-400"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Supports direct .pdf links, Google Drive share links, and Dropbox links.
              </p>
            </div>
          )}

          {/* ── Subject + Chapter selects ──────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => { setSelectedSubject(e.target.value); setSelectedChapter(""); }}
                className="w-full h-10 px-2 rounded-lg border border-teal-100 bg-white text-[13px] focus:ring-2 focus:ring-teal-500 outline-none"
                disabled={isProcessing}
              >
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Chapter dropdown — hidden in full-book mode */}
            {!isFullBook && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chapter</label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full h-10 px-2 rounded-lg border border-teal-100 bg-white text-[13px] focus:ring-2 focus:ring-teal-500 outline-none"
                  disabled={isProcessing || !selectedSubject}
                >
                  <option value="">Select chapter</option>
                  {filteredChapters.map((c) => (
                    <option key={c.id} value={c.id}>Ch {c.number}: {c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {isFullBook && (
              <div className="flex items-end pb-0.5">
                <div className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-xs text-teal-700">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  AI will auto-detect all chapters from the PDF
                </div>
              </div>
            )}
          </div>

          {/* ── Progress bar ───────────────────────────────────────────────── */}
          {isProcessing && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between text-xs font-medium text-teal-700">
                <span>
                  {isFullBook ? "AI is extracting chapters…" : "Uploading…"}
                  {uploadStats && uploadProgress < 80 && (
                    <span className="ml-2 text-zinc-500 font-normal">
                      ({uploadStats.loaded} MB / {uploadStats.total} MB)
                    </span>
                  )}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5 bg-teal-100" />
            </div>
          )}

          {/* ── Chapter Results (full-book success) ────────────────────────── */}
          {result?.detectedChapters?.length > 0 && (
            <div className="rounded-xl border border-teal-100 bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-3">
              <div className="px-4 py-2.5 bg-teal-50 flex items-center gap-2 text-sm font-semibold text-teal-800">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                {result.uploads?.length ?? 0} chapter(s) saved
                {result.detectedChapters.filter((c) => !c.matchedChapterId).length > 0 && (
                  <span className="ml-auto text-xs font-normal text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {result.detectedChapters.filter((c) => !c.matchedChapterId).length} unmatched
                  </span>
                )}
              </div>
              <div className="divide-y divide-teal-50 max-h-52 overflow-y-auto">
                {result.detectedChapters.map((ch, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    {ch.matchedChapterId
                      ? <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                      : <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />}
                    <span className="text-teal-900 font-medium">Chapter {ch.chapterNumber}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
                    <span className={cn("truncate", ch.matchedChapterId ? "text-zinc-600" : "text-amber-600")}>
                      {ch.chapterName}
                      {!ch.matchedChapterId && " (not in DB — skipped)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Submit Button ──────────────────────────────────────────────── */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid() || isProcessing}
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all shadow-lg shadow-teal-600/20"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isFullBook ? "AI Processing Chapters…" : "Uploading…"}
              </>
            ) : (
              isFullBook
                ? "Upload & Auto-Detect Chapters"
                : activeTab === "url"
                  ? "Process PDF from URL"
                  : "Upload & Process"
            )}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
