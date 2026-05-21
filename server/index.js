import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the frontend can communicate with this API
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// Initialize the Gemini API client
// The key is retrieved from the backend .env file to keep it secure
const getGenerativeAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Service function to handle AI generation.
 * Structured so that we can swap Gemini with OpenAI or other models easily in the future.
 */
async function generateWithGemini(params) {
  const { businessType, targetAudience, productService, platform, tone, goal } = params;
  const genAI = getGenerativeAIClient();
  
  // Use gemini-2.5-flash as the default model for fast and cost-effective text generation
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  // Construct a detailed prompt detailing exactly what structured fields the frontend expects
  const prompt = `
You are an expert marketing strategist and copywriter.
Generate a cohesive marketing campaign for the following business:
- Business Type: ${businessType}
- Target Audience: ${targetAudience}
- Product or Service: ${productService}
- Platform: ${platform}
- Tone: ${tone}
- Marketing Goal: ${goal}

Your response must be a single valid JSON object.
Do not include any markdown blocks like \`\`\`json or \`\`\` in the response. Return raw JSON only.
The JSON object must follow this structure exactly:
{
  "captions": [
    // Generate exactly 5 captions tailored for the platform, tone, and business type
  ],
  "adCopies": [
    // Generate exactly 3 high-converting ad copies
  ],
  "outreachMessages": [
    // Generate exactly 3 outreach messages (suitable for WhatsApp, LinkedIn, or Email)
  ],
  "contentIdeas": [
    // Generate exactly 10 engaging content ideas or post concepts
  ],
  "videoScript": "A detailed 30-60 second short video script (including stage directions and spoken copy) matching the platform and goal",
  "hashtags": [
    // Generate exactly 5 trending and relevant hashtags (prefixed with #)
  ],
  "callToAction": "One clear and compelling Call-To-Action (CTA)"
}

Ensure all arrays contain the exact number of items specified: 5 captions, 3 ad copies, 3 outreach messages, 10 content ideas, 5 hashtags, 1 call-to-action.
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  // Parse output to ensure it matches the required format
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error('Failed to parse Gemini output as JSON:', responseText);
    throw new Error('AI returned an invalid JSON response. Please try again.');
  }
}

/**
 * Alternative provider placeholder (e.g. OpenAI)
 * This shows how easy it is to switch or extend the AI provider later.
 */
async function generateWithOpenAI(params) {
  // Placeholder implementation:
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const response = await openai.chat.completions.create({ ... });
  // return JSON.parse(response.choices[0].message.content);
  throw new Error('OpenAI provider is not implemented yet.');
}

// POST endpoint: /api/generate
app.post('/api/generate', async (req, res) => {
  const { businessType, targetAudience, productService, platform, tone, goal, provider = 'gemini' } = req.body;

  // Basic validation for required fields
  if (!businessType || !targetAudience || !productService || !platform || !tone || !goal) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'All fields (businessType, targetAudience, productService, platform, tone, goal) are required.'
    });
  }

  try {
    let result;
    if (provider === 'openai') {
      result = await generateWithOpenAI(req.body);
    } else {
      result = await generateWithGemini(req.body);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Generation Endpoint Error:', error);
    return res.status(500).json({
      error: 'Generation Failed',
      message: error.message || 'An unexpected error occurred while generating marketing content.'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 MarketMate AI Backend running on http://localhost:${PORT}`);
});
