# HopeAI AIOps --- Complete Flow & Architecture

## 1. Overview

**HopeAI AIOps** is a GenAI-powered incident analysis and remediation
application.

The solution has two major applications:

1.  **AIOps UI** --- React + TypeScript + Vite + Material UI
2.  **AI Agent Service** --- Python + FastAPI + LangGraph/LangChain +
    Gemini + ChromaDB

The system supports the following end-to-end lifecycle:

> Incident Log → AI Analysis → RAG Knowledge Retrieval → AI Report →
> Recommended Actions → Human Approval → Real Automation → Execution
> Result → Persisted Incident Status

The current implementation also supports:

-   Pending incidents
-   Completed incidents
-   Cancelled/rejected incidents
-   Rejection reason
-   Incident history/details
-   Real PowerShell automation
-   Database connection-pool automation
-   Payment API restart automation
-   Loading/processing UI
-   Dashboard status counts

------------------------------------------------------------------------

# 2. High-Level Architecture

``` mermaid
flowchart LR

    User[Production Support Engineer]

    subgraph UI["AIOPS-UI - React Application"]
        Dashboard[Dashboard.tsx]
        Analyze[AnalyzeIncident.tsx]
        Details[IncidentDetails.tsx]

        Form[IncidentForm.tsx]
        Report[IncidentReport.tsx]
        Table[IncidentTable.tsx]
        Header[Header.tsx]
        RejectDialog[RejectDialog.tsx]
        Loader[LoadingOverlay.tsx]
    end

    subgraph Backend["AI-AGENT-SERVICE - FastAPI"]
        Main[main.py]

        AnalyzeAPI[api/analyze.py]
        ApprovalAPI[api/approval.py]
        IncidentsAPI[api/incidents.py]
        HealthAPI[api/health.py]

        Workflow[workflow/graph.py]
        State[workflow/state.py]

        IncidentAgent[agents/incident_agent.py]
        LogAgent[agents/log_agent.py]
        RagAgent[agents/rag_agent.py]
        ReportAgent[agents/report_agent.py]
        ActionAgent[agents/action_agent.py]
        Supervisor[agents/supervisor_agent.py]

        IncidentService[services/incident_service.py]
        ApprovalService[services/approval_service.py]
        Dependencies[services/dependencies.py]

        Repository[repository/incident_repository.py]
    end

    subgraph AI["AI / Knowledge Layer"]
        Gemini[Google Gemini]
        Chroma[ChromaDB]
        Docs[documents/Database_Runbook.txt]
    end

    subgraph Automation["Automation Layer"]
        RestartPS[restart_payment_api.ps1]
        PoolPS[increase_sql_connection_pool.ps1]
        Engine[HopeAI AIOps Automation Engine]
    end

    User --> UI

    UI -->|HTTP/JSON| Main

    Main --> AnalyzeAPI
    Main --> ApprovalAPI
    Main --> IncidentsAPI
    Main --> HealthAPI

    AnalyzeAPI --> Workflow

    Workflow --> LogAgent
    Workflow --> RagAgent
    Workflow --> ReportAgent
    Workflow --> ActionAgent

    LogAgent --> State
    RagAgent --> Chroma
    Chroma --> Docs
    ReportAgent --> Gemini
    ReportAgent --> State
    ActionAgent --> State

    AnalyzeAPI --> IncidentService
    IncidentService --> Repository

    ApprovalAPI --> IncidentService
    ApprovalAPI --> ActionAgent

    ActionAgent --> Engine
    Engine --> RestartPS
    Engine --> PoolPS

    IncidentsAPI --> IncidentService

    Details -->|Approve / Reject| ApprovalAPI
    Dashboard -->|View Incident| Details
```

------------------------------------------------------------------------

# 3. Project Structure

## 3.1 Python Backend

``` text
AI-AGENT-SERVICE/
│
├── app/
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── action_agent.py
│   │   ├── incident_agent.py
│   │   ├── log_agent.py
│   │   ├── rag_agent.py
│   │   ├── report_agent.py
│   │   └── supervisor_agent.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── analyze.py
│   │   ├── approval.py
│   │   ├── health.py
│   │   └── incidents.py
│   │
│   ├── models/
│   │   ├── requests.py
│   │   └── responses.py
│   │
│   ├── rag/
│   │   └── ...
│   │
│   ├── repository/
│   │   ├── __init__.py
│   │   └── incident_repository.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── approval_service.py
│   │   ├── dependencies.py
│   │   └── incident_service.py
│   │
│   └── workflow/
│       ├── __init__.py
│       ├── graph.py
│       └── state.py
│
├── chroma_db/
│   └── <Chroma collection data>
│
├── documents/
│   └── Database_Runbook.txt
│
├── scripts/
│   ├── restart_payment_api.ps1
│   └── increase_sql_connection_pool.ps1
│
├── .env
├── config.py
├── main.py
├── test_agent.py
├── test_rag.py
└── Test.ipynb
```

------------------------------------------------------------------------

## 3.2 React Frontend

``` text
AIOPS-UI/
│
├── public/
│
├── src/
│   │
│   ├── api/
│   │   └── api.ts
│   │
│   ├── assets/
│   │   └── hero.png
│   │
│   ├── components/
│   │   ├── DashboardCard.tsx
│   │   ├── Header.tsx
│   │   ├── IncidentForm.tsx
│   │   ├── IncidentReport.tsx
│   │   ├── IncidentTable.tsx
│   │   ├── LoadingOverlay.tsx
│   │   └── RejectDialog.tsx
│   │
│   ├── pages/
│   │   ├── AnalyzeIncident.tsx
│   │   ├── Dashboard.tsx
│   │   └── IncidentDetails.tsx
│   │
│   ├── services/
│   │   ├── approvalService.ts
│   │   ├── dashboardService.ts
│   │   ├── incidentDetailsService.ts
│   │   └── incidentService.ts
│   │
│   ├── theme/
│   │   └── darkTheme.ts
│   │
│   ├── types/
│   │   └── incident.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

------------------------------------------------------------------------

# 4. Application Layers

``` mermaid
flowchart TB

    A[Presentation Layer<br/>React UI]

    B[API Layer<br/>FastAPI Routers]

    C[Workflow / Agent Layer<br/>LangGraph]

    D[AI / RAG Layer<br/>Gemini + ChromaDB]

    E[Business Service Layer<br/>Incident / Approval Services]

    F[Persistence Layer<br/>Incident Repository]

    G[Automation Layer<br/>PowerShell Scripts]

    A --> B
    B --> C
    C --> D
    B --> E
    E --> F
    B --> G
    E --> G
```

------------------------------------------------------------------------

# 5. Analyze Incident --- Complete Flow

When the user enters an incident log and clicks **Analyze Incident**,
the following flow occurs.

``` mermaid
sequenceDiagram

    actor User
    participant UI as AnalyzeIncident.tsx
    participant Form as IncidentForm.tsx
    participant API as FastAPI /analyze
    participant WF as LangGraph Workflow
    participant Log as Log Agent
    participant RAG as RAG Agent
    participant DB as ChromaDB
    participant Report as Report Agent
    participant Gemini as Gemini
    participant Service as Incident Service
    participant Repo as Incident Repository

    User->>Form: Enter incident log
    User->>Form: Click Analyze Incident

    Form->>UI: onAnalyze(log)

    UI->>UI: setLoading(true)

    UI->>API: POST /analyze

    API->>WF: Start workflow

    WF->>Log: Analyze log
    Log-->>WF: log_analysis

    WF->>RAG: Search knowledge
    RAG->>DB: Similarity search
    DB-->>RAG: Relevant runbook
    RAG-->>WF: knowledge

    WF->>Report: Generate report
    Report->>Gemini: Incident analysis prompt
    Gemini-->>Report: AI report
    Report-->>WF: report + recommended actions

    WF-->>API: Final state

    API->>Service: Create incident
    Service->>Repo: Save incident
    Repo-->>Service: Incident persisted

    Service-->>API: Incident

    API-->>UI: AnalyzeResponse

    UI->>UI: setAnalysis(response)
    UI->>UI: setIncidentId(response.incident_id)
    UI->>UI: setLoading(false)

    UI-->>User: Display AI report
```

------------------------------------------------------------------------

# 6. Log Agent

File:

``` text
app/agents/log_agent.py
```

Responsibility:

-   Receive the original incident log.
-   Perform initial log analysis.
-   Identify information such as:
    -   detected issue
    -   severity
    -   category
-   Store the result in workflow state.

Conceptually:

``` text
Incident Log
     |
     v
+------------------+
|    Log Agent     |
+------------------+
     |
     v
log_analysis
```

The important design principle is that the original log should remain
available to later agents.

------------------------------------------------------------------------

# 7. RAG Agent

File:

``` text
app/agents/rag_agent.py
```

Knowledge source:

``` text
documents/
└── Database_Runbook.txt
```

Vector database:

``` text
chroma_db/
```

Flow:

``` mermaid
flowchart LR

    Log[Incident Log]
    Query[RAG Query]
    Chroma[ChromaDB]
    Runbook[Database Runbook]
    Knowledge[Relevant Knowledge]

    Log --> Query
    Query --> Chroma
    Chroma --> Runbook
    Runbook --> Knowledge
```

The RAG layer allows the system to use company-specific operational
knowledge rather than relying only on the LLM's general knowledge.

------------------------------------------------------------------------

# 8. Report Agent

File:

``` text
app/agents/report_agent.py
```

The Report Agent sends information to Gemini.

Conceptually:

``` text
Original Log
     +
Log Analysis
     +
Company Knowledge
     |
     v
+----------------+
|  Report Agent  |
+----------------+
     |
     v
+----------------+
| Gemini Model   |
+----------------+
     |
     v
AI Incident Report
```

The report contains:

``` text
Incident Summary

Severity

Affected Service

Root Cause

Recommended Resolution

Reference Documents
```

The recommended actions are then made available to the Action Agent and
UI.

------------------------------------------------------------------------

# 9. Workflow Architecture

File:

``` text
app/workflow/graph.py
```

State definition:

``` text
app/workflow/state.py
```

The workflow coordinates the agents.

``` mermaid
flowchart LR

    Start((Start))

    Log[Log Agent]
    RAG[RAG Agent]
    Report[Report Agent]
    Action[Action Agent]

    End((End))

    Start --> Log
    Log --> RAG
    RAG --> Report
    Report --> Action
    Action --> End
```

The workflow state acts as the shared context between agents.

Typical state information includes:

``` text
log
log_analysis
knowledge
report
recommended_actions
approval
execution_result
incident_id
```

------------------------------------------------------------------------

# 10. Incident Persistence

The application uses a service/repository pattern.

``` mermaid
flowchart LR

    API[FastAPI API]
    Service[IncidentService]
    Repo[IncidentRepository]
    Store[(Incident Store)]

    API --> Service
    Service --> Repo
    Repo --> Store
```

This separation is important because it allows the persistence
implementation to be changed later without changing the API or UI.

For example, the current repository can later be replaced with:

-   SQL Server
-   PostgreSQL
-   Amazon RDS
-   Azure SQL
-   MongoDB
-   another production database

without changing the React workflow.

------------------------------------------------------------------------

# 11. Incident Details Flow

The Dashboard contains the incident list.

The user selects **View Incident**.

``` mermaid
sequenceDiagram

    actor User
    participant Dashboard as Dashboard.tsx
    participant UI as IncidentDetails.tsx
    participant API as FastAPI /incidents
    participant Service as Incident Service
    participant Repo as Incident Repository

    User->>Dashboard: Click View Incident
    Dashboard->>UI: Navigate to /incidents/{id}

    UI->>API: GET incident by ID
    API->>Service: get_incident(id)
    Service->>Repo: Retrieve incident
    Repo-->>Service: Incident
    Service-->>API: Incident
    API-->>UI: Incident JSON

    UI->>UI: setIncident()
    UI-->>User: Display Incident Details
```

------------------------------------------------------------------------

# 12. Incident Status Lifecycle

The application currently uses three major business states.

``` mermaid
stateDiagram-v2

    [*] --> Pending

    Pending --> Completed: Approve Remediation
    Pending --> Cancelled: Reject Remediation

    Completed --> [*]
    Cancelled --> [*]
```

## Pending

Typical values:

``` text
approval = false
execution_result = null
```

The UI displays:

``` text
🟡 Pending
```

and shows:

``` text
Approve Remediation
Reject Remediation
```

------------------------------------------------------------------------

## Completed

Typical values:

``` text
approval = true
execution_result = automation output
```

The UI displays:

``` text
🟢 Completed
```

------------------------------------------------------------------------

## Cancelled

Typical values:

``` text
approval = false
execution_result = "User rejected remediation."
rejection_reason = <operator supplied reason>
```

The UI displays:

``` text
🔴 Cancelled
```

and displays the rejection reason.

------------------------------------------------------------------------

# 13. Approval Flow

When the user clicks:

``` text
Approve Remediation
```

the frontend calls:

``` text
POST /approve
```

with approximately:

``` json
{
  "incident_id": "incident-id",
  "approved": true
}
```

Flow:

``` mermaid
sequenceDiagram

    actor User
    participant UI as IncidentDetails.tsx
    participant Service as approvalService.ts
    participant API as FastAPI /approve
    participant Incident as Incident Service
    participant Action as Action Agent
    participant PS as PowerShell Automation
    participant Repo as Incident Repository

    User->>UI: Click Approve Remediation

    UI->>UI: processing = true

    UI->>Service: approveIncident(id, true)

    Service->>API: POST /approve

    API->>Incident: Get incident

    API->>Action: execute_action(incident)

    Action->>PS: Execute automation script

    PS-->>Action: Automation output

    Action-->>API: execution_result

    API->>Incident: Update incident
    Incident->>Repo: Persist completed state

    API-->>Service: ApprovalResponse

    Service-->>UI: Response

    UI->>API: Reload incident

    API-->>UI: Persisted incident

    UI->>UI: processing = false

    UI-->>User: Completed + execution output
```

------------------------------------------------------------------------

# 14. Real Automation Layer

The system has moved beyond simulation and now executes real PowerShell
scripts.

Scripts:

``` text
scripts/
├── restart_payment_api.ps1
└── increase_sql_connection_pool.ps1
```

The Action Agent determines which automation should be executed based on
the recommended action.

------------------------------------------------------------------------

# 15. Payment API Restart Automation

Script:

``` text
scripts/restart_payment_api.ps1
```

Conceptual flow:

``` text
Recommended Action
        |
        v
"Restart Payment API Service"
        |
        v
Action Agent
        |
        v
restart_payment_api.ps1
        |
        +--> Restart Payment API
        |
        +--> Health Check
        |
        v
Automation Result
```

Example structured output:

``` text
=====================================
HopeAI AIOps Automation Engine
=====================================

Restarting Payment API...

Payment API restarted successfully.

Health Check : PASSED

Automation completed successfully.
```

------------------------------------------------------------------------

# 16. SQL Connection Pool Automation

Script:

``` text
scripts/increase_sql_connection_pool.ps1
```

Conceptual flow:

``` text
Recommended Action
        |
        v
"Increase SQL Connection Pool"
        |
        v
Action Agent
        |
        v
increase_sql_connection_pool.ps1
        |
        +--> Read current pool size
        |
        +--> Set new pool size
        |
        +--> Test DB connectivity
        |
        v
Automation Result
```

Example:

``` text
=====================================
HopeAI AIOps Automation Engine
=====================================

Increasing SQL Connection Pool...

Current Pool Size : 100

New Pool Size     : 200

Database connectivity verified.

Automation completed successfully.
```

------------------------------------------------------------------------

# 17. Reject Flow

Rejecting an incident is a human decision and does not execute
remediation.

``` mermaid
sequenceDiagram

    actor User
    participant UI as IncidentDetails.tsx
    participant Dialog as RejectDialog.tsx
    participant Service as approvalService.ts
    participant API as FastAPI /approve
    participant Incident as Incident Service
    participant Repo as Incident Repository

    User->>UI: Click Reject Remediation
    UI->>Dialog: Open dialog

    User->>Dialog: Enter rejection reason
    User->>Dialog: Click Reject

    Dialog->>UI: rejectionReason

    UI->>Service: approveIncident(id, false, reason)

    Service->>API: POST /approve

    API->>Incident: Get incident

    API->>Incident: approval = false
    API->>Incident: rejection_reason = reason
    API->>Incident: execution_result = rejection message

    Incident->>Repo: Persist cancelled incident

    API-->>Service: Cancelled response
    Service-->>UI: Response

    UI->>API: Reload incident

    API-->>UI: Persisted incident

    UI-->>User: Cancelled + Rejection Reason
```

------------------------------------------------------------------------

# 18. Approval Request Model

File:

``` text
app/models/requests.py
```

Conceptually the approval request contains:

``` python
class ApprovalRequest(BaseModel):
    incident_id: str
    approved: bool
    reason: Optional[str] = None
```

The frontend sends the rejection reason when rejecting.

------------------------------------------------------------------------

# 19. Incident Model

File:

``` text
app/models/incident.py
```

Important fields include:

``` text
incident_id
created_at
log
report
recommended_actions
approval_required
approval
rejection_reason
execution_result
```

This model represents the incident lifecycle from analysis through
remediation.

------------------------------------------------------------------------

# 20. Frontend Service Layer

The React UI does not directly contain HTTP implementation inside every
page.

Instead, services provide a clean separation.

``` mermaid
flowchart LR

    Dashboard[Dashboard.tsx]
    Analyze[AnalyzeIncident.tsx]
    Details[IncidentDetails.tsx]

    DashboardService[dashboardService.ts]
    IncidentService[incidentService.ts]
    DetailsService[incidentDetailsService.ts]
    ApprovalService[approvalService.ts]

    API[api.ts]
    Backend[FastAPI]

    Dashboard --> DashboardService
    Analyze --> IncidentService
    Details --> DetailsService
    Details --> ApprovalService

    DashboardService --> API
    IncidentService --> API
    DetailsService --> API
    ApprovalService --> API

    API --> Backend
```

This makes the frontend easier to maintain and test.

------------------------------------------------------------------------

# 21. UI Component Architecture

``` mermaid
flowchart TB

    App[App.tsx]

    Header[Header.tsx]

    Dashboard[Dashboard.tsx]
    Analyze[AnalyzeIncident.tsx]
    Details[IncidentDetails.tsx]

    Dashboard --> Header
    Analyze --> Header
    Details --> Header

    Dashboard --> DashboardCard
    Dashboard --> IncidentTable

    Analyze --> IncidentForm
    Analyze --> IncidentReport
    Analyze --> LoadingOverlay

    Details --> RejectDialog
    Details --> LoadingOverlay
```

------------------------------------------------------------------------

# 22. Analyze Incident UI Flow

``` text
+-----------------------------+
|       Analyze Incident      |
+-----------------------------+
|                             |
| Incident Log                |
| -------------------------   |
| |                       |   |
| | Paste production log  |   |
| |                       |   |
| -------------------------   |
|                             |
| [ Analyze Incident ]        |
|                             |
+-----------------------------+

             |
             | Submit
             v

+-----------------------------+
|       LoadingOverlay        |
|                             |
|          (spinner)          |
|                             |
|     Analyzing incident...   |
+-----------------------------+

             |
             v

+-----------------------------+
|       AI Incident Report    |
+-----------------------------+
| Incident Summary            |
| Severity                    |
| Affected Service            |
| Root Cause                  |
| Recommended Resolution     |
| Reference Documents         |
+-----------------------------+

             |
             v

+-----------------------------+
| Incident created            |
|                             |
| [ View Incident ]           |
| [ Back to Dashboard ]       |
+-----------------------------+
```

------------------------------------------------------------------------

# 23. Incident Details UI

The Incident Details page contains:

``` text
Incident Details
│
├── Incident ID
├── Created
├── Status
├── Original Log
├── AI Incident Report
├── Recommended Actions
│
├── Approval Actions
│   ├── Approve Remediation
│   └── Reject Remediation
│
├── Rejection Reason
│
├── Execution Result
│
└── Back to Dashboard
```

------------------------------------------------------------------------

# 24. Loading / Processing Architecture

Component:

``` text
src/components/LoadingOverlay.tsx
```

The component uses Material UI:

``` text
Backdrop
    +
CircularProgress
    +
Typography
```

Approval processing:

``` text
Approve button
     |
     v
processing = true
     |
     v
LoadingOverlay
     |
     v
"Executing automation..."
     |
     v
POST /approve
     |
     v
Automation
     |
     v
Reload incident
     |
     v
processing = false
```

The same pattern can be used for incident analysis.

------------------------------------------------------------------------

# 25. Dashboard Architecture

The Dashboard is responsible for displaying:

-   Total incidents
-   Pending incidents
-   Completed incidents
-   Cancelled incidents
-   Incident table
-   View Incident action

Status counting logic conceptually is:

``` text
Total
  = all incidents

Pending
  = approval is false
    AND execution_result is null

Completed
  = approval is true

Cancelled
  = approval is false
    AND execution_result indicates rejection
```

This prevents cancelled incidents from being incorrectly counted as
pending.

------------------------------------------------------------------------

# 26. End-to-End Business Flow

``` mermaid
flowchart TD

    Start([Production Incident])

    Enter[Operator enters incident log]

    Analyze[Click Analyze Incident]

    LogAgent[Log Agent]

    RagAgent[RAG Agent]

    Knowledge[(Company Runbook / ChromaDB)]

    ReportAgent[Report Agent]

    Gemini[Gemini]

    Create[Create Incident]

    Pending[Pending]

    Decision{Operator Decision}

    Approve[Approve Remediation]

    Reject[Reject Remediation]

    Reason[Capture Rejection Reason]

    Action[Action Agent]

    Restart[Restart Payment API]

    Pool[Increase SQL Connection Pool]

    Result[Automation Result]

    Completed[Completed]

    Cancelled[Cancelled]

    End([Incident Lifecycle Complete])

    Start --> Enter
    Enter --> Analyze
    Analyze --> LogAgent

    LogAgent --> RagAgent
    RagAgent --> Knowledge
    Knowledge --> RagAgent

    RagAgent --> ReportAgent
    ReportAgent --> Gemini
    Gemini --> ReportAgent

    ReportAgent --> Create
    Create --> Pending

    Pending --> Decision

    Decision -->|Approve| Approve
    Decision -->|Reject| Reject

    Reject --> Reason
    Reason --> Cancelled

    Approve --> Action

    Action --> Restart
    Action --> Pool

    Restart --> Result
    Pool --> Result

    Result --> Completed

    Completed --> End
    Cancelled --> End
```

------------------------------------------------------------------------

# 27. Detailed Backend Request Flow

## Analyze

``` text
POST /analyze

        |
        v

api/analyze.py
        |
        v
workflow/graph.py
        |
        +--> log_agent.py
        |
        +--> rag_agent.py
        |
        +--> report_agent.py
        |
        +--> action_agent.py
        |
        v
incident_service.py
        |
        v
incident_repository.py
        |
        v
Incident persisted
        |
        v
AnalyzeResponse
```

## Approval

``` text
POST /approve

        |
        v

api/approval.py
        |
        v
incident_service.py
        |
        v
Decision
   /        \
Reject      Approve
  |            |
  v            v
Save reason   action_agent.py
  |            |
  v            v
Cancelled     PowerShell
               |
               v
           Execution result
               |
               v
           Save incident
               |
               v
            Completed
```

------------------------------------------------------------------------

# 28. API Responsibilities

## `main.py`

Application entry point.

Responsibilities:

-   Create FastAPI application.
-   Register API routers.
-   Configure middleware such as CORS.
-   Start the backend application.

------------------------------------------------------------------------

## `api/analyze.py`

Responsible for:

``` text
POST /analyze
```

Starts incident analysis and creates an incident.

------------------------------------------------------------------------

## `api/approval.py`

Responsible for:

``` text
POST /approve
```

Handles:

``` text
Approve
Reject
Rejection reason
Automation execution
Execution result
```

------------------------------------------------------------------------

## `api/incidents.py`

Responsible for incident retrieval.

Typical responsibility:

``` text
GET /incidents
GET /incidents/{incident_id}
```

------------------------------------------------------------------------

## `api/health.py`

Responsible for service health checking.

Typical endpoint:

``` text
GET /health
```

------------------------------------------------------------------------

# 29. Configuration

Files:

``` text
.env
config.py
```

The `.env` file stores environment-specific secrets/configuration such
as the Google API key.

Example:

``` text
GOOGLE_API_KEY=<secret>
```

`config.py` loads the environment configuration.

Important:

> `.env` must never be committed to source control.

The `.gitignore` file should contain:

``` text
.env
```

------------------------------------------------------------------------

# 30. Security Considerations

Before production deployment, the following should be implemented.

## API Authentication

The current local application can evolve to:

``` text
React
  |
  v
Authentication
  |
  v
FastAPI
```

Possible enterprise authentication:

-   Microsoft Entra ID
-   OAuth 2.0
-   JWT
-   API gateway authentication

## Automation Authorization

Automation actions should be protected by:

-   Role-based access control
-   Approval policy
-   Audit logging
-   Restricted service account
-   Script execution allow-list

## Secrets

Do not store:

``` text
API keys
database passwords
service credentials
tokens
```

inside source code.

Use:

-   Environment variables
-   Azure Key Vault
-   AWS Secrets Manager
-   HashiCorp Vault

------------------------------------------------------------------------

# 31. Recommended Production Architecture

The current local architecture can evolve into:

``` mermaid
flowchart TB

    User[Production Support Engineer]

    Auth[Microsoft Entra ID]

    Web[React UI]

    Gateway[API Gateway / Load Balancer]

    API1[FastAPI Instance 1]
    API2[FastAPI Instance 2]

    Workflow[Agent Workflow]

    Gemini[Gemini / Enterprise LLM]

    Vector[(Production Vector DB)]

    DB[(Production SQL Database)]

    Queue[Automation Queue]

    Worker[Automation Worker]

    Target[Target Application / Infrastructure]

    Audit[(Audit Log)]

    User --> Auth
    Auth --> Web
    Web --> Gateway

    Gateway --> API1
    Gateway --> API2

    API1 --> Workflow
    API2 --> Workflow

    Workflow --> Gemini
    Workflow --> Vector

    API1 --> DB
    API2 --> DB

    API1 --> Queue
    API2 --> Queue

    Queue --> Worker
    Worker --> Target

    API1 --> Audit
    API2 --> Audit
    Worker --> Audit
```

This architecture separates:

-   UI
-   API
-   AI reasoning
-   knowledge retrieval
-   persistence
-   automation execution
-   auditing

------------------------------------------------------------------------

# 32. Current vs Target Architecture

  -------------------------------------------------------------------------
  Area                    Current Implementation  Production Target
  ----------------------- ----------------------- -------------------------
  UI                      React/Vite              React + enterprise
                                                  authentication

  Backend                 FastAPI                 FastAPI behind API
                                                  Gateway

  AI                      Gemini                  Enterprise-approved LLM

  Workflow                LangGraph               LangGraph / managed
                                                  orchestration

  RAG                     ChromaDB                Managed vector database

  Incident Store          Repository              SQL Server/PostgreSQL/RDS
                          implementation          

  Automation              Local PowerShell        Dedicated automation
                                                  workers

  Authentication          Local                   Entra ID/OAuth

  Authorization           Basic approval          RBAC + policy

  Secrets                 `.env` locally          Key Vault/Secrets Manager

  Audit                   Basic incident data     Centralized audit logging

  Deployment              Local                   Docker/Kubernetes/Cloud

  Monitoring              Console/application     OpenTelemetry +
                          logs                    centralized monitoring
  -------------------------------------------------------------------------

------------------------------------------------------------------------

# 33. Important Design Principle

The most important architectural characteristic of HopeAI AIOps is that
the **LLM does not directly perform production changes**.

Instead:

``` text
LLM
 |
 | recommends
 v
Recommended Action
 |
 v
Human Approval
 |
 v
Action Agent
 |
 v
Approved Automation
 |
 v
PowerShell / Automation Worker
 |
 v
Target System
```

This is safer than allowing an LLM to execute arbitrary commands.

The recommended architecture is:

> **AI decides what should be done; deterministic automation decides how
> it is done.**

------------------------------------------------------------------------

# 34. Complete System Summary

``` text
                         HOPEAI AIOPS
                              |
          +-------------------+-------------------+
          |                                       |
          v                                       v
     React UI                               FastAPI Backend
          |                                       |
          |                               +-------+-------+
          |                               |               |
          v                               v               v
   Analyze Incident                  Analyze API     Approval API
          |                               |               |
          |                               v               v
          |                          LangGraph        Action Agent
          |                               |               |
          |                    +----------+----------+    |
          |                    |          |          |    |
          |                    v          v          v    v
          |                  Log        RAG       Report  Automation
          |                    |          |          |      |
          |                    |          v          v      |
          |                    |       Chroma      Gemini   |
          |                    |          |                 |
          |                    +----------+-----------------+
          |                               |
          |                               v
          |                         Incident Service
          |                               |
          |                               v
          |                        Incident Repository
          |                               |
          |                               v
          |                        Persisted Incident
          |
          +---------------------------------------------+
                                                        |
                                                        v
                                                 Incident Details
                                                        |
                                    +-------------------+------------------+
                                    |                                      |
                                    v                                      v
                              Approve                              Reject + Reason
                                    |                                      |
                                    v                                      v
                              Automation                            Cancelled
                                    |
                                    v
                              Execution Result
                                    |
                                    v
                                Completed
```

------------------------------------------------------------------------

# 35. Final End-to-End Flow

The complete HopeAI AIOps lifecycle is:

``` text
1. Operator receives production incident
              |
              v
2. Operator pastes logs into Analyze Incident
              |
              v
3. React sends POST /analyze
              |
              v
4. FastAPI starts LangGraph workflow
              |
              v
5. Log Agent analyzes the log
              |
              v
6. RAG Agent searches company runbooks
              |
              v
7. Report Agent sends contextual information to Gemini
              |
              v
8. AI report + recommended actions are generated
              |
              v
9. Incident is persisted
              |
              v
10. Incident becomes Pending
              |
              v
11. Operator opens Incident Details
              |
              +-----------------------------+
              |                             |
              v                             v
        Approve Remediation          Reject Remediation
              |                             |
              v                             v
        Action Agent                 Reject Dialog
              |                             |
              v                             v
       Deterministic script          Rejection Reason
              |                             |
              v                             v
       PowerShell Engine                Cancelled
              |
              v
       Automation Result
              |
              v
          Completed
              |
              v
12. UI reloads persisted incident
              |
              v
13. Dashboard reflects final state
```

------------------------------------------------------------------------

# 36. Key Files at a Glance

  --------------------------------------------------------------------------------------------
  Layer                   File                                         Responsibility
  ----------------------- -------------------------------------------- -----------------------
  Backend Entry           `main.py`                                    FastAPI application

  Analyze API             `app/api/analyze.py`                         Incident analysis
                                                                       endpoint

  Approval API            `app/api/approval.py`                        Approve/reject endpoint

  Incident API            `app/api/incidents.py`                       Incident retrieval

  Health API              `app/api/health.py`                          Health check

  Log Agent               `app/agents/log_agent.py`                    Log analysis

  RAG Agent               `app/agents/rag_agent.py`                    Knowledge retrieval

  Report Agent            `app/agents/report_agent.py`                 Gemini report
                                                                       generation

  Action Agent            `app/agents/action_agent.py`                 Automation execution

  Supervisor              `app/agents/supervisor_agent.py`             Agent
                                                                       coordination/control

  Workflow                `app/workflow/graph.py`                      LangGraph workflow

  State                   `app/workflow/state.py`                      Shared workflow state

  Incident Service        `app/services/incident_service.py`           Incident business logic

  Approval Service        `app/services/approval_service.py`           Approval-related logic

  Repository              `app/repository/incident_repository.py`      Incident persistence

  UI API                  `src/api/api.ts`                             Axios/API configuration

  Dashboard               `src/pages/Dashboard.tsx`                    Incident dashboard

  Analyze UI              `src/pages/AnalyzeIncident.tsx`              Incident analysis
                                                                       screen

  Details UI              `src/pages/IncidentDetails.tsx`              Approval and execution
                                                                       screen

  Incident Form           `src/components/IncidentForm.tsx`            Log input

  Report UI               `src/components/IncidentReport.tsx`          AI report display

  Reject Dialog           `src/components/RejectDialog.tsx`            Rejection reason

  Loader                  `src/components/LoadingOverlay.tsx`          Processing indicator

  Approval Client         `src/services/approvalService.ts`            Approval API calls

  Dashboard Client        `src/services/dashboardService.ts`           Dashboard API calls

  Incident Client         `src/services/incidentService.ts`            Analyze API calls

  Details Client          `src/services/incidentDetailsService.ts`     Incident detail API

  Restart Automation      `scripts/restart_payment_api.ps1`            Payment API restart

  SQL Automation          `scripts/increase_sql_connection_pool.ps1`   Pool-size automation

  Knowledge               `documents/Database_Runbook.txt`             Operational knowledge

  Vector Store            `chroma_db/`                                 RAG embeddings/data

  Config                  `.env`, `config.py`                          Environment
                                                                       configuration
  --------------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 37. Architecture in One Sentence

> **HopeAI AIOps combines a React enterprise UI, FastAPI service layer,
> LangGraph multi-agent workflow, Gemini-powered reasoning,
> ChromaDB-based RAG, persistent incident management, human approval,
> and deterministic PowerShell automation to provide an end-to-end
> AI-assisted production incident remediation platform.**
