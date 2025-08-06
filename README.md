# Breadbutter Assignment

A Next.js application for matching creative briefs with talents using semantic search and rule-based scoring.

## Features

- **Smart Matching**: Uses HuggingFace embeddings with fallback to rule-based matching
- **Real-time Results**: Fast response with intelligent mock data
- **Clean UI**: Simple form interface for submitting creative briefs

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** (`.env.local`):
   ```
   HUGGINGFACE_API_KEY=your_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── pages/
│   ├── index.tsx          # Main form page
│   ├── _app.tsx          # App wrapper
│   └── api/
│       ├── submitBrief.ts # Main API endpoint
│       └── feedback.ts    # Feedback API
├── lib/
│   ├── embedding.ts      # HuggingFace embedding with fallback
│   ├── match.ts         # Matching logic
│   └── utils.ts         # Utility functions
├── scripts/
│   └── populateDatabase.js # Database population script
└── styles/
    └── globals.css      # Global styles
```

## Database Setup

1. Run the SQL schema in your Supabase dashboard (`SUPABASE_SCHEMA.sql`)
2. Populate with sample data:
   ```bash
   node scripts/populateDatabase.js
   ```

## Current Status

The app is currently using mock data for demonstration purposes. To connect to the real database, update the `submitBrief.ts` API to use the `getTopMatches` function instead of mock data.
