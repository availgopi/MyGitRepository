from fastapi import APIRouter

from app.services.dependencies import incident_service
from fastapi import HTTPException

router = APIRouter()


@router.get("/incidents")
def get_all_incidents():

    return incident_service.get_all()


@router.get("/incidents/{incident_id}")
def get_incident(incident_id: str):

    incident = incident_service.get_incident(incident_id)

    if incident is None:

        raise HTTPException(
            status_code=404,
            detail="Incident not found."
        )

    return incident