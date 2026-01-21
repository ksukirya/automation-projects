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
  Loader2,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { GlassCard, AnimatedCounter, DashboardSkeleton } from '@/components/ui';

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

const quadrantConfig: Record<QuadrantKey, {
  icon: typeof Zap;
  color: string;
  bgColor: string;
  badgeClass: string;
  label: string;
  description: string;
}> = {
  BREAKING: {
    icon: Zap,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    badgeClass: 'badge-red',
    label: 'Breaking News',
    description: 'Time-sensitive AI announcements'
  },
  STRATEGY: {
    icon: TrendingUp,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    badgeClass: 'badge-blue',
    label: 'Strategy',
    description: 'Practical AI implementation insights'
  },
  MARKET: {
    icon: Briefcase,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    badgeClass: 'badge-green',
    label: 'Market',
    description: 'Industry trends and analysis'
  },
  CAREER: {
    icon: FileText,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    badgeClass: 'badge-purple',
    label: 'Career',
    description: 'Professional development in AI'
  },
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
  const [selectedContent, setSelectedContent] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

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

  const workflowMessages: Record<string, { loading: string; success: string; error: string }> = {
    scraper: {
      loading: 'Running scraper...',
      success: 'Successfully scraped new content items',
      error: 'Failed to run scraper',
    },
    categorize: {
      loading: 'Categorizing content...',
      success: 'All content has been categorized',
      error: 'Failed to categorize content',
    },
    script: {
      loading: 'Generating script...',
      success: 'New script draft has been generated',
      error: 'Failed to generate script',
    },
  };

  const triggerWorkflow = async (workflow: string) => {
    setTriggering(workflow);
    const messages = workflowMessages[workflow] || {
      loading: `Running ${workflow}...`,
      success: `${workflow} completed successfully`,
      error: `Failed to run ${workflow}`,
    };

    const toastId = toast.loading(messages.loading);

    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(messages.success, { id: toastId });
        setTimeout(fetchData, 2000);
      } else {
        toast.error(`${messages.error}: ${data.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error(messages.error, { id: toastId });
    }
    setTriggering(null);
  };

  const toggleQuadrant = (quadrant: string) => {
    setExpandedQuadrants(prev => ({ ...prev, [quadrant]: !prev[quadrant] }));
  };

  const toggleContentSelection = (id: string) => {
    setSelectedContent(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedContent(new Set());
    setSelectionMode(false);
  };

  const selectAllInQuadrant = (quadrant: QuadrantKey) => {
    const items = contentByQuadrant[quadrant] || [];
    setSelectedContent(prev => {
      const next = new Set(prev);
      items.forEach(item => next.add(item.id));
      return next;
    });
  };

  const generateScriptWithSelected = async () => {
    if (selectedContent.size === 0) {
      toast.error('Please select at least one article');
      return;
    }

    setTriggering('script');
    const toastId = toast.loading(`Generating script with ${selectedContent.size} selected articles...`);

    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: 'script',
          selectedContentIds: Array.from(selectedContent),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Script generation started with your selected articles', { id: toastId });
        clearSelection();
        setTimeout(fetchData, 2000);
      } else {
        toast.error(`Failed to generate script: ${data.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to generate script', { id: toastId });
    }
    setTriggering(null);
  };

  const contentByQuadrant = allContent.reduce((acc, item) => {
    const q = item.quadrant as QuadrantKey;
    if (q && quadrantConfig[q]) {
      if (!acc[q]) acc[q] = [];
      acc[q].push(item);
    }
    return acc;
  }, {} as Record<QuadrantKey, ContentItem[]>);

  const latestScraped = [...allContent]
    .sort((a, b) => new Date(b.scraped_at || 0).getTime() - new Date(a.scraped_at || 0).getTime())
    .slice(0, 10);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-400 mt-1">AI-powered content pipeline for Patrick</p>
        </div>
        <button
          onClick={fetchData}
          className="glass glass-hover flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Total Content"
          value={stats?.total || 0}
          color="text-gray-400"
          delay={0}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Categorized"
          value={stats?.categorized || 0}
          color="text-green-400"
          delay={50}
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="High Relevance"
          value={stats?.highRelevance || 0}
          color="text-blue-400"
          delay={100}
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Ready for Script"
          value={stats?.readyForScript || 0}
          color="text-purple-400"
          delay={150}
        />
        <StatCard
          icon={<Video className="w-5 h-5" />}
          label="Scripts"
          value={recentScripts.length}
          color="text-red-400"
          href="/scripts"
          delay={200}
        />
      </div>

      {/* Quick Actions */}
      <GlassCard className="opacity-0 animate-fade-in" style={{ animationDelay: '250ms' } as React.CSSProperties}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ActionButton
            label="Run Scraper"
            description="Fetch latest content from channels"
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
            label="Auto Generate Script"
            description="Use all high-relevance content"
            onClick={() => triggerWorkflow('script')}
            loading={triggering === 'script' && !selectionMode}
            icon={<Play className="w-4 h-4" />}
          />
          <ActionButton
            label={selectionMode ? 'Cancel Selection' : 'Select Articles'}
            description={selectionMode ? 'Exit selection mode' : 'Pick specific articles for script'}
            onClick={() => {
              if (selectionMode) {
                clearSelection();
              } else {
                setSelectionMode(true);
              }
            }}
            loading={false}
            icon={selectionMode ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            primary={!selectionMode}
          />
        </div>
      </GlassCard>

      {/* Latest Scraped Content */}
      <GlassCard className="opacity-0 animate-fade-in" style={{ animationDelay: '300ms' } as React.CSSProperties}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {selectionMode ? 'Select Articles for Script' : 'Latest Scraped Content'}
          </h2>
          <div className="flex items-center gap-2">
            {selectionMode && (
              <span className="badge badge-purple">
                {selectedContent.size} selected
              </span>
            )}
            <span className="badge badge-gray">{latestScraped.length} items</span>
          </div>
        </div>
        {selectionMode && (
          <p className="text-gray-400 text-sm mb-4">
            Click on articles to select them for your custom script. You can also expand categories below to select from specific quadrants.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestScraped.map((item, index) => (
            <ContentCard
              key={item.id}
              item={item}
              delay={index * 30}
              selectable={selectionMode}
              selected={selectedContent.has(item.id)}
              onToggleSelect={toggleContentSelection}
            />
          ))}
        </div>
        {latestScraped.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">No content scraped yet</p>
            <p className="text-gray-500 text-sm mt-1">Run the scraper to fetch content</p>
          </div>
        )}
      </GlassCard>

      {/* Content by Quadrant */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold opacity-0 animate-fade-in" style={{ animationDelay: '350ms' } as React.CSSProperties}>
          Content by Category
        </h2>
        {(Object.keys(quadrantConfig) as QuadrantKey[]).map((quadrant, index) => {
          const config = quadrantConfig[quadrant];
          const items = contentByQuadrant[quadrant] || [];
          const Icon = config.icon;
          const isExpanded = expandedQuadrants[quadrant];

          return (
            <GlassCard
              key={quadrant}
              padding="none"
              className={`opacity-0 animate-fade-in overflow-hidden accent-${quadrant.toLowerCase()}`}
              style={{ animationDelay: `${400 + index * 50}ms` } as React.CSSProperties}
            >
              <button
                onClick={() => toggleQuadrant(quadrant)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${config.bgColor}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">{config.label}</h3>
                    <p className="text-gray-500 text-sm">{config.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${config.badgeClass}`}>
                    {items.length} items
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              <div
                className="accordion-content"
                style={{
                  maxHeight: isExpanded && items.length > 0 ? '2000px' : '0',
                  opacity: isExpanded ? 1 : 0,
                }}
              >
                <div className="border-t border-white/5 p-4">
                  {selectionMode && items.length > 0 && (
                    <button
                      onClick={() => selectAllInQuadrant(quadrant)}
                      className="mb-3 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Select all in {config.label}
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        compact
                        selectable={selectionMode}
                        selected={selectedContent.has(item.id)}
                        onToggleSelect={toggleContentSelection}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {isExpanded && items.length === 0 && (
                <div className="border-t border-white/5 p-8 text-center text-gray-500">
                  No content in this category yet.
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Recent Scripts */}
      <GlassCard className="opacity-0 animate-fade-in" style={{ animationDelay: '600ms' } as React.CSSProperties}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-400" />
            Recent Scripts
          </h2>
          <a
            href="/scripts"
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View all
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </a>
        </div>
        <div className="space-y-3">
          {recentScripts.map((script, index) => (
            <ScriptCard key={script.id} script={script} delay={index * 50} />
          ))}
          {recentScripts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Video className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">No scripts generated yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Click "Generate Script" to create your first script
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Floating Selection Bar */}
      {selectionMode && selectedContent.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="glass flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border border-purple-500/30">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium">{selectedContent.size} articles selected</p>
                <p className="text-gray-400 text-xs">Ready for script generation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="glass glass-hover px-4 py-2 rounded-xl text-sm flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={generateScriptWithSelected}
                disabled={triggering === 'script'}
                className="btn-primary px-6 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {triggering === 'script' ? (
                  <Loader2 className="w-4 h-4 spinner" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Generate Script
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentCard({
  item,
  compact,
  delay = 0,
  selectable,
  selected,
  onToggleSelect,
}: {
  item: ContentItem;
  compact?: boolean;
  delay?: number;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const quadrant = item.quadrant as QuadrantKey;
  const config = quadrant ? quadrantConfig[quadrant] : null;

  const handleClick = (e: React.MouseEvent) => {
    if (selectable && onToggleSelect) {
      e.preventDefault();
      onToggleSelect(item.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`glass-subtle p-4 opacity-0 animate-fade-in transition-all ${
        selectable ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30'
          : 'glass-hover'
      }`}
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      <div className="flex items-start gap-3">
        {selectable && (
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              selected
                ? 'bg-purple-500 border-purple-500'
                : 'border-gray-500 hover:border-purple-400'
            }`}
          >
            {selected && <Check className="w-3 h-3 text-white" />}
          </div>
        )}
        {config && !selectable && (
          <div className={`p-2 rounded-lg ${config.bgColor} shrink-0`}>
            <config.icon className={`w-4 h-4 ${config.color}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {config && selectable && (
              <span className={`badge text-xs ${config.badgeClass}`}>
                {config.label}
              </span>
            )}
            {item.relevance_score && (
              <span
                className={`badge text-xs ${
                  item.relevance_score >= 7
                    ? 'badge-green'
                    : item.relevance_score >= 5
                    ? 'badge-yellow'
                    : 'badge-gray'
                }`}
              >
                {item.relevance_score}/10
              </span>
            )}
            <span className="text-gray-500 text-xs">
              {item.scraped_at && format(new Date(item.scraped_at), 'MMM d')}
            </span>
          </div>
          {selectable ? (
            <p className="font-medium text-sm line-clamp-2">{item.title}</p>
          ) : (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sm hover:text-purple-400 transition line-clamp-2"
            >
              {item.title}
            </a>
          )}
          {item.ai_summary && (
            <p className="text-gray-400 text-xs mt-1.5 line-clamp-2">{item.ai_summary}</p>
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
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  href?: string;
  delay?: number;
}) {
  const content = (
    <div
      className="opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl bg-white/5 ${color}`}>{icon}</div>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold">
        <AnimatedCounter value={value} />
      </p>
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
      className={`p-4 rounded-xl text-left transition relative overflow-hidden ${
        primary
          ? 'btn-primary pulse-glow'
          : 'glass glass-hover'
      } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {loading ? (
          <Loader2 className="w-4 h-4 spinner" />
        ) : (
          <span className={primary ? 'text-white' : 'text-purple-400'}>{icon}</span>
        )}
        <span className="font-medium">{label}</span>
      </div>
      <p className={`text-sm ${primary ? 'text-white/70' : 'text-gray-400'}`}>
        {description}
      </p>
    </button>
  );
}

function ScriptCard({ script, delay = 0 }: { script: Script; delay?: number }) {
  const statusConfig = {
    draft: { class: 'badge-yellow', label: 'Draft' },
    approved: { class: 'badge-blue', label: 'Approved' },
    recorded: { class: 'badge-purple', label: 'Recorded' },
    uploaded: { class: 'badge-green', label: 'Uploaded' },
  };

  const status = statusConfig[script.status];

  return (
    <div
      className="glass-subtle glass-hover flex items-center justify-between p-4 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className={`badge ${status.class}`}>{status.label}</span>
          <span className="text-gray-500 text-sm">
            {script.script_date && format(new Date(script.script_date), 'MMM d, yyyy')}
          </span>
        </div>
        <p className="font-medium truncate">{script.script_title}</p>
        <p className="text-sm text-gray-400">{(script.word_count || 0).toLocaleString()} words</p>
      </div>
      <a
        href={script.google_doc_url}
        target="_blank"
        rel="noopener noreferrer"
        className="glass glass-hover flex items-center gap-2 px-4 py-2 rounded-xl text-sm ml-4"
      >
        <ExternalLink className="w-4 h-4" />
        Open
      </a>
    </div>
  );
}
