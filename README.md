# AI4Good — Propaganda Detection Chrome Extension

A machine learning-powered Chrome extension that detects persuasion techniques in news articles at the paragraph level, powered by a fine-tuned transformer model trained on the SemEval 2023 Task 3 dataset.

## What It Does

When you visit a news article, the extension highlights paragraphs and identifies which of 23 persuasion techniques are present — e.g. Loaded Language, Appeal to Fear, False Dilemma, Name Calling, Doubt, and more.

Supports the English language for now.

## Project Structure

```
ai4good/
├── extension/              # Chrome extension
│   ├── popup/              # Extension popup UI
│   ├── content/            # Content script (runs on page)
│   ├── background/         # Service worker
│   └── icons/              # Extension icons
│
├── backend/                # Python API server
│   ├── model/              # Training, inference, and saved checkpoints
│   └── data/               # SemEval 2023 Task 3 dataset
│       └── semeval2023task3bundle-v4/
│
└── notebooks/              # Experimentation and exploration
```

## Architecture
(TBD, but could be a good idea)
The extension scrapes article text from the active tab and sends it to a locally-running Python backend. The backend runs inference using a fine-tuned multilingual transformer and returns predictions, which the extension displays in the popup.

```
[Chrome Extension] → POST /analyze → [FastAPI Backend] → [Transformer Model]
```

## Dataset

SemEval 2023 Task 3: Detecting the Genre, the Framing, and the Persuasion Techniques in Online News in a Multi-lingual Setup.

- 10 languages, 23 persuasion technique labels
- Baseline (SVM, char 5-gram): Subtask 3 Macro-F1 = 0.16

