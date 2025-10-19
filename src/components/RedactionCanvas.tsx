import { memo, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUIContext } from '@/contexts/UIContext'
import type { RedactionBox } from '@/types'
import { Trash } from '@phosphor-icons/react'

interface RedactionCanvasProps {
  pageIndex: number
  pageWidth: number
  pageHeight: number
  thumbnail?: string
  className?: string
}

const RedactionCanvas = memo(function RedactionCanvas({
  pageIndex,
  pageWidth,
  pageHeight,
  thumbnail,
  className
}: RedactionCanvasProps) {
  const { redactions, addRedaction, removeRedaction } = useUIContext()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)

  // Get redactions for this specific page
  const pageRedactions = redactions.filter(r => r.pageIndex === pageIndex)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDrawing(true)
    setStartPoint({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top
    
    setCurrentPoint({ x: currentX, y: currentY })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top
    
    const x = Math.min(startPoint.x, endX)
    const y = Math.min(startPoint.y, endY)
    const width = Math.abs(endX - startPoint.x)
    const height = Math.abs(endY - startPoint.y)
    
    // Only create redaction if it's large enough
    if (width > 10 && height > 10) {
      const redaction: RedactionBox = {
        pageIndex,
        x,
        y,
        width,
        height
      }
      addRedaction(redaction)
    }
    
    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
  }

  const handleRedactionRemove = (index: number) => {
    // Find the global index of this redaction
    const globalIndex = redactions.findIndex((r, i) => r.pageIndex === pageIndex && i === index)
    if (globalIndex !== -1) {
      removeRedaction(globalIndex)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={canvasRef}
        className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-crosshair select-none"
        style={{ width: pageWidth, height: pageHeight }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        role="region"
        aria-label={`Redaction canvas for page ${pageIndex + 1}`}
      >
        {/* Page thumbnail */}
        {thumbnail && (
          <img
            src={thumbnail}
            alt={`Page ${pageIndex + 1}`}
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        )}
        
        {/* Existing redaction boxes */}
        {pageRedactions.map((redaction, index) => (
          <div
            key={index}
            className="absolute bg-red-500/50 border-2 border-red-500 group hover:bg-red-500/70 transition-colors"
            style={{
              left: redaction.x,
              top: redaction.y,
              width: redaction.width,
              height: redaction.height,
            }}
          >
            {/* Delete button */}
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRedactionRemove(index)}
              aria-label={`Remove redaction ${index + 1}`}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {/* Drawing overlay */}
        {isDrawing && startPoint && currentPoint && (
          <div
            className="absolute bg-red-500/30 border-2 border-red-500 pointer-events-none"
            style={{
              left: Math.min(startPoint.x, currentPoint.x),
              top: Math.min(startPoint.y, currentPoint.y),
              width: Math.abs(currentPoint.x - startPoint.x),
              height: Math.abs(currentPoint.y - startPoint.y),
            }}
          />
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-2 text-sm text-muted-foreground">
        Click and drag to create redaction boxes
      </div>
    </div>
  )
})

export { RedactionCanvas }