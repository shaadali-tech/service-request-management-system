import { Request, Response } from "express";

export const analyzeRequest = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        error: "Title and description are required for AI analysis",
      });
    }

    // Reserved for future AI integration
    const apiKey = process.env.AI_SERVICE_TOKEN;
    void apiKey;

    const content = `${title} ${description}`.toLowerCase();

    if (
      content.includes("vpn") ||
      content.includes("remote access") ||
      content.includes("cannot connect")
    ) {
      return res.status(200).json({
        summary: "VPN connectivity issue affecting secure network access.",
        suggestedCategory: "NETWORK",
        suggestedPriority: "HIGH",
        reason:
          "VPN issues prevent access to internal systems and require prompt attention.",
      });
    }

    if (
      content.includes("internet") ||
      content.includes("wifi") ||
      content.includes("network")
    ) {
      return res.status(200).json({
        summary: "Internet or Wi-Fi connectivity issue.",
        suggestedCategory: "NETWORK",
        suggestedPriority: "MEDIUM",
        reason:
          "Network instability affects productivity but may have temporary workarounds.",
      });
    }

    if (
      content.includes("laptop") ||
      content.includes("screen") ||
      content.includes("keyboard") ||
      content.includes("mouse") ||
      content.includes("hardware")
    ) {
      return res.status(200).json({
        summary: "Hardware-related issue detected.",
        suggestedCategory: "HARDWARE",
        suggestedPriority: "LOW",
        reason:
          "Hardware issue appears to affect a single device and can be handled through standard support.",
      });
    }

    if (
      content.includes("password") ||
      content.includes("login") ||
      content.includes("account") ||
      content.includes("authentication")
    ) {
      return res.status(200).json({
        summary: "User account or authentication issue.",
        suggestedCategory: "ACCESS",
        suggestedPriority: "HIGH",
        reason:
          "Authentication issues can prevent users from accessing business systems.",
      });
    }

    return res.status(200).json({
      summary: "General support request.",
      suggestedCategory: "OTHER",
      suggestedPriority: "MEDIUM", // Fixed: was CRITICAL
      reason:
        "No specific category could be determined from the request details.",
    });
  } catch (error) {
    return res.status(500).json({
      error: "AI Analysis engine failed",
      details: (error as Error).message,
    });
  }
};
