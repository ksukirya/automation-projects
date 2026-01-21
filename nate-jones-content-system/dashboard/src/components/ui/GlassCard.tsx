'use client';

import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'gradient';
  onClick?: () => void;
  style?: React.CSSProperties;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function GlassCard({
  children,
  className = '',
  hover = false,
  padding = 'md',
  variant = 'default',
  onClick,
  style,
}: GlassCardProps) {
  const baseClasses = variant === 'gradient'
    ? 'gradient-border backdrop-blur-xl'
    : variant === 'subtle'
    ? 'glass-subtle'
    : 'glass';

  const hoverClasses = hover ? 'glass-hover cursor-pointer' : '';
  const paddingClass = paddingClasses[padding];

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${paddingClass} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}

interface GlassStatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  color?: string;
  href?: string;
  delay?: number;
}

export function GlassStatCard({
  icon,
  label,
  value,
  color = 'text-gray-400',
  href,
  delay = 0,
}: GlassStatCardProps) {
  const content = (
    <div
      className={`opacity-0 animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>{icon}</div>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );

  if (href) {
    return (
      <a href={href}>
        <GlassCard hover className="h-full">
          {content}
        </GlassCard>
      </a>
    );
  }

  return (
    <GlassCard hover className="h-full">
      {content}
    </GlassCard>
  );
}
