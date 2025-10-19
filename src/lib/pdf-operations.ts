import { PDFDocument, rgb } from 'pdf-lib'
import { PDF_SAVE_OPTIONS } from '@/constants'
import { ProcessingError, ValidationError } from '@/types'
import { validatePageIndices, validateSplitPoints, validatePageOrder, validateRedaction } from './validation'

/**
 * Extracts selected pages from a PDF document
 */
export async function extractPages(
  pdfDoc: PDFDocument,
  pageIndices: number[]
): Promise<PDFDocument> {
  validatePageIndices(pageIndices, pdfDoc.getPageCount())
  
  try {
    const newPdf = await PDFDocument.create()
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices)
    copiedPages.forEach(page => newPdf.addPage(page))
    
    return newPdf
  } catch (error) {
    throw new ProcessingError(
      'Eroare la extragerea paginilor',
      error instanceof Error ? error : undefined
    )
  }
}


/**
 * Splits a PDF document at specified points
 */
export async function splitPDF(
  pdfDoc: PDFDocument,
  splitPoints: number[]
): Promise<PDFDocument[]> {
  validateSplitPoints(splitPoints, pdfDoc.getPageCount())
  
  try {
    const splits: PDFDocument[] = []
    const totalPages = pdfDoc.getPageCount()
    const sortedPoints = [0, ...splitPoints.sort((a, b) => a - b), totalPages]
    
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const start = sortedPoints[i]
      const end = sortedPoints[i + 1]
      
      if (start >= end) {
        console.warn(`Skipping empty split from ${start} to ${end}`)
        continue
      }
      
      const indices = Array.from({ length: end - start }, (_, idx) => start + idx)
      
      const newPdf = await PDFDocument.create()
      const copiedPages = await newPdf.copyPages(pdfDoc, indices)
      copiedPages.forEach(page => newPdf.addPage(page))
      
      splits.push(newPdf)
    }
    
    if (splits.length === 0) {
      throw new ProcessingError('Nu s-au putut crea împărțiri valide')
    }
    
    return splits
  } catch (error) {
    throw new ProcessingError(
      'Eroare la împărțirea PDF',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Compresses a PDF document
 */
export async function compressPDF(pdfDoc: PDFDocument): Promise<PDFDocument> {
  try {
    // Return the same document - compression is handled in save options
    return pdfDoc
  } catch (error) {
    throw new ProcessingError(
      'Eroare la comprimarea PDF',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Applies redactions to a PDF document
 */
export async function applyRedactions(
  pdfDoc: PDFDocument,
  redactions: Array<{ pageIndex: number; x: number; y: number; width: number; height: number }>
): Promise<PDFDocument> {
  if (redactions.length === 0) {
    throw new ValidationError('Nu au fost furnizate redacții')
  }
  
  try {
    const pages = pdfDoc.getPages()
    const totalPages = pages.length
    
    for (const redaction of redactions) {
      const page = pages[redaction.pageIndex]
      const { width: pageWidth, height: pageHeight } = page.getSize()
      
      if (!validateRedaction(redaction, totalPages, pageWidth, pageHeight)) {
        console.warn(`Skipping invalid redaction with dimensions ${redaction.width}x${redaction.height}`)
        continue
      }
      
      // Validate redaction bounds
      if (redaction.x < 0 || redaction.y < 0 || 
          redaction.x + redaction.width > pageWidth || 
          redaction.y + redaction.height > pageHeight) {
        console.warn(`Redaction at page ${redaction.pageIndex} extends beyond page bounds`)
      }
      
      page.drawRectangle({
        x: redaction.x,
        y: pageHeight - redaction.y - redaction.height,
        width: redaction.width,
        height: redaction.height,
        color: rgb(0, 0, 0),
      })
    }
    
    return pdfDoc
  } catch (error) {
    throw new ProcessingError(
      'Eroare la aplicarea redacțiilor',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Reorders pages in a PDF document
 */
export async function reorderPages(
  pdfDoc: PDFDocument,
  newPageOrder: number[]
): Promise<PDFDocument> {
  validatePageOrder(newPageOrder, pdfDoc.getPageCount())
  
  try {
    const newPdf = await PDFDocument.create()
    const copiedPages = await newPdf.copyPages(pdfDoc, newPageOrder)
    copiedPages.forEach(page => newPdf.addPage(page))
    
    return newPdf
  } catch (error) {
    throw new ProcessingError(
      'Eroare la reordonarea paginilor',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Deletes pages from a PDF document, keeping only specified pages
 */
export async function deletePages(
  pdfDoc: PDFDocument,
  pagesToKeep: number[]
): Promise<PDFDocument> {
  if (pagesToKeep.length === 0) {
    throw new ValidationError('Nu se pot șterge toate paginile')
  }
  
  validatePageIndices(pagesToKeep, pdfDoc.getPageCount())
  
  try {
    const newPdf = await PDFDocument.create()
    const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep)
    copiedPages.forEach(page => newPdf.addPage(page))
    
    return newPdf
  } catch (error) {
    throw new ProcessingError(
      'Eroare la ștergerea paginilor',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Saves a PDF document to bytes with compression options
 */
export async function savePDF(pdfDoc: PDFDocument, useCompression: boolean = false): Promise<Uint8Array> {
  try {
    const options = useCompression ? PDF_SAVE_OPTIONS : {}
    return await pdfDoc.save(options)
  } catch (error) {
    throw new ProcessingError(
      'Eroare la salvarea PDF',
      error instanceof Error ? error : undefined
    )
  }
}
