import express, { Request, Response } from "express";
import axios from "axios";
import { Utils } from "../utils";

const router = express.Router();

// AI service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

interface RephraseRequest {
  text: string;
  tone: "Professional" | "Technical" | "Casual" | "SEO";
  provider?: "openai" | "groq";
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

export default router;
