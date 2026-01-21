'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  ExternalLink,
  CheckCircle,
  Video,
  Upload,
  Trash2,
  Loader2,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { GlassCard, AnimatedCounter, ScriptCardSkeleton } from '@/components/ui';

interface Script {
  id: string;
  script_id: number;
  script_date: string;
  script_title: string;
  google_doc_url: string;
  word_count: number;
  items_used: string;
  status: 'draft' | 'approved' | 'recorded' | 'uploaded';
  youtube_url: string | null;
  notes: string | null;
  created_at: string;
}

const statusConfig = {
  draft: { icon: FileText, class: 'badge-yellow', label: 'Draft' },
  approved: { icon: CheckCircle, class: 'badge-blue', label: 'Approved' },
  recorded: { icon: Video, class: 'badge-purple', label: 'Recorded' },
  uploaded: { icon: Upload, class: 'badge-green', label: 'Uploaded' },
};

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scripts');
      const data = await res.json();
      if (data.success) setScripts(data.data);
    } catch (error) {
      console.error('Error fetching scripts:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: Script['status']) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/scripts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setScripts((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
    setUpdating(null);
  };

  const deleteScriptHandler = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/scripts?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setScripts((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting script:', error);
    }
    setDeleting(null);
  };

  const getNextStatus = (current: Script['status']): Script['status'] | null => {
    const flow: Script['status'][] = ['draft', 'approved', 'recorded', 'uploaded'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-fade-in">
        <h1 className="text-3xl font-bold gradient-text">Scripts</h1>
        <p className="text-gray-400 mt-1">Manage your generated video scripts</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config], index) => {
          const Icon = config.icon;
          const count = scripts.filter((s) => s.status === key).length;
          return (
            <GlassCard
              key={key}
              hover
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-white/5">
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-gray-400 text-sm">{config.label}</span>
              </div>
              <p className="text-3xl font-bold">
                <AnimatedCounter value={count} />
              </p>
            </GlassCard>
          );
        })}
      </div>

      {/* Scripts List */}
      <div className="space-y-4">
        {loading ? (
          <>
            <ScriptCardSkeleton />
            <ScriptCardSkeleton />
            <ScriptCardSkeleton />
          </>
        ) : scripts.length === 0 ? (
          <GlassCard className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Video className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-gray-400 text-lg">No scripts generated yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Use the dashboard to generate your first script
            </p>
          </GlassCard>
        ) : (
          scripts.map((script, index) => {
            const status = statusConfig[script.status];
            const StatusIcon = status.icon;
            const nextStatus = getNextStatus(script.status);
            const itemsUsed = script.items_used ? JSON.parse(script.items_used).length : 0;

            return (
              <GlassCard
                key={script.id}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${200 + index * 50}ms` } as React.CSSProperties}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`badge ${status.class} flex items-center gap-1.5`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {script.script_date && format(new Date(script.script_date), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{script.script_title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        {(script.word_count || 0).toLocaleString()} words
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      <span>{itemsUsed} content items</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        ~{Math.round((script.word_count || 0) / 150)} min read
                      </span>
                    </div>

                    {script.notes && (
                      <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-sm text-gray-400">{script.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col gap-2">
                    <a
                      href={script.google_doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass glass-hover flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Script
                    </a>

                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(script.id, nextStatus)}
                        disabled={updating === script.id}
                        className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm disabled:opacity-50"
                      >
                        {updating === script.id ? (
                          <Loader2 className="w-4 h-4 spinner" />
                        ) : (
                          <>Mark as {statusConfig[nextStatus].label}</>
                        )}
                      </button>
                    )}

                    {script.youtube_url && (
                      <a
                        href={script.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition"
                      >
                        <Video className="w-4 h-4" />
                        Watch Video
                      </a>
                    )}

                    <button
                      onClick={() => deleteScriptHandler(script.id, script.script_title)}
                      disabled={deleting === script.id}
                      className="glass flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:border-red-500/30 transition disabled:opacity-50"
                    >
                      {deleting === script.id ? (
                        <Loader2 className="w-4 h-4 spinner" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
