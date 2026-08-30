import os
from typing import Dict, Any, Optional

def extract_pdf_text(filepath: str) -> str:
    text = ""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(filepath)
        for page_num in range(len(doc)):
            page = doc[page_num]
            text += page.get_text() + "\n"
        doc.close()
    except Exception as e:
        # Fallback to pypdf if PyMuPDF not installed/fails
        try:
            from pypdf import PdfReader
            reader = PdfReader(filepath)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e2:
            print(f"Error reading PDF {filepath}: {e2}")
    return text.strip()

def extract_docx_text(filepath: str) -> str:
    try:
        import docx
        doc = docx.Document(filepath)
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text)
        return "\n".join(full_text)
    except Exception as e:
        print(f"Error reading docx {filepath}: {e}")
        return ""

def extract_plain_text(filepath: str) -> str:
    encodings = ["utf-8", "latin-1", "cp1252"]
    for enc in encodings:
        try:
            with open(filepath, "r", encoding=enc) as f:
                return f.read()
        except Exception:
            continue
    return ""

def extract_image_text(filepath: str) -> str:
    enable_ocr = os.getenv("ENABLE_OCR", "false").lower() in ("true", "1", "yes")
    if not enable_ocr:
        return ""
    try:
        import easyocr
        reader = easyocr.Reader(["en"], gpu=False)
        results = reader.readtext(filepath, detail=0)
        return "\n".join(results)
    except Exception as e:
        print(f"OCR failed for {filepath}: {e}")
        return ""

def extract_text_from_file(filepath: str) -> Dict[str, Any]:
    if not os.path.exists(filepath):
        return {"text": "", "type": "unknown", "size": 0, "error": "File does not exist"}

    ext = os.path.splitext(filepath)[1].lower().lstrip(".")
    size = os.path.getsize(filepath)
    text = ""

    if ext in ["pdf"]:
        text = extract_pdf_text(filepath)
        # If PDF has no extractable text (e.g. scanned), attempt OCR if enabled
        if not text.strip():
            enable_ocr = os.getenv("ENABLE_OCR", "false").lower() in ("true", "1", "yes")
            if enable_ocr:
                try:
                    import fitz
                    import easyocr
                    from PIL import Image
                    import io
                    doc = fitz.open(filepath)
                    reader = easyocr.Reader(["en"], gpu=False)
                    for page in doc:
                        pix = page.get_pixmap()
                        img_bytes = pix.tobytes("png")
                        ocr_res = reader.readtext(img_bytes, detail=0)
                        text += "\n".join(ocr_res) + "\n"
                    doc.close()
                except Exception as oe:
                    print(f"Scanned PDF OCR failed: {oe}")
    elif ext in ["docx", "doc"]:
        text = extract_docx_text(filepath)
    elif ext in ["txt", "md", "markdown", "py", "js", "json", "csv", "html", "css", "yaml", "yml", "log"]:
        text = extract_plain_text(filepath)
    elif ext in ["png", "jpg", "jpeg", "webp", "tiff", "bmp"]:
        text = extract_image_text(filepath)
    else:
        text = extract_plain_text(filepath)

    return {
        "text": text.strip(),
        "type": ext or "txt",
        "size": size,
        "filename": os.path.basename(filepath),
        "filepath": os.path.abspath(filepath)
    }
