import { useState } from 'react';
import { X, Search, BookOpen, Loader, Copy, PenTool, Sparkles, FileText, Users, GraduationCap, List, Play } from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI } from '../config/aiApi';

const BlogWritingAssistant = ({ isOpen, onClose, onContentGenerated }) => {
  const [topic, setTopic] = useState('');
  const [summaryStyle, setSummaryStyle] = useState('comprehensive');
  const [maxSources, setMaxSources] = useState(10);
  const [generatedContent, setGeneratedContent] = useState('');
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Blog writing styles with descriptions and icons
  const blogStyles = {
    comprehensive: {
      label: 'Comprehensive',
      icon: <FileText className="w-4 h-4" />,
      description: 'Detailed, well-structured content covering all aspects',
      color: 'blue'
    },
    technical: {
      label: 'Technical',
      icon: <PenTool className="w-4 h-4" />,
      description: 'In-depth technical analysis with code examples',
      color: 'purple'
    },
    beginner: {
      label: 'Beginner-Friendly',
      icon: <GraduationCap className="w-4 h-4" />,
      description: 'Easy to understand for newcomers to the topic',
      color: 'green'
    },
    listicle: {
      label: 'Listicle',
      icon: <List className="w-4 h-4" />,
      description: 'Organized as an engaging numbered or bulleted list',
      color: 'orange'
    },
    tutorial: {
      label: 'Tutorial',
      icon: <Play className="w-4 h-4" />,
      description: 'Step-by-step guide with actionable instructions',
      color: 'indigo'
    }
  };

  const generateBlogContent = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic to generate blog content');
      return;
    }

    setIsLoading(true);
    setGeneratedContent('');
    setSources([]);

    try {
      const response = await aiAPI.generateBlogContent(topic, summaryStyle, maxSources);
      
      if (response.status === 'success') {
        setGeneratedContent(response.data.blog_content || response.data.summary);
        setSources(response.data.sources || []);
        toast.success('Blog content generated successfully!');
      } else {
        throw new Error(response.message || 'Failed to generate blog content');
      }
    } catch (error) {
      console.error('Blog generation error:', error);
      toast.error('Failed to generate blog content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedContent) return;
    
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const insertContentIntoEditor = () => {
    if (!generatedContent) return;
    
    if (onContentGenerated) {
      onContentGenerated(generatedContent);
      toast.success('Content inserted into editor!');
      handleClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      generateBlogContent();
    }
  };

  const resetModal = () => {
    setTopic('');
    setSummaryStyle('comprehensive');
    setMaxSources(10);
    setGeneratedContent('');
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
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-semibold">AI Blog Writing Assistant</h2>
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
          {/* Topic Input */}
          <div className="mb-6">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to write about?
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Machine Learning for Beginners, React Hooks Deep Dive..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Blog Style Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose your blog style
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(blogStyles).map(([key, style]) => (
                <div
                  key={key}
                  onClick={() => setSummaryStyle(key)}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                    summaryStyle === key
                      ? `border-${style.color}-500 bg-${style.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`text-${style.color}-600`}>
                      {style.icon}
                    </div>
                    <span className={`font-medium ${summaryStyle === key ? `text-${style.color}-800` : 'text-gray-700'}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {style.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Sources (Affects content depth)
            </label>
            <select
              value={maxSources}
              onChange={(e) => setMaxSources(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value={5}>5 sources (Quick overview)</option>
              <option value={10}>10 sources (Balanced)</option>
              <option value={15}>15 sources (Comprehensive)</option>
              <option value={20}>20 sources (In-depth research)</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="mb-6">
            <button
              onClick={generateBlogContent}
              disabled={isLoading || !topic.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating Amazing Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Blog Content</span>
                </>
              )}
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="relative">
                  <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                  <Sparkles className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Crafting Your {blogStyles[summaryStyle].label} Blog Post
                </h3>
                <p className="text-gray-600 mb-2">
                  AI is researching and writing amazing content about "{topic}"
                </p>
                <p className="text-sm text-gray-500">
                  This may take 30-60 seconds for the best results...
                </p>
              </div>
            </div>
          )}

          {/* Generated Content Results */}
          {generatedContent && !isLoading && (
            <div className="space-y-6">
              {/* Content Preview */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <div className={`text-${blogStyles[summaryStyle].color}-600`}>
                      {blogStyles[summaryStyle].icon}
                    </div>
                    <span>{blogStyles[summaryStyle].label} Blog: {topic}</span>
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    {onContentGenerated && (
                      <button
                        onClick={insertContentIntoEditor}
                        className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                        title="Insert into editor"
                      >
                        <PenTool className="w-4 h-4" />
                        <span>Use Content</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="prose max-w-none bg-white rounded-lg p-4 border">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
                    {generatedContent}
                  </div>
                </div>
              </div>

              {/* Sources */}
              {sources && sources.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-md font-semibold mb-3 text-blue-800 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Research Sources ({sources.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sources.map((source, index) => (
                      <div key={index} className="text-sm text-blue-700 bg-blue-100 rounded p-2">
                        <span className="font-medium">#{index + 1}</span> {source}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!generatedContent && !isLoading && (
            <div className="text-center py-12">
              <div className="relative mb-6">
                <Sparkles className="w-20 h-20 text-purple-300 mx-auto" />
                <PenTool className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Ready to Create Amazing Content?
              </h3>
              <p className="text-gray-600 mb-4">
                Choose your topic and style above, then let our AI craft the perfect blog post
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>✨ AI-powered content generation</p>
                <p>📚 Research from multiple sources</p>
                <p>🎯 Tailored to your chosen style</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Powered by AI • {maxSources} sources • {blogStyles[summaryStyle].label} style
            </div>
            <div className="flex space-x-2">
              {generatedContent && (
                <button
                  onClick={() => {
                    setTopic('');
                    setGeneratedContent('');
                    setSources([]);
                  }}
                  className="px-4 py-2 text-purple-600 hover:text-purple-800 transition-colors text-sm"
                >
                  Generate New
                </button>
              )}
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogWritingAssistant;