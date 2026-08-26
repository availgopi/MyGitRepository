from pydantic import BaseModel
from typing import Optional

class AnalyzeRequest(BaseModel):
    log: str


class ApprovalRequest(BaseModel):

    incident_id: str
    approved: bool
    rejection_reason: Optional[str] = None