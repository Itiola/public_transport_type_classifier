from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import io
from PIL import Image
import torch
import clip

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Load CLIP model
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# Transport labels
labels = ["a danfo bus", "a keke napep", "a motorcycle (okada)", "a BRT bus", "a private car"]
text_tokens = clip.tokenize(labels).to(device)

@app.get("/", response_class=HTMLResponse)
async def serve_ui():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_input = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        image_features = model.encode_image(image_input)
        text_features = model.encode_text(text_tokens)
        logits_per_image, _ = model(image_input, text_tokens)
        probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]

    pred_index = probs.argmax()
    return JSONResponse({"label": labels[pred_index], "confidence": float(probs[pred_index])})
