import { PDFDocument } from 'pdf-lib'
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from '@/constants'
import { ValidationError } from '@/types'

/**
 * Validates if a file is a PDF and within size limits
 */
export function validatePDFFile(file: File): void {
  if (file.type !== SUPPORTED_FILE_TYPES.PDF) {
    throw new ValidationError('Tip de fișier invalid - Vă rugăm să selectați un fișier PDF')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(`Fișier prea mare - Vă rugăm să selectați un fișier PDF sub 50MB`)
  }
}

/**
 * Validates page indices for PDF operations
 */
export function validatePageIndices(pageIndices: number[], totalPages: number): void {
  if (pageIndices.length === 0) {
    throw new ValidationError('Nu au fost selectate pagini pentru extragere')
  }

  const invalidPages = pageIndices.filter(index => index < 0 || index >= totalPages)
  if (invalidPages.length > 0) {
    throw new ValidationError(
      `Indici de pagini invalizi: ${invalidPages.join(', ')}. PDF-ul are ${totalPages} pagini.`
    )
  }
}

/**
 * Validates split points for PDF splitting
 */
export function validateSplitPoints(splitPoints: number[], totalPages: number): void {
  if (splitPoints.length === 0) {
    throw new ValidationError('Nu au fost furnizate puncte de împărțire')
  }

  const invalidPoints = splitPoints.filter(point => point <= 0 || point >= totalPages)
  if (invalidPoints.length > 0) {
    throw new ValidationError(
      `Puncte de împărțire invalide: ${invalidPoints.join(', ')}. PDF-ul are ${totalPages} pagini.`
    )
  }
}

/**
 * Validates page order for reordering operations
 */
export function validatePageOrder(pageOrder: number[], totalPages: number): void {
  if (pageOrder.length === 0) {
    throw new ValidationError('Nu există pagini de reordonat')
  }

  const invalidPages = pageOrder.filter(index => index < 0 || index >= totalPages)
  if (invalidPages.length > 0) {
    throw new ValidationError(
      `Indici de pagini invalizi: ${invalidPages.join(', ')}. PDF-ul are ${totalPages} pagini.`
    )
  }

  if (pageOrder.length !== totalPages) {
    throw new ValidationError(
      `Lungimea ordinii paginilor (${pageOrder.length}) trebuie să corespundă cu numărul total de pagini (${totalPages})`
    )
  }
}

/**
 * Validates redaction dimensions and bounds
 */
export function validateRedaction(
  redaction: { width: number; height: number; pageIndex: number },
  totalPages: number,
  pageWidth: number,
  pageHeight: number
): boolean {
  if (redaction.pageIndex < 0 || redaction.pageIndex >= totalPages) {
    throw new ValidationError(
      `Index de pagină invalid ${redaction.pageIndex}. PDF-ul are ${totalPages} pagini.`
    )
  }

  if (redaction.width <= 0 || redaction.height <= 0) {
    return false // Skip invalid redactions
  }

  return true
}


/**
 * Validates that a PDF document has pages
 */
export function validatePDFDocument(pdfDoc: PDFDocument): void {
  const pages = pdfDoc.getPages()
  if (pages.length === 0) {
    throw new ValidationError('PDF-ul pare să fie gol sau corupt')
  }
}
