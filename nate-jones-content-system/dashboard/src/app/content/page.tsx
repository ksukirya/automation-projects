'use client';

import { useEffect, useState } from 'react';
import {
  Zap,
  FileText,
  TrendingUp,
  Briefcase,
  ArrowLeft,
  ExternalLink,
  Filter,
} from 'lucide-react';

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

const quadrantConfig = {
  BREAKING: { icon: Zap, color: 'bg-red-500', textColor: 'text-red-400', label: 'Breaking' },
  STRATEGY: { icon: TrendingUp, color: 'bg-blue-500', textColor: 'text-blue-400', label: 'Strategy' },
  MARKET: { icon: Briefcase, color: 'bg-green-500', textColor: 'text-green-400', label: 'Market' },
  CAREER: { icon: FileText, color: 'bg-purple-500', textColor: 'text-purple-400', label: 'Career' },
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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-gray-400 text-sm">Browse and filter all scraped content</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filters:</span>
          </div>

          {/* Quadrant Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter((f) => ({ ...f, quadrant: null }))}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                !filter.quadrant ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Quadrants
            </button>
            {Object.entries(quadrantConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilter((f) => ({ ...f, quadrant: key }))}
                className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1.5 ${
                  filter.quadrant === key
                    ? `${config.color} text-white`
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <config.icon className="w-3 h-3" />
                {config.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={filter.status || ''}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value || null }))}
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-300 border-none"
          >
            <option value="">All Status</option>
            <option value="pending_categorization">Pending</option>
            <option value="categorized">Categorized</option>
            <option value="low_relevance">Low Relevance</option>
            <option value="used_in_script">Used in Script</option>
          </select>
        </div>

        <div className="flex gap-6">
          {/* Content List */}
          <div className="flex-1 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : content.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No content found</div>
            ) : (
              content.map((item) => {
                const quadrant = item.quadrant as keyof typeof quadrantConfig;
                const config = quadrantConfig[quadrant];
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 bg-gray-900 border rounded-xl cursor-pointer transition hover:border-gray-600 ${
                      selectedItem?.id === item.id ? 'border-blue-500' : 'border-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {config && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color} text-white`}>
                              {config.label}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">{item.source_type}</span>
                          {item.urgency === 'HIGH' && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                              Urgent
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium mb-1 line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {item.ai_summary || item.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            (item.relevance_score || 0) >= 7
                              ? 'bg-green-500/20 text-green-400'
                              : (item.relevance_score || 0) >= 5
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {item.relevance_score || '-'}/10
                        </span>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-white"
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
            <div className="w-96 bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-6 h-fit max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Details</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <h3 className="font-medium mb-4">{selectedItem.title}</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Quadrant</label>
                  <p className={quadrantConfig[selectedItem.quadrant as keyof typeof quadrantConfig]?.textColor || 'text-gray-400'}>
                    {selectedItem.quadrant || 'Not categorized'}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Relevance</label>
                  <p>{selectedItem.relevance_score || '-'}/10</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">AI Summary</label>
                  <p className="text-sm text-gray-300">{selectedItem.ai_summary || 'No summary'}</p>
                </div>

                {parseJSON(selectedItem.key_takeaways).length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Key Takeaways</label>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      {parseJSON(selectedItem.key_takeaways).map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {parseJSON(selectedItem.talking_points).length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Talking Points</label>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      {parseJSON(selectedItem.talking_points).map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-800">
                  <a
                    href={selectedItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Original
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
