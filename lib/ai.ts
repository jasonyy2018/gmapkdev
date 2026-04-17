import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import * as cheerio from "cheerio";

const API_KEY = process.env.GOOGLE_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-pro" }) : null;

export const aiService = {
  async fetchWebsiteContent(url: string): Promise<string> {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };
    try {
      const response = await axios.get(url, { 
        headers, 
        timeout: 15000,
        validateStatus: () => true 
      });
      const $ = cheerio.load(response.data);
      
      // Remove script and style elements
      $("script, style").remove();
      
      const text = $("body").text().replace(/\s+/g, ' ').trim();
      return text.substring(0, 10000); // Limit content size
    } catch (error: any) {
      console.error(`Error fetching website ${url}:`, error.message);
      return `Error fetching content: ${error.message}`;
    }
  },

  async analyzeWebsite(companyName: string, websiteContent: string) {
    if (!model) return { error: "AI Service not configured" };

    const prompt = `
    Analyze the following website content for a company named '${companyName}'.
    Goal: Determine if they need website development services and extract contact info.
    
    Content:
    ${websiteContent.substring(0, 10000)} 
    
    Provide a JSON response with:
    - tech_stack: list of detected technologies (CMS, JS frameworks, etc)
    - ux_assessment: brief assessment of design and user experience
    - mobile_friendly: boolean if it looks mobile friendly
    - business_insight: key business focus
    - contact_email: any professional contact email addresses found
    - score: 0-100 rating based on need for website services (100 = urgent need)
    - grade: A (Priority), B (Scale), C (Low)
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error: any) {
      console.error("AI Analysis failed:", error);
      return { error: "Failed to parse AI response", message: error.message };
    }
  },

  async generateOutreachEmail(leadInfo: any, analysisInfo: any) {
    if (!model) return "AI Service not configured";

    const prompt = `
    Write a professional, personalized outreach email for a website development service.
    Client: ${leadInfo.name}
    Website: ${leadInfo.website}
    AI Insights: ${JSON.stringify(analysisInfo, null, 2)}
    
    The tone should be helpful and consultative, not salesy. Mention specific details from the insights.
    Return the email body text.
    `;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Email generation failed:", error);
      return "Failed to generate email.";
    }
  },

  async refineEmailContent(currentEmail: string, instruction: string) {
    if (!model) return currentEmail;

    const prompt = `
    Refine the following outreach email based on the instruction provided.
    Current Email:
    ${currentEmail}

    Instruction: ${instruction}
    
    Return only the refined email body text.
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
    if (!model) return {};

    const prompt = `
    Create marketing poster data for a website development pitch to ${leadInfo.name}.
    Analyze their status: ${JSON.stringify(analysisInfo, null, 2)}
    
    Provide a JSON response with:
    - title: A powerful marketing headline (e.g., "Elevate ${leadInfo.name}'s Digital Presence")
    - subtitle: A compelling sub-headline
    - key_points: List of 3-4 specific technical or business improvements needed (short phrases)
    - call_to_action: A strong closing statement
    - theme_colors: {"primary": "hex_color", "secondary": "hex_color"}
    - style_vibe: (e.g., "Professional", "Boutique", "Modern", "Dynamic")
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error("Poster data generation failed:", error);
      return {};
    }
  }
};
