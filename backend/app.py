from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace "*" with your specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



CHECKPOINT_PATH = "./model/checkpoint-1876"

print("Loading model...")

tokenizer = AutoTokenizer.from_pretrained(CHECKPOINT_PATH)
model = AutoModelForSequenceClassification.from_pretrained(CHECKPOINT_PATH)

model.eval()

print("Model loaded.")

class InputData(BaseModel):
    text: str

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

    probs = torch.softmax(outputs.logits, dim=1)

    prediction = torch.argmax(probs, dim=1).item()

    return {
        "input": data.text,
        "prediction": LABEL_MAP.get(prediction, "Unknown"),
        "probabilities": probs.tolist()[0]
    }