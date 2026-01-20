'use client';

import { useEffect, useState } from 'react';
import {
  Zap,
  FileText,
  TrendingUp,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  RefreshCw,
  ExternalLink,
  Video,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';

interface Stats {
  total: number;
  pending: number;
  categorized: number;
  highRelevance: number;
  byQuadrant: {
    BREAKING: number;
    STRATEGY: number;
    MARKET: number;
    CAREER: number;
  };
  readyForScript: number;
}

interface ContentItem {
  id: string;
  title: string;
  source_type: string;
  quadrant: string | null;
  relevance_score: number | null;
  status: string;
  ai_summary: string | null;
  key_takeaways: string | null;
  link: string;
  scraped_at: string;
  thumbnail: string | null;
}

interface Script {
  id: string;
  script_id: number;
  script_date: string;
  script_title: string;
  google_doc_url: string;
  word_count: number;
  items_used: string;
  status: 'draft' | 'approved' | 'recorded' | 'uploaded';
}

type QuadrantKey = 'BREAKING' | 'STRATEGY' | 'MARKET' | 'CAREER';

const quadrantConfig: Record<QuadrantKey, { icon: typeof Zap; color: string; bgColor: string; label: string; description: string }> = {
  BREAKING: { icon: Zap, color: 'bg-red-500', bgColor: 'bg-red-500/10', label: 'Breaking News', description: 'Time-sensitive AI announcements' },
  STRATEGY: { icon: TrendingUp, color: 'bg-blue-500', bgColor: 'bg-blue-500/10', label: 'Strategy', description: 'Practical AI implementation insights' },
  MARKET: { icon: Briefcase, color: 'bg-green-500', bgColor: 'bg-green-500/10', label: 'Market', description: 'Industry trends and analysis' },
  CAREER: { icon: FileText, color: 'bg-purple-500', bgColor: 'bg-purple-500/10', label: 'Career', description: 'Professional development in AI' },
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [recentScripts, setRecentScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [expandedQuadrants, setExpandedQuadrants] = useState<Record<string, boolean>>({
    BREAKING: true,
    STRATEGY: true,
    MARKET: false,
    CAREER: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, contentRes, scriptsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/content'),
        fetch('/api/scripts'),
      ]);

      const statsData = await statsRes.json();
      const contentData = await contentRes.json();
      const scriptsData = await scriptsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (contentData.success) setAllContent(contentData.data);
      if (scriptsData.success) setRecentScripts(scriptsData.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const triggerWorkflow = async (workflow: string) => {
    setTriggering(workflow);
    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${workflow} workflow triggered successfully!`);
        setTimeout(fetchData, 2000);
      } else {
        alert(`Failed to trigger ${workflow}: ${data.error}`);
      }
    } catch (error) {
      alert(`Error triggering ${workflow}`);
    }
    setTriggering(null);
  };

  const toggleQuadrant = (quadrant: string) => {
    setExpandedQuadrants(prev => ({ ...prev, [quadrant]: !prev[quadrant] }));
  };

  // Group content by quadrant
  const contentByQuadrant = allContent.reduce((acc, item) => {
    const q = item.quadrant as QuadrantKey;
    if (q && quadrantConfig[q]) {
      if (!acc[q]) acc[q] = [];
      acc[q].push(item);
    }
    return acc;
  }, {} as Record<QuadrantKey, ContentItem[]>);

  // Get latest scraped content (last 10 items by scraped_at)
  const latestScraped = [...allContent]
    .sort((a, b) => new Date(b.scraped_at || 0).getTime() - new Date(a.scraped_at || 0).getTime())
    .slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Nate B Jones Content System</h1>
            <p className="text-gray-400 text-sm">Daily AI news pipeline for Patrick</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Total Content"
            value={stats?.total || 0}
            color="text-gray-400"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Categorized"
            value={stats?.categorized || 0}
            color="text-green-500"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5" />}
            label="High Relevance"
            value={stats?.highRelevance || 0}
            color="text-blue-500"
          />
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="Ready for Script"
            value={stats?.readyForScript || 0}
            color="text-purple-500"
          />
          <StatCard
            icon={<Video className="w-5 h-5" />}
            label="Scripts"
            value={recentScripts.length}
            color="text-red-500"
            href="/scripts"
          />
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              label="Run Scraper"
              description="Fetch latest content from Nate's channels"
              onClick={() => triggerWorkflow('scraper')}
              loading={triggering === 'scraper'}
              icon={<RefreshCw className="w-4 h-4" />}
            />
            <ActionButton
              label="Categorize Content"
              description="AI analyze pending content"
              onClick={() => triggerWorkflow('categorize')}
              loading={triggering === 'categorize'}
              icon={<Zap className="w-4 h-4" />}
            />
            <ActionButton
              label="Generate Script"
              description="Create today's video script"
              onClick={() => triggerWorkflow('script')}
              loading={triggering === 'script'}
              icon={<Play className="w-4 h-4" />}
              primary
            />
          </div>
        </div>

        {/* Latest Scraped Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Latest Scraped Content</h2>
            <span className="text-gray-500 text-sm">{latestScraped.length} items</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestScraped.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
          {latestScraped.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No content scraped yet. Run the scraper to fetch content.
            </p>
          )}
        </div>

        {/* Content by Quadrant */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold">Content by Category</h2>
          {(Object.keys(quadrantConfig) as QuadrantKey[]).map((quadrant) => {
            const config = quadrantConfig[quadrant];
            const items = contentByQuadrant[quadrant] || [];
            const Icon = config.icon;
            const isExpanded = expandedQuadrants[quadrant];

            return (
              <div key={quadrant} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleQuadrant(quadrant)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${config.color} p-2 rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">{config.label}</h3>
                      <p className="text-gray-400 text-sm">{config.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor}`}>
                      {items.length} items
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && items.length > 0 && (
                  <div className="border-t border-gray-800 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <ContentCard key={item.id} item={item} compact />
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && items.length === 0 && (
                  <div className="border-t border-gray-800 p-8 text-center text-gray-500">
                    No content in this category yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent Scripts */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Scripts</h2>
            <a href="/scripts" className="text-blue-400 hover:text-blue-300 text-sm">
              View all scripts
            </a>
          </div>
          <div className="space-y-3">
            {recentScripts.map((script) => {
              const statusColors = {
                draft: 'bg-yellow-500/20 text-yellow-400',
                approved: 'bg-blue-500/20 text-blue-400',
                recorded: 'bg-purple-500/20 text-purple-400',
                uploaded: 'bg-green-500/20 text-green-400',
              };
              return (
                <div
                  key={script.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[script.status]}`}>
                        {script.status}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {script.script_date && format(new Date(script.script_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="font-medium truncate">{script.script_title}</p>
                    <p className="text-sm text-gray-400">{script.word_count} words</p>
                  </div>
                  <a
                    href={script.google_doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm ml-4"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </a>
                </div>
              );
            })}
            {recentScripts.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No scripts generated yet. Click "Generate Script" to create your first script.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ContentCard({ item, compact }: { item: ContentItem; compact?: boolean }) {
  const quadrant = item.quadrant as QuadrantKey;
  const config = quadrant ? quadrantConfig[quadrant] : null;

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${compact ? '' : 'border border-gray-700'}`}>
      <div className="flex items-start gap-3">
        {config && (
          <div className={`${config.color} p-1.5 rounded shrink-0`}>
            <config.icon className="w-3 h-3 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {item.relevance_score && (
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  item.relevance_score >= 7
                    ? 'bg-green-500/20 text-green-400'
                    : item.relevance_score >= 5
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {item.relevance_score}/10
              </span>
            )}
            <span className="text-gray-500 text-xs">
              {item.scraped_at && format(new Date(item.scraped_at), 'MMM d')}
            </span>
          </div>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sm hover:text-blue-400 transition line-clamp-2"
          >
            {item.title}
          </a>
          {item.ai_summary && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.ai_summary}</p>
          )}
          {item.key_takeaways && !compact && (
            <p className="text-gray-500 text-xs mt-2 line-clamp-2">
              <span className="text-gray-400">Takeaways:</span> {item.key_takeaways}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </>
  );

  if (href) {
    return (
      <a href={href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition">
        {content}
      </a>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      {content}
    </div>
  );
}

function ActionButton({
  label,
  description,
  onClick,
  loading,
  icon,
  primary,
}: {
  label: string;
  description: string;
  onClick: () => void;
  loading: boolean;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`p-4 rounded-xl text-left transition ${
        primary
          ? 'bg-blue-600 hover:bg-blue-500'
          : 'bg-gray-800 hover:bg-gray-700'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : icon}
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </button>
  );
}
