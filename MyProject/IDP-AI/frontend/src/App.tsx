import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import { api, type WorkflowRecord } from "./services/api";
import UploadDocuments from "./components/UploadDocuments";
import ReviewQueue from "./components/ReviewQueue";
import WorkflowHistory from "./components/WorkflowHistory";


const drawerWidth = 240;

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2457C5" },
    background: {
      default: "#F5F7FB",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

const menuItems = [
  { label: "Dashboard", icon: <DashboardOutlinedIcon /> },
  { label: "Upload Documents", icon: <UploadFileOutlinedIcon /> },
  { label: "Review Queue", icon: <FactCheckOutlinedIcon /> },
  { label: "Workflow History", icon: <HistoryOutlinedIcon /> },
];

const metrics = [
  {
    label: "Total Documents",
    description: "Documents processed",
    key: "total",
  },
  {
    label: "Pending Review",
    description: "Awaiting reviewer action",
    key: "pending",
  },
  {
    label: "Auto-Processed",
    description: "Passed validation",
    key: "autoProcessed",
  },
  {
    label: "Rejected",
    description: "Rejected during review",
    key: "rejected",
  },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function App() {
  const [documents, setDocuments] = useState<WorkflowRecord[]>([]);
  const [allDocuments, setAllDocuments] = useState<WorkflowRecord[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<WorkflowRecord | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<"dashboard" | "upload" | "review" | "history">("dashboard");

  const loadDashboard = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const [healthResponse, queueResponse, historyResponse] =
      await Promise.all([
        api.health(),
        api.reviewQueue(),
        api.workflowHistory(),
      ]);

    setBackendConnected(healthResponse.status === "healthy");

    // Documents awaiting human review
    setDocuments(queueResponse.documents);

    // All analyzed and processed documents
    setAllDocuments(historyResponse.documents);

    setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setBackendConnected(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend API.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleViewDetails = async (documentId: string) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedDocument(null);

    try {
      const response = await api.getWorkflow(documentId);
      setSelectedDocument(response);
    } catch (err) {
      setDetailsError(
        err instanceof Error
          ? err.message
          : "Unable to load document details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

const pendingCount = documents.length;
const totalDocuments = allDocuments.length;
const autoProcessedCount = allDocuments.filter(
  (document) => document.workflow_status === "auto_processed",
).length;
const rejectedCount = allDocuments.filter(
  (document) => document.workflow_status === "rejected",
).length;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: "flex", minHeight: "100vh" }}>

        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid #E7EAF0",
              backgroundColor: "#FFFFFF",
            },
          }}
        >
          <Toolbar sx={{ px: 2.5, gap: 1.5, minHeight: "76px !important" }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "white",
                display: "grid",
                placeItems: "center",
              }}
            >
              <AutorenewOutlinedIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                AI-Based Multi-Document Intelligence & Validation System
              </Typography>
            </Box>
          </Toolbar>

          <Box sx={{ px: 2, mt: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ px: 1.5, fontWeight: 700, letterSpacing: 1 }}
            >
              WORKSPACE
            </Typography>

            <List sx={{ mt: 1 }}>
                {menuItems.map((item, index) => (
                  <ListItemButton
                    key={item.label}
                    selected={
                      (index === 0 && activePage === "dashboard") ||
                      (index === 1 && activePage === "upload")  ||
                      (index === 2 && activePage === "review") ||
                      (index === 3 && activePage === "history")
                    }
                    onClick={() => {
                      if (index === 0) setActivePage("dashboard");
                      if (index === 1) setActivePage("upload");
                      if (index === 2) setActivePage("review");
                      if (index === 3) setActivePage("history");
                    }}
                  >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color:
                        index === 0 ? "primary.main" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: 14,
                          fontWeight: 600,
                        },
                      },
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>

          {/* Backend status */}
          {/* <Box sx={{ mt: "auto", p: 2 }}>
            <Card variant="outlined" sx={{ bgcolor: "#F8FAFF" }}>
              <CardContent>
                <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                  Processing Engine
                </Typography>

                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1 }}>
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      bgcolor: backendConnected ? "#16A34A" : "#DC2626",
                    }}
                  />

                  <Typography variant="body2" color="text.secondary">
                    {backendConnected
                      ? "Backend connected"
                      : loading
                        ? "Checking connection..."
                        : "Backend disconnected"}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box> */}
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            width: `calc(100% - ${drawerWidth}px)`,
            backgroundColor: "background.default",
          }}
        >

          {/* Header */}
          <AppBar
            position="sticky"
            color="inherit"
            elevation={0}
            sx={{
              borderBottom: "1px solid #E7EAF0",
              backgroundColor: "#FFFFFF",
              zIndex: 10,
            }}
          >
            <Toolbar
              sx={{
                justifyContent: "space-between",
                minHeight: "76px !important",
                px: { xs: 2, md: 4 },
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {activePage === "dashboard" ? "Dashboard" : activePage === "upload" ? "Upload Documents"
                  : activePage === "review" ? "Review Queue"
                  : "Workflow History"}
                </Typography>
              </Box>

              {activePage === "dashboard" && (
              <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                <Tooltip title="Refresh dashboard">
                  <span>
                    <IconButton
                      onClick={loadDashboard}
                      disabled={loading}
                      color="primary"
                    >
                      <RefreshOutlinedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              )}
            </Toolbar>
          </AppBar>

          {/* Dashboard Body */}
          <Box
            sx={{
              width: "100%",
              maxWidth: 1600,
              mx: "auto",
              p: { xs: 2, sm: 3, lg: 4 },
            }}
          >
            {activePage === "upload" ? (
              <UploadDocuments />
            ) : activePage === "review" ? (
              <ReviewQueue onReviewed={loadDashboard} />
            ) : activePage === "history" ? (
              <WorkflowHistory onRefresh={loadDashboard} />
            ) : (
              <>
            {/* Page Heading */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  mb: 4,
                }}
              >
              <Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 800 }}
                >
                  Document Operations
                </Typography>

                <Typography color="text.secondary">
                  Monitor extraction, validation, and human-review workflows.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<UploadFileOutlinedIcon />}
                onClick={() => setActivePage("upload")}
              >
                Upload Document
              </Button>
            </Stack>

            {/* API Error */}
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                action={
                  <Button color="inherit" size="small" onClick={loadDashboard}>
                    Retry
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {/* Metrics */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  xl: "repeat(4, 1fr)",
                },
                gap: 2.5,
              }}
            >
              {metrics.map((metric) => {
                const isPending = metric.key === "pending";

                const metricValue =
                  metric.key === "total"
                    ? totalDocuments
                    : metric.key === "pending"
                      ? pendingCount
                      : metric.key === "autoProcessed"
                        ? autoProcessedCount
                        : rejectedCount;

                return (
                  <Card
                    key={metric.label}
                    variant="outlined"
                    sx={{
                      minHeight: 155,
                      borderColor: "#E4E8F0",
                      boxShadow: "0 2px 8px rgba(20,35,70,0.03)",
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                        {metric.label}
                      </Typography>

                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, mt: 2, mb: 1 }}
                      >
                        {loading ? (
                          <CircularProgress size={26} />
                        ) : error ? (
                          "—"
                        ) : (
                          metricValue
                        )}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {metric.description}
                      </Typography>

                      {isPending && !loading && !error && (
                        <Chip
                          size="small"
                          color={pendingCount > 0 ? "warning" : "success"}
                          label={
                            pendingCount > 0
                              ? "Requires attention"
                              : "No pending reviews"
                          }
                          sx={{ mt: 1.5 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })}

            </Box>

              {/* Recent Documents */}
              <Card
                variant="outlined"
                sx={{
                  mt: 3,
                  borderColor: "#E4E8F0",
                  boxShadow: "0 2px 8px rgba(20,35,70,0.03)",
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      mb: 3,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Recent Documents
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Latest processed documents and workflow status
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<HistoryOutlinedIcon />}
                      onClick={() => setActivePage("history")}
                    >
                      View All
                    </Button>
                  </Stack>

                  {loading ? (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <CircularProgress />
                      <Typography color="text.secondary" sx={{ mt: 2 }}>
                        Loading recent documents...
                      </Typography>
                    </Box>
                  ) : error ? (
                    <Alert severity="warning">
                      Unable to load recent documents. Please refresh the dashboard.
                    </Alert>
                  ) : allDocuments.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <DescriptionOutlinedIcon
                        sx={{ fontSize: 42, color: "text.secondary" }}
                      />
                      <Typography sx={{ fontWeight: 600, mt: 1 }}>
                        No processed documents yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Uploaded and analyzed documents will appear here.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ overflowX: "auto" }}>
                      <Box sx={{ minWidth: 750 }}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.2fr",
                            gap: 2,
                            p: 1.5,
                            bgcolor: "#F8FAFC",
                            borderRadius: 1,
                          }}
                        >
                          {[
                            "Document",
                            "Document Type",
                            "Validation",
                            "Workflow Status",
                            "Processed At",
                          ].map((heading) => (
                            <Typography
                              key={heading}
                              color="text.secondary"
                              sx={{ fontSize: 12, fontWeight: 700 }}
                            >
                              {heading}
                            </Typography>
                          ))}
                        </Box>

                        {allDocuments.slice(0, 5).map((document) => (
                          <Box
                              key={document.document_id}
                              onClick={() => handleViewDetails(document.document_id)}
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.2fr",
                                gap: 2,
                                p: 1.5,
                                alignItems: "center",
                                borderBottom: "1px solid #EDF0F5",
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "#F8FAFC",
                                },
                              }}
                            >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{ fontSize: 13, fontWeight: 700 }}
                                noWrap
                              >
                                {document.filename}
                              </Typography>
                              <Typography
                                sx={{ fontSize: 11 }}
                                color="text.secondary"
                                noWrap
                              >
                                {document.document_id.substring(0, 13)}...
                              </Typography>
                            </Box>

                            <Typography sx={{ fontSize: 13 }}>
                              {document.analysis.document_type.replaceAll("_", " ")}
                            </Typography>

                            <Chip
                              size="small"
                              color={
                                document.validation.validation_status === "valid" ||
                                document.validation.validation_status === "validated"
                                  ? "success"
                                  : "warning"
                              }
                              label={document.validation.validation_status.replaceAll(
                                "_",
                                " ",
                              )}
                            />

                            <Chip
                              size="small"
                              color={
                                document.workflow_status === "approved" ||
                                document.workflow_status === "auto_processed"
                                  ? "success"
                                  : document.workflow_status === "rejected"
                                    ? "error"
                                    : "warning"
                              }
                              label={document.workflow_status.replaceAll("_", " ")}
                            />

                            <Typography sx={{ fontSize: 12 }} color="text.secondary">
                              {formatDate(document.created_at)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
                {/* Document Details Dialog */}
                <Dialog
                  open={
                    detailsLoading ||
                    detailsError !== null ||
                    selectedDocument !== null
                  }
                  onClose={() => {
                    setSelectedDocument(null);
                    setDetailsError(null);
                  }}
                  fullWidth
                  maxWidth="md"
                >
                  <DialogTitle sx={{ fontWeight: 800 }}>
                    Document Details
                  </DialogTitle>

                  <DialogContent dividers>
                    {detailsLoading ? (
                      <Box sx={{ py: 5, textAlign: "center" }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }} color="text.secondary">
                          Loading document details...
                        </Typography>
                      </Box>
                    ) : detailsError ? (
                      <Alert severity="error">{detailsError}</Alert>
                    ) : selectedDocument ? (
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Filename
                          </Typography>
                          <Typography sx={{ fontWeight: 700 }}>
                            {selectedDocument.filename}
                          </Typography>

                          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                            Workflow Status
                          </Typography>
                          <Chip
                            label={selectedDocument.workflow_status.replace("_", " ")}
                            color={
                              selectedDocument.workflow_status === "auto_processed"
                                ? "success"
                                : selectedDocument.workflow_status === "approved"
                                  ? "primary"
                                  : selectedDocument.workflow_status === "rejected"
                                    ? "error"
                                    : "warning"
                            }
                            size="small"
                            sx={{
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          />
                        </Box>

                        <Divider />

                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                            AI Summary
                          </Typography>
                          <Typography color="text.secondary">
                            {selectedDocument.analysis.summary}
                          </Typography>
                        </Box>

                        <Divider />

                        <Box>
                          <Typography variant="h6" sx = {{ fontWeight : 700 }} gutterBottom>
                            Extracted Fields
                          </Typography>

                          {selectedDocument.analysis.fields.map((field, index) => (
                            <Box
                              key={`${field.name}-${index}`}
                              sx={{ py: 1.5, borderBottom: "1px solid #EDF0F5" }}
                            >
                              <Typography sx = {{ fontWeight:700 }}>
                                {field.name.replaceAll("_", " ")}
                              </Typography>
                              <Typography>
                                {String(field.value ?? "Not available")}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Confidence: {(field.confidence * 100).toFixed(1)}%
                              </Typography>
                              {field.evidence && (
                                <Typography variant="body2" color="text.secondary">
                                  Evidence: {field.evidence}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>

                        <Divider />

                        <Box>
                          <Typography variant="h6" sx = {{ fontWeight : 700 }} gutterBottom>
                            Validation Results
                          </Typography>

                          <Chip
                            size="small"
                            label={selectedDocument.validation.validation_status.replaceAll(
                              "_",
                              " ",
                            )}
                            color={
                              selectedDocument.validation.validation_status === "valid"
                                ? "success"
                                : "warning"
                            }
                          />

                          {selectedDocument.validation.errors.length > 0 && (
                            <>
                              <Typography sx={{ mt: 2, fontWeight: 700 }}>
                                Errors
                              </Typography>
                              {selectedDocument.validation.errors.map((item, index) => (
                                <Alert severity="error" key={index} sx={{ mt: 1 }}>
                                  {[item.field, item.issue, item.message]
                                    .filter(Boolean)
                                    .join(": ")}
                                </Alert>
                              ))}
                            </>
                          )}

                          {selectedDocument.validation.warnings.length > 0 && (
                            <>
                              <Typography sx={{ mt: 2, fontWeight: 700 }}>
                                Warnings
                              </Typography>
                              {selectedDocument.validation.warnings.map((item, index) => (
                                <Alert severity="warning" key={index} sx={{ mt: 1 }}>
                                  {[item.field, item.issue, item.message]
                                    .filter(Boolean)
                                    .join(": ")}
                                </Alert>
                              ))}
                            </>
                          )}
                        </Box>

                        <Divider />

                        <Box>
                          <Typography variant="h6" sx = {{ fontWeight : 700 }} gutterBottom>
                            Human Review Details
                          </Typography>

                          {selectedDocument.review ? (
                            <Box sx={{ bgcolor: "#F8FAFC", p: 2, borderRadius: 2 }}>
                              {Object.entries(selectedDocument.review).map(([key, value]) => (
                                <Typography key={key} sx={{ mb: 1 }}>
                                  <strong>{key.replaceAll("_", " ")}:</strong>{" "}
                                  {typeof value === "object"
                                    ? JSON.stringify(value)
                                    : String(value ?? "—")}
                                </Typography>
                              ))}
                            </Box>
                          ) : (
                            <Typography color="text.secondary">
                              No human review has been recorded for this document.
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    ) : null}
                  </DialogContent>

                  <DialogActions>
                    <Button
                      onClick={() => {
                        setSelectedDocument(null);
                        setDetailsError(null);
                      }}
                    >
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>

            {/* API Connection Information */}
            <Stack
              direction="row"
              sx={{ alignItems: "center", mt: 3 }}
              spacing={1}
            >
              {backendConnected ? (
                <CloudDoneOutlinedIcon
                  color="success"
                  fontSize="small"
                />
              ) : (
                <ErrorOutlineOutlinedIcon
                  color="error"
                  fontSize="small"
                />
              )}

              <Typography variant="caption" color="text.secondary">
                {backendConnected
                  ? "Connected to IDP-AI FastAPI backend"
                  : "Backend connection unavailable"}
              </Typography>
            </Stack>
            </>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;