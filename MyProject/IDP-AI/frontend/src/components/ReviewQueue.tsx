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
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import { api, type WorkflowRecord } from "../services/api";

interface ReviewQueueProps {
  onReviewed?: () => void;
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) =>
    letter.toUpperCase(),
  );
}

export default function ReviewQueue({ onReviewed }: ReviewQueueProps) {
  const [documents, setDocuments] = useState<WorkflowRecord[]>([]);
  const [selectedDocument, setSelectedDocument] =
    useState<WorkflowRecord | null>(null);

  const [reviewer, setReviewer] = useState("Admin");
  const [comments, setComments] = useState("");

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);

  const loadReviewQueue = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.reviewQueue();
      setDocuments(response.documents);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the review queue.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviewQueue();
  }, [loadReviewQueue]);

  const openDocument = async (documentId: string) => {
    setDialogOpen(true);
    setDetailsLoading(true);
    setSelectedDocument(null);
    setActionError(null);
    setComments("");

    try {
      const record = await api.getWorkflow(documentId);
      setSelectedDocument(record);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve document details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDialog = () => {
    if (submitting) return;

    setDialogOpen(false);
    setSelectedDocument(null);
    setActionError(null);
  };

  const handleReview = async (decision: "approve" | "reject") => {
    if (!selectedDocument) return;

    if (!reviewer.trim()) {
      setActionError("Please enter the reviewer name.");
      return;
    }

    setSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await api.submitReview(
        selectedDocument.document_id,
        decision,
        reviewer.trim(),
        comments.trim() || undefined,
      );

      setSuccessMessage(response.message);
      setDialogOpen(false);
      setSelectedDocument(null);

      await loadReviewQueue();
      onReviewed?.();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to submit the review decision.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Page heading */}
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
            Review Queue
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Review documents that require human intervention.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Chip
            color={documents.length > 0 ? "warning" : "success"}
            label={`${documents.length} Pending`}
          />

          <Button
            variant="outlined"
            startIcon={<RefreshOutlinedIcon />}
            onClick={loadReviewQueue}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={loadReviewQueue}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Queue content */}
      {loading ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Loading pending documents...
          </Typography>
        </Box>
      ) : !error && documents.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ py: 7, textAlign: "center" }}>
            <CheckCircleOutlineOutlinedIcon
              sx={{ fontSize: 52, color: "success.main", mb: 1 }}
            />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No documents awaiting review
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1 }}>
              All currently analyzed documents have been processed or
              reviewed.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {documents.map((document) => (
            <Card
              key={document.document_id}
              variant="outlined"
              sx={{
                borderColor: "#E4E8F0",
                boxShadow: "0 2px 8px rgba(20,35,70,0.03)",
              }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  sx={{
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }} noWrap>
                      {document.filename}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {formatLabel(document.analysis.document_type)}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 1 }}
                    >
                      Document ID: {document.document_id}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Created: {formatDate(document.created_at)}
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", flexWrap: "wrap" }}
                  >
                    <Chip
                      size="small"
                      color="warning"
                      label="Pending Review"
                    />

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={() =>
                        openDocument(document.document_id)
                      }
                    >
                      Review
                    </Button>
                  </Stack>
                </Stack>

                {document.validation.errors.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {document.validation.errors.length} validation
                    issue(s) require attention.
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Document review dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Review Document
        </DialogTitle>

        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <CircularProgress />
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Loading document details...
              </Typography>
            </Box>
          ) : actionError && !selectedDocument ? (
            <Alert severity="error">{actionError}</Alert>
          ) : selectedDocument ? (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {selectedDocument.filename}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {formatLabel(selectedDocument.analysis.document_type)}
                  {" · "}
                  {selectedDocument.document_id}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  AI Summary
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  {selectedDocument.analysis.summary ||
                    "No summary available."}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Extracted Fields
                </Typography>

                {selectedDocument.analysis.fields.length === 0 ? (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    No extracted fields available.
                  </Typography>
                ) : (
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {selectedDocument.analysis.fields.map((field, index) => (
                      <Box
                        key={`${field.name}-${index}`}
                        sx={{
                          p: 1.5,
                          border: "1px solid #E7EAF0",
                          borderRadius: 2,
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          sx={{
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", sm: "center" },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700 }}
                          >
                            {formatLabel(field.name)}
                          </Typography>

                          <Chip
                            size="small"
                            color={
                              field.confidence >= 0.75
                                ? "success"
                                : "warning"
                            }
                            label={`${(field.confidence * 100).toFixed(0)}% confidence`}
                          />
                        </Stack>

                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {field.value || "Not extracted"}
                        </Typography>

                        {field.evidence && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.5 }}
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

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Validation Results
                </Typography>

                <Chip
                  sx={{ mt: 1 }}
                  size="small"
                  color={
                    selectedDocument.validation.validation_status ===
                    "validated"
                      ? "success"
                      : "warning"
                  }
                  label={formatLabel(
                    selectedDocument.validation.validation_status,
                  )}
                />

                {selectedDocument.validation.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      Errors
                    </Typography>

                    {selectedDocument.validation.errors.map(
                      (item, index) => (
                        <Alert
                          key={`${item.field}-${index}`}
                          severity="error"
                          sx={{ mb: 1 }}
                        >
                          <strong>{formatLabel(item.field)}:</strong>{" "}
                          {item.message}
                        </Alert>
                      ),
                    )}
                  </Box>
                )}

                {selectedDocument.validation.warnings.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      Warnings
                    </Typography>

                    {selectedDocument.validation.warnings.map(
                      (item, index) => (
                        <Alert
                          key={`${item.field || "warning"}-${index}`}
                          severity="warning"
                          sx={{ mb: 1 }}
                        >
                          {item.field
                            ? `${formatLabel(item.field)}: `
                            : ""}
                          {item.message}
                        </Alert>
                      ),
                    )}
                  </Box>
                )}

                {selectedDocument.analysis.missing_information.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      Missing Information
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap", gap: 1 }}
                    >
                      {selectedDocument.analysis.missing_information.map(
                        (item, index) => (
                          <Chip
                            key={`${item}-${index}`}
                            color="error"
                            variant="outlined"
                            label={item}
                          />
                        ),
                      )}
                    </Stack>
                  </Box>
                )}
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Reviewer Decision
                </Typography>

                <TextField
                  fullWidth
                  label="Reviewer Name"
                  value={reviewer}
                  onChange={(event) => setReviewer(event.target.value)}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  label="Review Comments"
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                  margin="normal"
                  multiline
                  minRows={3}
                  slotProps={{ htmlInput: { maxLength: 1000,},}}
                  helperText={`${comments.length}/1000 characters`}
                />

                {actionError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {actionError}
                  </Alert>
                )}
              </Box>
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog} disabled={submitting}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="outlined"
            startIcon={<CancelOutlinedIcon />}
            onClick={() => handleReview("reject")}
            disabled={
              detailsLoading || !selectedDocument || submitting
            }
          >
            Reject
          </Button>

          <Button
            color="success"
            variant="contained"
            startIcon={<CheckCircleOutlineOutlinedIcon />}
            onClick={() => handleReview("approve")}
            disabled={
              detailsLoading || !selectedDocument || submitting
            }
          >
            {submitting ? "Submitting..." : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}