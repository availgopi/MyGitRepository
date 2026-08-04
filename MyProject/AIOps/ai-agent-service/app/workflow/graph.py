from langgraph.graph import StateGraph
from app.workflow.state import IncidentState
from app.agents.log_agent import analyze_log
from app.agents.rag_agent import  retrive_knowledge
from app.agents.report_agent import generate_report
from app.agents.action_agent import execute_action

workflow = StateGraph( IncidentState )

workflow.add_node("log_agent", analyze_log)
workflow.add_node("rag_agent", retrive_knowledge)
workflow.add_node("report_agent", generate_report)
# workflow.add_node("action_agent", execute_action)

workflow.set_entry_point("log_agent")

workflow.add_edge("log_agent", "rag_agent")
workflow.add_edge("rag_agent", "report_agent")
#workflow.add_edge("report_agent", "action_agent")

# workflow.set_finish_point("action_agent")
workflow.set_finish_point("report_agent")

workflow_app = workflow.compile()




