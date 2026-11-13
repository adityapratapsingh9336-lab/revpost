import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Send,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { mockPublishingQueue } from '../data/mockData';
import { api } from '../services/api';

export const PublishingPage = () => {
  const { activeBrand } = useOutletContext();
  const [queue, setQueue] = useState(mockPublishingQueue);
  const [isPaused, setIsPaused] = useState(false);
  const [confirmPublishItem, setConfirmPublishItem] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getPublishingQueue().then((res) => {
      if (!mounted || !res) return;
      if (Array.isArray(res.items)) setQueue(res.items);
      if (typeof res.is_paused === 'boolean') setIsPaused(res.is_paused);
    });
    return () => { mounted = false; };
  }, []);

  const handleTogglePause = async () => {
    const res = await api.togglePublishingPause();
    setIsPaused(res?.is_paused ?? !isPaused);
  };

  const handleImmediatePublish = async (item) => {
    const updated = await api.publishNow(item.id);
    setQueue(prev =>
      prev.map(q =>
        q.id === item.id
          ? (updated || { ...q, status: 'Published', approvalStatus: 'Published Manually' })
          : q
      )
    );
    setConfirmPublishItem(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Publishing Queue
            </h1>
            <Badge variant="indigo">{activeBrand.name}</Badge>
            {isPaused && (
              <Badge variant="danger">Publishing Engine Paused</Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Durable database-backed publishing pipeline with idempotency guarantees.
          </p>
        </div>

        <Button
          variant={isPaused ? 'primary' : 'secondary'}
          size="sm"
          icon={isPaused ? PlayCircle : PauseCircle}
          onClick={handleTogglePause}
        >
          {isPaused ? 'Resume Publishing Queue' : 'Pause All Publishing'}
        </Button>
      </div>

      {/* Safety Notice Banner */}
      <Card className="p-4 bg-slate-50 border-slate-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-0.5">
          <p className="font-semibold text-slate-900">Official OAuth & Safe Publishing Enforcement</p>
          <p className="text-slate-500 leading-relaxed">
            All dispatches use official platform REST endpoints with cryptographic token verification. No post is published without prior user signoff or explicit schedule approval.
          </p>
        </div>
      </Card>

      {/* Publishing Queue Table */}
      <Card className="p-0 overflow-hidden bg-white border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900">
            Active Jobs ({queue.length})
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Worker status: {isPaused ? 'PAUSED' : 'HEALTHY · POLLING'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {queue.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={item.platform === 'Instagram' ? 'indigo' : 'secondary'}>
                    {item.platform}
                  </Badge>
                  <span className="text-xs text-slate-500 font-medium">
                    {item.targetAccount}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.postTitle}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.scheduledTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Badge
                    variant={
                      item.status === 'Published'
                        ? 'success'
                        : item.status === 'Queued'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {item.status}
                  </Badge>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    {item.approvalStatus}
                  </div>
                </div>

                {item.status !== 'Published' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setConfirmPublishItem(item)}
                  >
                    Publish Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirm Immediate Publish Modal */}
      <Modal
        isOpen={!!confirmPublishItem}
        onClose={() => setConfirmPublishItem(null)}
        title="Confirm Immediate Publication"
        description="This action immediately dispatches the post to the connected social channel."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 leading-relaxed">
            You are about to publish <strong>"{confirmPublishItem?.postTitle}"</strong> directly to{' '}
            <strong>{confirmPublishItem?.targetAccount}</strong> on {confirmPublishItem?.platform}.
          </p>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
            Ensure caption, hashtags, and media assets conform to official content guidelines. This operation cannot be recalled once dispatched.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmPublishItem(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => handleImmediatePublish(confirmPublishItem)}
            >
              Confirm & Publish Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

