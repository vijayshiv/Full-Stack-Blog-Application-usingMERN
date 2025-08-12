import api from './api';

// AI service endpoints
export const aiAPI = {
  // Q&A endpoint
  askQuestion: async (question) => {
    try {
      const response = await api.post('/ai/qa', { question });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Semantic search endpoint
  semanticSearch: async (query, limit = 10) => {
    try {
      const response = await api.post('/ai/semantic-search', { query, limit });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Text summarization endpoint
  summarizeContent: async (content, maxWords = 200) => {
    try {
      const response = await api.post('/ai/summarize', { 
        content, 
        max_words: maxWords 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Topic summary endpoint
  getTopicSummary: async (topic) => {
    try {
      const response = await api.post('/ai/topic-summary', { topic });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Advanced Features - Multi-Hop Reasoning Q&A
  multiHopQA: async (question, userId = null, maxHops = 3, includeReasoning = true) => {
    try {
      const response = await api.post('/ai/multi-hop-qa', {
        question,
        user_id: userId,
        max_hops: maxHops,
        include_reasoning: includeReasoning
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Advanced Features - Agentic Workflows
  executeAgentTask: async (task, userId = null, context = null) => {
    try {
      const response = await api.post('/ai/agent-task', {
        task,
        user_id: userId,
        context
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Advanced Features - Tool Execution
  executeTool: async (toolName, parameters = {}) => {
    try {
      const response = await api.post('/ai/tool-execute', {
        tool_name: toolName,
        parameters
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Advanced Features - Enhanced Summarization
  advancedSummarize: async (text, options = {}) => {
    try {
      const {
        style = 'concise',
        targetAudience = 'general',
        length = 'medium',
        includeKeywords = null,
        tone = 'neutral'
      } = options;

      const response = await api.post('/ai/advanced-summarize', {
        text,
        style,
        target_audience: targetAudience,
        length,
        include_keywords: includeKeywords,
        tone
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get available tools
  getAvailableTools: async () => {
    try {
      const response = await api.get('/ai/available-tools');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // AI service health check
  checkHealth: async () => {
    try {
      const response = await api.get('/ai/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default aiAPI;
