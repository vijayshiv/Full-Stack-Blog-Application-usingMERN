import React, { useState } from 'react';
import { Search, Loader, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { aiAPI } from '../config/aiApi';

const SemanticSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const response = await aiAPI.semanticSearch(query, 10);
      
      if (response.status === 'success') {
        setResults(response.data.results || []);
        setHasSearched(true);
      } else {
        throw new Error(response.message || 'Search failed');
      }
    } catch (error) {
      console.error('Semantic search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatScore = (score) => {
    return (score * 100).toFixed(1);
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔍 AI-Powered Semantic Search
        </h2>
        <p className="text-gray-600">
          Search across our knowledge base using natural language. Find relevant content from blog posts, Wikipedia, and Stack Exchange.
        </p>
      </div>

      {/* Search Input */}
      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., 'How to implement machine learning algorithms?', 'Best practices for React development'"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          <span>{isLoading ? 'Searching...' : 'Search'}</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Searching knowledge base...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !isLoading && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Search Results ({results.length} found)
          </h3>
          {results.map((result, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-blue-600 mb-1">
                    {result.metadata?.title || `Result ${index + 1}`}
                  </h4>
                  <div className="flex items-center space-x-3 text-sm text-gray-500 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {result.metadata?.source || 'Unknown Source'}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {formatScore(result.score)}% match
                    </span>
                    {result.metadata?.category && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {result.metadata.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">
                {truncateText(result.text)}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {result.metadata?.date && (
                    <span>Published: {new Date(result.metadata.date).toLocaleDateString()}</span>
                  )}
                </div>
                
                {result.metadata?.post_id && (
                  <Link
                    to={`/post/${result.metadata.post_id}`}
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>View Full Post</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {hasSearched && results.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No results found</p>
          <p className="text-gray-400">
            Try refining your search query or using different keywords
          </p>
        </div>
      )}

      {/* Tips */}
      {!hasSearched && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Search Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use natural language questions like "How to optimize React performance?"</li>
            <li>• Search for concepts, technologies, or specific problems</li>
            <li>• Try different phrasings if you don't find what you're looking for</li>
            <li>• Results are ranked by semantic similarity to your query</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SemanticSearch;