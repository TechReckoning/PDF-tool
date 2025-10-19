import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Check, Plus } from '@phosphor-icons/react'
import { usePDFContext } from '@/contexts/PDFContext'
import { useUIContext } from '@/contexts/UIContext'
import type { PDFPageInfo } from '@/types'

interface PDFPageGridProps {
  pages: PDFPageInfo[]
}

const PDFPageGrid = memo(function PDFPageGrid({ pages }: PDFPageGridProps) {
  const { currentDoc } = usePDFContext()
  const { 
    mode, 
    selectedPages, 
    splitPoints, 
    currentPage, 
    zoom,
    togglePageSelection,
    toggleSplitPoint,
    setCurrentPage
  } = useUIContext()

  const selectable = mode === 'extract'
  const redactionMode = mode === 'redact'
  const showSplitPoints = mode === 'split'

  const handlePageClick = (pageIndex: number) => {
    if (redactionMode) {
      setCurrentPage(pageIndex)
    } else if (selectable) {
      togglePageSelection(pageIndex)
    }
  }

  const handleSplitPointToggle = (pageIndex: number) => {
    if (showSplitPoints) {
      toggleSplitPoint(pageIndex)
    }
  }

  if (!currentDoc) return null

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {pages.map((page, index) => {
          const isSelected = selectedPages.has(index)
          const isCurrentPage = currentPage === index
          const hasSplitPoint = splitPoints.has(index)
          const isSelectable = selectable || redactionMode
          const isClickable = isSelectable || showSplitPoints

          return (
            <div key={index} className="relative group">
              {/* Page container */}
              <div
                className={cn(
                  "relative bg-white border-2 rounded-lg overflow-hidden shadow-sm transition-all duration-200",
                  isClickable && "cursor-pointer hover:shadow-md",
                  isSelected && "border-primary ring-2 ring-primary/20",
                  isCurrentPage && "border-blue-500 ring-2 ring-blue-500/20",
                  hasSplitPoint && "border-orange-500 ring-2 ring-orange-500/20"
                )}
                onClick={() => handlePageClick(index)}
                role={isClickable ? "button" : "img"}
                aria-label={`Page ${page.pageNumber}${isSelected ? ' (selected)' : ''}${isCurrentPage ? ' (current)' : ''}`}
                aria-current={isCurrentPage ? "true" : "false"}
                tabIndex={isClickable ? 0 : -1}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    handlePageClick(index)
                  }
                }}
              >
                {/* Page image */}
                <div 
                  className="relative w-full bg-gray-50"
                  style={{ 
                    aspectRatio: `${page.width} / ${page.height}`,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top left',
                    width: `${100 / (zoom / 100)}%`,
                    height: `${100 / (zoom / 100)}%`
                  }}
                >
                  {page.thumbnail ? (
                    <img
                      src={page.thumbnail}
                      alt={`Page ${page.pageNumber}`}
                      className="w-full h-full object-contain"
                      role="img"
                      aria-label={`Page ${page.pageNumber} thumbnail`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>

                {/* Page number */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {page.pageNumber}
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" weight="bold" />
                  </div>
                )}

                {/* Current page indicator */}
                {isCurrentPage && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Current
                  </div>
                )}
              </div>

              {/* Split point button */}
              {showSplitPoints && (
                <button
                  className={cn(
                    "absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 bg-white shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110",
                    hasSplitPoint 
                      ? "border-orange-500 bg-orange-500 text-white" 
                      : "border-gray-300 hover:border-orange-400"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSplitPointToggle(index)
                  }}
                  aria-label={hasSplitPoint ? `Remove split point after page ${index + 1}` : `Add split point after page ${index + 1}`}
                >
                  <Plus className="h-3 w-3" weight="bold" />
                </button>
              )}

              {/* Hover overlay for split points */}
              {showSplitPoints && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-orange-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Status indicators */}
      {pages.length > 0 && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{pages.length} pagin{pages.length !== 1 ? 'i' : 'ă'}</span>
              {selectedPages.size > 0 && (
                <Badge variant="secondary">
                  {selectedPages.size} selectat{selectedPages.size !== 1 ? 'e' : 'ă'}
                </Badge>
              )}
              {splitPoints.size > 0 && (
                <Badge variant="secondary">
                  {splitPoints.size} punct{splitPoints.size !== 1 ? 'e' : ''} de împărțire
                </Badge>
              )}
            </div>
            <div className="text-xs">
              Zoom: {zoom}%
            </div>
          </div>
        </div>
      )}
    </ScrollArea>
  )
})

export { PDFPageGrid }