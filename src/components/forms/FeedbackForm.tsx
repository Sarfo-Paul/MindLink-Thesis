import React, { useState } from 'react';

interface FeedbackFormProps {
  game: string;
  mmseScore: string;
  onSubmit: () => void;
  onSkip: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ game, mmseScore, onSubmit, onSkip }) => {
  const [formData, setFormData] = useState({
    before: '',
    after: '',
    difficulty: '',
    fun: '',
    suggestion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback Submitted:', { ...formData, game, mmseScore });
    onSubmit();
  };

  const handleSkip = () => {
    console.log('User skipped feedback form');
    onSkip();
  };

  const radioOptions = {
    before: ['Bad', 'Neutral', 'Good', 'Excellent'],
    after: ['Bad', 'Neutral', 'Good', 'Excellent'],
    difficulty: ['Easy', 'Moderate', 'Hard', 'Very Hard'],
    fun: ['Not Fun', 'Fun', 'Very Fun']
  };

  const renderRadioGroup = (name: keyof typeof radioOptions, label: string) => (
    <div className="mb-4">
      <label className="block font-semibold mb-2 text-md text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-3">
        {radioOptions[name].map(option => (
          <label
            key={option}
            className={`cursor-pointer px-3 py-1 rounded-full border transition 
            ${formData[name] === option ? 'bg-green-400 text-white border-green-400' : 'border-gray-300 hover:bg-gray-100'}`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={formData[name] === option}
              onChange={handleChange}
              className="hidden"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fadeIn scale-95 transition-transform"
        style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
      >
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <h1 className="text-3xl font-bold text-gray-800 leading-snug">
            Leave a feedback
          </h1>

          {renderRadioGroup('before', 'How were you feeling before playing the game?')}
          {renderRadioGroup('after', 'How did you feel after playing the game?')}
          {renderRadioGroup('difficulty', 'How difficult was the game?')}
          {renderRadioGroup('fun', 'How fun was the game?')}

          <div>
            <label className="block font-semibold mb-2 text-gray-700">Any suggestions?</label>
            <textarea
              name="suggestion"
              value={formData.suggestion}
              onChange={handleChange}
              maxLength={40}
              placeholder="Your suggestions to improve the game"
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={handleSkip}
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Skip
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
