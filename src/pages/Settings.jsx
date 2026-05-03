import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, LogOut, Upload, UserCircle, Copy, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { defaultPlan } from '../utils/workoutData';
import { api } from '../utils/api';

// Minimal schema example for ChatGPT prompt
const EXERCISE_SCHEMA = {
  id: "ex1",
  name: "Exercise Name",
  detail: "Form cue · notes",
  parts: ["chest", "triceps"],
  sets: 4,
  reps: "8-12",
  weight: 60,
  unit: "kg"
};

const DAY_SCHEMA = {
  id: "d1",
  type: "push",
  variant: "A",
  week: 1,
  pos: 1,
  overload: "Foundation — focus form, moderate weight",
  exercises: [EXERCISE_SCHEMA],
  abs: [{ id: "ab1", name: "Plank Hold", detail: "3×45s", parts: ["core"], sets: 3, reps: "45s", weight: 0, unit: "bw" }]
};

const CHATGPT_PROMPT = (user) => `You are an expert fitness coach. Generate a 30-day Push/Pull/Legs workout plan JSON for:
- Name: ${user?.name || 'Athlete'}
- Age: ${user?.age || 25}, Weight: ${user?.weight || 75}kg, Height: ${user?.height || 175}cm, BMI: ${user?.bmi || 22}
- Goal: Fat loss + muscle building

Return a valid JSON array of exactly 30 day objects. Each day must follow this schema:
${JSON.stringify(DAY_SCHEMA, null, 2)}

Rules:
- Days 7, 14, 21, 28 are rest days: { "id": "d7", "type": "rest", "week": 1, "pos": 7 }
- Week pattern: Push-A, Pull-A, Legs-A, Push-B, Pull-B, Legs-B, Rest (repeat x4)
- Each non-rest day has 6 exercises in "exercises" and 3 in "abs"
- "parts" must be from: ["chest","lower_chest","triceps","biceps","forearms","shoulders","front_delts","rear_delts","back","lats","mid_back","lower_back","traps","core","upper_abs","lower_abs","obliques","quads","hamstrings","glutes","calves"]
- "unit" must be "kg", "lbs", or "bw" (bodyweight)
- "id" must be unique: "d1"..."d30" for days, and unique per exercise within each day
- Progressively overload weight each week (+5% per week)
- Return ONLY valid JSON, no markdown, no explanations.`;


export default function Settings() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [jsonSuccess, setJsonSuccess] = useState('');
  const [copied, setCopied] = useState('');
  
  // Local profile state for editing
  const [editWeight, setEditWeight] = useState(user?.weight || '');
  const [editHeight, setEditHeight] = useState(user?.height || '');

  useEffect(() => {
    api.getPlan().then(plan => {
      if (plan) setJsonInput(JSON.stringify(plan, null, 2));
    }).catch(err => console.error(err));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateProfile({ weight: parseFloat(editWeight), height: parseFloat(editHeight) });
    alert('Profile updated successfully!');
  };

  const handleJsonUpload = async () => {
    setJsonError(''); setJsonSuccess('');
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed) || parsed.length !== 30) throw new Error('JSON must be an array of exactly 30 days');
      await api.savePlan(parsed);
      setJsonSuccess('Custom workout plan applied successfully! Check dashboard.');
    } catch (err) { setJsonError('Invalid JSON format: ' + err.message); }
  };

  const loadDefaultPlan = () => { setJsonInput(JSON.stringify(defaultPlan, null, 2)); setJsonError(''); setJsonSuccess(''); };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(''), 2500); });
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: 740, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <SettingsIcon color="var(--color-pull)" /> Settings
        </h1>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600
        }}>
          Back to Dashboard
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Profile Section */}
        <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCircle /> My Profile
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--bg-tertiary)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Current BMI</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-push)' }}>
                {user?.bmi || 'N/A'}
              </div>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--bg-tertiary)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Age</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-legs)' }}>
                {user?.age || 'N/A'}
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Weight (kg)</label>
              <input type="number" value={editWeight} onChange={e => setEditWeight(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Height (cm)</label>
              <input type="number" value={editHeight} onChange={e => setEditHeight(e.target.value)} style={{ width: '100%' }} />
            </div>
            <button type="submit" style={{ background: 'var(--color-pull)', color: '#fff', padding: '12px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
              Update
            </button>
          </form>
        </div>

        {/* Weekly Workout JSON Section */}
        <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Upload /> Weekly Workout Plan (JSON)
            </h2>
            <button onClick={loadDefaultPlan} style={{ fontSize: 12, color: 'var(--color-pull)', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}>
              Load Default Template
            </button>
          </div>
          
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Paste a valid JSON array of 30 day objects. This will overwrite your active plan. Until a new valid plan is uploaded, the current one will persist.
          </p>

          <textarea 
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            style={{ 
              width: '100%', 
              height: 200, 
              fontFamily: 'monospace', 
              fontSize: 12,
              marginBottom: 16,
              resize: 'vertical',
              background: '#0d1117'
            }}
            placeholder="[ { 'id': 'd1', 'type': 'push', ... } ]"
          />

          {jsonError && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{jsonError}</div>}
          {jsonSuccess && <div style={{ color: 'var(--color-legs)', fontSize: 13, marginBottom: 16 }}>{jsonSuccess}</div>}

          <button onClick={handleJsonUpload} style={{ background: 'var(--color-push)', color: '#fff', padding: '12px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
            Apply Custom Plan
          </button>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
          padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 20
        }}>
          <LogOut size={18} /> Sign Out
        </button>

        {/* ChatGPT Plan Generator */}
        <div className="glass-panel" style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(245,158,11,0.3)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles color="#f59e0b" size={20} /> Generate Plan with ChatGPT
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Copy the prompt below → paste into ChatGPT → paste the returned JSON into the plan section above.
          </p>

          {/* Schema */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>Exercise JSON Schema (one entry)</div>
              <button onClick={() => handleCopy(JSON.stringify(EXERCISE_SCHEMA, null, 2), 'schema')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: copied === 'schema' ? '#10b981' : 'var(--text-secondary)' }}>
                {copied === 'schema' ? <Check size={12} /> : <Copy size={12} />} {copied === 'schema' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre style={{ background: 'var(--bg-primary)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, padding: 14, fontSize: 11, overflowX: 'auto', color: '#10b981', fontFamily: 'monospace', margin: 0 }}>{JSON.stringify(EXERCISE_SCHEMA, null, 2)}</pre>
          </div>

          {/* Full prompt */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>Full ChatGPT Prompt (personalised to your profile)</div>
              <button onClick={() => handleCopy(CHATGPT_PROMPT(user), 'prompt')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: copied === 'prompt' ? '#10b981' : '#f59e0b', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 800, color: '#000' }}>
                {copied === 'prompt' ? <Check size={13} /> : <Copy size={13} />}
                {copied === 'prompt' ? 'Copied! Now paste in ChatGPT →' : 'Copy Prompt for ChatGPT'}
              </button>
            </div>
            <textarea readOnly value={CHATGPT_PROMPT(user)}
              style={{ width: '100%', height: 200, fontFamily: 'monospace', fontSize: 11, resize: 'vertical', background: '#0d1117', borderRadius: 10, border: '1px solid var(--bg-tertiary)', padding: 12, color: 'var(--text-secondary)' }} />
          </div>

          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, fontSize: 12, color: '#f59e0b' }}>
            💡 After ChatGPT returns the JSON array, paste it in <strong>"Weekly Workout Plan (JSON)"</strong> above and click <strong>Apply Custom Plan</strong>.
          </div>
        </div>
        
      </div>
    </div>
  );
}
