import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Scissors,
  CopySimple,
  ArrowsInLineVertical,
  PaintBucket,
  Download,
  Trash,
  FilePlus,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Eye,
  ArrowsVertical,
  X
} from '@phosphor-icons/react'
import { usePDFContext } from '@/contexts/PDFContext'
import { useUIContext } from '@/contexts/UIContext'
import { usePDFOperationsWithContext } from '@/hooks/usePDFOperationsWithContext'
import { useFileUpload } from '@/hooks/useFileUpload'
import { ToolMode } from '@/types'
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '@/constants'
import { useCallback } from 'react'

export function Toolbar() {
  // Get state from contexts
  const { currentDoc, documents, operationHistory, isProcessing } = usePDFContext()
  const { 
    mode, 
    selectedPages, 
    splitPoints, 
    redactions, 
    zoom,
    setMode,
    setZoom,
    clearSelections
  } = useUIContext()

  // Get operations from hooks
  const pdfOperations = usePDFOperationsWithContext()
  const fileUpload = useFileUpload({
    onPDFLoaded: () => {} // Will be handled by context
  })

  // Event handlers
  const handleModeChange = useCallback((newMode: ToolMode) => {
    setMode(newMode)
  }, [setMode])

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM)
    setZoom(newZoom)
  }, [zoom, setZoom])

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM)
    setZoom(newZoom)
  }, [zoom, setZoom])

  const handleExtract = useCallback(() => {
    pdfOperations.handleExtract()
  }, [pdfOperations])

  const handleSplit = useCallback(() => {
    pdfOperations.handleSplit()
  }, [pdfOperations])


  const handleCompress = useCallback(() => {
    pdfOperations.handleCompress()
  }, [pdfOperations])

  const handleApplyRedactions = useCallback(() => {
    pdfOperations.handleApplyRedactions()
  }, [pdfOperations])

  const handleApplyReorder = useCallback(() => {
    pdfOperations.handleApplyReorder()
  }, [pdfOperations])

  const handleDownload = useCallback(() => {
    pdfOperations.handleDownload()
  }, [pdfOperations])

  const handleReset = useCallback(() => {
    // Will be handled by context
  }, [])


  const handleAddPDF = useCallback(() => {
    fileUpload.triggerFileSelection()
  }, [fileUpload])

  const handleClearSelections = useCallback(() => {
    clearSelections()
  }, [clearSelections])

  const selectedCount = selectedPages.size
  const splitPointCount = splitPoints.size
  const redactionCount = redactions.length
  const documentCount = documents.length
  const hasDocument = !!currentDoc
  const hasOperations = operationHistory.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
          <div className="flex items-center justify-between w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="view" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Vizualizare</span>
              </TabsTrigger>
              <TabsTrigger value="extract" className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                <span className="hidden sm:inline">Extragere</span>
              </TabsTrigger>
              <TabsTrigger value="split" className="flex items-center gap-2">
                <CopySimple className="h-4 w-4" />
                <span className="hidden sm:inline">Împărțire</span>
              </TabsTrigger>
              <TabsTrigger value="redact" className="flex items-center gap-2">
                <PaintBucket className="h-4 w-4" />
                <span className="hidden sm:inline">Redactare</span>
              </TabsTrigger>
              <TabsTrigger value="reorder" className="flex items-center gap-2">
                <ArrowsVertical className="h-4 w-4" />
                <span className="hidden sm:inline">Reordonare</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= MIN_ZOOM}
                  className="h-8 w-8 p-0"
                >
                  <MagnifyingGlassMinus className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= MAX_ZOOM}
                  className="h-8 w-8 p-0"
                >
                  <MagnifyingGlassPlus className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                {mode === 'extract' && (
                  <Button
                    onClick={handleExtract}
                    disabled={selectedCount === 0 || isProcessing}
                    size="sm"
                  >
                    <Scissors className="h-4 w-4 mr-2" />
                    Extrage ({selectedCount})
                  </Button>
                )}

                {mode === 'split' && (
                  <Button
                    onClick={handleSplit}
                    disabled={splitPointCount === 0 || isProcessing}
                    size="sm"
                  >
                    <CopySimple className="h-4 w-4 mr-2" />
                    Împarte ({splitPointCount})
                  </Button>
                )}


                {mode === 'redact' && (
                  <Button
                    onClick={handleApplyRedactions}
                    disabled={redactionCount === 0 || isProcessing}
                    size="sm"
                  >
                    <PaintBucket className="h-4 w-4 mr-2" />
                    Aplică ({redactionCount})
                  </Button>
                )}

                {mode === 'reorder' && (
                  <Button
                    onClick={handleApplyReorder}
                    disabled={isProcessing}
                    size="sm"
                  >
                    <ArrowsVertical className="h-4 w-4 mr-2" />
                    Aplică Reordonare
                  </Button>
                )}

                <Button
                  onClick={handleCompress}
                  disabled={!hasDocument || isProcessing}
                  size="sm"
                  variant="outline"
                >
                  <ArrowsInLineVertical className="h-4 w-4 mr-2" />
                  Comprimă
                </Button>

                <Button
                  onClick={handleDownload}
                  disabled={!hasDocument || isProcessing}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descarcă
                </Button>

                <Button
                  onClick={handleAddPDF}
                  disabled={isProcessing}
                  size="sm"
                  variant="outline"
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Adaugă PDF
                </Button>

                {/* Clear selections button - only show when there are selections */}
                {(selectedCount > 0 || splitPointCount > 0 || redactionCount > 0) && (
                  <Button
                    onClick={handleClearSelections}
                    disabled={isProcessing}
                    size="sm"
                    variant="outline"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Șterge Selecții
                  </Button>
                )}

              </div>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Status indicators */}
      {hasDocument && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {selectedCount > 0 && (
            <Badge variant="secondary">
              {selectedCount} pagină{selectedCount !== 1 ? 'e' : ''} selectat{selectedCount !== 1 ? 'e' : ''}
            </Badge>
          )}
          {splitPointCount > 0 && (
            <Badge variant="secondary">
              {splitPointCount} punct{splitPointCount !== 1 ? 'e' : ''} de împărțire
            </Badge>
          )}
          {redactionCount > 0 && (
            <Badge variant="secondary">
              {redactionCount} redacție{redactionCount !== 1 ? 'i' : ''}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}