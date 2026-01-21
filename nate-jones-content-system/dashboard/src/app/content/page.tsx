'use client';

import { useEffect, useState } from 'react';
import {
  Zap,
  FileText,
  TrendingUp,
  Briefcase,
  ExternalLink,
  Filter,
  X,
  Search,
} from 'lucide-react';
import { GlassCard, ContentCardSkeleton } from '@/components/ui';

interface ContentItem {
  id: string;
  content_id: string;
  title: string;
  link: string;
  published_date: string;
  author: string;
  description: string;
  source: string;
  source_type: string;
  status: string;
  quadrant: string | null;
  relevance_score: number | null;
  urgency: string | null;
  key_takeaways: string | null;
  talking_points: string | null;
  ai_summary: string | null;
  used_in_script: boolean;
  scraped_at: string;
}

type QuadrantKey = 'BREAKING' | 'STRATEGY' | 'MARKET' | 'CAREER';

const quadrantConfig: Record<QuadrantKey, {
  icon: typeof Zap;
  color: string;
  bgColor: string;
  badgeClass: string;
  label: string;
}> = {
  BREAKING: { icon: Zap, color: 'text-red-400', bgColor: 'bg-red-500/10', badgeClass: 'badge-red', label: 'Breaking' },
  STRATEGY: { icon: TrendingUp, color: 'text-blue-400', bgColor: 'bg-blue-500/10', badgeClass: 'badge-blue', label: 'Strategy' },
  MARKET: { icon: Briefcase, color: 'text-green-400', bgColor: 'bg-green-500/10', badgeClass: 'badge-green', label: 'Market' },
  CAREER: { icon: FileText, color: 'text-purple-400', bgColor: 'bg-purple-500/10', badgeClass: 'badge-purple', label: 'Career' },
};

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ quadrant: string | null; status: string | null }>({
    quadrant: null,
    status: null,
  });
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    fetchContent();
  }, [filter]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.quadrant) params.set('quadrant', filter.quadrant);
      if (filter.status) params.set('status', filter.status);

      const res = await fetch(`/api/content?${params.toString()}`);
      const data = await res.json();
      if (data.success) setContent(data.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
    setLoading(false);
  };

  const parseJSON = (str: string | null): string[] => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-fade-in">
        <h1 className="text-3xl font-bold gradient-text">Content Library</h1>
        <p className="text-gray-400 mt-1">Browse and filter all scraped content</p>
      </div>

      {/* Filters */}
      <GlassCard className="opacity-0 animate-fade-in" style={{ animationDelay: '50ms' } as React.CSSProperties}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>

          {/* Quadrant Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter((f) => ({ ...f, quadrant: null }))}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                !filter.quadrant
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {(Object.entries(quadrantConfig) as [QuadrantKey, typeof quadrantConfig[QuadrantKey]][]).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setFilter((f) => ({ ...f, quadrant: key }))}
                  className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1.5 ${
                    filter.quadrant === key
                      ? `${config.bgColor} ${config.color} border border-current/30`
                      : 'glass text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <select
            value={filter.status || ''}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value || null }))}
            className="glass-input px-3 py-1.5 text-sm text-gray-300"
          >
            <option value="">All Status</option>
            <option value="pending_categorization">Pending</option>
            <option value="categorized">Categorized</option>
            <option value="low_relevance">Low Relevance</option>
            <option value="used_in_script">Used in Script</option>
          </select>
        </div>
      </GlassCard>

      <div className="flex gap-6">
        {/* Content List */}
        <div className="flex-1 space-y-3">
          {loading ? (
            <>
              <ContentCardSkeleton />
              <ContentCardSkeleton />
              <ContentCardSkeleton />
              <ContentCardSkeleton />
            </>
          ) : content.length === 0 ? (
            <GlassCard className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-400 text-lg">No content found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your filters or run the scraper
              </p>
            </GlassCard>
          ) : (
            content.map((item, index) => {
              const quadrant = item.quadrant as QuadrantKey;
              const config = quadrantConfig[quadrant];
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`glass glass-hover p-4 cursor-pointer opacity-0 animate-fade-in ${
                    selectedItem?.id === item.id ? 'border-purple-500/50' : ''
                  }`}
                  style={{ animationDelay: `${100 + index * 30}ms` } as React.CSSProperties}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {config && (
                          <span className={`badge ${config.badgeClass}`}>
                            <config.icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{item.source_type}</span>
                        {item.urgency === 'HIGH' && (
                          <span className="badge badge-red">Urgent</span>
                        )}
                      </div>
                      <h3 className="font-medium mb-1 line-clamp-2 hover:text-purple-400 transition">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {item.ai_summary || item.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`badge ${
                          (item.relevance_score || 0) >= 7
                            ? 'badge-green'
                            : (item.relevance_score || 0) >= 5
                            ? 'badge-yellow'
                            : 'badge-gray'
                        }`}
                      >
                        {item.relevance_score || '-'}/10
                      </span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-purple-400 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        {selectedItem && (
          <div className="hidden lg:block w-96 shrink-0">
            <GlassCard className="sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold gradient-text">Details</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-medium mb-4 leading-relaxed">{selectedItem.title}</h3>

              <div className="space-y-4">
                <DetailSection label="Category">
                  {selectedItem.quadrant ? (
                    <span className={`badge ${quadrantConfig[selectedItem.quadrant as QuadrantKey]?.badgeClass || 'badge-gray'}`}>
                      {selectedItem.quadrant}
                    </span>
                  ) : (
                    <span className="text-gray-500">Not categorized</span>
                  )}
                </DetailSection>

                <DetailSection label="Relevance">
                  <span className={`badge ${
                    (selectedItem.relevance_score || 0) >= 7
                      ? 'badge-green'
                      : (selectedItem.relevance_score || 0) >= 5
                      ? 'badge-yellow'
                      : 'badge-gray'
                  }`}>
                    {selectedItem.relevance_score || '-'}/10
                  </span>
                </DetailSection>

                <DetailSection label="AI Summary">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {selectedItem.ai_summary || 'No summary available'}
                  </p>
                </DetailSection>

                {parseJSON(selectedItem.key_takeaways).length > 0 && (
                  <DetailSection label="Key Takeaways">
                    <ul className="space-y-2">
                      {parseJSON(selectedItem.key_takeaways).map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </DetailSection>
                )}

                {parseJSON(selectedItem.talking_points).length > 0 && (
                  <DetailSection label="Talking Points">
                    <ul className="space-y-2">
                      {parseJSON(selectedItem.talking_points).map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </DetailSection>
                )}

                <div className="pt-4 border-t border-white/5">
                  <a
                    href={selectedItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Original
                  </a>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
