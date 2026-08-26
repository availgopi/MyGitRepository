export interface AnalyzeResponse {

    incident_id: string;

    report: string;

    recommended_actions: string[];

    approval_required: boolean;
}