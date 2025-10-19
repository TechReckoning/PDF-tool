import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, Trash } from '@phosphor-icons/react'
import { useUIContext } from '@/contexts/UIContext'
import { toast } from 'sonner'
import type { PDFPageInfo } from '@/types'

interface PageReorderProps {
  pages: PDFPageInfo[]
}

const PageReorder = memo(function PageReorder({ pages }: PageReorderProps) {
  const { pageOrder, zoom, movePageUp, movePageDown, deletePage } = useUIContext()
  const maxWidth = `${Math.round((400 * zoom) / 100)}px`
  
  const handleDeletePage = (displayIndex: number) => {
    if (pageOrder.length <= 1) {
      toast.error('Nu se poate șterge ultima pagină rămasă')
      return
    }
    deletePage(displayIndex)
  }
  
  return (
    <div className="space-y-4" role="main" aria-label="Page reordering interface">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Reordonează paginile</h3>
          <p className="text-sm text-muted-foreground">
            Folosește butoanele pentru a reordona sau șterge paginile
          </p>
        </div>
        <Badge variant="secondary">
          {pageOrder.length} pagin{pageOrder.length !== 1 ? 'i' : 'ă'}
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {pageOrder.map((originalIndex, displayIndex) => {
          const page = pages[originalIndex]
          if (!page) return null
          
          return (
            <div
              key={`${originalIndex}-${displayIndex}`}
              className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
            >
              {/* Page thumbnail */}
              <div 
                className="flex-shrink-0 border rounded overflow-hidden"
                style={{ width: maxWidth, height: `${Math.round((400 * page.height * zoom) / (page.width * 100))}px` }}
              >
                {page.thumbnail ? (
                  <img
                    src={page.thumbnail}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-full object-cover"
                    style={{ 
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top left',
                      width: `${100 / (zoom / 100)}%`,
                      height: `${100 / (zoom / 100)}%`
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <span className="text-sm">Loading...</span>
                  </div>
                )}
              </div>
              
              {/* Page info and controls */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Pagina {page.pageNumber}</h4>
                    <p className="text-sm text-muted-foreground">
                      Poziția curentă: {displayIndex + 1}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Move up button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => movePageUp(displayIndex)}
                      disabled={displayIndex === 0}
                      aria-label={`Move page ${page.pageNumber} up`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    
                    {/* Move down button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => movePageDown(displayIndex)}
                      disabled={displayIndex === pageOrder.length - 1}
                      aria-label={`Move page ${page.pageNumber} down`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    
                    {/* Delete button */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePage(displayIndex)}
                      disabled={pageOrder.length <= 1}
                      aria-label={`Delete page ${page.pageNumber}`}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {pageOrder.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nu există pagini de reordonat</p>
        </div>
      )}
    </div>
  )
})

export { PageReorder }