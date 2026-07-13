from backend.processing.ocr.ocr_engine import extract_ocr_text


print("\n--- TEST IMAGE ---")

image_result = extract_ocr_text(
    "tests/samples/test_image.png"
)

print("File Type:", image_result["file_type"])
print("Text:")
print(image_result["text"])


print("\n--- TEST SCANNED PDF ---")

pdf_result = extract_ocr_text(
    "tests/samples/test_scan.pdf"
)

print("File Type:", pdf_result["file_type"])
print("Pages:", len(pdf_result["pages"]))
print("Text:")
print(pdf_result["text"])