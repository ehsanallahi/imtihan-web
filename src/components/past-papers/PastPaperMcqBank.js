"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, RefreshCcw, ChevronDown, Repeat2, Calendar, BookOpen } from "lucide-react";
import Link from "next/link";

const BOARD_OPTIONS = [
  { value: "", label: "All Boards" },
  { value: "punjab", label: "Punjab" },
  { value: "sindh", label: "Sindh" },
  { value: "kpk", label: "KPK" },
  { value: "federal", label: "Federal" },
  { value: "aku", label: "AKU" },
  { value: "private", label: "Private" },
];

const GRADE_OPTIONS = [
  { value: "", label: "All Classes" },
  { value: "nine", label: "Class 9" },
  { value: "ten", label: "Class 10" },
  { value: "eleven", label: "Class 11" },
  { value: "twelve", label: "Class 12" },
];

const MEDIUM_OPTIONS = [
  { value: "", label: "All Mediums" },
  { value: "english", label: "English" },
  { value: "urdu", label: "Urdu" },
];

const SORT_OPTIONS = [
  { value: "repeated", label: "🔁 Most Repeated" },
  { value: "newest", label: "📅 Newest First" },
];

function SelectFilter({ value, onChange, options, label }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
        className="appearance-none bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-teal-300 transition-colors w-full"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
    </div>
  );
}

function RepeatBadge({ count }) {
  if (count <= 1) return null;
  const color =
    count >= 5 ? "bg-red-100 text-red-700 border-red-200" :
    count >= 3 ? "bg-amber-100 text-amber-700 border-amber-200" :
    "bg-teal-100 text-teal-700 border-teal-200";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold border rounded-full px-2 py-0.5 ${color}`}>
      <Repeat2 className="w-3 h-3" /> Asked {count}×
    </span>
  );
}

export function PastPaperMcqBank({ mcqs = [], subjects = [], filters = {}, isPremium = false, boardLabel = {}, gradeLabel = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [board, setBoard] = useState(filters.board || "");
  const [grade, setGrade] = useState(filters.grade || "");
  const [subjectId, setSubjectId] = useState(filters.subjectId || "");
  const [medium, setMedium] = useState(filters.medium || "");
  const [sort, setSort] = useState(filters.sort || "repeated");

  // Expanded MCQ (shows options)
  const [expanded, setExpanded] = useState(null);
  const [revealed, setRevealed] = useState(new Set());

  function applyFilters(overrides = {}) {
    const params = new URLSearchParams({
      ...(board && { board }),
      ...(grade && { grade }),
      ...(subjectId && { subject: subjectId }),
      ...(medium && { medium }),
      sort,
      ...overrides,
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleFilter(key, val, setter) {
    setter(val);
    const overrides = { [key]: val };
    applyFilters({ board, grade, subject: subjectId, medium, sort, ...overrides });
  }

  function revealAnswer(id) {
    setRevealed(prev => new Set([...prev, id]));
  }

  // MCQs visible to non-premium: show first 5 blurred
  const visibleMcqs = isPremium ? mcqs : mcqs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SelectFilter
            value={board} label="Board"
            onChange={val => handleFilter("board", val, setBoard)}
            options={BOARD_OPTIONS}
          />
          <SelectFilter
            value={grade} label="Class"
            onChange={val => handleFilter("grade", val, setGrade)}
            options={GRADE_OPTIONS}
          />
          <SelectFilter
            value={subjectId} label="Subject"
            onChange={val => handleFilter("subject", val, setSubjectId)}
            options={[{ value: "", label: "All Subjects" }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
          />
          <SelectFilter
            value={medium} label="Medium"
            onChange={val => handleFilter("medium", val, setMedium)}
            options={MEDIUM_OPTIONS}
          />
          <SelectFilter
            value={sort} label="Sort"
            onChange={val => handleFilter("sort", val, setSort)}
            options={SORT_OPTIONS}
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-zinc-400">
            {isPending ? "Loading…" : `${mcqs.length} unique question${mcqs.length !== 1 ? "s" : ""} found`}
          </p>
          <button
            onClick={() => {
              setBoard(""); setGrade(""); setSubjectId(""); setMedium(""); setSort("repeated");
              router.push(pathname);
            }}
            className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors"
          >
            <RefreshCcw className="w-3 h-3" /> Clear filters
          </button>
        </div>
      </div>

      {/* MCQ list */}
      {mcqs.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-teal-100 rounded-2xl bg-teal-50/30">
          <BookOpen className="w-12 h-12 text-teal-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-teal-900 mb-1">No questions found</h3>
          <p className="text-zinc-500">Try adjusting your filters or check back after more papers are uploaded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleMcqs.map((mcq, idx) => {
            const isOpen = expanded === mcq.id;
            const isRevealed = revealed.has(mcq.id);
            const optionLabels = { A: mcq.optionA, B: mcq.optionB, C: mcq.optionC, D: mcq.optionD };

            return (
              <Card key={mcq.id} className={`border transition-all duration-200 ${isOpen ? "border-teal-200 shadow-md" : "border-zinc-100 hover:border-teal-100 hover:shadow-sm"}`}>
                <CardContent className="p-5">
                  {/* Tags row */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <RepeatBadge count={mcq.repeatCount} />
                    <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-100">
                      {boardLabel[mcq.board] || mcq.board}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Class {mcq.grade === "nine" ? "9" : mcq.grade === "ten" ? "10" : mcq.grade === "eleven" ? "11" : "12"}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-zinc-500">
                      <Calendar className="w-2.5 h-2.5 mr-1" />
                      {mcq.year}
                    </Badge>
                    {mcq.subject?.name && (
                      <Badge variant="outline" className="text-xs text-zinc-500">{mcq.subject.name}</Badge>
                    )}
                  </div>

                  {/* Question text */}
                  <p className="text-sm font-medium text-teal-950 mb-1 leading-relaxed">
                    <span className="text-zinc-400 font-normal mr-2">Q{idx + 1}.</span>
                    {mcq.question}
                  </p>
                  {mcq.questionUrdu && (
                    <p className="text-sm text-zinc-500 mb-3 font-urdu text-right leading-loose">{mcq.questionUrdu}</p>
                  )}

                  {/* Toggle options */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : mcq.id)}
                    className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1 mt-2 transition-colors"
                  >
                    {isOpen ? "Hide options" : "Show options"}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && isPremium && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(optionLabels).map(([letter, text]) => {
                        const isCorrect = letter === mcq.correctAnswer;
                        const reveal = isRevealed;
                        return (
                          <div
                            key={letter}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-sm transition-colors ${
                              reveal && isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold" :
                              reveal && !isCorrect ? "bg-zinc-50 border-zinc-100 text-zinc-400" :
                              "bg-zinc-50/50 border-zinc-100 text-zinc-700"
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              reveal && isCorrect ? "bg-emerald-500 text-white" : "bg-white border border-zinc-200 text-zinc-500"
                            }`}>{letter}</span>
                            {text}
                          </div>
                        );
                      })}

                      <div className="pt-2 flex items-center gap-3">
                        {!isRevealed ? (
                          <Button onClick={() => revealAnswer(mcq.id)} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
                            Reveal Answer
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                              ✓ Answer: {mcq.correctAnswer}
                            </span>
                            {mcq.explanation && (
                              <span className="text-xs text-zinc-500 italic">{mcq.explanation}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isOpen && !isPremium && (
                    <div className="mt-3 p-4 rounded-lg bg-amber-50 border border-amber-100 text-center">
                      <Lock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-amber-700">Upgrade to Super to see options & answers</p>
                      <Link href="/pricing">
                        <Button size="sm" className="mt-2 bg-amber-500 hover:bg-amber-600 text-white text-xs">Upgrade</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Non-premium blur overlay for remaining questions */}
          {!isPremium && mcqs.length > 5 && (
            <div className="relative">
              <div className="space-y-3 blur-sm pointer-events-none select-none">
                {mcqs.slice(5, 8).map((mcq, idx) => (
                  <Card key={mcq.id} className="border border-zinc-100">
                    <CardContent className="p-5">
                      <div className="flex gap-2 mb-2">
                        <RepeatBadge count={mcq.repeatCount} />
                        <Badge variant="outline" className="text-xs">{boardLabel[mcq.board]}</Badge>
                      </div>
                      <p className="text-sm font-medium text-teal-950">Q{idx + 6}. {mcq.question}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-2xl">
                <Lock className="w-8 h-8 text-amber-400 mb-2" />
                <p className="font-bold text-teal-900 text-lg">
                  {mcqs.length - 5} more questions
                </p>
                <p className="text-sm text-zinc-500 mb-4">Upgrade to Super to unlock the full bank</p>
                <Link href="/pricing">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold">Upgrade to Super</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
