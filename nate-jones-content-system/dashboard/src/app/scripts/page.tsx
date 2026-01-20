'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, ExternalLink, CheckCircle, Clock, Video, Upload } from 'lucide-react';
import { format } from 'date-fns';

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
  draft: { icon: FileText, color: 'bg-yellow-500/20 text-yellow-400', label: 'Draft' },
  approved: { icon: CheckCircle, color: 'bg-blue-500/20 text-blue-400', label: 'Approved' },
  recorded: { icon: Video, color: 'bg-purple-500/20 text-purple-400', label: 'Recorded' },
  uploaded: { icon: Upload, color: 'bg-green-500/20 text-green-400', label: 'Uploaded' },
};

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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

  const getNextStatus = (current: Script['status']): Script['status'] | null => {
    const flow: Script['status'][] = ['draft', 'approved', 'recorded', 'uploaded'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
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
          <h1 className="text-2xl font-bold">Scripts</h1>
          <p className="text-gray-400 text-sm">Manage your generated video scripts</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = scripts.filter((s) => s.status === key).length;
            return (
              <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{config.label}</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Scripts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : scripts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No scripts generated yet. Use the dashboard to generate your first script.
            </div>
          ) : (
            scripts.map((script) => {
              const status = statusConfig[script.status];
              const StatusIcon = status.icon;
              const nextStatus = getNextStatus(script.status);
              const itemsUsed = script.items_used ? JSON.parse(script.items_used).length : 0;

              return (
                <div
                  key={script.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {script.script_date && format(new Date(script.script_date), 'MMM d, yyyy')}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium mb-2">{script.script_title}</h3>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{script.word_count} words</span>
                        <span>•</span>
                        <span>{itemsUsed} content items</span>
                        <span>•</span>
                        <span>~{Math.round(script.word_count / 150)} min read</span>
                      </div>

                      {script.notes && (
                        <p className="mt-3 text-sm text-gray-400 bg-gray-800 rounded-lg p-3">
                          {script.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <a
                        href={script.google_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Script
                      </a>

                      {nextStatus && (
                        <button
                          onClick={() => updateStatus(script.id, nextStatus)}
                          disabled={updating === script.id}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition text-sm disabled:opacity-50"
                        >
                          {updating === script.id ? (
                            <Clock className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              Mark as {statusConfig[nextStatus].label}
                            </>
                          )}
                        </button>
                      )}

                      {script.youtube_url && (
                        <a
                          href={script.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition text-sm"
                        >
                          <Video className="w-4 h-4" />
                          Watch Video
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
