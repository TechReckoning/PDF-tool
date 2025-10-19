import { toast } from 'sonner'
import { PDFError, ValidationError, ProcessingError } from '@/types'
import { ERROR_MESSAGES, TOAST_DURATION } from '@/constants'

export interface ErrorContext {
  operation?: string
  fileName?: string
  pageCount?: number
  additionalInfo?: Record<string, any>
}

/**
 * Centralized error handling for the PDF application
 */
export class ErrorHandler {
  /**
   * Handle PDF-related errors with appropriate user feedback
   */
  static handlePDFError(error: unknown, context?: ErrorContext): void {
    console.error('PDF Error:', error, context)

    if (error instanceof ValidationError) {
      toast.error(ERROR_MESSAGES.INVALID_FILE_TYPE, {
        description: error.message,
        duration: TOAST_DURATION.ERROR
      })
      return
    }

    if (error instanceof ProcessingError) {
      toast.error(ERROR_MESSAGES.PDF_PROCESSING_ERROR, {
        description: error.message,
        duration: TOAST_DURATION.ERROR
      })
      return
    }

    if (error instanceof PDFError) {
      toast.error('PDF Error', {
        description: error.message,
        duration: TOAST_DURATION.ERROR
      })
      return
    }

    // Handle generic errors
    if (error instanceof Error) {
      toast.error('Unexpected Error', {
        description: error.message,
        duration: TOAST_DURATION.ERROR
      })
      return
    }

    // Fallback for unknown errors
    toast.error('An unexpected error occurred', {
      description: 'Please try again or contact support if the problem persists',
      duration: TOAST_DURATION.ERROR
    })
  }

  /**
   * Handle file upload errors
   */
  static handleUploadError(error: unknown, fileName?: string): void {
    console.error('Upload Error:', error, { fileName })

    if (error instanceof ValidationError) {
      toast.error(error.message, {
        description: fileName ? `File: ${fileName}` : undefined,
        duration: TOAST_DURATION.ERROR
      })
      return
    }

    this.handlePDFError(error, { operation: 'upload', fileName })
  }

  /**
   * Handle PDF processing errors
   */
  static handleProcessingError(error: unknown, operation: string): void {
    console.error('Processing Error:', error, { operation })

    this.handlePDFError(error, { operation })
  }

  /**
   * Handle network or browser-specific errors
   */
  static handleBrowserError(error: unknown, context?: ErrorContext): void {
    console.error('Browser Error:', error, context)

    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        toast.error('Storage Quota Exceeded', {
          description: 'Please try with a smaller file or clear your browser storage',
          duration: TOAST_DURATION.ERROR
        })
        return
      }

      if (error.name === 'NotSupportedError') {
        toast.error('Feature Not Supported', {
          description: 'This operation is not supported in your browser',
          duration: TOAST_DURATION.ERROR
        })
        return
      }
    }

    this.handlePDFError(error, context)
  }

  /**
   * Wrap async operations with error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      this.handlePDFError(error, context)
      return null
    }
  }

  /**
   * Wrap sync operations with error handling
   */
  static withSyncErrorHandling<T>(
    operation: () => T,
    context?: ErrorContext
  ): T | null {
    try {
      return operation()
    } catch (error) {
      this.handlePDFError(error, context)
      return null
    }
  }
}

/**
 * Hook for error handling in React components
 */
export function useErrorHandler() {
  const handleError = (error: unknown, context?: ErrorContext) => {
    ErrorHandler.handlePDFError(error, context)
  }

  const handleUploadError = (error: unknown, fileName?: string) => {
    ErrorHandler.handleUploadError(error, fileName)
  }

  const handleProcessingError = (error: unknown, operation: string) => {
    ErrorHandler.handleProcessingError(error, operation)
  }

  const handleBrowserError = (error: unknown, context?: ErrorContext) => {
    ErrorHandler.handleBrowserError(error, context)
  }

  return {
    handleError,
    handleUploadError,
    handleProcessingError,
    handleBrowserError
  }
}
