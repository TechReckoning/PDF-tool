import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { loadPDFDocument, formatFileSize } from '@/lib/pdf-utils'
import { PDFDocumentData } from '@/types'
import { UPLOAD_PROGRESS_STEP, UPLOAD_PROGRESS_MAX, UPLOAD_PROGRESS_FINAL } from '@/constants'
import { SUCCESS_MESSAGES } from '@/constants'
import { ErrorHandler } from '@/lib/error-handler'

interface UseFileUploadProps {
  onPDFLoaded: (docData: PDFDocumentData) => void
}

export function useFileUpload({ onPDFLoaded }: UseFileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true)
    setUploadProgress(0)

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + UPLOAD_PROGRESS_STEP, UPLOAD_PROGRESS_MAX))
      }, 100)

      const docData = await loadPDFDocument(file)
      
      clearInterval(interval)
      setUploadProgress(UPLOAD_PROGRESS_FINAL)

      onPDFLoaded(docData)
      
      toast.success(SUCCESS_MESSAGES.PDF_LOADED, {
        description: `${docData.pageCount} pagini • ${formatFileSize(docData.fileSize)}`
      })
    } catch (error) {
      ErrorHandler.handleUploadError(error, file.name)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setUploadProgress(0), 500)
    }
  }, [onPDFLoaded])

  const triggerFileSelection = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    }
    input.click()
  }, [handleFileSelect])

  return {
    isProcessing,
    uploadProgress,
    handleFileSelect,
    triggerFileSelection
  }
}
