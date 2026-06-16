from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Path to your checkpoint
CHECKPOINT_PATH = "./model/checkpoint-1876"

print("Loading local tokenizer and model checkpoint...")

try:
    tokenizer = AutoTokenizer.from_pretrained(CHECKPOINT_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(CHECKPOINT_PATH)

    print("Model loaded successfully!")
    print("Label mapping:", model.config.id2label)

except Exception as e:
    print(f"Error loading model: {e}")
    exit()

# Put model in inference mode
model.eval()

# Test input
text = "Our enemies are destroying everything we built. Join us now or lose it all forever. Every true patriot knows what must be done."

print(f"\nInput text: {text}")

# Tokenize
inputs = tokenizer(
    text,
    return_tensors="pt",
    truncation=True,
    padding=True
)

# Run inference
print("Running inference...")

with torch.no_grad():
    outputs = model(**inputs)

# Get logits
logits = outputs.logits

# Convert logits to probabilities
probabilities = torch.softmax(logits, dim=1)

# Predicted class
prediction = torch.argmax(probabilities, dim=1).item()

print("\nResults")
print("-" * 40)
print("Prediction ID:", prediction)

if hasattr(model.config, "id2label"):
    print("Prediction Label:", model.config.id2label.get(prediction, "Unknown"))

print("Probabilities:", probabilities.tolist()[0])
print("-" * 40)

