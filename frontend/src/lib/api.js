// Mimir AI API Client
// Connects strictly to FastAPI backend (http://127.0.0.1:8000)

const API_BASE = "http://127.0.0.1:8000";

export async function indexFolderApi(folderPath) {
  const res = await fetch(`${API_BASE}/index`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder_path: folderPath }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP ${res.status}: Failed to index folder`);
  }
  return await res.json();
}

export async function uploadFilesApi(fileList) {
  const formData = new FormData();
  for (let i = 0; i < fileList.length; i++) {
    formData.append("files", fileList[i]);
  }
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP ${res.status}: Failed to upload and index files`);
  }
  return await res.json();
}

export async function getDocumentsApi() {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP ${res.status}: Failed to fetch documents`);
  }
  return await res.json();
}

export async function searchFilesApi(query, k = 5) {
  const res = await fetch(`${API_BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, k }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP ${res.status}: Search request failed`);
  }
  return await res.json();
}

export async function askMimirApi(query, fileId = null, history = []) {
  const res = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, file_id: fileId, history, k: 4 }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP ${res.status}: Failed to generate answer`);
  }
  return await res.json();
}

export async function getSettingsApi() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP ${res.status}: Failed to load settings`);
  }
  return await res.json();
}

export async function saveSettingsApi(settings) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `HTTP ${res.status}: Failed to save settings`);
  }
  return await res.json();
}
