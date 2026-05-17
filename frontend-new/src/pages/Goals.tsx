import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const API = 'http://localhost:8000/api';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
}

interface Goal {
  id: string;
  goal_title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'rgba(234,179,8,0.2)',
  'in-progress': 'rgba(59,130,246,0.2)',
  completed: 'rgba(34,197,94,0.2)'
};
const STATUS_TEXT: Record<string, string> = {
  pending: '#eab308',
  'in-progress': '#3b82f6',
  completed: '#22c55e'
};

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ goal_title: '', description: '', deadline: '' });
  const [adding, setAdding] = useState(false);

  const fetchGoals = async () => {
    const headers = await authHeaders();
    const res = await fetch(`${API}/goals`, { headers });
    const data = await res.json();
    setGoals(data.goals || []);
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const headers = await authHeaders();
    await fetch(`${API}/goals`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, deadline: form.deadline || null })
    });
    setForm({ goal_title: '', description: '', deadline: '' });
    setShowForm(false);
    await fetchGoals();
    setAdding(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const headers = await authHeaders();
    await fetch(`${API}/goals/${id}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setGoals(prev => prev.map(g => g.id === id ? { ...g, status: status as Goal['status'] } : g));
  };

  const deleteGoal = async (id: string) => {
    const headers = await authHeaders();
    await fetch(`${API}/goals/${id}`, { method: 'DELETE', headers });
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const counts = {
    pending: goals.filter(g => g.status === 'pending').length,
    'in-progress': goals.filter(g => g.status === 'in-progress').length,
    completed: goals.filter(g => g.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals Tracker</h1>
          <p className="text-gray-400 mt-1">Track your ambitions and progress</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          + Add Goal
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {(['pending', 'in-progress', 'completed'] as const).map(s => (
          <div key={s} className="rounded-2xl p-4 text-center"
            style={{ background: STATUS_COLORS[s], border: `1px solid ${STATUS_TEXT[s]}30` }}>
            <p className="text-2xl font-bold" style={{ color: STATUS_TEXT[s] }}>{counts[s]}</p>
            <p className="text-sm text-gray-400 capitalize mt-1">{s}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-2xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <input required placeholder="Goal Title"
            value={form.goal_title} onChange={e => setForm({ ...form, goal_title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', outline: 'none' }} />
          <textarea placeholder="Description (optional)" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
            className="w-full px-4 py-3 rounded-xl text-white text-sm resize-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', outline: 'none' }} />
          <input type="date" value={form.deadline}
            onChange={e => setForm({ ...form, deadline: e.target.value })}
            placeholder="Deadline (optional)"
            className="w-full px-4 py-3 rounded-xl text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', outline: 'none', colorScheme: 'dark' }} />
          <button type="submit" disabled={adding}
            className="px-6 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {adding ? 'Saving...' : 'Save Goal'}
          </button>
        </form>
      )}

      {loading ? <p className="text-gray-400">Loading goals...</p> :
        goals.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-4">🎯</p>
            <p>No goals yet. Set your first goal!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id} className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{goal.goal_title}</h3>
                    {goal.description && <p className="text-gray-400 text-sm mt-1">{goal.description}</p>}
                    {goal.deadline && (
                      <p className="text-gray-500 text-xs mt-2">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={goal.status}
                      onChange={e => updateStatus(goal.id, e.target.value)}
                      className="text-xs px-3 py-1 rounded-lg border-0 cursor-pointer"
                      style={{ background: STATUS_COLORS[goal.status], color: STATUS_TEXT[goal.status], colorScheme: 'dark' }}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button onClick={() => deleteGoal(goal.id)} className="text-gray-500 hover:text-red-400 text-xl">×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
