import os
import pytesseract
from PIL import Image


tesseract_cmd = os.getenv("TESSERACT_CMD")

if not tesseract_cmd:
    raise RuntimeError("TESSERACT_CMD not set in environment variables")

pytesseract.pytesseract.tesseract_cmd = tesseract_cmd


def extract_text_from_image(file_path: str) -> str:
    """
    OCR pipeline:
    1. Open image
    2. Convert to grayscale
    3. Upscale (improves accuracy on small images)
    4. Apply threshold (binarization)
    5. Run Tesseract
    """

    image = Image.open(file_path)

    image = image.convert("L")

    width, height = image.size
    image = image.resize((width * 2, height * 2))

    image = image.point(lambda x: 0 if x < 150 else 255, "1")

    text = pytesseract.image_to_string(
        image,
        lang="rus+eng",
        config="--oem 3 --psm 3"
    )

    return text.strip()