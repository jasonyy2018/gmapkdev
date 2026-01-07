# GMAPKDev - Smart Map Customer Development System

Professional AI-powered lead discovery and analysis platform using Google Maps and Gemini.

## 🚀 Quick Start (Local)

1. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your GOOGLE_API_KEY to .env
   ```

2. **Install Dependencies**
   ```bash
   ./install_dependencies.sh
   ```

3. **Run Application**
   ```bash
   ./run.sh
   ```

## 🐳 Running with Docker

```bash
docker-compose up --build
```

## 🏗️ Architecture

- **Backend**: FastAPI with SQLModel (SQLite).
  - `app/api`: Modular routers for Leads and Search.
  - `app/services`: Isolated logic for Maps, AI, and Scrapers.
  - `app/tasks`: Background AI analysis pipeline.
- **Frontend**: React + Vite + Tailwind CSS.
  - `src/api`: Typed service layer with TypeScript interfaces.
  - `src/components`: Clean, glassmorphic UI components.

## 🛠️ Key Components
- **WebScraperService**: Robust website content extraction with browser-like headers.
- **AIService**: Deep intelligence using Gemini 1.5 Pro to find emails and tech stacks.
- **MapsService**: Resilient Google Places integration with detailed result fetching.

## 📝 Troubleshooting
If "no data" appears:
1. Check your `.env` for a valid `GOOGLE_API_KEY`.
2. Ensure **Places API** and **Generative Language API** are enabled in Google Cloud Console.
3. Verify that your API key is not restricted from accessing these specific services.
