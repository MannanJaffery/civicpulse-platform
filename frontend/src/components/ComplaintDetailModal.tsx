import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Clock,
  MapPin,
  User,
  Cpu,
  AlertTriangle,
  FileText,
  Activity,
  RefreshCw,
  Droplets,
  Zap,
  Trash2,
  Footprints,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';
import { getComplaint, updateStatus } from '../api/client';
import { Complaint, Category, Priority, Status } from '../types';

interface ComplaintDetailModalProps {
  complaintId: string | null;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  onClose,
  onStatusUpdated,
}) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!complaintId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getComplaint(complaintId);
        setComplaint(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch complaint details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [complaintId]);

  const handleCopyId = () => {
    if (!complaintId) return;
    navigator.clipboard.writeText(complaintId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusTransition = async (newStatus: Status) => {
    if (!complaint) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateStatus(complaint.id, newStatus);
      setComplaint(updated);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      setError(err.message || 'Status transition failed.');
    } finally {
      setUpdating(false);
    }
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case Category.water:
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case Category.electricity:
        return <Zap className="w-4 h-4 text-amber-500" />;
      case Category.sanitation:
        return <Trash2 className="w-4 h-4 text-cyan-500" />;
      case Category.roads:
        return <Footprints className="w-4 h-4 text-emerald-500" />;
      case Category.streetlights:
        return <Lightbulb className="w-4 h-4 text-purple-500" />;
      case Category.other:
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  if (!complaintId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Top Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Incident Details</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-slate-500">{complaintId}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                    title="Copy UUID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Fetching real-time incident data...</span>
              </div>
            ) : complaint ? (
              <>
                {/* Status & Priority Overview Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</span>
                    <span className="font-extrabold capitalize text-slate-800">{complaint.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Priority</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        complaint.priority === Priority.high
                          ? 'bg-red-100 text-red-700'
                          : complaint.priority === Priority.normal
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {complaint.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Category</span>
                    <span className="font-bold capitalize text-slate-800 flex items-center gap-1">
                      {getCategoryIcon(complaint.category)}
                      {complaint.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Triaged By</span>
                    <span className="font-mono font-bold text-blue-700 flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-blue-500" />
                      {complaint.triaged_by}
                    </span>
                  </div>
                </div>

                {/* AI Summary Block */}
                {complaint.ai_summary && (
                  <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-blue-900">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span>AI Triage Summary</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 italic">
                      "{complaint.ai_summary}"
                    </p>
                  </div>
                )}

                {/* Complaint Narrative Body */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Full Incident Report
                  </h4>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {complaint.text}
                  </div>
                </div>

                {/* Meta Information Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Location</span>
                      <span className="font-medium text-slate-800">{complaint.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-100">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Reporter</span>
                      <span className="font-medium text-slate-800">
                        {complaint.reporter_contact || 'Anonymous / Not provided'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-100">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Created At</span>
                      <span className="font-medium text-slate-800">
                        {new Date(complaint.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-100">
                    <Cpu className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Triage Latency</span>
                      <span className="font-medium font-mono text-slate-800">
                        {complaint.triage_latency_ms} ms
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Footer with State Machine Controls */}
          {complaint && (
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Transition Status:</span>
                {complaint.status === Status.open && (
                  <>
                    <button
                      disabled={updating}
                      onClick={() => handleStatusTransition(Status.in_progress)}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold border border-amber-200 text-xs transition-colors"
                    >
                      In‑Progress
                    </button>
                    <button
                      disabled={updating}
                      onClick={() => handleStatusTransition(Status.rejected)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold border border-red-200 text-xs transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                {complaint.status === Status.in_progress && (
                  <>
                    <button
                      disabled={updating}
                      onClick={() => handleStatusTransition(Status.resolved)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200 text-xs transition-colors"
                    >
                      Resolve
                    </button>
                    <button
                      disabled={updating}
                      onClick={() => handleStatusTransition(Status.rejected)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold border border-red-200 text-xs transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                {(complaint.status === Status.resolved || complaint.status === Status.rejected) && (
                  <span className="text-xs text-slate-400 italic font-medium">Terminal state</span>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
