from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ai_edge_litert.interpreter import Interpreter
import numpy as np
from PIL import Image
import io

app = FastAPI(title="NeuroScan AI Lightweight Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load lightweight TFLite model (uses <90MB RAM)
interpreter = Interpreter(model_path="brain_tumor_model.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

CLASS_NAMES = [
    "Glioma Tumor",
    "Meningioma Tumor",
    "No Tumor",
    "Pituitary Tumor"
]

@app.get("/")
def health_check():
    return {"status": "ready", "model": "EfficientNetB0-TFLite"}

@app.post("/predict")
async def predict_mri(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
    img_array = np.expand_dims(np.array(img, dtype=np.float32), axis=0)

    interpreter.set_tensor(input_details[0]["index"], img_array)
    interpreter.invoke()
    preds = interpreter.get_tensor(output_details[0]["index"])[0]

    results = [
        {"label": CLASS_NAMES[i], "confidence": float(preds[i])}
        for i in range(len(CLASS_NAMES))
    ]
    results.sort(key=lambda x: x["confidence"], reverse=True)
    return {"predictions": results}