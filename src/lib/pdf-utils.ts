import { PDFDocument } from 'pdf-lib'
import { ProcessingError, PDFDocumentData, PDFPageInfo } from '@/types'
import { validatePDFFile, validatePDFDocument } from './validation'
import { loadPDFForRendering, generatePageThumbnails } from './pdf-renderer'
import { 
  extractPages, 
  splitPDF, 
  compressPDF, 
  applyRedactions, 
  reorderPages, 
  deletePages, 
  savePDF 
} from './pdf-operations'
import { downloadBlob, createPDFBlob } from './file-utils'

export async function loadPDFDocument(file: File): Promise<PDFDocumentData> {
  try {
    // Validate file first
    validatePDFFile(file)
    
    const arrayBuffer = await file.arrayBuffer()
    
    // Load PDF with pdf-lib
    let pdfDoc: PDFDocument
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer)
    } catch (error) {
      throw new ProcessingError(
        'Eroare la încărcarea PDF cu pdf-lib',
        error instanceof Error ? error : undefined
      )
    }
    
    validatePDFDocument(pdfDoc)
    const pages = pdfDoc.getPages()
    
    // Load PDF with pdfjs for rendering
    const pdfJsDoc = await loadPDFForRendering(arrayBuffer)
    
    // Generate thumbnails
    const pageInfos = await generatePageThumbnails(pdfJsDoc, pages)
    
    return {
      id: crypto.randomUUID(),
      name: file.name,
      file,
      pdfDoc,
      pages: pageInfos,
      pageCount: pages.length,
      fileSize: file.size
    }
  } catch (error) {
    console.error('PDF loading error:', error)
    throw error
  }
}

export async function extractPagesToBlob(
  pdfDoc: PDFDocument,
  pageIndices: number[]
): Promise<Blob> {
  const newPdf = await extractPages(pdfDoc, pageIndices)
  const pdfBytes = await savePDF(newPdf)
  return createPDFBlob(pdfBytes)
}


export async function splitPDFToBlobs(
  pdfDoc: PDFDocument,
  splitPoints: number[]
): Promise<Blob[]> {
  const splitPdfs = await splitPDF(pdfDoc, splitPoints)
  const blobs = await Promise.all(
    splitPdfs.map(async (pdf) => {
      const pdfBytes = await savePDF(pdf)
      return createPDFBlob(pdfBytes)
    })
  )
  return blobs
}

export async function compressPDFToBlob(pdfDoc: PDFDocument): Promise<Blob> {
  const compressedPdf = await compressPDF(pdfDoc)
  const pdfBytes = await savePDF(compressedPdf, true) // Use compression
  return createPDFBlob(pdfBytes)
}

export async function applyRedactionsToBlob(
  pdfDoc: PDFDocument,
  redactions: Array<{ pageIndex: number; x: number; y: number; width: number; height: number }>
): Promise<Blob> {
  const redactedPdf = await applyRedactions(pdfDoc, redactions)
  const pdfBytes = await savePDF(redactedPdf)
  return createPDFBlob(pdfBytes)
}

// Re-export utility functions
export { downloadBlob, formatFileSize, generateFilename, triggerFileSelection } from './file-utils'

export async function reorderPagesToBlob(
  pdfDoc: PDFDocument,
  newPageOrder: number[]
): Promise<Blob> {
  const reorderedPdf = await reorderPages(pdfDoc, newPageOrder)
  const pdfBytes = await savePDF(reorderedPdf)
  return createPDFBlob(pdfBytes)
}

// Functions that modify PDFDocument and return new instance (for chained operations)
export { extractPages as extractPagesToDoc } from './pdf-operations'

export { applyRedactions as applyRedactionsToDoc } from './pdf-operations'

export { reorderPages as reorderPagesToDoc, deletePages as deletePagesToDoc } from './pdf-operations'
