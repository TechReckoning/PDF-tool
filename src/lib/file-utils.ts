import { ProcessingError } from '@/types'

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  try {
    if (!blob || blob.size === 0) {
      throw new ProcessingError('Blob invalid furnizat pentru descărcare')
    }
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    throw new ProcessingError(
      'Eroare la descărcarea fișierului',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Creates a blob from PDF bytes
 */
export function createPDFBlob(pdfBytes: Uint8Array): Blob {
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

/**
 * Generates a filename with operation suffix
 */
export function generateFilename(baseName: string, operationHistory: string[]): string {
  const cleanBaseName = baseName.replace('.pdf', '')
  const operationsSuffix = operationHistory.length > 0 ? '-processed' : ''
  return `${cleanBaseName}${operationsSuffix}.pdf`
}

/**
 * Creates a file input element and triggers file selection
 */
export function triggerFileSelection(
  accept: string = '.pdf',
  multiple: boolean = false,
  callback: (files: FileList | null) => void
): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept
  input.multiple = multiple
  input.onchange = (e) => {
    const target = e.target as HTMLInputElement
    callback(target.files)
  }
  input.click()
}
