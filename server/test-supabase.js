import dotenv from 'dotenv';

dotenv.config();

// We will load the frontend keys from the client folder to test connection
import fs from 'fs';
import path from 'path';

function loadClientEnv() {
  try {
    const envPath = path.resolve('../client/.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const config = {};
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        config[parts[0].trim()] = parts[1].trim();
      }
    });
    return config;
  } catch (e) {
    console.error('Could not load client .env file:', e.message);
    return null;
  }
}

async function main() {
  const clientEnv = loadClientEnv();
  if (!clientEnv) return;

  const url = clientEnv.VITE_SUPABASE_URL;
  const anonKey = clientEnv.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in client/.env');
    return;
  }

  console.log(`Testing connection to Supabase URL: ${url}`);

  try {
    const response = await fetch(`${url}/rest/v1/generations?select=*`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });

    const status = response.status;
    const text = await response.text();
    console.log(`Response Status: ${status}`);
    console.log(`Response Body: ${text}`);
  } catch (err) {
    console.error('Request failed:', err.message);
  }
}

main();
