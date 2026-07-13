from pathlib import Path

from backend.processing.ocr.image_ocr import extract_text_from_image
from backend.processing.ocr.pdf_ocr import extract_text_from_pdf


SUPPORTED_IMAGES = {".png", ".jpg", ".jpeg"}


def extract_ocr_text(file_path: str) -> dict:
    """
    Extract text from supported images or scanned PDFs.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    extension = path.suffix.lower()

    if extension in SUPPORTED_IMAGES:
        text = extract_text_from_image(str(path))

        return {
            "file_path": str(path),
            "file_type": "image",
            "text": text,
            "pages": [
                {
                    "page": 1,
                    "text": text
                }
            ]
        }

    if extension == ".pdf":
        result = extract_text_from_pdf(str(path))

        return {
            "file_path": str(path),
            "file_type": "pdf",
            "text": result["text"],
            "pages": result["pages"]
        }

    raise ValueError(
        f"Unsupported OCR file type: {extension}"
    )