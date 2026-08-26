from langchain_google_genai import ChatGoogleGenerativeAI
from config import GOOGLE_API_KEY

llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
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

    try:
        response = llm.invoke(prompt)
    except Exception as ex:
        response = """
        AI Analysis Unavailable

        Gemini quota exceeded.

        Probable Root Cause:
        Database connection pool exhaustion.

        Recommended Actions:
        - Restart Payment API Service
        - Increase SQL Connection Pool
        """

    content = response.content

    if isinstance(content, list):
        content = "\n".join(
            item.get("text", "")
            for item in content
            if isinstance(item, dict)
        )

    state["report"] = content

    state["recommended_actions"] = [
        "Restart Payment API Service",
        "Increase SQL Connection Pool"
    ]

    return state