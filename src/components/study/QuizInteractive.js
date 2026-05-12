'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { submitExam } from '@/actions/quizActions'
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2, Trophy, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AiTutor } from './AiTutor'
import { reportMcq } from '@/actions/quizActions'

export function QuizInteractive({ sessionId, mcqs, medium = 'english', timeLimitMinutes }) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(timeLimitMinutes ? timeLimitMinutes * 60 : null)

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTakenSeconds(prev => prev + 1)
      if (timeLeftSeconds !== null && timeLeftSeconds > 0) {
        setTimeLeftSeconds(prev => prev - 1)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeftSeconds])

  // Auto-submit when time is up
  useEffect(() => {
    if (timeLeftSeconds === 0 && !isSubmitting) {
      handleSubmit()
    }
  }, [timeLeftSeconds, isSubmitting])

  const currentMcq = mcqs[currentIndex]
  const isLastQuestion = currentIndex === mcqs.length - 1
  const progress = ((currentIndex + 1) / mcqs.length) * 100

  const handleSelectOption = (optionKey) => {
    setAnswers(prev => ({
      ...prev,
      [currentMcq.id]: optionKey
    }))
  }

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true)
    
    // Format answers for submission
    const formattedAnswers = mcqs.map(mcq => ({
      mcqId: mcq.id,
      selectedAnswer: answers[mcq.id] || "SKIP",
      timeTakenSeconds: Math.floor(timeTakenSeconds / mcqs.length) // Rough estimate per question
    }))

    const result = await submitExam(sessionId, formattedAnswers)
    
    if (result.success) {
      if (result.newAchievements?.length > 0) {
        result.newAchievements.forEach(ach => {
          toast.success(`Achievement Unlocked: ${ach.title}`, {
            description: ach.description,
            icon: <Trophy className="w-5 h-5 text-amber-500" />,
            duration: 6000,
          });
        });
      }
      router.push(`/study/quiz/results/${sessionId}`)
    } else {
      alert("Failed to submit exam. Please try again.")
      setIsSubmitting(false)
    }
  }, [answers, isSubmitting, mcqs, sessionId, timeTakenSeconds, router]);

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Header / Progress */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-500">
              {medium === 'urdu' ? `${mcqs.length} میں سے سوال ${currentIndex + 1}` : `Question ${currentIndex + 1} of ${mcqs.length}`}
            </span>
            {timeLimitMinutes && (
              <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider">
                Mock Exam
              </Badge>
            )}
          </div>
          <span className={`text-sm font-mono font-medium px-3 py-1 rounded-md ${timeLeftSeconds !== null && timeLeftSeconds < 60 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-teal-50 text-teal-600'}`}>
            {timeLeftSeconds !== null ? `Time Left: ${formatTime(timeLeftSeconds)}` : formatTime(timeTakenSeconds)}
          </span>
        </div>
        <Progress value={progress} className="h-2 bg-teal-50" />
      </div>

      {/* Question Card */}
      <Card className="border-none shadow-sm overflow-hidden mb-4 sm:mb-6 bg-white min-h-[350px] sm:min-h-[400px] flex flex-col">
        <div className="h-1 bg-gradient-to-r from-teal-400 to-emerald-400" />
        <CardContent className="p-4 sm:p-6 lg:p-10 flex-1 flex flex-col">
          
          <div className="mb-10">
            {medium === 'urdu' && currentMcq.questionUrdu ? (
              <>
                <h2 className="text-xl sm:text-2xl font-urdu text-teal-950 text-right leading-loose mb-4" dir="rtl">
                  {currentMcq.questionUrdu}
                </h2>
                <h3 className="text-sm font-medium text-zinc-500 italic">
                  {currentMcq.question}
                </h3>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-teal-950 mb-4">
                  {currentMcq.question}
                </h2>
                {currentMcq.questionUrdu && (
                  <h3 className="text-xl font-urdu text-zinc-600 text-right leading-loose" dir="rtl">
                    {currentMcq.questionUrdu}
                  </h3>
                )}
              </>
            )}
          </div>

          <div className="space-y-3 mt-auto">
            {['A', 'B', 'C', 'D'].map((optionKey) => {
              const optionText = currentMcq[`option${optionKey}`]
              if (!optionText) return null

              const isSelected = answers[currentMcq.id] === optionKey

              // A basic heuristic to split English and Urdu if they are concatenated.
              // In a real app, you'd store them in separate fields if possible.
              // For now we assume `optionText` might contain both or just English.
              return (
                <button
                  key={optionKey}
                  onClick={() => handleSelectOption(optionKey)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-slate-100 hover:border-teal-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                    isSelected ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-200 text-slate-500'
                  }`}>
                    {optionKey}
                  </div>
                  <span className={`text-base flex-1 ${isSelected ? 'text-teal-900 font-medium' : 'text-zinc-700'}`}>
                    {optionText}
                  </span>
                </button>
              )
            })}
          </div>

        </CardContent>
      </Card>

      {/* AI Tutor Integration */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <AiTutor mcqId={currentMcq.id} medium={medium} />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        const reason = window.prompt("Reason for reporting (e.g., wrong_answer, typo):");
                        if (reason) {
                          reportMcq({ mcqId: currentMcq.id, reason }).then(res => {
                            if (res.success) toast.success("Report submitted. Thank you!");
                            else toast.error("Failed to submit report.");
                          });
                        }
                      }}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-2 font-medium text-xs"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Report Issue
                    </Button>
                  </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 gap-3">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isSubmitting}
          className="px-4 sm:px-6"
        >
          <ChevronLeft className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Previous</span>
        </Button>

        {!isLastQuestion ? (
          <Button 
            onClick={handleNext}
            disabled={!answers[currentMcq.id]}
            className="flex-1 sm:flex-none px-6 sm:px-8 bg-teal-600 hover:bg-teal-700 text-white"
          >
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={!answers[currentMcq.id] || isSubmitting}
            className="flex-1 sm:flex-none px-6 sm:px-8 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Submit Quiz</>
            )}
          </Button>
        )}
      </div>

    </div>
  )
}
