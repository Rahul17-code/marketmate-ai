import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is not defined in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log('Testing connection to Gemini API...');
    // We try to list models
    // Since GoogleGenerativeAI doesn't have a direct listModels, we can fetch using fetch or check standard endpoints
    // Wait, let's try calling gemini-1.5-flash and gemini-2.5-flash with a simple request
    const model1 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res1 = await model1.generateContent('Hi');
    console.log('gemini-1.5-flash connection successful:', res1.response.text());
  } catch (err1) {
    console.error('gemini-1.5-flash failed:', err1.message);
    
    try {
      const model2 = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const res2 = await model2.generateContent('Hi');
      console.log('gemini-2.5-flash connection successful:', res2.response.text());
    } catch (err2) {
      console.error('gemini-2.5-flash failed:', err2.message);
    }
  }
}

main();
