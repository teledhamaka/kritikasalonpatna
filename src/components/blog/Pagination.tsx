import Link from 'next/link';

export default function Pagination({ 
  totalPages, 
  currentPage,
  category,
  searchQuery,
  onPageChange
}: {
  totalPages: number;
  currentPage: number;
  category?: string;
  searchQuery?: string;
  onPageChange?: (page: number) => void;
}) {
  const basePath = category ? `/blog/category/${category}` : '/blog';
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(page);
    }
  };
  
  return (
    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
      {/* Previous Button */}
      {currentPage > 1 && (
        <Link
          href={`${basePath}?page=${currentPage - 1}${searchQuery ? `&search=${searchQuery}` : ''}`}
          onClick={(e) => handleClick(e, currentPage - 1)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
        >
          ← Previous
        </Link>
      )}

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set('search', searchQuery);
        if (page > 1) queryParams.set('page', page.toString());
        
        // Show first page, last page, current page, and pages around current
        const showPage = 
          page === 1 || 
          page === totalPages || 
          (page >= currentPage - 1 && page <= currentPage + 1);
        
        // Show ellipsis
        const showEllipsis = 
          (page === currentPage - 2 && currentPage > 3) ||
          (page === currentPage + 2 && currentPage < totalPages - 2);
        
        if (!showPage && !showEllipsis) return null;
        
        if (showEllipsis) {
          return (
            <span key={page} className="px-2 text-gray-400">
              ...
            </span>
          );
        }
        
        return (
          <Link
            key={page}
            href={`${basePath}${queryParams.toString() ? `?${queryParams}` : ''}`}
            onClick={(e) => handleClick(e, page)}
            className={`min-w-10 px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === page
                ? 'bg-pink-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {page}
          </Link>
        );
      })}

      {/* Next Button */}
      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}${searchQuery ? `&search=${searchQuery}` : ''}`}
          onClick={(e) => handleClick(e, currentPage + 1)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
        >
          Next →
        </Link>
      )}
    </div>
  );
}