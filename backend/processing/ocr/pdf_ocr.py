import fitz
import numpy as np
import easyocr


reader = easyocr.Reader(["en"], gpu=False)


def extract_text_from_pdf(pdf_path: str) -> dict:
    """
    Extract text from a scanned PDF using EasyOCR.
    """

    document = fitz.open(pdf_path)

    pages = []
    full_text = []

    for page_number, page in enumerate(document):
        pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2))

        image = np.frombuffer(
            pixmap.samples,
            dtype=np.uint8
        ).reshape(
            pixmap.height,
            pixmap.width,
            pixmap.n
        )

        results = reader.readtext(image, detail=0)

        page_text = "\n".join(results)

        pages.append({
            "page": page_number + 1,
            "text": page_text
        })

        full_text.append(page_text)

    document.close()

    return {
        "text": "\n".join(full_text),
        "pages": pages
    }