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
    model: 'gemini-2.5-flash',
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
  businessType: 'gym',
  targetAudience: 'fat people',
  productService: 'cardio',
  platform: 'Instagram',
  tone: 'Emotional',
  goal: 'Lead Generation'
}).catch(console.error);
