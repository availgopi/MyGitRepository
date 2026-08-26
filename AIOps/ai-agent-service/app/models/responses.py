from pydantic import BaseModel
from typing import List
from typing import Optional

class AnalyzeResponse(BaseModel):

    incident_id: str

    report: str

    recommended_actions: List[str]

    approval_required: bool


class ApprovalResponse(BaseModel):

    status: str

    message: str

    execution_result: Optional[str] = None