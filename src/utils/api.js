// Utility for API requests to the new Express Backend

const BASE_URL = '/api';

export const api = {
  // User
  getUser: async () => {
    const res = await fetch(`${BASE_URL}/user`);
    return res.json();
  },
  saveUser: async (userData) => {
    const res = await fetch(`${BASE_URL}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  // Logs
  getLogs: async () => {
    const res = await fetch(`${BASE_URL}/logs`);
    return res.json(); // Returns dictionary: { 'd1_warmup': {completed: true, val1: ...} }
  },
  saveLog: async (logData) => {
    const res = await fetch(`${BASE_URL}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
    return res.json();
  },
  saveBatchLogs: async (checksObject) => {
    const res = await fetch(`${BASE_URL}/logs/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checks: checksObject })
    });
    return res.json();
  },
  clearLogs: async () => {
    const res = await fetch(`${BASE_URL}/logs/clear`, { method: 'POST' });
    return res.json();
  },

  // Meta (Week, history)
  getMeta: async () => {
    const res = await fetch(`${BASE_URL}/meta`);
    return res.json();
  },
  saveMeta: async (metaData) => {
    const res = await fetch(`${BASE_URL}/meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metaData)
    });
    return res.json();
  },

  // Custom Plan
  getPlan: async () => {
    const res = await fetch(`${BASE_URL}/plan`);
    return res.json();
  },
  savePlan: async (planArray) => {
    const res = await fetch(`${BASE_URL}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planArray })
    });
    return res.json();
  }
};
