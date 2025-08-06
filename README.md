# Breadbutter Assignment

A Next.js application for matching creative briefs with talents using semantic search and rule-based scoring.

## Features

- **Smart Matching**: Uses HuggingFace embeddings with fallback to rule-based matching
- **Real-time Results**: Fast response with intelligent mock data
- **Clean UI**: Simple form interface for submitting creative briefs

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

