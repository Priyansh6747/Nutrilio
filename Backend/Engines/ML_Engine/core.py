from transformers import AutoModelForImageClassification, AutoImageProcessor
from PIL import Image
from io import BytesIO
import torch
import torch.nn.functional as F

processor = AutoImageProcessor.from_pretrained("rajistics/finetuned-indian-food")
model = AutoModelForImageClassification.from_pretrained("rajistics/finetuned-indian-food")
model.eval()


def predict_food(image_bytes: bytes) -> dict:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    # Process image
    inputs = processor(images=image, return_tensors="pt")

    # Make prediction
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

        # Get probabilities using softmax
        probabilities = F.softmax(logits, dim=-1)

        # Get predicted class and confidence
        confidence, predicted_class_id = torch.max(probabilities, dim=-1)
        predicted_class = model.config.id2label[predicted_class_id.item()]

        return {
            "result": predicted_class,
            "confidence": confidence.item()
        }

