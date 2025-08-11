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
