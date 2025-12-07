'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  itemName?: string; // e.g., "polls", "transactions", "notifications"
  className?: string;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalDocs,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  itemName = 'items',
  className,
  showPageNumbers = true,
  maxPageButtons = 5,
}: PaginationProps) {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: number[] = [];
    
    if (totalPages <= maxPageButtons) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate range based on current page
      let start: number;
      let end: number;
      
      if (currentPage <= Math.ceil(maxPageButtons / 2)) {
        // Near the beginning
        start = 1;
        end = maxPageButtons;
      } else if (currentPage >= totalPages - Math.floor(maxPageButtons / 2)) {
        // Near the end
        start = totalPages - maxPageButtons + 1;
        end = totalPages;
      } else {
        // In the middle
        start = currentPage - Math.floor(maxPageButtons / 2);
        end = currentPage + Math.floor(maxPageButtons / 2);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]",
      className
    )}>
      {/* Info text */}
      <div className="text-sm text-[#9A9A9A] font-light">
        Showing page <span className="font-medium text-[#EDEDED]">{currentPage}</span> of{' '}
        <span className="font-medium text-[#EDEDED]">{totalPages}</span>
        {totalDocs > 0 && (
          <>
            {' '}(<span className="font-medium text-[#EDEDED]">{totalDocs}</span> total {itemName})
          </>
        )}
      </div>
      
      {/* Navigation controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={!hasPrevPage}
          variant="outline"
          size="sm"
          className="rounded-xl border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>
        
        {/* Page numbers */}
        {showPageNumbers && (
          <div className="hidden sm:flex items-center gap-1">
            {/* First page + ellipsis if needed */}
            {pageNumbers[0] > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="w-8 h-8 rounded-lg text-sm font-normal text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] transition-all"
                >
                  1
                </button>
                {pageNumbers[0] > 2 && (
                  <span className="px-2 text-[#9A9A9A]/50">...</span>
                )}
              </>
            )}
            
            {/* Page number buttons */}
            {pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "w-8 h-8 rounded-lg text-sm font-normal transition-all",
                  pageNum === currentPage
                    ? "bg-[#EDEDED] text-[#0A0A0A]"
                    : "text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515]"
                )}
              >
                {pageNum}
              </button>
            ))}
            
            {/* Last page + ellipsis if needed */}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <span className="px-2 text-[#9A9A9A]/50">...</span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="w-8 h-8 rounded-lg text-sm font-normal text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] transition-all"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
        )}
        
        {/* Mobile page indicator */}
        <div className="flex sm:hidden items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151515] border border-[#1F1F1F]">
          <span className="text-sm font-normal text-[#EDEDED]">
            {currentPage} / {totalPages}
          </span>
        </div>

        {/* Next button */}
        <Button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={!hasNextPage}
          variant="outline"
          size="sm"
          className="rounded-xl border-[#1F1F1F] text-[#9A9A9A] hover:text-[#EDEDED] hover:bg-[#151515] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}