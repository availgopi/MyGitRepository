import {
    Container,
    Paper,
    Typography,
    Chip,
    Stack,
    Button
} from "@mui/material";

import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
// import Header from "../components/Header";

import { useEffect, useState } from "react";
import { getIncident } from "../services/incidentDetailsService";
import type { Incident } from "../services/dashboardService";
import { approveIncident } from "../services/approvalService";
import RejectDialog from "../components/RejectDialog";
import LoadingOverlay from "../components/LoadingOverlay";

function getStatusChip(incident: Incident) {

    if (incident.approval) {

        return (
            <Chip
                label="Completed"
                color="success"
            />
        );

    }

    if (incident.execution_result === "User rejected remediation.") {

        return (
            <Chip
                label="Cancelled"
                color="error"
            />
        );

    }

    return (

        <Chip
            label="Pending"
            color="warning"
        />

    );

}

export default function IncidentDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [incident, setIncident] = useState<Incident | null>(null);
    const [processing, setProcessing] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    useEffect(() => {

    if (!id) return;

    loadIncident();

    }, [id]);



    async function loadIncident() {

        try {

                const incidentData = await getIncident(id!);

                setIncident(incidentData);
        }
        catch (err) {

            console.error(err);

        }

    }


    async function approve() {

        if (!incident) return;

        try {

            setProcessing(true);

            await approveIncident(
                incident.incident_id,
                true
            );

            await loadIncident();

        }

        catch (err) {

            console.error(err);

            alert("Approval failed.");

        }

        finally {

            setProcessing(false);

        }

    }

    async function reject(rejectionReason: string) {

        if (!incident) return;

        try {

            setProcessing(true);

            await approveIncident(
                incident.incident_id,
                false,
                rejectionReason
            );

            setRejectDialogOpen(false);

            await loadIncident();

        }
        catch (err) {

            console.error(err);

            alert("Reject failed.");

        }
        finally {

            setProcessing(false);

        }

    }

    if (!incident) {

    return (
        <>
            {/* <Header /> */}

            <Container
                sx={{
                    mt: 8,
                    textAlign: "center"
                }}
            >

                <CircularProgress />

                <Typography sx={{ mt: 2 }}>
                    Loading incident...
                </Typography>

            </Container>
        </>
    );

    }
    //console.log(incident);
    return (

        <>
            {/* <Header /> */}

            <LoadingOverlay
                open={processing}
                message="Executing automation..."
            />

            <Container
                maxWidth="lg"
                sx={{ mt: 4 }}
            >

                <Paper sx={{ p: 4 }}>

                    <Typography variant="h4" gutterBottom>
                        Incident Intelligence Report
                    </Typography>

                    <Typography sx={{ mt: 3 }}>
                        <strong>Incident ID:</strong>
                    </Typography>

                    <Typography gutterBottom>
                        {incident.incident_id}
                    </Typography>

                    <Typography sx={{ mt: 3 }}>
                        <strong>Created:</strong>
                    </Typography>

                    <Typography gutterBottom>
                        {new Date(incident.created_at).toLocaleString()}
                    </Typography>

                    <Typography sx={{ mt: 3 }}>
                        <strong>Status:</strong>
                    </Typography>

                    {getStatusChip(incident)}

                    <Typography sx={{ mt: 4 }}>
                        <strong>Original Log</strong>
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                        <Typography
                            sx={{
                                whiteSpace: "pre-wrap"
                            }}
                        >
                            {incident.log}
                        </Typography>
                    </Paper>

                    <Typography sx={{ mt: 4 }}>
                        <strong>AI Incident Report</strong>
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                        <Typography
                            sx={{
                                whiteSpace: "pre-wrap"
                            }}
                        >
                            {incident.report}
                        </Typography>
                    </Paper>

                    <Typography sx={{ mt: 4 }}>
                        <strong>Recommended Actions</strong>
                    </Typography>

                    <ul>
                        {incident.recommended_actions.map(action => (
                            <li key={action}>
                                {action}
                            </li>
                        ))}
                    </ul>

                    {!incident.approval && incident.execution_result === null && (

                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ mt: 3 }}
                        >

                            <Button
                                variant="contained"
                                color="success"
                                disabled={processing}
                                onClick={approve}
                            >
                                Approve Remediation
                            </Button>

                            <Button
                                variant="contained"
                                color="error"
                                disabled={processing}
                                onClick={() => setRejectDialogOpen(true)}
                            >
                                Reject Remediation
                            </Button>
                    </Stack>
                    )}
                    <Typography sx={{ mt: 4 }}>
                        <strong>Execution Result</strong>
                    </Typography>
                    {incident.rejection_reason && (

                        <>
                            <Typography sx={{ mt: 4 }}>
                                <strong>Rejection Reason</strong>
                            </Typography>

                            <Paper
                                variant="outlined"
                                sx={{ p: 2, mt: 1 }}
                            >
                                <Typography
                                    sx={{
                                        whiteSpace: "pre-wrap"
                                    }}
                            >
                                    {incident.rejection_reason}
                                </Typography>
                            </Paper>

                        </>

                    )}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            mt: 1,
                            bgcolor: "#111827",
                            color: "#E5E7EB",
                            fontFamily: "Consolas, monospace",
                            overflowX: "auto"
                        }}
                    >
                        <Typography
                            component="pre"
                            sx={{
                                m: 0,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                fontFamily: "inherit"
                            }}
                        >
                            {incident.execution_result ??
                                "Waiting for operator approval."}
                        </Typography>
                    </Paper>
                    <Stack
                            direction="row"
                            spacing={2}
                            sx={{ mt: 3 }}
                        >
                            <Button
                                variant="outlined"
                                onClick={() => navigate("/")}
                            >
                                Back to Dashboard
                            </Button>
                    </Stack>
                </Paper>
            </Container>
            <RejectDialog
                open={rejectDialogOpen}
                onClose={() => setRejectDialogOpen(false)}
                onReject={reject}
            />

        </>

    );

}