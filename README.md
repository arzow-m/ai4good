# Perspect — Propaganda Detection Chrome Extension

A machine learning-powered Chrome extension that detects persuasion techniques in news articles at the paragraph level, powered by a fine-tuned transformer model trained on the SemEval 2023 Task 3 dataset.

## Resources
- [Demo Day Slides](https://docs.google.com/presentation/d/1yCy7zeGHEvlM25I5dv6GIicrbNbuRrBp/edit?usp=drivesdk&ouid=114298068544227992623&rtpof=true&sd=true)
- [Demo Day Pitch](https://www.youtube.com/live/AQ9wZb7XeQU?t=4180&si=lrpzv2dkRdCjDX8j)
- [Model Card](https://docs.google.com/document/d/1efaf6AZV5XFC1-bGp2zusex3nZVSX2FLha-u2ksDkew/edit?tab=t.0)

## What It Does

When you visit a news article, the extension highlights paragraphs and identifies which of 6 generalized persuasion techniques are present — Justification, Simplification, Call, Manipulative Wording, Attack on Reputation or None. A built-in chat assistant lets you ask follow-up questions about the detected techniques, or provides a neutral rewrite.

Supports English language articles...

## Project Structure

```
ai4good/
├── extension/              # Chrome extension
│   ├── popup/              # Extension popup UI
│   ├── sidebar/            # Sidebar panel
│   ├── content/            # Content script (runs on page)
│   ├── background/         # Service worker
│   └── icons/              # Extension icons
│
├── backend/                # Python API server (FastAPI)
│   ├── model/              # Fine-tuned transformer checkpoints
│   ├── chat/               # Chat assistant (Groq-powered)
│   └── data/               # SemEval 2023 Task 3 dataset
│
└── notebooks/              # Training and experimentation
```

## Architecture

The extension scrapes article text from the active tab and sends it to a locally-running Python backend. The backend runs inference using a fine-tuned RoBERTa model and returns per-paragraph predictions, which the extension displays in the popup and sidebar. A chat assistant powered by Groq lets users ask questions about the results.

```
[Chrome Extension] → POST /analyze  → [FastAPI Backend] → [RoBERTa Model]
                   → POST /chat     → [FastAPI Backend] → [Groq LLM]
```

## Setup

### Environment Variables

Create a .env file in the backend folder:

```bash
GROQ_API_KEY= your_api_key_here
```
Get a free API key from [Groq](https://console.groq.com/keys).

### Model

Create a 'checkpoints' folder in backend/model.
Add the correct checkpoint folder to backend/model/checkpoints. 

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

### Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `extension/` folder

## Dataset

SemEval 2023 Task 3: Detecting the Genre, the Framing, and the Persuasion Techniques in Online News in a Multi-lingual Setup.
