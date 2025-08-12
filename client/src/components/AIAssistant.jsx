import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Bot, User, Loader, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { aiAPI } from '../config/aiApi';

const AIAssistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hi! I\'m your AI assistant 🤖\n\nI can help you with:\n• 🧠 Analysis & insights\n• 💡 Content suggestions\n• 🔍 Research & questions\n\nWhat would you like to know?',
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
          timestamp: new Date(),
          contextUsed: response.context_used,
          sources: response.sources,
          reasoningSteps: response.reasoning_steps,
          isAdvanced: true,
          totalHops: response.reasoning_steps?.length || 0
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else if (isAgentTask(currentInput)) {
        // Use agent for task-oriented queries
        response = await aiAPI.agent(currentInput);
        
        const botMessage = {
          type: 'bot',
          content: response.final_answer,
          timestamp: new Date(),
          contextUsed: response.context_used,
          stepsTaken: response.steps_taken,
          isAgent: true,
          executionTime: response.execution_time
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Use standard QA for simple questions
        response = await aiAPI.qa(currentInput);
        
        const botMessage = {
          type: 'bot',
          content: response.data.answer,
          timestamp: new Date(),
          contextUsed: response.context_used,
          sources: response.sources
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      const errorMessage = {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
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
    "What's trending in tech?",
    "Suggest blog topics",
    "Analyze our content",
    "Help with writing"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop with improved styling */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity backdrop-blur-sm"
        onClick={onClose}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Side Drawer with 3D effects */}
      <div 
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-[9999] transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} relative overflow-hidden`}
        style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '24rem' }}
      >
        {/* 3D Background Effects */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/15 via-purple-400/15 to-pink-400/15 transform -skew-y-1"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
        
        <div className="flex flex-col h-full relative z-10">
          {/* Header with enhanced styling */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400"></div>
            
            <div className="flex items-center space-x-3 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                <Bot className="w-6 h-6 relative z-10" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-bounce" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI Assistant</h2>
                <p className="text-xs opacity-90">Smart & Helpful</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-all duration-200 p-2 rounded-full hover:bg-white/20 transform hover:scale-110 relative z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Questions with improved styling */}
          {messages.length === 1 && (
            <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-purple-100/30"></div>
              <p className="text-sm font-semibold text-gray-700 mb-3 relative z-10">✨ Quick Start:</p>
              <div className="grid grid-cols-1 gap-2 relative z-10">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left text-sm bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-2.5 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-white to-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md transform transition-all duration-200 hover:scale-105 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <Bot className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                      
                      {/* Simplified context indicator */}
                      {message.contextUsed && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            message.contextUsed === 'blog' || message.contextUsed === 'site_specific' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {message.contextUsed === 'blog' || message.contextUsed === 'site_specific' ? '🏠 Blog Data' : '🤖 AI Knowledge'}
                          </span>
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs opacity-60">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white rounded-2xl px-4 py-3 max-w-[85%] shadow-md border border-gray-200">
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

          {/* Input with improved styling */}
          <div className="border-t p-4 bg-white relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50"></div>
            <div className="flex space-x-2 relative z-10">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows="1"
                  disabled={isLoading}
                  style={{ minHeight: '44px', maxHeight: '100px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transform hover:scale-105 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center relative z-10">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default AIAssistant;
