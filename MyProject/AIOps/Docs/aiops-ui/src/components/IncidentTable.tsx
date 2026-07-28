import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Button
} from "@mui/material";

import type { Incident } from "../services/dashboardService";
import { useNavigate } from "react-router-dom";

interface Props {
    incidents: Incident[];
}

function getStatusChip(incident: Incident) {

    if (incident.approval) {

        return (
            <Chip
                label="Completed"
                color="success"
                size="small"
            />
        );

    }

    if (!incident.approval && incident.execution_result === null) {

        return (
            <Chip
                label="Pending"
                color="warning"
                size="small"
            />
        );

    }

    return (
        <Chip
            label="Cancelled"
            color="error"
            size="small"
        />
    );

}

export default function IncidentTable({
    incidents
}: Props) {

    const navigate = useNavigate();

    return (

        <TableContainer
            component={Paper}
            sx={{ mt: 4 }}
        >

            <Typography
                variant="h6"
                sx={{ p: 2 }}
            >
                Recent Incidents
            </Typography>

            <Table>

                <TableHead>

                    <TableRow>

                        <TableCell>Incident ID</TableCell>

                        <TableCell>Created</TableCell>

                        <TableCell>Status</TableCell>

                        <TableCell>Action</TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {incidents.map((incident) => (

                        <TableRow
                            key={incident.incident_id}
                        >

                            <TableCell>

                                {incident.incident_id.substring(0, 8)}

                            </TableCell>

                            <TableCell>

                                {new Date(
                                    incident.created_at
                                ).toLocaleString()}

                            </TableCell>

                            <TableCell>

                                {getStatusChip(incident)}

                            </TableCell>

                            <TableCell>

                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() =>
                                        navigate(`/incidents/${incident.incident_id}`)
                                    }
                                >
                                    View
                                </Button>

                            </TableCell>

                        </TableRow>

                    ))}

                </TableBody>

            </Table>

        </TableContainer>

    );

}