import {
    Container,
    Grid,
    Paper,
    Typography,
    Button
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import IncidentForm from "../components/IncidentForm";
import IncidentReport from "../components/IncidentReport";

import { analyzeIncident } from "../services/incidentService";
import LoadingOverlay from "../components/LoadingOverlay";


export default function AnalyzeIncident() {

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [incidentId, setIncidentId] = useState("");

  const navigate = useNavigate();

  async function analyze(log: string) {

    try {

      setLoading(true);

      const response = await analyzeIncident(log);

      setAnalysis(response);
      setIncidentId(response.incident_id);

    }
    catch (error) {

      console.error(error);

      alert("Failed to analyze incident.");

    }
    finally {

      setLoading(false);

    }

  }



  return (

    <>
      <Header />
      <LoadingOverlay open={loading} />
      
      <Container
        maxWidth="xl"
        sx={{ mt: 4 }}
      >

        <Grid container spacing={3}>

          <Grid xs={12} lg={6}>

            <IncidentForm
              loading={loading}
              onAnalyze={analyze}
            />

          </Grid>

          <Grid xs={12} lg={6}>

             <IncidentReport
                analysis={analysis}
              />

          </Grid>

        </Grid>

        {incidentId && (

          <Paper
              sx={{
                  p: 3,
                  mt: 3
              }}
          >

              <Typography
                  color="success.main"
                  gutterBottom
              >

                  ✓ Incident created successfully.

              </Typography>

              <Button
                  variant="contained"
                  sx={{ mr: 2 }}
                  onClick={() =>
                      navigate(`/incidents/${incidentId}`)
                  }
              >

                  View Incident

              </Button>

              <Button
                  variant="outlined"
                  onClick={() =>
                      navigate("/")
                  }
              >

                  Back to Dashboard

              </Button>

          </Paper>

  )}

      </Container>

      

    </>

  );

}