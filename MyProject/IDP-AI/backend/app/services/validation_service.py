import re
from typing import Any
from datetime import date, datetime
from decimal import Decimal, InvalidOperation


# Canonical document types and their mandatory fields.
DOCUMENT_RULES = {
    "invoice": {
        "required_fields": [
            "invoice_number",
            "supplier_name",
            "invoice_date",
            "total_amount",
        ],
        "aliases": {
            "invoice_number": [
                "invoice_number", "invoice_no", "invoice_id",
                "bill_number", "bill_no",
            ],
            "supplier_name": [
                "supplier_name", "supplier", "vendor_name",
                "vendor", "seller_name",
            ],
            "invoice_date": [
                "invoice_date", "bill_date", "date_of_invoice",
            ],
            "total_amount": [
                "total_amount", "invoice_total", "grand_total",
                "amount_due", "total",
            ],
        },
    },
    "insurance_claim": {
        "required_fields": [
            "claim_number",
            "policy_number",
            "claimed_amount",
        ],
        "aliases": {
            "claim_number": [
                "claim_number", "claim_no", "claim_id",
            ],
            "policy_number": [
                "policy_number", "policy_no", "policy_id",
            ],
            "claimed_amount": [
                "claimed_amount", "claim_amount",
                "requested_amount",
            ],
        },
    },
    "resume": {
        "required_fields": [
            "candidate_name",
            "skills",
        ],
        "aliases": {
            "candidate_name": [
                "candidate_name", "applicant_name",
                "full_name", "name",
            ],
            "skills": [
                "skills", "technical_skills",
                "key_skills", "core_competencies",
            ],
        },
    },
    "kyc": {
        "required_fields": [
            "full_name",
            "document_number",
            "date_of_birth",
        ],
        "aliases": {
            "full_name": [
                "full_name", "customer_name",
                "applicant_name", "name",
            ],
            "document_number": [
                "document_number", "id_number",
                "identity_number", "passport_number",
                "license_number",
            ],
            "date_of_birth": [
                "date_of_birth",
                "dob",
                "birth_date",
                "date_of_birth",
            ],
        },

    },
    "purchase_order": {
        "required_fields": [
            "purchase_order_number",
            "supplier_name",
            "total_amount",
        ],
        "aliases": {
            "purchase_order_number": [
                "purchase_order_number", "po_number",
                "purchase_order_no", "order_number",
            ],
            "supplier_name": [
                "supplier_name", "supplier", "vendor_name",
                "vendor",
            ],
            "total_amount": [
                "total_amount", "order_total",
                "grand_total", "total",
            ],
        },
    },

        "receipt": {
        "required_fields": [
            "receipt_number",
            "receipt_date",
            "supplier_name",
            "total_amount",
            "payment_status",
        ],
        "aliases": {
            "receipt_number": [
                "receipt_number",
                "receipt_no",
            ],
            "receipt_date": [
                "receipt_date",
                "payment_date",
            ],
            "supplier_name": [
                "supplier_name",
                "business_name",
                "merchant_name",
                "vendor_name",
            ],
            "total_amount": [
                "total_amount",
                "amount_paid",
                "total_amount_paid",
                "grand_total",
            ],
            "payment_status": [
                "payment_status",
                "receipt_status",
            ],
        },
    },
}


DOCUMENT_TYPE_ALIASES = {
    "invoice": "invoice",
    "tax_invoice": "invoice",
    "bill": "invoice",
    "insurance_claim": "insurance_claim",
    "claim": "insurance_claim",
    "claim_form": "insurance_claim",
    "resume": "resume",
    "cv": "resume",
    "kyc": "kyc",
    "identity_document": "kyc",
    "identity_proof": "kyc",
    "purchase_order": "purchase_order",
    "po": "purchase_order",
    "receipt": "receipt",
    "payment_receipt": "receipt",
}


def normalize_name(value: str) -> str:
    """Normalize field/document names for consistent matching."""
    value = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", value)
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")


def normalize_document_type(value: str) -> str:
    """Map common document labels to a supported document type."""
    normalized = normalize_name(value)
    return DOCUMENT_TYPE_ALIASES.get(normalized, normalized)


def has_value(value: Any) -> bool:
    """Return False for missing or blank extracted values."""
    if value is None:
        return False

    if isinstance(value, str):
        return value.strip().lower() not in {
            "", "null", "none", "n/a", "not available", "unknown"
        }

    if isinstance(value, (list, dict)):
        return bool(value)

    return True


def parse_claimed_amount(value: Any) -> Decimal | None:
    """Parse a positive claim amount, including common currency formats."""
    if not isinstance(value, (str, int, float, Decimal)):
        return None

    raw = str(value).strip()
    raw = re.sub(r"(?i)\bINR\b", "", raw)
    raw = raw.replace("₹", "").replace(",", "").strip()

    # Accept values such as 110000, 110000.50, and +110000.
    if not re.fullmatch(r"\+?\d+(?:\.\d{1,2})?", raw):
        return None

    try:
        amount = Decimal(raw)
    except InvalidOperation:
        return None

    return amount if amount > 0 else None


def parse_document_date(value: Any) -> date | None:
    """Parse common date formats used in business documents."""
    if not isinstance(value, str) or not value.strip():
        return None

    raw = value.strip()
    formats = (
        "%d %B %Y",   # 10 October 2026
        "%d %b %Y",   # 10 Oct 2026
        "%Y-%m-%d",   # 2026-10-10
        "%d/%m/%Y",   # 10/10/2026
        "%d-%m-%Y",   # 10-10-2026
        "%m/%d/%Y",   # 10/10/2026 (ambiguous format)
    )

    for fmt in formats:
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue

    return None

def validate_document(analysis: dict) -> dict:
    """
    Apply deterministic business rules to Gemini's analysis.

    This function does not modify the original analysis.
    Missing mandatory fields and uncertain extraction trigger review.
    """
    document_type = normalize_document_type(
        str(analysis.get("document_type") or "unknown")
    )

    fields = analysis.get("fields") or []
    field_lookup = {}

    for field in fields:
        if not isinstance(field, dict):
            continue

        name = normalize_name(str(field.get("name") or ""))
        if name:
            field_lookup[name] = field

    errors = []
    warnings = []
    checked_fields = []

    rules = DOCUMENT_RULES.get(document_type)

    if rules is None:
        warnings.append(
            f"No validation rules are configured for document type "
            f"'{document_type}'. Manual review is required."
        )
    else:
        for required_name in rules["required_fields"]:
            aliases = rules["aliases"].get(
                required_name, [required_name]
            )

            matched_field = next(
                (
                    field_lookup[normalize_name(alias)]
                    for alias in aliases
                    if normalize_name(alias) in field_lookup
                ),
                None,
            )

            if matched_field is None or not has_value(
                matched_field.get("value")
            ):
                errors.append({
                    "field": required_name,
                    "issue": "missing_required_field",
                    "message": (
                        f"Required field '{required_name}' is missing "
                        "or empty."
                    ),
                })
                checked_fields.append({
                    "field": required_name,
                    "status": "missing",
                })
                continue

            confidence = matched_field.get("confidence")
            evidence = matched_field.get("evidence")

            field_warnings = []

            if not isinstance(confidence, (int, float)) or not (
                0 <= confidence <= 1
            ):
                field_warnings.append(
                    "Confidence score is missing or invalid."
                )
            elif confidence < 0.75:
                field_warnings.append(
                    f"Low extraction confidence: {confidence:.2f}."
                )

            if not isinstance(evidence, str) or not evidence.strip():
                field_warnings.append(
                    "Supporting evidence is missing."
                )

            for message in field_warnings:
                warnings.append({
                    "field": required_name,
                    "issue": "extraction_uncertainty",
                    "message": message,
                })

            checked_fields.append({
                "field": required_name,
                "status": (
                    "review_required" if field_warnings else "present"
                ),
                "value": matched_field.get("value"),
            })

    # Additional business rules for insurance claims.
    if document_type == "insurance_claim":

        # Validate the claimed amount.
        amount_aliases = [
            "claimed_amount",
            "claim_amount",
            "requested_amount",
        ]

        amount_field = next(
            (
                field_lookup[normalize_name(alias)]
                for alias in amount_aliases
                if normalize_name(alias) in field_lookup
            ),
            None,
        )

        if amount_field is not None and has_value(
            amount_field.get("value")
        ):
            amount = parse_claimed_amount(amount_field["value"])

            if amount is None:
                errors.append({
                    "field": "claimed_amount",
                    "issue": "invalid_amount",
                    "message": (
                        "Claimed amount must be a valid positive "
                        "number, for example INR 110000."
                    ),
                })

                for checked in checked_fields:
                    if checked["field"] == "claimed_amount":
                        checked["status"] = "invalid"

        # Validate incident date when supplied.
        date_aliases = [
            "incident_date",
            "date_of_incident",
            "event_date",
        ]

        incident_field = next(
            (
                field_lookup[normalize_name(alias)]
                for alias in date_aliases
                if normalize_name(alias) in field_lookup
            ),
            None,
        )

        if incident_field is not None and has_value(
            incident_field.get("value")
        ):
            incident_date = parse_document_date(
                incident_field["value"]
            )

            date_issue = None
            date_message = None

            if incident_date is None:
                date_issue = "invalid_date"
                date_message = (
                    "Incident date must use a supported date format "
                    "and represent a valid calendar date."
                )
            elif incident_date > date.today():
                date_issue = "future_incident_date"
                date_message = (
                    "Incident date cannot be in the future."
                )

            if date_issue:
                errors.append({
                    "field": "incident_date",
                    "issue": date_issue,
                    "message": date_message,
                })
                checked_fields.append({
                    "field": "incident_date",
                    "status": "invalid",
                    "value": incident_field.get("value"),
                })
            else:
                checked_fields.append({
                    "field": "incident_date",
                    "status": "present",
                    "value": incident_field.get("value"),
                })

    requires_human_review = bool(errors or warnings)

    return {
        "document_type": document_type,
        "validation_status": (
            "review_required"
            if requires_human_review
            else "validated"
        ),
        "requires_human_review": requires_human_review,
        "errors": errors,
        "warnings": warnings,
        "checked_fields": checked_fields,
    }