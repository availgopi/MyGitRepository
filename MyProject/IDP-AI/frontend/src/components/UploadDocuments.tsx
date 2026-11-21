
import { useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CloudDoneOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

import {
  api,
  type AnalyzeResponse,
} from "../services/api";

type ProcessingStep =
  | "idle"
  | "uploading"
  | "analyzing"
  | "completed"
  | "failed";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export default function UploadDocuments() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<ProcessingStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const isProcessing =
    step === "uploading" || step === "analyzing";

  function validateFile(file: File): string | null {
    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return "Unsupported file type. Please select a PDF, DOCX, or TXT file.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 10 MB. Please select a smaller document.";
    }

    if (file.size === 0) {
      return "The selected file is empty.";
    }

    return null;
  }

  function handleFile(file: File | undefined) {
    if (!file) return;

    const validationError = validateFile(file);

    setError(validationError);
    setResult(null);
    setDocumentId(null);
    setStep(validationError ? "failed" : "idle");

    if (!validationError) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }

  async function processDocument() {
    if (!selectedFile || isProcessing) return;

    setError(null);
    setResult(null);
    setDocumentId(null);

    try {
      // Step 1: Upload the document.
      setStep("uploading");

      const uploadResponse = await api.uploadDocument(selectedFile);

      setDocumentId(uploadResponse.document_id);

      // Step 2: Analyze using Gemini and validate.
      setStep("analyzing");

      const analysisResponse = await api.analyzeDocument(
        uploadResponse.document_id,
      );

      setResult(analysisResponse);
      setStep("completed");
    } catch (err) {
      setStep("failed");

      setError(
        err instanceof Error
          ? err.message
          : "Document processing failed.",
      );
    }
  }

  function resetForm() {
    setSelectedFile(null);
    setResult(null);
    setDocumentId(null);
    setError(null);
    setStep("idle");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const validation = result?.validation;
  const analysis = result?.analysis;

  return (
    <Box>
      {/* Page Heading */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800 }}
          gutterBottom
        >
          Upload Documents
        </Typography>

        <Typography color="text.secondary">
          Upload business documents for AI-powered extraction,
          classification, and validation.
        </Typography>
      </Box>

      {/* Upload Area */}
      <Card
        variant="outlined"
        sx={{
          borderColor: "#E4E8F0",
          boxShadow: "0 2px 8px rgba(20,35,70,0.03)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Select Document
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Supported formats: PDF, DOCX, TXT. Maximum file size: 10 MB.
          </Typography>

          <Paper
            variant="outlined"
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);

              if (!isProcessing) {
                handleFile(event.dataTransfer.files[0]);
              }
            }}
            sx={{
              p: { xs: 3, md: 5 },
              textAlign: "center",
              borderStyle: "dashed",
              borderWidth: 2,
              borderColor: dragActive ? "primary.main" : "#CBD5E1",
              backgroundColor: dragActive ? "#EFF6FF" : "#FAFBFD",
              borderRadius: 3,
            }}
          >
            <CloudUploadOutlinedIcon
              sx={{
                fontSize: 58,
                color: "primary.main",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Drag and drop your document here
            </Typography>

            <Typography
              color="text.secondary"
              variant="body2"
              sx={{ mt: 1, mb: 3 }}
            >
              Or select a file from your computer
            </Typography>

            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              Browse Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.docx,.txt"
              onChange={(event) =>
                handleFile(event.target.files?.[0])
              }
            />
          </Paper>

          {/* Selected File */}
          {selectedFile && (
            <Paper
              variant="outlined"
              sx={{ p: 2, mt: 3, borderRadius: 2 }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: "center" }}
                >
                <DescriptionOutlinedIcon
                  color="primary"
                  fontSize="large"
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{ fontWeight: 700 }}
                    noWrap
                  >
                    {selectedFile.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>

                <Chip
                  label="Ready"
                  color="success"
                  size="small"
                />
              </Stack>
            </Paper>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <Box sx={{ mt: 3 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {step === "uploading"
                    ? "Uploading document..."
                    : "Analyzing document with Gemini..."}
                </Typography>

                <CircularProgress size={20} />
              </Stack>

              <LinearProgress />
            </Box>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}

              {documentId && (
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 1 }}
                >
                  Uploaded document ID: {documentId}
                </Typography>
              )}
            </Alert>
          )}

          {/* Actions */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              mt: 3,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              onClick={resetForm}
              disabled={isProcessing}
            >
              Clear
            </Button>

            <Button
              variant="contained"
              startIcon={<AutoAwesomeOutlinedIcon />}
              onClick={processDocument}
              disabled={!selectedFile || isProcessing}
            >
              Upload & Analyze
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {result && analysis && validation && (
        <Card
          variant="outlined"
          sx={{
            mt: 3,
            borderColor: "#E4E8F0",
            boxShadow: "0 2px 8px rgba(20,35,70,0.03)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {/* Results Header */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800 }}
                >
                  Document Analysis Results
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Document ID: {result.document_id}
                </Typography>
              </Box>

              <Chip
                icon={
                  validation.validation_status === "validated"
                    ? <CheckCircleOutlineIcon />
                    : <ErrorOutlineIcon />
                }
                color={
                  validation.validation_status === "validated"
                    ? "success"
                    : "warning"
                }
                label={validation.validation_status.replaceAll("_", " ")}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Document Information */}
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Document Information
            </Typography>

            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Document Type:</strong>{" "}
                {analysis.document_type.replaceAll("_", " ")}
              </Typography>

              <Typography variant="body2">
                <strong>Summary:</strong> {analysis.summary}
              </Typography>

              <Typography variant="body2">
                <strong>Human Review Required:</strong>{" "}
                {validation.requires_human_review ? "Yes" : "No"}
              </Typography>
            </Stack>

            {/* Extracted Fields */}
            <Typography sx={{ fontWeight: 700, mb: 2 }}>
              Extracted Fields
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                },
                gap: 2,
              }}
            >
              {analysis.fields.map((field, index) => (
                <Paper
                  key={`${field.name}-${index}`}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2 }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {field.name}
                  </Typography>

                  <Typography
                    sx={{ fontWeight: 700, my: 0.5 }}
                  >
                    {field.value || "Not available"}
                  </Typography>

                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Confidence
                    </Typography>

                    <Chip
                      size="small"
                      label={`${(field.confidence * 100).toFixed(0)}%`}
                      color={
                        field.confidence >= 0.85
                          ? "success"
                          : "warning"
                      }
                    />
                  </Stack>

                  {field.evidence && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mt: 1,
                      }}
                    >
                      Evidence: {field.evidence}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>

            {/* Validation Errors */}
            {validation.errors.length > 0 && (
              <Alert severity="error" sx={{ mt: 3 }}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  Validation Errors
                </Typography>

                {validation.errors.map((item, index) => (
                  <Typography key={index} variant="body2">
                    • {item.message}
                  </Typography>
                ))}
              </Alert>
            )}

            {/* Validation Warnings */}
            {validation.warnings.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  Validation Warnings
                </Typography>

                {validation.warnings.map((item, index) => (
                  <Typography key={index} variant="body2">
                    • {item.message}
                  </Typography>
                ))}
              </Alert>
            )}

            {/* Missing Information */}
            {analysis.missing_information.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  Missing Information
                </Typography>

                <Stack
                  direction="row"
                  sx={{
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {analysis.missing_information.map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Final Workflow Status */}
            <Alert
              severity={
                validation.requires_human_review ? "warning" : "success"
              }
              icon={<FactCheckOutlinedIcon />}
              sx={{ mt: 3 }}
            >
              {validation.requires_human_review
                ? "Document successfully analyzed and routed for human review."
                : "Document successfully analyzed and passed backend validation."}
            </Alert>

            {/* Process Another Document */}
            <Stack
              direction="row"
              sx={{
                justifyContent: "flex-end",
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                onClick={resetForm}
              >
                Process Another Document
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}