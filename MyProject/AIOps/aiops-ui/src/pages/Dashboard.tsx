import {
    Container,
    Grid,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { getIncidents, type Incident} from "../services/dashboardService";
import Header from "../components/Header";
import DashboardCard from "../components/DashboardCard";
import IncidentTable from "../components/IncidentTable";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";



export default function Dashboard() {

    const [incidents, setIncidents] = useState<Incident[]>([]);
    const navigate = useNavigate();

    useEffect(() => {

        loadDashboard();

    }, []);

    async function loadDashboard() {

        try {

            const data = await getIncidents();

            console.log(data);

            setIncidents(data);

        }

        catch (err) {

            console.error(err);

        }

    }   
    const total = incidents.length;

    const pending = incidents.filter(
        x => !x.approval &&
            x.execution_result === null
    ).length;

    const completed = incidents.filter(
        x => x.approval
    ).length;

    const cancelled = incidents.filter(
        x => !x.approval &&
            x.execution_result === "User rejected remediation."
    ).length;

    return (

        <>
            <Header />

            <Container
                maxWidth="xl"
                sx={{ mt: 4 }}
            >

                <Typography
                    variant="h4"
                    gutterBottom
                >
                    Dashboard
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{ mb: 4 }}
                >
                    Enterprise Incident Service
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    sx={{ mb: 4 }}
                    onClick={() => navigate("/analyze")}
                    >
                    Analyze New Incident
                </Button>

                <Grid
                    container
                    spacing={3}
                >

                    <Grid size={{ xs: 12, md: 3 }}>
                        <DashboardCard
                            title="Incidents"
                            value={total}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <DashboardCard
                            title="Pending"
                            value={pending}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <DashboardCard
                            title="Completed"
                            value={completed}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <DashboardCard
                            title="Cancelled"
                            value={cancelled}
                        />
                    </Grid>

                </Grid>
                <IncidentTable incidents={incidents} />
            </Container>

        </>

    );

}