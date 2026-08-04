from langchain_google_genai import ChatGoogleGenerativeAI
from config import GOOGLE_API_KEY
from app.agents.rag_agent import retrive_solution

llm = ChatGoogleGenerativeAI (
        model="gemini-2.5-flash-lite",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.2
)

def analyze_incident(log_text):
       
        knowledge = retrive_solution(log_text)
       
       
        prompt = f"""
        You are an experienced production support engineer.

        Analyze the incident.

        Incident Log:
        {log_text}


        Use the following company knowledge:

        {knowledge}


        Generate:

        1. Incident Summary
        2. Severity
        3. Root Cause
        4. Recommended Resolution Steps
        5. Reference Documents

        """
        response = llm.invoke(prompt)

        return {
                "analysis": response.content
        }


# def analyze_incident(log_text):

#     result = {
#         "summary": "Database timeout detected",
#         "severity": "High",
#         "recommendation": [
#             "Check database connection pool",
#             "Review recent deployments",
#             "Restart service if required"
#         ]
#     }

#     return result