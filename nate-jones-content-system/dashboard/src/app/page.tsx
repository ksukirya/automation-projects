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
} from 'lucide-react';

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
  link: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, contentRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/content?status=categorized'),
      ]);

      const statsData = await statsRes.json();
      const contentData = await contentRes.json();

      if (statsData.success) setStats(statsData.data);
      if (contentData.success) setRecentContent(contentData.data.slice(0, 10));
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

  const quadrantConfig = {
    BREAKING: { icon: Zap, color: 'bg-red-500', label: 'Breaking' },
    STRATEGY: { icon: TrendingUp, color: 'bg-blue-500', label: 'Strategy' },
    MARKET: { icon: Briefcase, color: 'bg-green-500', label: 'Market' },
    CAREER: { icon: FileText, color: 'bg-purple-500', label: 'Career' },
  };

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pending"
            value={stats?.pending || 0}
            color="text-yellow-500"
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
        </div>

        {/* Quadrant Distribution */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(quadrantConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = stats?.byQuadrant[key as keyof typeof stats.byQuadrant] || 0;
            return (
              <div
                key={key}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${config.color} p-2 rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-400 text-sm">{config.label}</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
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

        {/* Recent Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Categorized Content</h2>
            <a
              href="/content"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View all
            </a>
          </div>
          <div className="space-y-3">
            {recentContent.map((item) => {
              const quadrant = item.quadrant as keyof typeof quadrantConfig;
              const config = quadrantConfig[quadrant];
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {config && (
                      <div className={`${config.color} p-1.5 rounded`}>
                        <config.icon className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-sm text-gray-400 truncate">
                        {item.ai_summary || 'No summary'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        (item.relevance_score || 0) >= 7
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {item.relevance_score || '-'}/10
                    </span>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      ↗
                    </a>
                  </div>
                </div>
              );
            })}
            {recentContent.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No categorized content yet. Run the scraper and categorization workflows.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
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
