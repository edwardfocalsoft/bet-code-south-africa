
import * as React from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  // Calculate range of page numbers to display
  const getPageRange = () => {
    const range = [];
    const maxButtonsToShow = 5; // Show max 5 page buttons at a time
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtonsToShow - 1);
    
    // Adjust start if we're at the end of the range
    if (end - start + 1 < maxButtonsToShow) {
      start = Math.max(1, end - maxButtonsToShow + 1);
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  const pageRange = getPageRange();

  return (
    <div
      className={cn("flex items-center justify-center space-x-1", className)}
      {...props}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pageRange[0] > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(1)}
            aria-label="Page 1"
          >
            1
          </Button>
          {pageRange[0] > 2 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}
        </>
      )}
      
      {pageRange.map(page => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          aria-label={`Page ${page}`}
        >
          {page}
        </Button>
      ))}
      
      {pageRange[pageRange.length - 1] < totalPages && (
        <>
          {pageRange[pageRange.length - 1] < totalPages - 1 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}
          <Button
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(totalPages)}
            aria-label={`Page ${totalPages}`}
          >
            {totalPages}
          </Button>
        </>
      )}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
