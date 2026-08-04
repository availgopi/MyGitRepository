from langchain_google_genai import ChatGoogleGenerativeAI
from config import GOOGLE_API_KEY

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    google_api_key=GOOGLE_API_KEY
)

def generate_report(state):
    prompt = f"""
    You are an experienced Production Support Engineer.

    Analyze the incident using ONLY the information provided.

    Do NOT invent or assume any details.

    If any information is missing, return "Not Available".

    Incident Log:
    {state["log_analysis"]}

    Company Knowledge:
    {state["knowledge"]}

    Return the report in the following format:

    Incident Summary:

    Severity:

    Affected Service:

    Root Cause:

    Recommended Resolution:

    Reference Documents:
    """

    response = llm.invoke(prompt)

    state["report"] = response.content

    state["recommended_actions"] = [
    "Restart Payment API Service",
    "Increase SQL Connection Pool"
    ]

    return state

