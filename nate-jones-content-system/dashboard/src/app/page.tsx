'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Check, Play, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  link: string;
  source_name: string;
  category: string | null;
  relevance_score: number | null;
  patrick_angle: string | null;
  published_date: string;
  scraped_at: string;
}

interface Script {
  id: string;
  script_id: number;
  script_date: string;
  script_title: string;
  script_type?: string;
  google_doc_url: string;
  word_count: number;
  patrick_focus?: string;
  status: string;
  created_at?: string;
}

export default function SimpleDashboard() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Auto-refresh every hour
  useEffect(() => {
    fetchContent();
    const interval = setInterval(() => {
      fetchContent();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, []);

  async function fetchContent() {
    try {
      const [contentRes, scriptsRes] = await Promise.all([
        fetch('/api/top-picks', { cache: 'no-store' }),
        fetch('/api/scripts', { cache: 'no-store' })
      ]);

      const [contentData, scriptsData] = await Promise.all([
        contentRes.json(),
        scriptsRes.json()
      ]);

      if (contentData.success && contentData.data) {
        setContent(contentData.data);
        setLastUpdate(new Date());
      }

      if (scriptsData.success && scriptsData.data) {
        setScripts(scriptsData.data.slice(0, 5)); // Show latest 5 scripts
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    if (selected.size === content.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(content.map(c => c.id)));
    }
  }

  async function generateScript() {
    if (selected.size === 0) {
      toast.error('Please select at least one article');
      return;
    }

    setGenerating(true);
    const toastId = toast.loading(`Generating script with ${selected.size} articles...`);

    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: 'script',
          selectedContentIds: Array.from(selected),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Script generated! Check your email or Scripts page.', { id: toastId });
        setSelected(new Set());
        fetchContent(); // Refresh to remove used items
      } else {
        toast.error(`Failed: ${data.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to generate script', { id: toastId });
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-400">AI Content for Patrick</span>
        </div>

        <h1 className="text-5xl font-bold mb-4">Your AI News Feed</h1>

        <p className="text-lg text-gray-400 mb-8">
          Top {content.length} AI articles automatically curated and categorized
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={fetchContent}
            className="px-6 py-3 glass rounded-xl flex items-center gap-2 hover:bg-white/10 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Now
          </button>

          <button
            onClick={selectAll}
            className="px-6 py-3 glass rounded-xl flex items-center gap-2 hover:bg-white/10 transition"
          >
            <Check className="w-4 h-4" />
            {selected.size === content.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-refreshes every hour</span>
          </div>
        </div>
      </div>

      {/* Selection Info */}
      {selected.size > 0 && (
        <div className="glass p-6 rounded-2xl text-center animate-fade-in">
          <p className="text-2xl font-bold mb-4">
            {selected.size} article{selected.size !== 1 ? 's' : ''} selected
          </p>

          <button
            onClick={generateScript}
            disabled={generating}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 spinner" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Generate Script
              </>
            )}
          </button>
        </div>
      )}

      {/* Content Grid */}
      <div className="space-y-4">
        {content.map((item, index) => {
          const isSelected = selected.has(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              className={`glass p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] opacity-0 animate-fade-in ${
                isSelected
                  ? 'border-2 border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                  : 'hover:bg-white/5'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-1 transition ${
                  isSelected
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-gray-500 hover:border-purple-400'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {item.category && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                        {item.category.replace('_', ' ')}
                      </span>
                    )}
                    {item.relevance_score && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.relevance_score >= 9
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {item.relevance_score}/10
                      </span>
                    )}
                    <span className="text-gray-500 text-sm">{item.source_name}</span>
                    {item.published_date && (
                      <span className="text-gray-500 text-xs">
                        • {new Date(item.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>

                  {item.patrick_angle && (
                    <p className="text-gray-400 mb-3">
                      💡 <span className="font-medium">For Patrick:</span> {item.patrick_angle}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      View source
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {item.scraped_at && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500 text-xs">
                          Scraped {new Date(item.scraped_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {content.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No content available yet</p>
          <p className="text-gray-500 text-sm mt-2">Content will auto-update every hour</p>
        </div>
      )}

      {/* Generated Scripts Section */}
      {scripts.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Recent Scripts</h2>
            <span className="text-gray-400 text-sm">{scripts.length} scripts</span>
          </div>

          <div className="space-y-4">
            {scripts.map((script, index) => (
              <div
                key={script.id}
                className="glass p-6 rounded-2xl hover:bg-white/5 transition opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {script.script_type && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                          {script.script_type.replace('_', ' ')}
                        </span>
                      )}
                      {script.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          script.status === 'approved'
                            ? 'bg-green-500/20 text-green-300'
                            : script.status === 'draft'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {script.status}
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">
                        #{script.script_id}
                      </span>
                      {script.script_date && (
                        <span className="text-gray-500 text-xs">
                          • {new Date(script.script_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{script.script_title || 'Untitled Script'}</h3>

                    {script.patrick_focus && (
                      <p className="text-gray-400 mb-3">
                        💡 <span className="font-medium">Focus:</span> {script.patrick_focus}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {script.word_count && <span>{script.word_count.toLocaleString()} words</span>}
                      {script.word_count && (script.created_at || script.script_date) && <span>•</span>}
                      {(script.created_at || script.script_date) && (
                        <span>Created {new Date(script.created_at || script.script_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {script.google_doc_url && (
                    <a
                      href={script.google_doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Doc
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {selected.size > 0 && (
        <div className="fixed bottom-8 right-8 animate-fade-in">
          <button
            onClick={generateScript}
            disabled={generating}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="w-6 h-6 spinner text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {selected.size}
          </div>
        </div>
      )}
    </div>
  );
}
