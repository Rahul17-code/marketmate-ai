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
    "Generate caption 1 tailored for the platform, tone, and business type",
    "Generate caption 2...",
    "Generate caption 3...",
    "Generate caption 4...",
    "Generate caption 5..."
  ],
  "adCopies": [
    "Generate ad copy 1 (high-converting)",
    "Generate ad copy 2...",
    "Generate ad copy 3..."
  ],
  "outreachMessages": [
    "Generate outreach message 1 (for WhatsApp, LinkedIn, or Email)",
    "Generate outreach message 2...",
    "Generate outreach message 3..."
  ],
  "contentIdeas": [
    "Generate content idea 1",
    "Generate content idea 2",
    "Generate content idea 3",
    "Generate content idea 4",
    "Generate content idea 5",
    "Generate content idea 6",
    "Generate content idea 7",
    "Generate content idea 8",
    "Generate content idea 9",
    "Generate content idea 10"
  ],
  "videoScript": "A detailed 30-60 second short video script (including stage directions and spoken copy) matching the platform and goal",
  "hashtags": [
    "#hashtag1",
    "#hashtag2",
    "#hashtag3",
    "#hashtag4",
    "#hashtag5"
  ],
  "callToAction": "One clear and compelling Call-To-Action (CTA)"
}

Ensure all arrays contain the exact number of items specified: 5 captions, 3 ad copies, 3 outreach messages, 10 content ideas, 5 hashtags, 1 call-to-action.
`;

  const modelsToTry = ['gemini-3.5-flash', 'gemini-2.5-flash'];
  let result = null;
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });
      result = await model.generateContent(prompt);
      if (result) {
        console.log(`Successfully generated content using model: ${modelName}`);
        break;
      }
    } catch (err) {
      console.warn(`Model ${modelName} failed or returned error:`, err.message);
      lastError = err;
    }
  }

  if (!result) {
    throw new Error(lastError?.message || 'All available Gemini models are currently experiencing high demand. Please try again in a few moments.');
  }

  let responseText = result.response.text();
  
  // Parse output robustly to handle fences, wrapping text, and trailing commas
  try {
    if (!responseText) throw new Error('Empty response received from AI.');
    
    let cleaned = responseText.trim();
    
    // 1. Extract JSON object boundaries (between first '{' and last '}')
    const firstOpen = cleaned.indexOf('{');
    const lastClose = cleaned.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      cleaned = cleaned.substring(firstOpen, lastClose + 1);
    }
    
    // 2. Strip standard markdown code blocks if still present
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    // 3. Remove trailing commas in arrays/objects which break standard JSON.parse
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error('Failed to parse Gemini output as JSON:', responseText);
    console.error('Parsing error details:', parseError);
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
