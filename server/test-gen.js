import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not defined');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function generateWithGemini(params) {
  const { businessType, targetAudience, productService, platform, tone, goal } = params;
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

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

  console.log('Sending prompt to Gemini...');
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  console.log('--- RAW RESPONSE ---');
  console.log(responseText);
  console.log('--------------------');
  
  try {
    const parsed = JSON.parse(responseText);
    console.log('Parsing successful!');
    return parsed;
  } catch (err) {
    console.error('Parsing failed:', err.message);
    throw err;
  }
}

generateWithGemini({
  businessType: 'marketing',
  targetAudience: 'professional marketers age between 20-45',
  productService: 'a platform that makes the marketing campaign',
  platform: 'LinkedIn',
  tone: 'Professional',
  goal: 'Brand Awareness'
}).catch(console.error);
