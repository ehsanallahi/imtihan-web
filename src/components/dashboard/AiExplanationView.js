'use client'

import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BrainCircuit } from 'lucide-react'

export function AiExplanationView({ explanation }) {
  if (!explanation) return null

  return (
    <Card className="border-teal-100 shadow-sm bg-gradient-to-br from-white to-teal-50/30">
      <CardHeader className="pb-3 border-b border-teal-50">
        <CardTitle className="text-lg font-display font-bold text-teal-900 flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-teal-600" />
          AI Chapter Explanation
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="prose prose-teal prose-sm max-w-none prose-headings:font-display prose-headings:text-teal-900 prose-a:text-teal-600">
          <ReactMarkdown>{explanation}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
