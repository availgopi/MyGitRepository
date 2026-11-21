import json
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any


DATA_DIR = Path(__file__).resolve().parents[2] / "data"
STORE_FILE = DATA_DIR / "documents.json"

_store_lock = Lock()


def _read_store() -> dict[str, Any]:
    """Load persisted document workflow records."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if not STORE_FILE.exists():
        return {}

    try:
        with STORE_FILE.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Workflow store contains invalid JSON. "
            "Restore a valid documents.json backup before continuing."
        ) from exc

    if not isinstance(data, dict):
        raise RuntimeError("Workflow store must contain a JSON object.")

    return data


def _write_store(records: dict[str, Any]) -> None:
    """Persist workflow records to disk."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temporary_file = STORE_FILE.with_suffix(".tmp")

    with temporary_file.open("w", encoding="utf-8") as file:
        json.dump(records, file, indent=2, ensure_ascii=False)

    temporary_file.replace(STORE_FILE)


def save_analysis(
    document_id: str,
    filename: str,
    analysis: dict[str, Any],
    validation: dict[str, Any],
) -> dict[str, Any]:
    """Save analysis and assign the next workflow status."""
    requires_review = validation.get("requires_human_review", True)

    status = "pending_review" if requires_review else "auto_processed"

    record = {
        "document_id": document_id,
        "filename": filename,
        "analysis": analysis,
        "validation": validation,
        "workflow_status": status,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "review": None,
    }

    with _store_lock:
        records = _read_store()
        records[document_id] = record
        _write_store(records)

    return record


def get_document_record(document_id: str) -> dict[str, Any] | None:
    """Retrieve a stored workflow record."""
    with _store_lock:
        records = _read_store()
        return records.get(document_id)


def get_review_queue() -> list[dict[str, Any]]:
    """Return documents awaiting human review."""
    with _store_lock:
        records = _read_store()

    queue = [
        record
        for record in records.values()
        if record.get("workflow_status") == "pending_review"
    ]

    return sorted(
        queue,
        key=lambda record: record.get("created_at", ""),
        reverse=True,
    )

def get_workflow_history() -> list[dict[str, Any]]:
    """Return all processed documents, newest first."""
    with _store_lock:
        records = _read_store()

    history = list(records.values())

    return sorted(
        history,
        key=lambda record: record.get("created_at", ""),
        reverse=True,
    )

def submit_review(
    document_id: str,
    decision: str,
    reviewer: str,
    comments: str | None = None,
) -> dict[str, Any] | None:
    """Record an approval or rejection for a pending document."""
    with _store_lock:
        records = _read_store()
        record = records.get(document_id)

        if record is None:
            return None

        if record.get("workflow_status") != "pending_review":
            raise ValueError(
                "Only documents awaiting human review can be reviewed."
            )

        reviewed_at = datetime.now(timezone.utc).isoformat()

        record["review"] = {
            "decision": decision,
            "reviewer": reviewer,
            "comments": comments,
            "reviewed_at": reviewed_at,
        }

        record["workflow_status"] = (
            "approved" if decision == "approve" else "rejected"
        )

        records[document_id] = record
        _write_store(records)

    return record