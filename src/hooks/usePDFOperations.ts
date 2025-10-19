import { useCallback, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'sonner'
import { AppState, UIAction } from '@/types'
import { 
  extractPagesToDoc, 
  applyRedactionsToDoc, 
  reorderPagesToDoc, 
  deletePagesToDoc,
  compressPDFToBlob,
  mergePDFsToBlob,
  splitPDFToBlobs,
  downloadBlob,
  generateFilename,
  formatFileSize
} from '@/lib/pdf-utils'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants'
import { ErrorHandler } from '@/lib/error-handler'

interface UsePDFOperationsProps {
  workingDoc: PDFDocument | null
  currentDoc: AppState['currentDoc']
  documents: AppState['documents']
  operationHistory: AppState['operationHistory']
  setWorkingDoc: (doc: PDFDocument | null) => void
  addOperation: (operation: string) => void
}

export function usePDFOperations({
  workingDoc,
  currentDoc,
  documents,
  operationHistory,
  setWorkingDoc,
  addOperation
}: UsePDFOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const applyOperationToWorkingDoc = useCallback(async (
    operation: (pdfDoc: PDFDocument) => Promise<PDFDocument>,
    operationName: string
  ) => {
    if (!workingDoc) return null
    
    try {
      const newWorkingDoc = await operation(workingDoc)
      setWorkingDoc(newWorkingDoc)
      addOperation(operationName)
      toast.success(`${operationName} aplicată`, {
        description: 'Operația salvată în documentul de lucru'
      })
      return newWorkingDoc
    } catch (error) {
      ErrorHandler.handleProcessingError(error, operationName)
      throw error
    }
  }, [workingDoc, setWorkingDoc, addOperation])

  const handleExtract = useCallback(async (selectedPages: Set<number>) => {
    if (!workingDoc || selectedPages.size === 0) return

    setIsProcessing(true)
    try {
      const indices = Array.from(selectedPages).sort((a, b) => a - b)
      await applyOperationToWorkingDoc(
        (pdfDoc) => extractPagesToDoc(pdfDoc, indices),
        `Extragere ${indices.length} pagină${indices.length !== 1 ? 'e' : ''}`
      )
    } catch (error) {
      // Error already handled in applyOperationToWorkingDoc
    } finally {
      setIsProcessing(false)
    }
  }, [workingDoc, applyOperationToWorkingDoc])

  const handleSplit = useCallback(async (splitPoints: Set<number>) => {
    if (!currentDoc || splitPoints.size === 0) return

    setIsProcessing(true)
    try {
      const points = Array.from(splitPoints)
      const blobs = await splitPDFToBlobs(currentDoc.pdfDoc, points)
      
      blobs.forEach((blob, index) => {
        downloadBlob(blob, `${currentDoc.name.replace('.pdf', '')}-part${index + 1}.pdf`)
      })
      
      toast.success(`PDF împărțit în ${blobs.length} documente`)
    } catch (error) {
      ErrorHandler.handleProcessingError(error, 'split')
    } finally {
      setIsProcessing(false)
    }
  }, [currentDoc])

  const handleMerge = useCallback(async () => {
    if (documents.length < 2) {
      toast.error('Need at least 2 PDFs to merge')
      return
    }

    setIsProcessing(true)
    try {
      const pdfDocs = documents.map(doc => doc.pdfDoc)
      const blob = await mergePDFsToBlob(pdfDocs)
      downloadBlob(blob, 'merged-document.pdf')
      toast.success(`${documents.length} PDF-uri unite cu succes`)
    } catch (error) {
      ErrorHandler.handleProcessingError(error, 'merge')
    } finally {
      setIsProcessing(false)
    }
  }, [documents])

  const handleCompress = useCallback(async () => {
    if (!currentDoc) return

    setIsProcessing(true)
    try {
      const blob = await compressPDFToBlob(currentDoc.pdfDoc)
      const reduction = ((currentDoc.fileSize - blob.size) / currentDoc.fileSize) * 100
      downloadBlob(blob, `${currentDoc.name.replace('.pdf', '')}-compressed.pdf`)
      toast.success('PDF comprimat', {
        description: `Dimensiunea redusă cu ${reduction.toFixed(1)}%`
      })
    } catch (error) {
      ErrorHandler.handleProcessingError(error, 'compress')
    } finally {
      setIsProcessing(false)
    }
  }, [currentDoc])

  const handleApplyRedactions = useCallback(async (redactions: Array<{ pageIndex: number; x: number; y: number; width: number; height: number }>) => {
    if (!workingDoc || redactions.length === 0) return

    setIsProcessing(true)
    try {
      await applyOperationToWorkingDoc(
        (pdfDoc) => applyRedactionsToDoc(pdfDoc, redactions),
        `Aplicare ${redactions.length} redacție${redactions.length !== 1 ? 'i' : ''}`
      )
    } catch (error) {
      // Error already handled in applyOperationToWorkingDoc
    } finally {
      setIsProcessing(false)
    }
  }, [workingDoc, applyOperationToWorkingDoc])

  const handleApplyReorder = useCallback(async (pageOrder: number[]) => {
    if (!workingDoc) return

    setIsProcessing(true)
    try {
      // Check if pages were deleted (pageOrder length < original pages)
      const originalPageCount = workingDoc.getPageCount()
      const currentPageCount = pageOrder.length
      
      if (currentPageCount < originalPageCount) {
        // Pages were deleted, use deletePagesToDoc
        await applyOperationToWorkingDoc(
          (pdfDoc) => deletePagesToDoc(pdfDoc, pageOrder),
          `Ștergere ${originalPageCount - currentPageCount} pagină${originalPageCount - currentPageCount !== 1 ? 'e' : ''}`
        )
      } else {
        // No pages deleted, just reorder
        await applyOperationToWorkingDoc(
          (pdfDoc) => reorderPagesToDoc(pdfDoc, pageOrder),
          'Reordonare pagini'
        )
      }
    } catch (error) {
      // Error already handled in applyOperationToWorkingDoc
    } finally {
      setIsProcessing(false)
    }
  }, [workingDoc, applyOperationToWorkingDoc])

  const handleDownload = useCallback(async () => {
    if (!workingDoc || !currentDoc) return

    setIsProcessing(true)
    try {
      const pdfBytes = await workingDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      
      const filename = generateFilename(currentDoc.name, operationHistory)
      
      downloadBlob(blob, filename)
      toast.success('PDF descărcat', {
        description: operationHistory.length > 0 
          ? `Aplicată ${operationHistory.length} operați${operationHistory.length !== 1 ? 'uni' : 'une'}`
          : 'PDF original'
      })
    } catch (error) {
      ErrorHandler.handleProcessingError(error, 'download')
    } finally {
      setIsProcessing(false)
    }
  }, [workingDoc, currentDoc, operationHistory])

  return {
    isProcessing,
    handleExtract,
    handleSplit,
    handleMerge,
    handleCompress,
    handleApplyRedactions,
    handleApplyReorder,
    handleDownload
  }
}
