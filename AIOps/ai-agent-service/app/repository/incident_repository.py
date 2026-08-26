import uuid

from app.models.incident import Incident


class IncidentRepository:

    def __init__(self):

        self._storage = {}

    def save(self, incident: Incident):

        self._storage[incident.incident_id] = incident

    def get(self, incident_id: str):

        return self._storage.get(incident_id)

    def get_all(self):

        return list(self._storage.values())

    def delete(self, incident_id: str):

        self._storage.pop(incident_id, None)

    def update(self, incident):

        self._storage[incident.incident_id] = incident