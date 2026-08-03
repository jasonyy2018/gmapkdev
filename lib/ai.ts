import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import * as cheerio from "cheerio";

const getApiKey = () => process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";

function getGenerativeModel() {
  const key = getApiKey();
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  // Default to gemini-1.5-flash or gemini-1.5-pro
  try {
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (e) {
    return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }
}

function cleanAndParseJSON(text: string) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  return JSON.parse(cleaned);
}

export const aiService = {
  async fetchWebsiteContent(url: string): Promise<string> {
    if (!url || !url.startsWith("http")) {
      url = `https://${url}`;
    }
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };
    try {
      const response = await axios.get(url, { 
        headers, 
        timeout: 12000,
        validateStatus: () => true 
      });
      if (typeof response.data !== "string") {
        return "Non-text website content";
      }
      const $ = cheerio.load(response.data);
      $("script, style, noscript, svg").remove();
      
      const text = $("body").text().replace(/\s+/g, ' ').trim();
      return text.substring(0, 12000);
    } catch (error: any) {
      console.error(`Error fetching website ${url}:`, error.message);
      return `Error fetching content: ${error.message}`;
    }
  },

  async analyzeWebsite(companyName: string, websiteContent: string) {
    const model = getGenerativeModel();
    if (!model) return { error: "AI Service not configured (missing API Key)" };

    const isFetchError = websiteContent.startsWith("Error fetching content") || websiteContent.length < 50;

    const prompt = `
    Analyze the following digital audit data for a company named '${companyName}'.
    Goal: Determine if they need website development / UX redesign / SEO optimization services and extract actionable lead details.
    
    Content/Context:
    ${isFetchError ? `Website inaccessible or offline (${websiteContent}). Perform Google Business profile fallback audit.` : websiteContent.substring(0, 10000)}
    
    Return ONLY a valid JSON object matching this structure:
    {
      "tech_stack": ["string", "string"],
      "ux_assessment": "string describing design, responsiveness, or online presence",
      "mobile_friendly": true/false,
      "business_insight": "string summarizing core business model and opportunities",
      "contact_email": "string email if found, or null",
      "score": number 0-100 (100 = urgent need for web overhaul/new site),
      "grade": "A" (80-100 Priority), "B" (50-79 Scale), or "C" (0-49 Low),
      "email_subjects": ["Subject Option 1", "Subject Option 2", "Subject Option 3"]
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      return cleanAndParseJSON(rawText);
    } catch (error: any) {
      console.error("AI Analysis failed:", error);
      return {
        tech_stack: isFetchError ? ["Legacy / Offline Site"] : ["Unspecified Stack"],
        ux_assessment: "Website inaccessible or requires modern responsive overhaul.",
        mobile_friendly: false,
        business_insight: `${companyName} requires digital presence upgrade to capture local leads effectively.`,
        contact_email: null,
        score: 85,
        grade: "A",
        email_subjects: [
          `Digital Upgrade Proposal for ${companyName}`,
          `Quick question regarding ${companyName}'s web presence`,
          `Modernizing ${companyName}'s Online Platform`
        ]
      };
    }
  },

  async generateOutreachEmail(leadInfo: any, analysisInfo: any) {
    const model = getGenerativeModel();
    if (!model) return "AI Service not configured. Please add GOOGLE_API_KEY or GEMINI_API_KEY.";

    const prompt = `
    Write a professional, consultative, non-spammy outreach email offering web development & digital optimization services to ${leadInfo.name}.
    Client Name: ${leadInfo.name}
    Website: ${leadInfo.website || "No official website currently"}
    AI Audit Insights: ${JSON.stringify(analysisInfo, null, 2)}
    
    Key Rules:
    - Keep tone consultative, respectful, and value-focused.
    - Highlight 1-2 specific improvements based on tech stack or UX assessment.
    - End with a low-friction call-to-action (e.g., a brief 10-minute call or quick mockup review).
    - Return ONLY the email body text.
    `;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Email generation failed:", error);
      return `Hi ${leadInfo.name} Team,\n\nI noticed your online presence could benefit from a modern, responsive website upgrade to increase customer conversion.\n\nWould you be open to a quick chat this week to explore options?\n\nBest regards,`;
    }
  },

  async refineEmailContent(currentEmail: string, instruction: string) {
    const model = getGenerativeModel();
    if (!model) return currentEmail;

    const prompt = `
    Refine the following outreach email according to the instruction provided.
    Current Email:
    ${currentEmail}

    Instruction: ${instruction}
    
    Return ONLY the refined email body text.
    `;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Email refinement failed:", error);
      return currentEmail;
    }
  },

  async generatePosterData(leadInfo: any, analysisInfo: any) {
    const model = getGenerativeModel();
    if (!model) {
      return {
        title: `Transform ${leadInfo.name || "Business"}'s Digital Impact`,
        subtitle: "Custom Web Solutions Built for Maximum Conversions",
        key_points: [
          "Mobile-First Responsive Layout",
          "Ultra-Fast Page Load Speed",
          "Modern UI/UX Design",
          "Built-in Lead Generation"
        ],
        call_to_action: "Schedule Your Free Consultation Today",
        theme_colors: { primary: "#6366f1", secondary: "#a855f7" },
        style_vibe: "Modern Tech"
      };
    }

    const prompt = `
    Create structured marketing poster content for a web design and technology pitch tailored to '${leadInfo.name}'.
    Lead Status & Insights: ${JSON.stringify(analysisInfo, null, 2)}
    
    Return ONLY a valid JSON object with:
    {
      "title": "Headline phrase (e.g., Elevate ${leadInfo.name}'s Web Presence)",
      "subtitle": "Compelling subheadline",
      "key_points": ["Point 1", "Point 2", "Point 3", "Point 4"],
      "call_to_action": "Actionable closing phrase",
      "theme_colors": {"primary": "#6366f1", "secondary": "#a855f7"},
      "style_vibe": "Modern / Boutique / Enterprise"
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      return cleanAndParseJSON(result.response.text());
    } catch (error) {
      console.error("Poster data generation failed:", error);
      return {
        title: `Transform ${leadInfo.name}'s Digital Presence`,
        subtitle: "Custom High-Converting Web & Tech Overhaul",
        key_points: [
          "Responsive Mobile Optimization",
          "SEO & Speed Enhancements",
          "Modern User Interface",
          "Automated Customer Funnel"
        ],
        call_to_action: "Claim Your Web Transformation Blueprint",
        theme_colors: { primary: "#6366f1", secondary: "#a855f7" },
        style_vibe: "Modern Tech"
      };
    }
  }
};

