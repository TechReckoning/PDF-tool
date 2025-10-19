import { useCallback, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'sonner'
import { usePDFContext } from '@/contexts/PDFContext'
import { useUIContext } from '@/contexts/UIContext'
import { 
  extractPagesToDoc, 
  applyRedactionsToDoc, 
  reorderPagesToDoc, 
  deletePagesToDoc,
  compressPDFToBlob,
  splitPDFToBlobs,
  downloadBlob,
  generateFilename,
  formatFileSize
} from '@/lib/pdf-utils'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants'
import { ErrorHandler } from '@/lib/error-handler'

export function usePDFOperationsWithContext() {
  const { 
    workingDoc, 
    currentDoc, 
    documents, 
    operationHistory,
    setWorkingDoc,
    setCurrentDoc,
    addOperation,
    resetAll
  } = usePDFContext()
  
  const { 
    selectedPages, 
    splitPoints, 
    redactions, 
    pageOrder,
    clearSelections
  } = useUIContext()
  
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

  const handleExtract = useCallback(async () => {
    if (!currentDoc || selectedPages.size === 0) return

    setIsProcessing(true)
    try {
      const indices = Array.from(selectedPages).sort((a, b) => a - b)
      const extractedDoc = await extractPagesToDoc(currentDoc.pdfDoc, indices)
      
      // Convert to blob and download
      const pdfBytes = await extractedDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      
      // Generate filename based on selected pages
      const pageRange = indices.length === 1 
        ? `page-${indices[0] + 1}` 
        : `pages-${indices[0] + 1}-${indices[indices.length - 1] + 1}`
      const filename = `${currentDoc.name.replace('.pdf', '')}-${pageRange}.pdf`
      
      downloadBlob(blob, filename)
      
      toast.success(SUCCESS_MESSAGES.PDF_EXTRACTED, {
        description: `Extrase ${indices.length} pagină${indices.length !== 1 ? 'e' : ''}`
      })
      
      // Clear selections after successful extraction to allow for multiple extractions
      clearSelections()
    } catch (error) {
      ErrorHandler.handleProcessingError(error, 'extract')
    } finally {
      setIsProcessing(false)
    }
  }, [currentDoc, selectedPages, clearSelections])

  const handleSplit = useCallback(async () => {
    if (!currentDoc || splitPoints.size === 0) return

    setIsProcessing(true)
    try {
      const points = Array.from(splitPoints)
      const blobs = await splitPDFToBlobs(currentDoc.pdfDoc, points)
      
      blobs.forEach((blob, index) => {
        downloadBlob(blob, `${currentDoc.name.replace('.pdf', '')}-part${index + 1}.pdf`)
      })
      
      toast.success(SUCCESS_MESSAGES.PDF_SPLIT(blobs.length))
      // Clear split points after successful split to allow for multiple splits
      clearSelections()
    } catch (error) {
      ErrorHandler.handleProcessingError(error, 'split')
    } finally {
      setIsProcessing(false)
    }
  }, [currentDoc, splitPoints, clearSelections])


  const handleCompress = useCallback(async () => {
    if (!currentDoc) return

    setIsProcessing(true)
    try {
      const blob = await compressPDFToBlob(currentDoc.pdfDoc)
      const reduction = ((currentDoc.fileSize - blob.size) / currentDoc.fileSize) * 100
      downloadBlob(blob, `${currentDoc.name.replace('.pdf', '')}-compressed.pdf`)
      toast.success(SUCCESS_MESSAGES.PDF_COMPRESSED, {
        description: `Dimensiunea redusă cu ${reduction.toFixed(1)}%`
      })
    } catch (error) {
      ErrorHandler.handleProcessingError(error, 'compress')
    } finally {
      setIsProcessing(false)
    }
  }, [currentDoc])

  const handleApplyRedactions = useCallback(async () => {
    if (!workingDoc || redactions.length === 0) return

    setIsProcessing(true)
    try {
      await applyOperationToWorkingDoc(
        (pdfDoc) => applyRedactionsToDoc(pdfDoc, redactions),
        `Aplicare ${redactions.length} redacție${redactions.length !== 1 ? 'i' : ''}`
      )
      // Clear redactions after successful application to allow for multiple redaction sessions
      clearSelections()
    } catch (error) {
      // Error already handled in applyOperationToWorkingDoc
    } finally {
      setIsProcessing(false)
    }
  }, [workingDoc, redactions, applyOperationToWorkingDoc, clearSelections])

  const handleApplyReorder = useCallback(async () => {
    if (!workingDoc || !currentDoc) return

    setIsProcessing(true)
    try {
      const originalPageCount = currentDoc.pdfDoc.getPageCount()
      const currentPageCount = pageOrder.length
      
      if (currentPageCount < originalPageCount) {
        await applyOperationToWorkingDoc(
          (pdfDoc) => deletePagesToDoc(pdfDoc, pageOrder),
          `Ștergere ${originalPageCount - currentPageCount} pagină${originalPageCount - currentPageCount !== 1 ? 'e' : ''}`
        )
      } else {
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
  }, [workingDoc, currentDoc, pageOrder, applyOperationToWorkingDoc])

  const handleDownload = useCallback(async () => {
    if (!workingDoc || !currentDoc) return

    setIsProcessing(true)
    try {
      const pdfBytes = await workingDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      
      const filename = generateFilename(currentDoc.name, operationHistory)
      
      downloadBlob(blob, filename)
      toast.success(SUCCESS_MESSAGES.PDF_DOWNLOADED, {
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
    handleCompress,
    handleApplyRedactions,
    handleApplyReorder,
    handleDownload,
  }
}
