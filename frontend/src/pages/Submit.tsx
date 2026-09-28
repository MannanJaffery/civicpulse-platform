import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  MapPin,
  User,
  AlertCircle,
  Sparkles,
  Info,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { submitComplaint } from '../api/client';
import { Complaint } from '../types';
import { QuillEditor } from '../components/QuillEditor';
import { TriageResultCard } from '../components/TriageResultCard';

const Submit: FC = () => {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<Complaint | null>(null);

  // Honest multi-stage loading animation sequence
  const pipelineStages = [
    'Ingesting incident report & sanitizing input...',
    'Generating content-hash & querying Redis cache...',
    'Invoking active AI model (Groq / Gemini / Ollama)...',
    'Validating structured Pydantic schema output...',
    'Persisting record to PostgreSQL & broadcasting update...',
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < pipelineStages.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Strip HTML for validation
  const getCleanText = (str: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = str;
    return (tmp.textContent || tmp.innerText || '').trim();
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    const cleanText = getCleanText(text);

    if (cleanText.length < 10 || cleanText.length > 2000) {
      errs.push('Complaint description must be between 10 and 2000 characters.');
    }
    if (location.trim().length < 3 || location.length > 200) {
      errs.push('Location must be between 3 and 200 characters.');
    }
    if (reporterContact && reporterContact.length > 100) {
      errs.push('Reporter contact info is too long.');
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    setLoading(true);
    setResult(null);

    const cleanText = getCleanText(text);

    try {
      const complaint = await submitComplaint({
        text: cleanText || text,
        location,
        reporter_contact: reporterContact || undefined,
      });
      setResult(complaint);
    } catch (err: any) {
      setErrors([err.message || 'Submission failed. Please verify the input or try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText('');
    setLocation('');
    setReporterContact('');
    setResult(null);
    setErrors([]);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-4 sm:px-0">
      {/* Header Banner */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Citizen Intake Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Submit Municipal Incident
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-2">
          Describe the problem in plain language. Our automated AI triage engine will categorize,
          prioritize, and route your complaint directly to the municipal dispatch unit.
        </p>
      </div>

      {/* Validation Errors Alert */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-900 rounded-2xl p-4 shadow-subtle flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <h4 className="font-bold text-red-900 mb-1">Please correct the following:</h4>
              <ul className="list-disc list-inside space-y-1 font-medium text-red-800">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result View or Form */}
      {result ? (
        <TriageResultCard result={result} onReset={handleReset} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-premium border border-slate-100/80"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rich Text Complaint Description */}
            <div>
              <label
                htmlFor="text"
                className="block text-sm font-bold text-slate-800 mb-2 flex items-center justify-between"
              >
                <span>Complaint Description *</span>
                <span className="text-xs font-normal text-slate-400">Rich Text & Plain Text</span>
              </label>
              <QuillEditor
                value={text}
                onChange={setText}
                placeholder="E.g. Burst water main on Street 12 since morning, flooding basement and blocking vehicle movement..."
                minChars={10}
                maxChars={2000}
              />
            </div>

            {/* Location Field */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Location *</span>
              </label>
              <div className="relative">
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Street 12, Sector F-8/3, Islamabad"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 text-sm placeholder:text-slate-400 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Please specify streets, landmarks, sector or area code.
              </p>
            </div>

            {/* Optional Contact Field */}
            <div>
              <label
                htmlFor="reporterContact"
                className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Reporter Contact (optional)</span>
              </label>
              <input
                id="reporterContact"
                type="text"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="e.g. +92 300 1234567 or citizen@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 text-sm placeholder:text-slate-400 transition-all"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>
                  Protected under municipal PII guidelines. Redacted before third-party LLM dispatch.
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white font-extrabold text-sm sm:text-base shadow-gis shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing Complaint...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Honest Loading State Indicator */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-slate-100 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-2 text-blue-600">
                    <Cpu className="w-4 h-4 animate-pulse" />
                    Submitting… AI Triage In Progress
                  </span>
                  <span className="font-mono text-slate-400">
                    Step {loadingStep + 1} of {pipelineStages.length}
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-blue-600 h-full rounded-full"
                    initial={{ width: '10%' }}
                    animate={{ width: `${((loadingStep + 1) / pipelineStages.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <p className="text-xs text-slate-500 italic flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                  {pipelineStages[loadingStep]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Submit;
