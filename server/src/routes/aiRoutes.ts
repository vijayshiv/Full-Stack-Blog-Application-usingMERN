import express, { Request, Response } from "express";
import axios from "axios";
import { Utils } from "../utils";

const router = express.Router();

// AI service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

console.log(`AI Service URL configured: ${AI_SERVICE_URL}`);

interface RephraseRequest {
  text: string;
  tone: "Professional" | "Technical" | "Casual" | "SEO";
  provider?: "openai" | "groq";
}

interface QARequest {
  question: string;
}

interface SemanticSearchRequest {
  query: string;
  limit?: number;
}

interface SummarizeRequest {
  content: string;
  max_words?: number;
}

interface TopicSummaryRequest {
  topic: string;
}

/**
 * @route POST /api/ai/rephrase
 * @desc Rephrase text using AI service
 * @access Private
 */
router.post("/rephrase", async (req: Request, res: Response) => {
  try {
    const { text, tone, provider = "groq" }: RephraseRequest = req.body;

    // Validate input
    if (!text || !tone) {
      return res
        .status(400)
        .json(Utils.errorMessage("Text and tone are required"));
    }

    // Validate tone
    const validTones = ["Professional", "Technical", "Casual", "SEO"];
    if (!validTones.includes(tone)) {
      return res
        .status(400)
        .json(
          Utils.errorMessage(
            "Invalid tone. Must be: Professional, Technical, Casual, or SEO"
          )
        );
    }

    // Choose endpoint based on provider
    const endpoint =
      provider === "openai"
        ? `${AI_SERVICE_URL}/rephrase-openai`
        : `${AI_SERVICE_URL}/rephrase-groq`;

    // Call AI service
    const response = await axios.post(
      endpoint,
      { text, tone },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(Utils.successMessage(response.data));
  } catch (error: any) {
    console.error("AI rephrasing error:", error);

    if (error.response) {
      // AI service returned an error
      const message = error.response.data?.detail || "AI service error";
      return res
        .status(error.response.status)
        .json(Utils.errorMessage(message));
    } else if (error.code === "ECONNREFUSED") {
      // AI service is not running
      return res
        .status(503)
        .json(Utils.errorMessage("AI service is currently unavailable"));
    } else {
      // Other errors
      return res.status(500).json(Utils.errorMessage("Internal server error"));
    }
  }
});

/**
 * @route GET /api/ai/health
 * @desc Check AI service health
 * @access Public
 */
router.get("/health", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000,
    });

    return res.status(200).json(Utils.successMessage(response.data));
  } catch (error) {
    return res
      .status(503)
      .json(Utils.errorMessage("AI service is unavailable"));
  }
});

/**
 * @route POST /api/ai/qa
 * @desc Ask questions using RAG system
 * @access Public
 */
router.post("/qa", async (req: Request, res: Response) => {
  try {
    const { question }: QARequest = req.body;

    if (!question) {
      return res.status(400).json(Utils.errorMessage("Question is required"));
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/qa`,
      { question },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(Utils.successMessage(response.data));
  } catch (error: any) {
    console.error("AI Q&A error:", error);

    if (error.response) {
      const message = error.response.data?.detail || "AI service error";
      return res
        .status(error.response.status)
        .json(Utils.errorMessage(message));
    } else if (error.code === "ECONNREFUSED") {
      return res
        .status(503)
        .json(Utils.errorMessage("AI service is currently unavailable"));
    } else {
      return res.status(500).json(Utils.errorMessage("Internal server error"));
    }
  }
});

/**
 * @route POST /api/ai/semantic-search
 * @desc Perform semantic search across content
 * @access Public
 */
router.post("/semantic-search", async (req: Request, res: Response) => {
  try {
    const { query, limit = 10 }: SemanticSearchRequest = req.body;

    if (!query) {
      return res.status(400).json(Utils.errorMessage("Query is required"));
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/semantic-search`,
      { query, limit },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(Utils.successMessage(response.data));
  } catch (error: any) {
    console.error("Semantic search error:", error);

    if (error.response) {
      const message = error.response.data?.detail || "AI service error";
      return res
        .status(error.response.status)
        .json(Utils.errorMessage(message));
    } else if (error.code === "ECONNREFUSED") {
      return res
        .status(503)
        .json(Utils.errorMessage("AI service is currently unavailable"));
    } else {
      return res.status(500).json(Utils.errorMessage("Internal server error"));
    }
  }
});

/**
 * @route POST /api/ai/summarize
 * @desc Summarize content with word limit
 * @access Public
 */
router.post("/summarize", async (req: Request, res: Response) => {
  try {
    const { content, max_words = 200 }: SummarizeRequest = req.body;

    if (!content) {
      return res.status(400).json(Utils.errorMessage("Content is required"));
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/summarize`,
      {
        text: content, // Map content to text for FastAPI
        max_length: max_words, // Map max_words to max_length for FastAPI
      },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(Utils.successMessage(response.data));
  } catch (error: any) {
    console.error("Summarization error:", error);

    if (error.response) {
      const message = error.response.data?.detail || "AI service error";
      return res
        .status(error.response.status)
        .json(Utils.errorMessage(message));
    } else if (error.code === "ECONNREFUSED") {
      return res
        .status(503)
        .json(Utils.errorMessage("AI service is currently unavailable"));
    } else {
      return res.status(500).json(Utils.errorMessage("Internal server error"));
    }
  }
});

/**
 * @route POST /api/ai/topic-summary
 * @desc Get topic-based summary from knowledge base
 * @access Public
 */
router.post("/topic-summary", async (req: Request, res: Response) => {
  try {
    const { topic }: TopicSummaryRequest = req.body;

    if (!topic) {
      return res.status(400).json(Utils.errorMessage("Topic is required"));
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/topic-summary`,
      { topic },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(Utils.successMessage(response.data));
  } catch (error: any) {
    console.error("Topic summary error:", error);

    if (error.response) {
      const message = error.response.data?.detail || "AI service error";
      return res
        .status(error.response.status)
        .json(Utils.errorMessage(message));
    } else if (error.code === "ECONNREFUSED") {
      return res
        .status(503)
        .json(Utils.errorMessage("AI service is currently unavailable"));
    } else {
      return res.status(500).json(Utils.errorMessage("Internal server error"));
    }
  }
});

export default router;
