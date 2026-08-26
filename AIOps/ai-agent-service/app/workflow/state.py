from typing import TypedDict

class IncidentState(TypedDict):
    log:str
    log_analysis:str
    knowledge:str
    report:str
    recommended_actions: list
    approval_required: bool
    approval: bool
    execution_result: str
