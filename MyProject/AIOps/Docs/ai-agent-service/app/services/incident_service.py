import uuid

from datetime import datetime

from app.models.incident import Incident

# from app.repository.incident_repository import IncidentRepository

class IncidentService:

    def __init__(self, repository):

        self.repository = repository

    def create_incident(self, state):

        incident = Incident(

            incident_id=str(uuid.uuid4()),

            created_at=datetime.now(),

            log=state["log"],

            report=state["report"],

            recommended_actions=state["recommended_actions"],

            approval_required=True

        )

        self.repository.save(incident)

        return incident

    def get_incident(self, incident_id):

        return self.repository.get(incident_id)

    def get_all(self):

        return self.repository.get_all()
    
    def update_incident(self, incident):

        return self.repository.update(incident)