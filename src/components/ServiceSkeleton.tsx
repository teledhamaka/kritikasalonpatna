// app/components/ServiceSkeleton.tsx
const ServiceSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ServiceSkeleton;