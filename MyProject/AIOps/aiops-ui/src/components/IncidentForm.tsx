import { useState } from "react";

import {
  Paper,
  Typography,
  TextField,
  Button,
  Box
} from "@mui/material";

interface Props {
  onAnalyze: (log: string) => void;
  loading: boolean;
}

export default function IncidentForm({
  onAnalyze,
  loading
}: Props) {

  const [log, setLog] = useState("");

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
      >
        Analyze New Incident
      </Typography>

      <Typography
        variant="body2"
        sx={{ mb: 2 }}
      >
        Paste your application logs below.
      </Typography>

      <TextField
        multiline
        rows={14}
        fullWidth
        placeholder="Paste application logs..."
        value={log}
        onChange={(e) => setLog(e.target.value)}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 2
        }}
      >
        <Typography color="text.secondary">
          {log.length} characters
        </Typography>

        <Button
          variant="contained"
          disabled={loading || log.trim() === ""}
          onClick={() => onAnalyze(log)}
        >
          Analyze Incident
        </Button>
      </Box>
    </Paper>
  );
}