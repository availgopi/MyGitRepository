from app.repository.incident_repository import IncidentRepository
from app.services.incident_service import IncidentService

repository = IncidentRepository()

incident_service = IncidentService(repository)