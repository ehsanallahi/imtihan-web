'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BrainCircuit, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { generateMcqsAction } from '@/actions/generateMcqs'

export function GenerateMcqsButton({ uploadId, isGenerated }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(isGenerated ? 'success' : 'idle')
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateMcqsAction(uploadId)
      if (result.success) {
        setStatus('success')
      }
    } catch (err) {
      setError(err.message)
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
        <CheckCircle2 className="h-4 w-4" />
        <span>Generated</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        disabled={loading}
        onClick={handleGenerate}
        className="bg-teal-600 hover:bg-teal-700 text-white gap-2 h-8"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <BrainCircuit className="h-3 w-3" />
        )}
        {loading ? 'Generating...' : 'AI Generate'}
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
