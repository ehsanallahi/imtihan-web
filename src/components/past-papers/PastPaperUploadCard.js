"use client";

import { useState, useRef } from "react";
import { Upload, Link2, Loader2, CheckCircle2, XCircle, FileText, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BOARD_LABELS = { punjab: "Punjab", sindh: "Sindh", kpk: "KPK", federal: "Federal", aku: "AKU", private: "Private" };
const GRADE_LABELS = { nine: "Grade 9", ten: "Grade 10", eleven: "Grade 11", twelve: "Grade 12" };
const MEDIUM_LABELS = { english: "English", urdu: "Urdu" };
const BOARD_OPTIONS = Object.entries(BOARD_LABELS);
const GRADE_OPTIONS = Object.entries(GRADE_LABELS);
const MEDIUM_OPTIONS = Object.entries(MEDIUM_LABELS);

export function PastPaperUploadCard({ subjects = [] }) {
  const [tab, setTab] = useState("file"); // "file" | "url"
  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  // Step state: "idle" | "uploading" | "confirming" | "processing" | "done" | "error"
  const [step, setStep] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // After upload, admin reviews / edits these
  const [uploadId, setUploadId] = useState(null);
  const [metadata, setMetadata] = useState({ board: "punjab", grade: "ten", year: new Date().getFullYear(), subjectName: "", medium: "english" });
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // After processing
  const [result, setResult] = useState(null);

  // ─── Upload step ───────────────────────────────────────────────────────────
  async function handleUpload() {
    setStep("uploading");
    setErrorMsg("");
    try {
      let res;
      if (tab === "file") {
        if (!file) throw new Error("Please select a PDF file.");
        const fd = new FormData();
        fd.append("file", file);
        res = await fetch("/api/past-paper/upload", { method: "POST", body: fd });
      } else {
        if (!sourceUrl.trim()) throw new Error("Please enter a PDF URL.");
        res = await fetch("/api/past-paper/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceUrl: sourceUrl.trim(), filename: sourceUrl.split("/").pop() }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setUploadId(data.uploadId);
      setMetadata({
        board: data.metadata?.board || "punjab",
        grade: data.metadata?.grade || "ten",
        year: data.metadata?.year || new Date().getFullYear(),
        subjectName: data.metadata?.subjectName || "",
        medium: data.metadata?.medium || "english",
      });
      // Try to pre-select the subject
      if (data.subjectId) setSelectedSubjectId(data.subjectId);
      setStep("confirming");
    } catch (err) {
      setErrorMsg(err.message);
      setStep("error");
    }
  }

  // ─── Process step ──────────────────────────────────────────────────────────
  async function handleProcess() {
    if (!selectedSubjectId) { setErrorMsg("Please select a subject."); return; }
    setStep("processing");
    setErrorMsg("");
    try {
      const res = await fetch("/api/past-paper/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          board: metadata.board,
          grade: metadata.grade,
          year: parseInt(metadata.year),
          medium: metadata.medium,
          subjectId: selectedSubjectId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed");
      setResult(data);
      setStep("done");
    } catch (err) {
      setErrorMsg(err.message);
      setStep("error");
    }
  }

  function reset() {
    setStep("idle"); setFile(null); setSourceUrl(""); setUploadId(null);
    setMetadata({ board: "punjab", grade: "ten", year: new Date().getFullYear(), subjectName: "", medium: "english" });
    setSelectedSubjectId(""); setResult(null); setErrorMsg("");
  }

  // ─── Drop handlers ────────────────────────────────────────────────────────
  function onDrop(e) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") setFile(f);
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-teal-900 text-lg">Processing Complete!</p>
          <p className="text-sm text-zinc-500 mt-1">{result?.total} MCQs extracted</p>
          <div className="flex justify-center gap-3 mt-3 flex-wrap">
            <Badge className="bg-teal-100 text-teal-700 border-teal-200">🆕 {result?.newQuestions} New</Badge>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">🔁 {result?.repeatedQuestions} Repeated</Badge>
          </div>
        </div>
        <Button onClick={reset} variant="outline" className="mt-2 border-teal-200 text-teal-700 hover:bg-teal-50">
          <Upload className="w-4 h-4 mr-2" /> Upload Another
        </Button>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="font-bold text-red-700">Error</p>
        <p className="text-sm text-zinc-500">{errorMsg}</p>
        <Button onClick={reset} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">Try Again</Button>
      </div>
    );
  }

  if (step === "confirming") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <p className="font-semibold text-teal-900 text-sm">AI detected metadata</p>
            <p className="text-xs text-zinc-400">Review and correct if needed, then extract MCQs.</p>
          </div>
        </div>

        {/* Board */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Board</label>
          <div className="relative">
            <select
              value={metadata.board}
              onChange={e => setMetadata(m => ({ ...m, board: e.target.value }))}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white pr-8"
            >
              {BOARD_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Grade */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Grade / Class</label>
          <div className="relative">
            <select
              value={metadata.grade}
              onChange={e => setMetadata(m => ({ ...m, grade: e.target.value }))}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white pr-8"
            >
              {GRADE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Subject</label>
          <div className="relative">
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white pr-8"
            >
              <option value="">— Select Subject —</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
          {metadata.subjectName && (
            <p className="text-xs text-teal-600 mt-1">AI detected: <span className="font-medium">{metadata.subjectName}</span></p>
          )}
        </div>

        {/* Year */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Exam Year</label>
          <input
            type="number"
            min="2000" max="2099"
            value={metadata.year}
            onChange={e => setMetadata(m => ({ ...m, year: e.target.value }))}
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Medium */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Medium</label>
          <div className="relative">
            <select
              value={metadata.medium}
              onChange={e => setMetadata(m => ({ ...m, medium: e.target.value }))}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white pr-8"
            >
              {MEDIUM_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}

        <div className="flex gap-2 pt-1">
          <Button onClick={reset} variant="outline" size="sm" className="flex-1 border-zinc-200 text-zinc-600">Cancel</Button>
          <Button onClick={handleProcess} size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
            Extract MCQs
          </Button>
        </div>
      </div>
    );
  }

  if (step === "uploading" || step === "processing") {
    const label = step === "uploading" ? "Uploading & detecting metadata…" : "Extracting MCQs with AI…";
    const sub = step === "uploading" ? "This may take a moment." : "Reading the paper and detecting repeat questions…";
    return (
      <div className="text-center py-8 space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500 mx-auto" />
        <p className="font-semibold text-teal-900">{label}</p>
        <p className="text-xs text-zinc-400">{sub}</p>
      </div>
    );
  }

  // ─── Idle state ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex bg-zinc-100 rounded-lg p-1 gap-1">
        <button
          onClick={() => setTab("file")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${tab === "file" ? "bg-white shadow text-teal-700" : "text-zinc-500 hover:text-teal-600"}`}
        >
          <Upload className="w-4 h-4" /> Upload File
        </button>
        <button
          onClick={() => setTab("url")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${tab === "url" ? "bg-white shadow text-teal-700" : "text-zinc-500 hover:text-teal-600"}`}
        >
          <Link2 className="w-4 h-4" /> From URL
        </button>
      </div>

      {tab === "file" ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${dragging ? "border-teal-400 bg-teal-50" : "border-zinc-200 hover:border-teal-300 hover:bg-teal-50/30"}`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
          {file ? (
            <div className="space-y-1">
              <FileText className="w-8 h-8 text-teal-500 mx-auto" />
              <p className="text-sm font-medium text-teal-800 truncate max-w-[200px] mx-auto">{file.name}</p>
              <p className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-sm text-zinc-500">Drop past paper PDF here</p>
              <p className="text-xs text-zinc-400">or click to browse</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-600">PDF URL (Google Drive, Dropbox, etc.)</label>
          <input
            type="url"
            value={sourceUrl}
            onChange={e => setSourceUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={tab === "file" ? !file : !sourceUrl.trim()}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold disabled:opacity-50"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload & Detect Metadata
      </Button>
    </div>
  );
}
