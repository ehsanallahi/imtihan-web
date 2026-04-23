
"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function UploadCard({ onUploadComplete, subjects = [], chapters = [] }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid PDF file.");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedSubject || !selectedChapter) {
      setError("Please select a file, subject, and chapter.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectId", selectedSubject);
    formData.append("chapterId", selectedChapter);

    try {
      const response = await fetch("/api/cms/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      setUploadStatus("success");
      if (onUploadComplete) onUploadComplete(result.upload);
      
      // Reset after success
      setTimeout(() => {
        setFile(null);
        setUploadStatus("idle");
      }, 3000);
      
    } catch (err) {
      setError(err.message);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="w-full border-dashed border-2 border-teal-100 hover:border-teal-300 transition-all bg-teal-50/10">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full h-40 cursor-pointer rounded-xl bg-white/50 border border-teal-50 hover:bg-teal-50/50 transition-all group"
            >
              <div className="p-4 rounded-full bg-teal-100/50 text-teal-600 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8" />
              </div>
              <p className="mt-4 text-sm font-medium text-teal-900">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF up to 50MB</p>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-teal-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-teal-50 text-teal-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-teal-900 truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={removeFile}
                disabled={isUploading}
                className="text-muted-foreground hover:text-crimson-600 hover:bg-crimson-50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full h-10 px-2 rounded-lg border border-teal-100 bg-white text-[13px] focus:ring-2 focus:ring-teal-500 outline-none"
                disabled={isUploading}
              >
                <option value="">Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chapter</label>
              <select 
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full h-10 px-2 rounded-lg border border-teal-100 bg-white text-[13px] focus:ring-2 focus:ring-teal-500 outline-none"
                disabled={isUploading}
              >
                <option value="">Chapter</option>
                {chapters.filter(c => c.subjectId === selectedSubject).map(c => (
                  <option key={c.id} value={c.id}>Ch {c.number}: {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="w-full flex items-center gap-2 p-3 rounded-lg bg-crimson-50 text-crimson-900 text-sm border border-crimson-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {uploadStatus === "success" && (
            <div className="w-full flex items-center gap-2 p-3 rounded-lg bg-teal-50 text-teal-900 text-sm border border-teal-100">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p>Upload successful! Processing has started.</p>
            </div>
          )}

          <Button 
            onClick={handleUpload}
            disabled={!file || !selectedSubject || !selectedChapter || isUploading}
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all shadow-lg shadow-teal-600/20"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              "Start Upload & Process"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
