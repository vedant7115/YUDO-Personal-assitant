import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const API = 'http://localhost:8000/api';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
}

interface TimelineEvent {
  id: string;
  event_title: string;
  description: string;
  event_date: string;
}

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ event_title: '', description: '', event_date: '' });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchEvents = async () => {
    const headers = await authHeaders();
    const res = await fetch(`${API}/timeline`, { headers });
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const headers = await authHeaders();
    await fetch(`${API}/timeline`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ event_title: '', description: '', event_date: '' });
    setShowForm(false);
    await fetchEvents();
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const headers = await authHeaders();
    await fetch(`${API}/timeline/${id}`, { method: 'DELETE', headers });
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Life Timeline</h1>
          <p className="text-gray-400 mt-1">Your journey, one event at a time</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
        >
          + Add Event
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-2xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <input
            required
            placeholder="Event Title (e.g. Started internship at XYZ)"
            value={form.event_title}
            onChange={e => setForm({ ...form, event_title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', outline: 'none' }}
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 rounded-xl text-white text-sm resize-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', outline: 'none' }}
          />
          <input
            required
            type="date"
            value={form.event_date}
            onChange={e => setForm({ ...form, event_date: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', colorScheme: 'dark' }}
          />
          <button type="submit" disabled={adding}
            className="px-6 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {adding ? 'Saving...' : 'Save Event'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading timeline...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">🗓️</p>
          <p>No events yet. Add your first life milestone!</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: 'rgba(99,102,241,0.3)' }} />
          <div className="space-y-6">
            {events.map((ev) => (
              <div key={ev.id} className="relative flex gap-6 items-start pl-16">
                <div className="absolute left-4 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', top: '1rem' }}>
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="flex-1 rounded-2xl p-5"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-semibold">{ev.event_title}</h3>
                      {ev.description && <p className="text-gray-400 text-sm mt-1">{ev.description}</p>}
                      <p className="text-indigo-400 text-xs mt-2">
                        {new Date(ev.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(ev.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors text-xl ml-4">×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
