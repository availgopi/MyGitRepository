import api from "../api/api";

export interface AnalyzeResponse {
    incident_id: string;
    report: string;
    recommended_actions: string[];
    approval_required: boolean;
}

export async function analyzeIncident(log: string): Promise<AnalyzeResponse> {

    const response = await api.post<AnalyzeResponse>(
        "/analyze",
        {
            log: log,
        }
    );

    return response.data;
}