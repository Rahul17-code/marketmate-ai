# MarketMate AI - Full-Stack AI Marketing Assistant

MarketMate AI is a professional full-stack SaaS application that generates custom marketing materials (captions, ad copies, outreach messages, content ideas, short video scripts, hashtags, and call-to-actions) using the Google Gemini API based on user business configurations. Campaigns are automatically saved to a Supabase database and tracked chronologically in the user's dashboard history.

---

## Technical Stack
- **Frontend**: React (Vite), Axios, Lucide Icons, Supabase JS SDK, Modern Glassmorphic CSS.
- **Backend**: Node.js, Express, CORS, `@google/generative-ai` SDK.
- **Database/Auth**: Supabase (PostgreSQL with Email Authentication).

---

## Project Structure
```
Marketing_ai/
├── .gitignore
├── README.md
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── History.jsx
│   │   │   ├── MarketingForm.jsx
│   │   │   └── OutputCard.jsx
│   │   └── lib/
│   │       └── supabaseClient.js
└── server/
    ├── .env.example
    ├── index.js
    └── package.json
```

---

## 1. Database Setup (Supabase)

Log in to your [Supabase Console](https://supabase.com), create a new project, navigate to the **SQL Editor**, and execute the following SQL command to create the generations history table:

```sql
-- Create generations storage table
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  business_type TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  product_service TEXT NOT NULL,
  platform TEXT NOT NULL,
  tone TEXT NOT NULL,
  goal TEXT NOT NULL,
  output TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optional: Enable row-level security (RLS) for security
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own campaigns" 
ON generations 
FOR ALL 
TO authenticated 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);
```

Make sure to enable **Email Signup/Login** in your Supabase Auth Providers setting (this is enabled by default in Supabase).

---

## 2. Environment Variables Configuration

### Backend (`server/`)
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend (`client/`)
Create a `.env` file inside the `client/` directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_URL=http://localhost:5000
```

---

## 3. Installation & Setup

Open two terminals to run the backend and frontend separately.

### Terminal 1: Backend Server Setup
```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Start development server (via nodemon)
npm run dev
```
The server will boot and run on `http://localhost:5000`.

### Terminal 2: Frontend Client Setup
```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Start Vite developer server
npm run dev
```
The Vite React client will run on `http://localhost:3000`. Open this page in your browser.

---

## Features
1. **Supabase Email Authentication**: Sign up and login panels using secure Supabase credentials.
2. **Dynamic Generation Form**: Input business type, target audience, products, select platforms (e.g. YouTube, Instagram), tone, and goals.
3. **Structured Cards Dashboard**: Beautiful responsive display showing all generated marketing materials.
4. **Copy to Clipboard**: Quick copies with instant success ticks.
5. **Interactive History**: View all past campaigns. Click an item to reload it on the dashboard view.
