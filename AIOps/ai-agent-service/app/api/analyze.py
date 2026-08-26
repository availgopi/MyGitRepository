from fastapi import APIRouter

from app.models.requests import AnalyzeRequest
from app.models.responses import AnalyzeResponse

from app.workflow.graph import workflow_app
# from app.services.incident_service import IncidentService
from app.services.dependencies import incident_service

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):

    state = workflow_app.invoke(
        {
            "log": request.log
        }
    )

    incident = incident_service.create_incident(state)

    return AnalyzeResponse(

        incident_id=incident.incident_id,

        report=incident.report,

        recommended_actions=incident.recommended_actions,

        approval_required=True
    )