import {
  Paper,
  Typography,
  Divider  
} from "@mui/material";

import ReactMarkdown from "react-markdown";

interface Props {
    analysis: any;
}

export default function IncidentReport({
    analysis
}: Props) {

  return (

    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        minHeight: 500
      }}
    >

      <Typography variant="h5">
        AI Incident Report
      </Typography>

      <Divider sx={{ my: 2 }} />

      {!analysis ? (

        <Typography color="text.secondary">
          Waiting for analysis...
        </Typography>

      ) : (

        <>

          <Typography sx={{ mb: 2 }}>
            <strong>Incident ID:</strong> {analysis.incident_id}
          </Typography>

          <ReactMarkdown>
            {analysis.report}
          </ReactMarkdown>
        </>

      )}

    </Paper>

  );

}