# Perspect  - *Media literacy, built into your browser*

Perspect is a ML-powered Chrome extension that detects and classifies persuasion techniques in social media posts and news articles in real time.


**Key features**

- Fine-tuned RoBERTa transformer model trained on the SemEval 2023 Task 3 dataset, classifying text into 6 broad persuasion technique categories with per-class confidence scoring 
- Real-time scroll-based detection across Instagram, Facebook, X, and news article pages
- Context-aware AI assistant that reads alongside the user in real time

## Resources
- [Demo Day Slides](https://docs.google.com/presentation/d/1yCy7zeGHEvlM25I5dv6GIicrbNbuRrBp/edit?usp=drivesdk&ouid=114298068544227992623&rtpof=true&sd=true)
- [Demo Day Pitch](https://www.youtube.com/live/AQ9wZb7XeQU?t=4180&si=lrpzv2dkRdCjDX8j)
- [Model Card](https://docs.google.com/document/d/1efaf6AZV5XFC1-bGp2zusex3nZVSX2FLha-u2ksDkew/edit?tab=t.0)
- [Demo Video](https://drive.google.com/file/d/1JjdjiotCDMMunDxv8dcgrg3Tw06gh6TU/view?usp=sharing)

## What It Does

As the user scrolls through social media or news content, the extension extracts text in real time and runs it through a fine-tuned RoBERTa classifier. For each piece of content, the model returns a confidence score across 6 persuasion technique categories - Justification, Simplification, Call, Manipulative Wording, Attack on Reputation, and None - along with plain-language explanations. A built-in AI assistant with full reading context lets users ask follow-up questions about the results.

*Currently supports English language content.*

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
│   └── chat/               # Chat assistant (Groq-powered)
│
└── notebooks/              # Training and experimentation
```

## Architecture

The application is split into two main systems: a Chrome extension frontend and a local Python backend.

- The extension content script scans page text using DOM selectors and browser observers. It caches repeated text blocks and forwards new text to the backend for classification.
- The backend runs a FastAPI server with two endpoints:
  - `POST /predict` receives text, tokenizes it with, runs a fine-tuned RoBERTa classifier, and returns per-label confidence scores.
  - `POST /chat` receives chat messages plus the current post context and model predictions, builds a system prompt from `backend/chat/prompt.py`, and forwards the conversation to Groq.
- The sidebar UI displays technique scores, explanations, and user chat history. Assistant replies are rendered as HTML in the sidebar.

```
[Chrome Extension] → POST /predict  → [FastAPI Backend] → [RoBERTa Model]
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

## Tech Stack
Extension: JavaScript, HTML / CSS

Backend: Python, PyTorch, FastAPI, Groq LLM

## Dataset

SemEval 2023 Task 3: Detecting the Genre, the Framing, and the Persuasion Techniques in Online News in a Multi-lingual Setup.

