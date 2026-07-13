import easyocr


# Create OCR reader once when the module loads
reader = easyocr.Reader(["en"], gpu=False)


def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from an image using EasyOCR.

    Args:
        image_path: Path to the image file.

    Returns:
        Extracted text as a single string.
    """

    results = reader.readtext(image_path, detail=0)

    extracted_text = "\n".join(results)

    return extracted_text