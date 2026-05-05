'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, AlertCircle } from 'lucide-react'
import { deleteTextbookAction } from '@/actions/deleteTextbook'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteTextbookButton({ uploadId, filename }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await deleteTextbookAction(uploadId)
      if (!result.success) {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={loading}
            className="h-8 w-8 text-zinc-400 hover:text-crimson-600 hover:bg-crimson-50 transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-none shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-display font-bold text-zinc-900">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              This will permanently delete <span className="font-bold text-zinc-900">"{filename}"</span>, all its Cloudinary assets, and any MCQs generated from it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-200 text-zinc-600 hover:bg-zinc-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-crimson-600 hover:bg-crimson-700 text-white"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {error && (
        <span className="text-[10px] text-crimson-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
          <AlertCircle className="h-3 w-3" />
          {error.substring(0, 15)}...
        </span>
      )}
    </div>
  )
}
