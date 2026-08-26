import api from "../api/api";

export interface ApprovalResponse {
    status: string;
    message: string;
    execution_result: string;
}

export async function approveIncident(
    incidentId: string,
    approved: boolean,
    rejectionReason?: string
) {

    const response = await api.post("/approve", {

        incident_id: incidentId,

        approved: approved,

        rejection_reason: rejectionReason

    });

    return response.data;

}