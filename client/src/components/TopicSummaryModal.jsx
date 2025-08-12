import { useState } from 'react';
import { X, Search, BookOpen, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI } from '../config/aiApi';

const TopicSummaryModal = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState('');
  const [summary, setSummary] = useState('');
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTopicSearch = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic to search for');
      return;
    }

    setIsLoading(true);
    setSummary('');
    setSources([]);

    try {
      const response = await aiAPI.getTopicSummary(topic);
      
      if (response.status === 'success') {
        setSummary(response.data.summary);
        setSources(response.data.sources || []);
      } else {
        throw new Error(response.message || 'Failed to get topic summary');
      }
    } catch (error) {
      console.error('Topic summary error:', error);
      toast.error('Failed to get topic summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTopicSearch();
    }
  };

  const resetModal = () => {
    setTopic('');
    setSummary('');
    setSources([]);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-green-600 text-white">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Topic Summary</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - with proper scrolling */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search Input */}
          <div className="mb-6">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Enter a topic to get a comprehensive summary
            </label>
            <div className="flex space-x-2">
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Artificial Intelligence, Climate Change, React.js..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleTopicSearch}
                disabled={isLoading || !topic.trim()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Searching...' : 'Get Summary'}</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
                <p className="text-gray-600">Generating comprehensive summary...</p>
              </div>
            </div>
          )}

          {/* Summary Results */}
          {summary && !isLoading && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Summary: {topic}
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {summary}
                  </p>
                </div>
              </div>

              {/* Sources */}
              {sources && sources.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-2 text-blue-800">
                    Sources & References
                  </h4>
                  <ul className="space-y-1">
                    {sources.map((source, index) => (
                      <li key={index} className="text-sm text-blue-700">
                        • {source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!summary && !isLoading && (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Enter a topic above to get a detailed summary from our knowledge base
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Our AI will search through blog posts, Wikipedia, and Stack Exchange content
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicSummaryModal;