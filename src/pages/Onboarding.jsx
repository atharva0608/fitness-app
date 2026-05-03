import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle } from 'lucide-react';

export default function Onboarding() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      weight: parseFloat(weight),
      height: parseFloat(height),
      age: parseInt(age, 10)
    });
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="glass-panel fade-in" style={{ padding: 40, borderRadius: 24, width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <UserCircle size={48} color="var(--color-legs)" style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Profile Setup</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Let's calculate your BMI</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Weight (kg)</label>
            <input
              type="number"
              style={{ width: '100%' }}
              placeholder="e.g. 75"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              min="30"
              max="300"
              step="0.1"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Height (cm)</label>
            <input
              type="number"
              style={{ width: '100%' }}
              placeholder="e.g. 180"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
              min="100"
              max="250"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Age</label>
            <input
              type="number"
              style={{ width: '100%' }}
              placeholder="e.g. 25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              min="10"
              max="120"
            />
          </div>
          
          <button type="submit" style={{
            background: 'var(--color-legs)',
            color: '#fff',
            padding: 14,
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            marginTop: 12,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={e => e.target.style.opacity = 0.9}
          onMouseOut={e => e.target.style.opacity = 1}>
            Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
