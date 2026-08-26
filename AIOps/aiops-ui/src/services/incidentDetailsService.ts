import api from "../api/api";

import type { Incident } from "./dashboardService";

export async function getIncident(
    incidentId: string
): Promise<Incident> {

    const response = await api.get<Incident>(
        `/incidents/${incidentId}`
    );

    return response.data;

}