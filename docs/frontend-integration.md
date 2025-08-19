# API Frontend Integration Guide

## Getting Started

This guide explains how to integrate with the Forge API from your frontend application.

## Authentication Flow

1. Get a Forge token:

```typescript
async function getForgeToken() {
  const response = await fetch("http://localhost:8081/token");
  const { success, data } = await response.json();

  if (!success) throw new Error("Failed to get token");
  return data.access_token;
}
```

## Common Operations

### List Models

```typescript
async function listModels(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:8081/api/models?${params}`);
  const { success, data } = await response.json();

  if (!success) throw new Error("Failed to list models");
  return data;
}
```

### Upload IFC File

```typescript
async function uploadIFC(file: File, name: string, description?: string) {
  const formData = new FormData();
  formData.append("ifcFile", file);
  formData.append("name", name);
  if (description) formData.append("description", description);

  const response = await fetch("http://localhost:8081/api/models/ifc/upload", {
    method: "POST",
    body: formData,
  });

  const { success, data } = await response.json();
  if (!success) throw new Error("Upload failed");
  return data;
}
```

### Monitor Upload Status

```typescript
async function checkUploadStatus(modelId: string) {
  const response = await fetch(
    `http://localhost:8081/api/models/ifc/status/${modelId}`
  );
  const { success, data } = await response.json();

  if (!success) throw new Error("Failed to check status");
  return data;
}
```

### Get Viewer URN

```typescript
async function getViewerURN(modelId: string) {
  const response = await fetch(
    `http://localhost:8081/api/viewer-urn/${modelId}`
  );
  const { success, data } = await response.json();

  if (!success) throw new Error("Failed to get URN");
  return data.urn;
}
```

## Error Handling

All endpoints follow the same error pattern. Here's a helper to handle errors:

```typescript
async function handleApiResponse(response: Response) {
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Unknown error");
  }

  return data.data;
}
```

## Example: Complete Upload Flow

```typescript
async function handleModelUpload(file: File, name: string) {
  try {
    // 1. Upload the file
    const uploadResult = await uploadIFC(file, name);
    const modelId = uploadResult.id;

    // 2. Monitor status until complete
    const checkStatus = async () => {
      const status = await checkUploadStatus(modelId);

      if (status.status === "error") {
        throw new Error(status.message);
      }

      if (status.status !== "success") {
        setTimeout(checkStatus, 2000); // Check again in 2 seconds
        return;
      }

      // 3. Get viewer URN when complete
      const urn = await getViewerURN(modelId);
      return urn;
    };

    return checkStatus();
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}
```

## TypeScript Interfaces

```typescript
interface Model {
  _id: string;
  name: string;
  fileName: string;
  urn: string;
  base64Urn: string;
  status: "pending" | "uploading" | "processing" | "success" | "error";
  progress: string;
  fileType: string;
  fileSize: number;
  description?: string;
  tags: string[];
  uploadDate: string;
  metadata: Record<string, any>;
}

interface UploadStatus {
  id: string;
  status: Model["status"];
  progress: string;
  message?: string;
  urn?: string;
}

interface ViewerURN {
  id: string;
  name: string;
  fileName: string;
  urn: string;
  status: string;
}
```

## Best Practices

1. Always handle errors gracefully
2. Implement retries for network failures
3. Show upload progress to users
4. Cache tokens appropriately
5. Validate file types before upload
6. Show meaningful error messages to users
