import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const API = 'http://localhost:8000/api';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
}

interface JournalEntry {
  id: string;
  entry_text: string;
  mood: string;
  date: string;
}

const MOODS = [
  { label: '😄', value: 'happy' },
  { label: '😐', value: 'neutral' },
  { label: '😔', value: 'sad' },
  { label: '😤', value: 'stressed' },
  { label: '🔥', value: 'motivated' },
  { label: '😴', value: 'tired' },
];

const MOOD_COLORS: Record<string, string> = {
  happy: '#22c55e',
  neutral: '#6366f1',
  sad: '#6b7280',
  stressed: '#ef4444',
  motivated: '#f97316',
  tired: '#8b5cf6',
};

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ entry_text: '', mood: 'neutral', entry_date: '' });
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    const headers = await authHeaders();
    const res = await fetch(`${API}/journal`, { headers });
    const data = await res.json();
    setEntries(data.entries || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const headers = await authHeaders();
    await fetch(`${API}/journal`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ entry_text: '', mood: 'neutral', entry_date: '' });
    setShowForm(false);
    await fetchEntries();
    setSaving(false);
  };

  const deleteEntry = async (id: string) => {
    const headers = await authHeaders();
    await fetch(`${API}/journal/${id}`, { method: 'DELETE', headers });
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const getMoodEmoji = (mood: string) => MOODS.find(m => m.value === mood)?.label || '😐';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Journal</h1>
          <p className="text-gray-400 mt-1">Your personal space to reflect and write</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          + New Entry
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <textarea required
            placeholder="What's on your mind today?"
            value={form.entry_text}
            onChange={e => setForm({ ...form, entry_text: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 rounded-xl text-white text-sm resize-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', outline: 'none' }} />

          {/* Mood Selector */}
          <div>
            <p className="text-gray-400 text-sm mb-2">How are you feeling?</p>
            <div className="flex gap-3 flex-wrap">
              {MOODS.map(m => (
                <button key={m.value} type="button"
                  onClick={() => setForm({ ...form, mood: m.value })}
                  className="px-4 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: form.mood === m.value ? `${MOOD_COLORS[m.value]}30` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${form.mood === m.value ? MOOD_COLORS[m.value] : 'rgba(255,255,255,0.1)'}`,
                    color: form.mood === m.value ? MOOD_COLORS[m.value] : '#9ca3af'
                  }}>
                  {m.label} {m.value}
                </button>
              ))}
            </div>
          </div>

          <input type="date" value={form.entry_date}
            onChange={e => setForm({ ...form, entry_date: e.target.value })}
            className="px-4 py-2 rounded-xl text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', colorScheme: 'dark' }} />

          <button type="submit" disabled={saving}
            className="px-6 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </form>
      )}

      {loading ? <p className="text-gray-400">Loading journal...</p> :
        entries.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-4">📖</p>
            <p>No journal entries yet. Write your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div key={entry.id} className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                    <div>
                      <p className="text-white text-sm font-medium capitalize" style={{ color: MOOD_COLORS[entry.mood] || '#6366f1' }}>
                        {entry.mood}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteEntry(entry.id)} className="text-gray-500 hover:text-red-400 text-xl">×</button>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{entry.entry_text}</p>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
