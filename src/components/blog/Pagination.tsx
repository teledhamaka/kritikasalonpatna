import Link from 'next/link';

export default function Pagination({ 
  totalPages, 
  currentPage,
  category,
  searchQuery
}: {
  totalPages: number;
  currentPage: number;
  category?: string;
  searchQuery?: string;
}) {
  const basePath = category ? `/blog/category/${category}` : '/blog';
  
  return (
    <div className="flex justify-center mt-8">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set('search', searchQuery);
        if (page > 1) queryParams.set('page', page.toString());
        
        return (
          <Link
            key={page}
            href={`${basePath}${queryParams.toString() ? `?${queryParams}` : ''}`}
            className={`mx-1 px-4 py-2 rounded ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {page}
          </Link>
        );
      })}
    </div>
  );
}