import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';

const issues = [
  'Spam or misleading content',
  'Nudity or sexual content',
  'Hate speech or symbols',
  'Violence or dangerous content',
  'Harassment or bullying',
  'False information',
  'Intellectual property violation',
  'Other',
];

export default function ReportPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!selected) return toast.error('Please select an issue');
    setSubmitted(true);
    toast.success('Report submitted. Thank you for your feedback.');
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <span className="text-green-400 text-2xl">✓</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Report submitted</h2>
        <p className="text-gray-400 text-sm mb-6">We'll review your report and take appropriate action.</p>
        <button onClick={() => navigate(-1)} className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-4">
      <div className="sticky top-0 bg-dark z-10 px-4 py-4 border-b border-dark-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
          <HiOutlineArrowLeft size={22} />
        </button>
        <h2 className="text-lg font-bold">Report a problem</h2>
      </div>

      <div className="px-4 py-4 space-y-4">
        <p className="text-sm text-gray-400">What issue are you reporting?</p>
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          {issues.map((issue, i) => (
            <button
              key={issue}
              onClick={() => setSelected(issue)}
              className={`flex items-center justify-between w-full px-4 py-3.5 text-left transition-colors ${i < issues.length - 1 ? 'border-b border-dark-border' : ''} ${selected === issue ? 'bg-primary/10' : 'hover:bg-dark-muted'}`}
            >
              <span className="text-sm text-white">{issue}</span>
              {selected === issue && <span className="w-4 h-4 rounded-full bg-primary flex-shrink-0" />}
            </button>
          ))}
        </div>

        {selected && (
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder="Add more details (optional)"
            rows={4}
            className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
          />
        )}

        <button
          onClick={submit}
          disabled={!selected}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-40"
        >
          Submit report
        </button>
      </div>
    </div>
  );
}
