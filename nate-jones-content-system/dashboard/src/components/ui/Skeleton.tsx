'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  return (
    <div className={`skeleton ${variantClasses[variant]} ${className}`} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10" variant="rectangular" />
        <Skeleton className="w-20 h-4" variant="text" />
      </div>
      <Skeleton className="w-16 h-8" variant="text" />
    </div>
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="glass p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 shrink-0" variant="rectangular" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-12 h-4" variant="text" />
            <Skeleton className="w-16 h-4" variant="text" />
          </div>
          <Skeleton className="w-full h-5" variant="text" />
          <Skeleton className="w-3/4 h-4" variant="text" />
        </div>
      </div>
    </div>
  );
}

export function ScriptCardSkeleton() {
  return (
    <div className="glass p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-20 h-6" variant="rectangular" />
            <Skeleton className="w-24 h-4" variant="text" />
          </div>
          <Skeleton className="w-3/4 h-6" variant="text" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-4" variant="text" />
            <Skeleton className="w-20 h-4" variant="text" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="w-28 h-10" variant="rectangular" />
          <Skeleton className="w-28 h-10" variant="rectangular" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass p-6">
        <Skeleton className="w-32 h-6 mb-4" variant="text" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" variant="card" />
          ))}
        </div>
      </div>

      {/* Content Cards */}
      <div className="glass p-6">
        <Skeleton className="w-40 h-6 mb-4" variant="text" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
