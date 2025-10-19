import * as pdfjsLib from 'pdfjs-dist'
import { THUMBNAIL_SCALE, THUMBNAIL_QUALITY } from '@/constants'
import { ProcessingError } from '@/types'

// Configure PDF.js worker with correct path
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

/**
 * Renders a PDF page to an image data URL
 */
export async function renderPageToImage(
  pdfDocument: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = THUMBNAIL_SCALE
): Promise<string> {
  try {
    const page = await pdfDocument.getPage(pageNumber)
    const viewport = page.getViewport({ scale })
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new ProcessingError('Nu s-a putut obține contextul canvas-ului')
    }
    
    canvas.width = viewport.width
    canvas.height = viewport.height
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas
    }
    
    await page.render(renderContext).promise
    
    return canvas.toDataURL('image/png', THUMBNAIL_QUALITY)
  } catch (error) {
    throw new ProcessingError(
      `Eroare la renderizarea paginii ${pageNumber}`,
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Loads a PDF document using PDF.js for rendering purposes
 */
export async function loadPDFForRendering(arrayBuffer: ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
  try {
    return await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: false
    }).promise
  } catch (error) {
    throw new ProcessingError(
      'Eroare la încărcarea PDF cu pdfjs',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Generates thumbnails for all pages in a PDF document
 */
export async function generatePageThumbnails(
  pdfJsDoc: pdfjsLib.PDFDocumentProxy,
  pages: any[]
): Promise<Array<{ pageNumber: number; thumbnail: string; width: number; height: number }>> {
  const pageInfos = []
  
  for (let i = 0; i < pages.length; i++) {
    try {
      const page = pages[i]
      const { width, height } = page.getSize()
      
      const thumbnail = await renderPageToImage(pdfJsDoc, i + 1, THUMBNAIL_SCALE)
      
      pageInfos.push({
        pageNumber: i + 1,
        thumbnail,
        width,
        height
      })
    } catch (error) {
      console.warn(`Failed to render thumbnail for page ${i + 1}:`, error)
      // Add page info without thumbnail
      const page = pages[i]
      const { width, height } = page.getSize()
      pageInfos.push({
        pageNumber: i + 1,
        thumbnail: '', // Empty thumbnail
        width,
        height
      })
    }
  }
  
  return pageInfos
}
