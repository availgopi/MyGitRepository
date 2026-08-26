from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Incident(BaseModel):

    incident_id: str

    created_at: datetime

    log: str

    report: str

    recommended_actions: List[str]

    approval_required: bool

    approval: bool = False

    execution_result: Optional[str] = None

    rejection_reason: Optional[str] = None