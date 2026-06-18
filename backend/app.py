from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os
from dotenv import load_dotenv
from groq import Groq
from chat.prompt import build_system_prompt
import json

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace "*" with your specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHECKPOINT_PATH = "./model/checkpoints/checkpoint-1876"

print("Loading model...")

tokenizer = AutoTokenizer.from_pretrained("roberta-base")
model = AutoModelForSequenceClassification.from_pretrained(CHECKPOINT_PATH)

model.eval()

print("Model loaded.")

class InputData(BaseModel):
    text: str

class ChatMessage(BaseModel):
    message: str
    post_text: str
    predictions: dict
    hostname: str
    history: list = []

LABEL_MAP = {
    0: "Call",
    1: "Justification",
    2: "Manipulative Wording",
    3: "None",
    4: "Attack on Reputation",
    5: "Simplification"
}

@app.post("/predict")
def predict(data: InputData):

    inputs = tokenizer(
        data.text,
        return_tensors="pt",
        truncation=True,
        padding=True
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probs = torch.sigmoid(outputs.logits)

    return {
        "input": data.text,
        "prediction": {LABEL_MAP[i]: round(prob, 4) for i, prob in enumerate(probs.tolist()[0])}
    }

@app.post("/chat")
def chat(data: ChatMessage):
    print("\n--- CHAT REQUEST ---")
    print(f"\nPost: {data.post_text}")
    print(f"\nPredictions: {json.dumps(data.predictions, indent=2)}")
    print(f"\nMessage: {data.message}")
    print("-------------------\n")
    system_prompt = build_system_prompt(
        post_text=data.post_text,
        predictions=data.predictions,
        hostname=data.hostname
    )

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            *[{"role": turn["role"], "content": turn["content"]} for turn in data.history],
            {"role": "user", "content": data.message}
        ],
        temperature=0.3,
        max_tokens=500
    )

    return {"response": response.choices[0].message.content}