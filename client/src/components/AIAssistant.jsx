import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI } from '../config/aiApi';

const AIAssistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hi! I\'m your advanced AI assistant 🤖✨\n\nI can help you with:\n• 🧠 Complex multi-step analysis\n• 🤖 Intelligent task automation\n• 📊 Blog performance insights\n• 💡 Smart content suggestions\n• 🔍 Deep research and reasoning\n\nTry asking complex questions or requesting detailed analysis!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      let response;
      
      // Intelligent routing based on question complexity and type
      if (isComplexQuestion(currentInput)) {
        // Use multi-hop QA for complex questions
        response = await aiAPI.multiHopQA(currentInput, null, 3, true);
        
        const botMessage = {
          type: 'bot',
          content: response.answer,
          sources: response.sources || [],
          reasoningSteps: response.reasoning_steps || [],
          totalHops: response.total_hops,
          isAdvanced: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
      } else if (isAgentTask(currentInput)) {
        // Use agent for task-oriented requests
        response = await aiAPI.executeAgentTask(currentInput);
        
        const botMessage = {
          type: 'bot',
          content: response.result,
          sources: response.sources || [],
          stepsTaken: response.steps_taken || [],
          executionTime: response.execution_time,
          isAgent: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
      } else {
        // Use regular QA for simple questions
        response = await aiAPI.askQuestion(currentInput);
        
        if (response.status === 'success') {
          const botMessage = {
            type: 'bot',
            content: response.data.answer,
            sources: response.data.sources || [],
            contextUsed: response.data.context_used,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          throw new Error(response.message || 'Failed to get response');
        }
      }
      
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage = {
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to detect complex questions requiring multi-hop reasoning
  const isComplexQuestion = (input) => {
    const complexPatterns = [
      /what are the most .* and .*/i,
      /find .* and .*/i,
      /compare .* with .*/i,
      /analyze .* and .*/i,
      /both .* and .*/i,
      /relationship between .* and .*/i,
      /how .* affects .*/i,
      /suggest .* for each .*/i,
      /popular .* and .*ideas/i
    ];
    
    return complexPatterns.some(pattern => pattern.test(input));
  };

  // Helper function to detect agent tasks
  const isAgentTask = (input) => {
    const agentPatterns = [
      /find my .* post/i,
      /analyze my .*/i,
      /improve my .*/i,
      /suggest .* for my .*/i,
      /help me with .*/i,
      /create .* based on .*/i,
      /generate .* from .*/i,
      /summarize .* and suggest .*/i
    ];
    
    return agentPatterns.some(pattern => pattern.test(input));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What are the most popular food categories and suggest new post ideas for each?",
    "Find my most liked post and suggest how to improve it",
    "What's trending in tech today?",
    "Analyze our blog performance and suggest content strategy"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Side Drawer */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bot className="w-6 h-6" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI Assistant</h2>
                <p className="text-xs opacity-90">Powered by AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="p-4 border-b bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Start:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left text-xs bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-2 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-blue-600" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        
                        {/* Advanced Features Indicators */}
                        {message.isAdvanced && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              🧠 Multi-Hop Analysis ({message.totalHops} steps)
                            </span>
                          </div>
                        )}
                        
                        {message.isAgent && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              🤖 Agent Task ({message.executionTime?.toFixed(2)}s)
                            </span>
                          </div>
                        )}
                        
                        {/* Reasoning Steps for Multi-Hop QA */}
                        {message.reasoningSteps && message.reasoningSteps.length > 0 && (
                          <div className="mt-3 bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-semibold mb-2 text-gray-700">🔍 Reasoning Process:</p>
                            <div className="space-y-2">
                              {message.reasoningSteps.map((step, idx) => (
                                <div key={idx} className="text-xs text-gray-600">
                                  <span className="font-medium">Step {step.step}:</span> {step.action}
                                  {step.result && step.result.length < 100 && (
                                    <div className="ml-2 mt-1 text-gray-500 italic">{step.result}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Agent Steps */}
                        {message.stepsTaken && message.stepsTaken.length > 0 && (
                          <div className="mt-3 bg-blue-50 rounded-lg p-3">
                            <p className="text-xs font-semibold mb-2 text-blue-700">🛠️ Agent Actions:</p>
                            <div className="space-y-2">
                              {message.stepsTaken.map((step, idx) => (
                                <div key={idx} className="text-xs text-blue-600">
                                  <span className="font-medium">{step.action}:</span> {step.details}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Context indicator */}
                        {message.contextUsed && (
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              message.contextUsed === 'blog' || message.contextUsed === 'site_specific' 
                                ? 'bg-green-100 text-green-800' 
                                : message.contextUsed === 'content_ideas'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {message.contextUsed === 'blog' || message.contextUsed === 'site_specific' ? '🏠 Our Blog' : 
                               message.contextUsed === 'content_ideas' ? '💡 AI Ideas' : 
                               message.contextUsed === 'external_fallback' ? '🌐 External' : '🤖 AI'}
                            </span>
                          </div>
                        )}
                        
                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold mb-1 opacity-80">Sources:</p>
                            <div className="space-y-1">
                              {message.sources.map((source, idx) => (
                                <div key={idx} className="text-xs opacity-70">
                                  <span className="font-medium">• {source.title}</span>
                                  {source.type && (
                                    <span className="ml-1 px-1 py-0.5 bg-black bg-opacity-10 rounded text-xs">
                                      {source.type}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs opacity-60 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[85%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <Loader className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4 bg-white">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="1"
                  disabled={isLoading}
                  style={{ minHeight: '44px', maxHeight: '100px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;