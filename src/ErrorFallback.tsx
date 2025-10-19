import { Button } from "./components/ui/button";

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  // When encountering an error in the development mode, rethrow it and don't display the boundary.
  // The parent UI will take care of showing a more helpful dialog.
  if (import.meta.env.DEV) throw error;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-destructive mb-2">PDF Master Pro - Runtime Error</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Something unexpected happened while running the application. The error details are shown below. Please try refreshing the page or contact support if the problem persists.
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Error Details:</h3>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32">
            {error.message}
          </pre>
        </div>
        
        <Button 
          onClick={resetErrorBoundary} 
          className="w-full"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
