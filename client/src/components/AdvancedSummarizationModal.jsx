import React, { useState, useEffect } from 'react';
import { X, FileText, Loader, Copy, Check, Settings, Star, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI } from '../config/aiApi';

const AdvancedSummarizationModal = ({ isOpen, onClose, content, postTitle }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);

  // Advanced options
  const [options, setOptions] = useState({
    style: 'concise',
    targetAudience: 'general',
    length: 'medium',
    tone: 'neutral',
    includeKeywords: []
  });

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (isOpen && content) {
      generateAdvancedSummary();
    }
  }, [isOpen, content]);

  const styleOptions = [
    { value: 'concise', label: 'Concise', icon: '⚡', description: 'Brief and to-the-point' },
    { value: 'detailed', label: 'Detailed', icon: '📝', description: 'Comprehensive with details' },
    { value: 'bullet_points', label: 'Bullet Points', icon: '📋', description: 'Clear bullet format' },
    { value: 'executive', label: 'Executive', icon: '💼', description: 'Business stakeholders' },
    { value: 'creative', label: 'Creative', icon: '🎨', description: 'Engaging and creative' },
    { value: 'academic', label: 'Academic', icon: '🎓', description: 'Formal and precise' }
  ];

  const audienceOptions = [
    { value: 'general', label: 'General Public', icon: '👥' },
    { value: 'technical', label: 'Technical', icon: '⚙️' },
    { value: 'beginner', label: 'Beginners', icon: '🌱' },
    { value: 'expert', label: 'Experts', icon: '🔬' }
  ];

  const lengthOptions = [
    { value: 'short', label: 'Short', description: '~50 words' },
    { value: 'medium', label: 'Medium', description: '~150 words' },
    { value: 'long', label: 'Long', description: '~300 words' }
  ];

  const toneOptions = [
    { value: 'neutral', label: 'Neutral', icon: '😐' },
    { value: 'formal', label: 'Formal', icon: '🎩' },
    { value: 'casual', label: 'Casual', icon: '😊' },
    { value: 'enthusiastic', label: 'Enthusiastic', icon: '🚀' }
  ];

  const generateAdvancedSummary = async () => {
    if (!content.trim()) {
      toast.error('No content available to summarize');
      return;
    }

    setIsLoading(true);
    setSummary('');
    setSummaryResult(null);

    try {
      // Strip HTML tags from content for cleaner summarization
      const cleanContent = content.replace(/<[^>]*>/g, '').trim();
      
      const response = await aiAPI.advancedSummarize(cleanContent, options);
      
      setSummary(response.summary);
      setSummaryResult(response);
      
    } catch (error) {
      console.error('Advanced summarization error:', error);
      toast.error('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (optionKey, value) => {
    setOptions(prev => ({
      ...prev,
      [optionKey]: value
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !options.includeKeywords.includes(keywordInput.trim())) {
      setOptions(prev => ({
        ...prev,
        includeKeywords: [...prev.includeKeywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setOptions(prev => ({
      ...prev,
      includeKeywords: prev.includeKeywords.filter(k => k !== keyword)
    }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success('Summary copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const resetModal = () => {
    setSummary('');
    setSummaryResult(null);
    setIsLoading(false);
    setCopied(false);
    setShowSettings(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Advanced AI Summarization</h2>
              <p className="text-sm opacity-90">Powered by Hugging Face & LangChain</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10'}`}
              title="Advanced Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-88px)]">
          {/* Settings Panel */}
          {showSettings && (
            <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
              <h3 className="font-semibold text-gray-800 mb-4">Customization Options</h3>
              
              {/* Style Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {styleOptions.map(style => (
                    <button
                      key={style.value}
                      onClick={() => handleOptionChange('style', style.value)}
                      className={`p-2 text-left rounded-lg border transition-colors ${
                        options.style === style.value 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{style.icon} {style.label}</div>
                      <div className="text-xs text-gray-500">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <div className="grid grid-cols-2 gap-2">
                  {audienceOptions.map(audience => (
                    <button
                      key={audience.value}
                      onClick={() => handleOptionChange('targetAudience', audience.value)}
                      className={`p-2 text-left rounded-lg border transition-colors ${
                        options.targetAudience === audience.value 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{audience.icon} {audience.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                <div className="space-y-2">
                  {lengthOptions.map(length => (
                    <label key={length.value} className="flex items-center">
                      <input
                        type="radio"
                        name="length"
                        value={length.value}
                        checked={options.length === length.value}
                        onChange={(e) => handleOptionChange('length', e.target.value)}
                        className="mr-2 text-purple-600"
                      />
                      <span className="text-sm">
                        <span className="font-medium">{length.label}</span>
                        <span className="text-gray-500 ml-1">{length.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {toneOptions.map(tone => (
                    <button
                      key={tone.value}
                      onClick={() => handleOptionChange('tone', tone.value)}
                      className={`p-2 text-left rounded-lg border transition-colors ${
                        options.tone === tone.value 
                          ? 'border-green-500 bg-green-50 text-green-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{tone.icon} {tone.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Include Keywords</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    placeholder="Add keyword..."
                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {options.includeKeywords.map(keyword => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={generateAdvancedSummary}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Regenerating...' : 'Regenerate Summary'}
              </button>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Post Title */}
            {postTitle && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Summarizing: {postTitle}
                </h3>
                <div className="h-px bg-gray-200"></div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Generating advanced summary...</p>
                  <p className="text-gray-500 text-sm mt-2">Using AI models to create the perfect summary</p>
                </div>
              </div>
            )}

            {/* Summary Results */}
            {summary && !isLoading && summaryResult && (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-600">
                        Length: <span className="text-purple-600">{summaryResult.summary_length} words</span>
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        Style: <span className="text-blue-600 capitalize">{summaryResult.style_used}</span>
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        Audience: <span className="text-green-600 capitalize">{summaryResult.target_audience}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-600">
                          {(summaryResult.confidence_score * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {summaryResult.keywords_included && summaryResult.keywords_included.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">
                        Keywords included: {summaryResult.keywords_included.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Summary Content */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-l-4 border-purple-500">
                  <h4 className="text-lg font-semibold mb-3 text-purple-800">
                    AI-Generated Summary
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {summary}
                    </p>
                  </div>
                </div>

                {/* Improvement Metrics */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((1 - summaryResult.summary_length / summaryResult.original_length) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Reduced</div>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {summaryResult.original_length}
                    </div>
                    <div className="text-sm text-gray-600">Original Words</div>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {summaryResult.summary_length}
                    </div>
                    <div className="text-sm text-gray-600">Summary Words</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSummarizationModal;
