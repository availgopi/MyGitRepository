import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

import { api, type WorkflowRecord } from "../services/api";

interface WorkflowHistoryProps {
  onRefresh?: () => void;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
}

function formatLabel(value: string | null | undefined) {
  if (!value) return "Unknown";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusColor(
  status: string,
): "success" | "error" | "warning" | "info" | "default" {
  switch (status.toLowerCase()) {
    case "approved":
    case "auto_processed":
    case "validated":
      return "success";

    case "rejected":
      return "error";

    case "pending_review":
    case "review_required":
      return "warning";

    default:
      return "default";
  }
}

export default function WorkflowHistory({
  onRefresh,
}: WorkflowHistoryProps) {
  const [documents, setDocuments] = useState<WorkflowRecord[]>([]);
  const [selectedDocument, setSelectedDocument] =
    useState<WorkflowRecord | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.workflowHistory();
      setDocuments(response.documents);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load workflow history.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const openDetails = async (documentId: string) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedDocument(null);

    try {
      const record = await api.getWorkflow(documentId);
      setSelectedDocument(record);
    } catch (err) {
      setDetailsError(
        err instanceof Error
          ? err.message
          : "Unable to load workflow details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedDocument(null);
    setDetailsError(null);
  };

  const refreshHistory = async () => {
    await loadHistory();
    onRefresh?.();
  };

  return (
    <Box>
      {/* Page Heading */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Workflow History
          </Typography>

          <Typography color="text.secondary">
            View and track all processed documents and their workflow outcomes.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlinedIcon />}
          onClick={refreshHistory}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {/* History Table */}
      <Card
        variant="outlined"
        sx={{
          borderColor: "#E4E8F0",
          boxShadow: "0 2px 8px rgba(20,35,70,0.03)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", mb: 2 }}
          >
            <HistoryOutlinedIcon color="primary" />

            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Processed Documents
            </Typography>

            <Chip
              size="small"
              label={`${documents.length} records`}
              color="primary"
              variant="outlined"
            />
          </Stack>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={loadHistory}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ py: 7, textAlign: "center" }}>
              <CircularProgress />

              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Loading workflow history...
              </Typography>
            </Box>
          ) : error ? null : documents.length === 0 ? (
            <Box sx={{ py: 7, textAlign: "center" }}>
              <HistoryOutlinedIcon
                sx={{ fontSize: 48, color: "text.secondary" }}
              />

              <Typography sx={{ mt: 1, fontWeight: 700 }}>
                No workflow history found
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Documents will appear here after they have been analyzed.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 850 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Document
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Document Type
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Validation
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Workflow Status
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700 }}>
                      Created At
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {documents.map((document) => (
                    <TableRow
                      key={document.document_id}
                      hover
                    >
                      <TableCell>
                        <Typography
                          sx={{ fontSize: 13, fontWeight: 700 }}
                          noWrap
                        >
                          {document.filename}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {document.document_id.slice(0, 13)}...
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: 13 }}>
                          {formatLabel(document.analysis?.document_type)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          color={getStatusColor(
                            document.validation?.validation_status ?? "",
                          )}
                          label={formatLabel(
                            document.validation?.validation_status,
                          )}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          color={getStatusColor(document.workflow_status)}
                          label={formatLabel(document.workflow_status)}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{ fontSize: 12 }}
                          color="text.secondary"
                        >
                          {formatDate(document.created_at)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="View workflow details">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() =>
                              openDetails(document.document_id)
                            }
                          >
                            <VisibilityOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Workflow Details Dialog */}
      <Dialog
        open={detailsLoading || detailsError !== null || selectedDocument !== null}
        onClose={closeDetails}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Workflow Details
        </DialogTitle>

        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <CircularProgress />

              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Loading document details...
              </Typography>
            </Box>
          ) : detailsError ? (
            <Alert severity="error">{detailsError}</Alert>
          ) : selectedDocument ? (
            <Stack spacing={2.5}>
              {/* Document Information */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Document Information
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Filename:</strong> {selectedDocument.filename}
                </Typography>

                <Typography variant="body2">
                  <strong>Document ID:</strong>{" "}
                  {selectedDocument.document_id}
                </Typography>

                <Typography variant="body2">
                  <strong>Document Type:</strong>{" "}
                  {formatLabel(selectedDocument.analysis.document_type)}
                </Typography>

                <Typography variant="body2">
                  <strong>Created At:</strong>{" "}
                  {formatDate(selectedDocument.created_at)}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
                  <Chip
                    size="small"
                    color={getStatusColor(selectedDocument.workflow_status)}
                    label={formatLabel(selectedDocument.workflow_status)}
                  />

                  <Chip
                    size="small"
                    color={getStatusColor(
                      selectedDocument.validation.validation_status,
                    )}
                    label={formatLabel(
                      selectedDocument.validation.validation_status,
                    )}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* AI Summary */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  AI Analysis Summary
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedDocument.analysis.summary || "No summary available."}
                </Typography>
              </Box>

              <Divider />

              {/* Extracted Fields */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                  Extracted Fields
                </Typography>

                {selectedDocument.analysis.fields.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No extracted fields available.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {selectedDocument.analysis.fields.map((field, index) => (
                      <Box
                        key={`${field.name}-${index}`}
                        sx={{
                          p: 1.5,
                          border: "1px solid #EDF0F5",
                          borderRadius: 1.5,
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          sx={{ justifyContent: "space-between", gap: 1 }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                              {formatLabel(field.name)}
                            </Typography>

                            <Typography variant="body2">
                              {field.value ?? "Not available"}
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            color={field.confidence >= 0.75 ? "success" : "warning"}
                            label={`${(field.confidence * 100).toFixed(0)}% confidence`}
                          />
                        </Stack>

                        {field.evidence && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.75 }}
                          >
                            Evidence: {field.evidence}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              <Divider />

              {/* Validation */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                  Validation Results
                </Typography>

                {selectedDocument.validation.errors.length === 0 &&
                selectedDocument.validation.warnings.length === 0 ? (
                  <Alert severity="success">
                    No validation errors or warnings.
                  </Alert>
                ) : (
                  <Stack spacing={1}>
                    {selectedDocument.validation.errors.map((item, index) => (
                      <Alert severity="error" key={`error-${index}`}>
                        {item.message}
                      </Alert>
                    ))}

                    {selectedDocument.validation.warnings.map((item, index) => (
                      <Alert severity="warning" key={`warning-${index}`}>
                        {item.message}
                      </Alert>
                    ))}
                  </Stack>
                )}

                {selectedDocument.analysis.missing_information.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.5 }}>
                      Missing Information
                    </Typography>

                    {selectedDocument.analysis.missing_information.map(
                      (item, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          color="text.secondary"
                        >
                          • {item}
                        </Typography>
                      ),
                    )}
                  </Box>
                )}
              </Box>

              {/* Human Review */}
              {selectedDocument.review && (
                <>
                  <Divider />

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Human Review
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Decision:</strong>{" "}
                      {formatLabel(selectedDocument.review.decision)}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Reviewer:</strong>{" "}
                      {selectedDocument.review.reviewer}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Reviewed At:</strong>{" "}
                      {formatDate(selectedDocument.review.reviewed_at)}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Comments:</strong>{" "}
                      {selectedDocument.review.comments || "No comments"}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}