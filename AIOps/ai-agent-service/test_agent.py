# from workflow.graph import app

# result = app.invoke(
#     {"log":"Payment API failed. SQL Timeout Exception. Database connection pool exhausted."}
# )


# print("\n=== Final STATE ===\n")
# print(result["execution_result"])

# # print(result["report"])

from app.services.incident_service import IncidentService

service = IncidentService()

state = {

    "log":"Payment API failed",

    "report":"Database Timeout",

    "recommended_actions":[

        "Restart Payment API"

    ]

}

incident = service.create_incident(state)

print(incident)

print(service.get_all())


