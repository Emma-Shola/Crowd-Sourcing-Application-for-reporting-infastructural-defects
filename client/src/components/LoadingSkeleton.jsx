// Create a new file: src/components/LoadingSkeleton.jsx
export function ReportCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-800/50" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-700/50 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-700/50 rounded w-full" />
          <div className="h-4 bg-gray-700/50 rounded w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-700/50 rounded w-16" />
          <div className="h-6 bg-gray-700/50 rounded w-20" />
        </div>
        <div className="h-10 bg-gray-700/50 rounded" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gray-700/50">
          <div className="h-6 w-6 bg-gray-600/50 rounded" />
        </div>
        <div className="h-8 w-12 bg-gray-700/50 rounded" />
      </div>
      <div className="h-4 bg-gray-700/50 rounded w-24" />
    </div>
  );
}