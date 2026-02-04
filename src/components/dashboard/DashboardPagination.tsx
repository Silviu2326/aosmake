import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DashboardPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const DashboardPagination: React.FC<DashboardPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  function getPageNumbers(current: number, total: number): (number | string)[] {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5, '...', total);
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    
    return pages;
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mt-4 pt-4 border-t border-border">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">Mostrar</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            const newItemsPerPage = parseInt(e.target.value);
            onItemsPerPageChange(newItemsPerPage);
            onPageChange(1); // Reset to first page
          }}
          className="px-3 py-1 bg-background border border-border rounded-lg text-gray-300 text-sm focus:outline-none focus:border-accent"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-gray-400 text-sm">por página</span>
      </div>

      {/* Page info */}
      <div className="text-gray-400 text-sm">
        {startItem} - {endItem} de {totalItems} leads
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-border text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Primera página"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-border text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((page, idx) => (
          <React.Fragment key={idx}>
            {page === '...' ? (
              <span className="px-3 py-1 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`min-w-[36px] h-9 rounded-lg border transition-colors ${
                  currentPage === page
                    ? 'bg-accent border-accent text-white'
                    : 'border-border text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-border text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-border text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Última página"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Helper hook for pagination state
export const usePagination = (totalItems: number, initialItemsPerPage = 25) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(c => c + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(c => c - 1);
  };

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    setItemsPerPage,
    goToPage,
    nextPage,
    prevPage
  };
};

export default DashboardPagination;
