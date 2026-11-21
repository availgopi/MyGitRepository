
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface ExtractedField {
  name: string;
  value: string | null;
  confidence: number;
  evidence: string;
}

export interface DocumentAnalysis {
  document_type: string;
  summary: string;
  fields: ExtractedField[];
  missing_information: string[];
  requires_human_review: boolean;
}

export interface ValidationResult {
  document_type: string;
  validation_status: string;
  requires_human_review: boolean;
  errors: Array<{
    field: string;
    issue: string;
    message: string;
  }>;
  warnings: Array<{
    field?: string;
    issue?: string;
    message: string;
  }>;
  checked_fields: Array<{
    field: string;
    status: string;
    value?: string;
  }>;
}

export interface WorkflowRecord {
  document_id: string;
  filename: string;
  workflow_status: string;
  created_at: string;
  analysis: DocumentAnalysis;
  validation: ValidationResult;
  review: {
    decision: string;
    reviewer: string;
    comments: string | null;
    reviewed_at: string;
  } | null;
}

export interface WorkflowHistoryResponse {
  count: number;
  documents: WorkflowRecord[];
}

export interface UploadResponse {
  document_id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  status: string;
  message: string;
}

export interface AnalyzeResponse {
  document_id: string;
  status: string;
  analysis: DocumentAnalysis;
  validation: ValidationResult;
}

export interface ReviewRequest {
  decision: "approve" | "reject";
  reviewer: string;
  comments?: string;
}

export interface ReviewResponse {
  document_id: string;
  workflow_status: string;
  review: {
    decision: string;
    reviewer: string;
    comments: string | null;
    reviewed_at: string;
  };
  message: string;
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    let message = `API request failed: HTTP ${response.status}`;

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () =>
    request<{ status: string; service: string }>("/health"),

  reviewQueue: () =>
    request<WorkflowHistoryResponse>(
      "/api/documents/review-queue",
    ),

  workflowHistory: () =>
    request<WorkflowHistoryResponse>(
      "/api/documents/history",
    ),

  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return request<UploadResponse>("/api/documents/upload", {
      method: "POST",
      body: formData,
    });
  },

  analyzeDocument: (documentId: string) =>
    request<AnalyzeResponse>(
      `/api/documents/${encodeURIComponent(documentId)}/analyze`,
      {
        method: "POST",
      },
    ),

  getWorkflow: (documentId: string) =>
    request<WorkflowRecord>(
      `/api/documents/${encodeURIComponent(documentId)}/workflow`,
    ),

  submitReview: (
    documentId: string,
    decision: "approve" | "reject",
    reviewer: string,
    comments?: string,
  ) =>
    request<ReviewResponse>(
      `/api/documents/${encodeURIComponent(documentId)}/review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decision,
          reviewer,
          comments,
        }),
      },
    ),
};