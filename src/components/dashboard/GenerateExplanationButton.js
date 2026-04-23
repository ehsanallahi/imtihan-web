'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpenText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { generateExplanationAction } from '@/actions/generateExplanation'
import { toast } from 'sonner'

export function GenerateExplanationButton({ uploadId, isGenerated }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(isGenerated ? 'success' : 'idle')
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateExplanationAction(uploadId)
      if (result.success) {
        setStatus('success')
        toast.success(result.message)
      } else {
        setError(result.error)
        toast.error(result.error)
        setStatus('error')
      }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
        <CheckCircle2 className="h-4 w-4" />
        <span>Explained</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        disabled={loading}
        onClick={handleGenerate}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-8"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <BookOpenText className="h-3 w-3" />
        )}
        {loading ? 'Analyzing...' : 'AI Explain'}
      </Button>
      {error && (
        <span className="text-[10px] text-crimson-600 flex items-center gap-1">
          <AlertCircle className="h-2 w-2" />
          {error.substring(0, 20)}...
        </span>
      )}
    </div>
  )
}
