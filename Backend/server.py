from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI(title="NeuroScan AI Local Backend")

# ফ্রন্টএন্ড (localhost বা যেকোনো ডোমেইন) থেকে API কল অনুমোদন করা
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model("brain_tumor_model.keras")

CLASS_NAMES = [
    "Glioma Tumor",
    "Meningioma Tumor",
    "No Tumor",
    "Pituitary Tumor"
]

@app.get("/")
def health_check():
    return {"status": "ready", "model": "EfficientNetB0"}

@app.post("/predict")
async def predict_mri(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
    img_array = np.expand_dims(np.array(img, dtype=np.float32), axis=0)
    
    preds = model.predict(img_array)[0]
    results = [
        {"label": CLASS_NAMES[i], "confidence": float(preds[i])}
        for i in range(len(CLASS_NAMES))
    ]
    results.sort(key=lambda x: x["confidence"], reverse=True)
    return {"predictions": results}