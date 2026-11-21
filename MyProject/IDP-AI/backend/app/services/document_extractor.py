from pathlib import Path

import fitz
from docx import Document


def extract_text(file_path: str) -> str:
    path = Path(file_path)
    extension = path.suffix.lower()

    if not path.exists():
        raise FileNotFoundError(f"Document not found: {path.name}")

    if extension == ".pdf":
        with fitz.open(path) as pdf:
            text = "\n".join(page.get_text() for page in pdf)

    elif extension == ".docx":
        document = Document(path)

        extracted_content = []

        # Extract normal paragraphs
        for paragraph in document.paragraphs:
            paragraph_text = paragraph.text.strip()

            if paragraph_text:
                extracted_content.append(paragraph_text)

        # Extract content from all tables
        for table in document.tables:
            for row in table.rows:
                row_values = []

                for cell in row.cells:
                    cell_text = cell.text.strip()

                    if cell_text:
                        row_values.append(cell_text)

                if row_values:
                    extracted_content.append(" | ".join(row_values))

        text = "\n".join(extracted_content)

    elif extension == ".txt":
        text = path.read_text(encoding="utf-8-sig")

    else:
        raise ValueError(
            "Unsupported document type. Use PDF, DOCX, or TXT."
        )

    text = text.strip()

    if not text:
        raise ValueError(
            "No text found in the document. "
            "Scanned PDFs may require OCR."
        )

    return text