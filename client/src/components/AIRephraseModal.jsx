import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import api from '../config/api';

const AIRephraseModal = ({
  isOpen,
  onClose,
  selectedText,
  onTextReplaced,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState('Casual');
  const [selectedProvider, setSelectedProvider] = useState('groq');
  const [rephrasedText, setRephrasedText] = useState('');

  const tones = [
    { value: 'Professional', label: 'Professional', description: 'Formal business tone' },
    { value: 'Technical', label: 'Technical', description: 'Precise and detailed' },
    { value: 'Casual', label: 'Casual', description: 'Friendly and conversational' },
    { value: 'SEO', label: 'SEO', description: 'Optimized for search engines' },
  ];

  const providers = [
    { value: 'groq', label: 'Groq (Fast & Free)', description: 'Fast processing with open models' },
    { value: 'openai', label: 'OpenAI (Premium)', description: 'High quality but requires credits' },
  ];

  const handleRephrase = async () => {
    if (!selectedText.trim()) {
      toast.error('Please select some text to rephrase');
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error('Authentication required. Please log in.');
      return;
    }

    setIsLoading(true);
    setRephrasedText('');

    try {
      const response = await api.post('/ai/rephrase', {
        text: selectedText,
        tone: selectedTone,
        provider: selectedProvider,
      }, {
        headers: {
          token: token,
        },
      });

      if (response.data.status === 'success') {
        setRephrasedText(response.data.data.rephrased_text);
      } else {
        toast.error('Failed to rephrase text');
      }
    } catch (error) {
      console.error('Rephrasing error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to rephrase text';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (rephrasedText) {
      onTextReplaced(rephrasedText);
      onClose();
      setRephrasedText('');
      toast.success('Text replaced successfully!');
    }
  };

  const handleClose = () => {
    setRephrasedText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">AI Text Rephrasing</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Original Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Original Text:
          </label>
          <div className="p-3 bg-gray-50 border rounded-md">
            <p className="text-gray-800">{selectedText}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Tone:
            </label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {tones.map((tone) => (
                <option key={tone.value} value={tone.value}>
                  {tone.label} - {tone.description}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider:
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {providers.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {providers.find(p => p.value === selectedProvider)?.description}
            </p>
          </div>
        </div>

        {/* Rephrase Button */}
        <div className="mb-6">
          <button
            onClick={handleRephrase}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Rephrasing...
              </span>
            ) : (
              'Rephrase Text'
            )}
          </button>
        </div>

        {/* Rephrased Text */}
        {rephrasedText && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rephrased Text:
            </label>
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-gray-800">{rephrasedText}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {rephrasedText && (
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Apply Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
AIRephraseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedText: PropTypes.string.isRequired,
  onTextReplaced: PropTypes.func.isRequired,
};

export default AIRephraseModal;
