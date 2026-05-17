import { supabase } from './supabase';

// Python FastAPI backend
const API_BASE_URL = 'http://localhost:8000/api';

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${session.access_token}` };
}

// ── CHAT ────────────────────────────────────────────────────────────────────

export async function chatWithAgent(query: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/agent/chat`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── NOTES ───────────────────────────────────────────────────────────────────

export async function addNote(note: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/notes/add-note`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ note })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getNotes() {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/notes/list-notes`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function queryNotes(query: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/notes/query-notes?query=${encodeURIComponent(query)}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── MEMORY ──────────────────────────────────────────────────────────────────

export async function addMemory(memory: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/memory/add-memory`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ memory })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function queryMemory(query: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/memory/query-memory?query=${encodeURIComponent(query)}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── DOCUMENTS ───────────────────────────────────────────────────────────────

export async function uploadDocument(file: File, context: string, type: string) {
  const headers = await getAuthHeader();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('context', context);
  formData.append('type', type);
  const res = await fetch(`${API_BASE_URL}/documents/upload-document`, {
    method: 'POST',
    headers,
    body: formData
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchDocument(query: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/documents/search-document?query=${encodeURIComponent(query)}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getDocuments() {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/documents/list-documents`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── TIMELINE ────────────────────────────────────────────────────────────────

export async function getTimeline() {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/timeline`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addTimelineEvent(event_title: string, description: string, event_date: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/timeline`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_title, description, event_date })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── GOALS ───────────────────────────────────────────────────────────────────

export async function getGoals() {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/goals`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addGoal(goal_title: string, description: string, deadline?: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/goals`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal_title, description, deadline })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateGoalStatus(id: string, status: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── JOURNAL ─────────────────────────────────────────────────────────────────

export async function getJournal() {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/journal`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addJournalEntry(entry_text: string, mood: string, entry_date?: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/journal`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ entry_text, mood, entry_date })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── DASHBOARD ───────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
