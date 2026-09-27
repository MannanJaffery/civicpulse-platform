import { FC, useState } from 'react';
import { submitComplaint } from '../api/client';
import { Complaint } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Submit: FC = () => {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Complaint | null>(null);

  const validate = (): string[] => {
    const errs: string[] = [];
    if (text.trim().length < 10 || text.length > 2000) {
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
    try {
      const complaint = await submitComplaint({
        text,
        location,
        reporter_contact: reporterContact || undefined,
      });
      setResult(complaint);
    } catch (err: any) {
      setErrors([err.message || 'Submission failed']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submit Complaint</h1>
      {errors.length > 0 && (
        <div className="bg-red-100 text-red-800 p-2 mb-4 rounded">
          <ul className="list-disc list-inside">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="text">
            Complaint Description
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border rounded p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="reporterContact">
            Reporter Contact (optional)
          </label>
          <input
            id="reporterContact"
            type="text"
            value={reporterContact}
            onChange={(e) => setReporterContact(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          Submit
        </button>
      </form>

      {loading && (
        <div className="mt-4 flex items-center">
          <LoadingSpinner />
          <span className="ml-2">Submitting…</span>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Triage Result</h2>
          <p><strong>Category:</strong> {result.category}</p>
          <p><strong>Priority:</strong> {result.priority}</p>
          <p><strong>AI Summary:</strong> {result.ai_summary}</p>
          <p><strong>Triaged By:</strong> {result.triaged_by}</p>
        </div>
      )}
    </div>
  );
};

export default Submit;
