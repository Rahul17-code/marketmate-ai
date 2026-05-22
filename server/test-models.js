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
  
  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-pro',
    'gemini-3.0-flash',
    'gemini-3.5-flash'
  ];

  for (const m of models) {
    try {
      console.log(`Testing connection to ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent('Hi');
      console.log(`SUCCESS [${m}]:`, res.response.text());
    } catch (err) {
      console.error(`FAILED [${m}]:`, err.message);
    }
  }
}

main();
