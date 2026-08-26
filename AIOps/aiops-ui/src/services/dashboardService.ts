import api from "../api/api";

export interface Incident {

    incident_id: string;
    created_at: string;
    log: string;
    report: string;
    recommended_actions: string[];
    approval_required: boolean;
    approval: boolean;
    execution_result: string | null;
    rejection_reason: string | null;

}

export async function getIncidents(): Promise<Incident[]> {

    const response = await api.get<Incident[]>("/incidents");

    return response.data;

}