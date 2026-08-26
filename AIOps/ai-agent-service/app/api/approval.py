from fastapi import APIRouter, HTTPException

from app.models.requests import ApprovalRequest
from app.models.responses import ApprovalResponse

# from app.services.incident_service import IncidentService
from app.agents.action_agent import execute_action
from app.services.dependencies import incident_service

router = APIRouter()

@router.post("/approve", response_model=ApprovalResponse)
def approve(request: ApprovalRequest):

    incident = incident_service.get_incident(request.incident_id)

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found."
        )

    if not request.approved:

        incident.approval = False

        incident.rejection_reason = request.rejection_reason

        incident.execution_result = "User rejected remediation."

        incident_service.update_incident(incident)

        return ApprovalResponse(

            status="Cancelled",

            message="User rejected remediation.",

            execution_result=incident.execution_result

        )

    # -------- APPROVE --------

    incident.approval = True

    incident = execute_action(incident)

    incident_service.update_incident(incident)

    return ApprovalResponse(
        status="Completed",
        message="Remediation executed successfully.",
        execution_result=incident.execution_result
    )

    