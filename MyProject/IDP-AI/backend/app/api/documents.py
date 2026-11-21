from pathlib import Path
from uuid import uuid4
from typing import Literal

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field

from app.services.document_extractor import extract_text
from app.services.gemini_extractor import analyze_document
from app.services.validation_service import validate_document
from app.services.workflow_service import (
    get_document_record,
    get_review_queue,
    get_workflow_history,
    save_analysis,
    submit_review,
)


router = APIRouter(prefix="/api/documents", tags=["Documents"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class ReviewRequest(BaseModel):
    decision: Literal["approve", "reject"]
    reviewer: str = Field(min_length=1, max_length=100)
    comments: str | None = Field(default=None, max_length=1000)


@router.post("/upload", status_code=201)
async def upload_document(file: UploadFile = File(...)):
    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if not original_name or extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, and TXT files are supported.",
        )

    document_id = str(uuid4())
    destination = UPLOAD_DIR / f"{document_id}{extension}"
    size = 0

    try:
        with destination.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)

                if size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File size exceeds the 10 MB limit.",
                    )

                output.write(chunk)

        return {
            "document_id": document_id,
            "filename": original_name,
            "file_type": extension.lstrip("."),
            "size_bytes": size,
            "status": "uploaded",
            "message": "Document uploaded successfully.",
        }

    except Exception:
        destination.unlink(missing_ok=True)
        raise

    finally:
        await file.close()


@router.post("/{document_id}/extract")
async def extract_document_text(document_id: str):
    matches = list(UPLOAD_DIR.glob(f"{document_id}.*"))

    if not matches:
        raise HTTPException(
            status_code=404,
            detail="Uploaded document not found.",
        )

    try:
        extracted_text = extract_text(str(matches[0]))

        return {
            "document_id": document_id,
            "filename": matches[0].name,
            "status": "extracted",
            "character_count": len(extracted_text),
            "text": extracted_text,
        }

    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Uploaded document not found.",
        )


@router.post("/{document_id}/analyze")
async def analyze_uploaded_document(document_id: str):
    matches = list(UPLOAD_DIR.glob(f"{document_id}.*"))

    if not matches:
        raise HTTPException(
            status_code=404,
            detail="Uploaded document not found.",
        )

    try:
        # Step 1: Extract document text.
        extracted_text = extract_text(str(matches[0]))

        # Step 2: Analyze the document with Gemini.
        result = await run_in_threadpool(
            analyze_document,
            extracted_text,
        )

        # Step 3: Validate the extracted fields.
        analysis = result.model_dump()
        validation = validate_document(analysis)

        # Step 4: Persist the analysis and determine workflow status.
        record = save_analysis(
            document_id=document_id,
            filename=matches[0].name,
            analysis=analysis,
            validation=validation,
        )

        return {
            "document_id": document_id,
            "status": "analyzed",
            "workflow_status": record["workflow_status"],
            "analysis": analysis,
            "validation": validation,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        )


@router.get("/review-queue")
def list_documents_for_review():
    """List documents that require human review."""
    return {
        "count": len(get_review_queue()),
        "documents": get_review_queue(),
    }

@router.get("/history")
def list_workflow_history():
    """List all processed documents, newest first."""
    history = get_workflow_history()

    return {
        "count": len(history),
        "documents": history,
    }

@router.get("/{document_id}/workflow")
def get_document_workflow(document_id: str):
    """Retrieve a document's analysis, validation, and review status."""
    record = get_document_record(document_id)

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Document workflow record not found. Analyze the document first.",
        )

    return record


@router.post("/{document_id}/review")
def review_document(
    document_id: str,
    request: ReviewRequest,
):
    """Approve or reject a document awaiting human review."""
    try:
        record = submit_review(
            document_id=document_id,
            decision=request.decision,
            reviewer=request.reviewer.strip(),
            comments=request.comments,
        )

        if record is None:
            raise HTTPException(
                status_code=404,
                detail="Document workflow record not found.",
            )

        return {
            "document_id": document_id,
            "workflow_status": record["workflow_status"],
            "review": record["review"],
            "message": (
                "Document approved successfully."
                if request.decision == "approve"
                else "Document rejected successfully."
            ),
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        )
