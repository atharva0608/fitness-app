import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, Activity } from 'lucide-react';
import { defaultPlan, hiitMachines } from '../utils/workoutData';
import { api } from '../utils/api';
import BodyMap, { calculateMuscleIntensity } from '../components/BodyMap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';

const typeColor = { push: '#f97316', pull: '#06b6d4', legs: '#10b981', rest: '#8b5cf6' };
const typeLabel = { push: 'Push', pull: 'Pull', legs: 'Legs', rest: 'Rest' };
const typeIcon  = { push: '💪', pull: '🏋️', legs: '🦵', rest: '🌿' };
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDayItems(day) {
  if (!day) return [];
  if (day.type === 'rest') return ['warmup', 'walk', 'stretch', 'foam'];
  return [
    'warmup',
    ...(day.exercises?.map(e => e.id) || []),
    ...(hiitMachines.map(m => m.id)),
    ...(day.abs?.map(a => a.id) || []),
    'cooldown',
  ];
}

function ProgressBar({ pct, color, h = 6 }) {
  return (
    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 99, height: h, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 99,
        width: `${pct}%`,
        background: pct === 100 ? color : `linear-gradient(90deg,${color}99,${color})`,
        transition: 'width 0.5s ease',
        boxShadow: pct > 0 ? `0 0 8px ${color}60` : 'none'
      }} />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allDays, setAllDays]           = useState([]);
  const [checks, setChecks]             = useState({});
  const [liveDayPos, setLiveDayPos]     = useState(1);
  const [currentWeek, setCurrentWeek]   = useState(1);
  const [historicalData, setHistoricalData] = useState([]);
  const [heatmapView, setHeatmapView]   = useState('today');

  useEffect(() => {
    async function loadInitialData() {
      const plan = await api.getPlan();
      const loadedPlan = plan || defaultPlan;
      setAllDays(loadedPlan);

      const d = new Date();
      const dayOfWeek = d.getDay();
      const livePos = dayOfWeek === 0 ? 7 : dayOfWeek;
      setLiveDayPos(livePos);

      loadAndCheckReset(livePos, loadedPlan);
    }
    loadInitialData();
  }, []);

  const loadAndCheckReset = async (livePos) => {
    try {
      const storedChecks = await api.getLogs() || {};
      const storedMeta   = await api.getMeta() || {};

      let currentWk   = storedMeta.week || 1;
      let history      = storedMeta.history || [];
      const lastUpdated = storedMeta.lastUpdated ? new Date(storedMeta.lastUpdated) : new Date();

      const msPerWeek = 1000 * 60 * 60 * 24 * 7;
      const isNewWeek = (new Date() - lastUpdated) > msPerWeek ||
        (new Date().getDay() === 1 && lastUpdated.getDay() !== 1 && (new Date() - lastUpdated) > 1000 * 60 * 60 * 24);

      if (isNewWeek) {
        currentWk = currentWk < 4 ? currentWk + 1 : 1;
        setChecks({});
        await api.clearLogs();
      } else {
        setChecks(storedChecks);
      }

      setCurrentWeek(currentWk);
      setHistoricalData(history);

      await api.saveMeta({ week: currentWk, lastUpdated: new Date().toISOString() });
    } catch (e) {
      console.error('Dashboard API error:', e);
    }
  };

  // ── derived stats ──────────────────────────────────────────────────────────

  const dayProgress = (dayIdx) => {
    const day = allDays[dayIdx];
    if (!day || !day.id) return { done: 0, total: 0, pct: 0 };
    const items = getDayItems(day);
    if (items.length === 0) return { done: 0, total: 0, pct: 0 };
    const dayId = day.id;
    const done = items.filter(id => {
      const v = checks[`${dayId}_${id}`];
      return v === true || v?.completed === true;
    }).length;
    return { done, total: items.length, pct: Math.round((done / items.length) * 100) };
  };

  const completedDays = allDays.reduce((acc, _, i) => dayProgress(i).pct === 100 ? acc + 1 : acc, 0);
  const totalPct      = Math.round((completedDays / 30) * 100);

  let streak = 0;
  for (let i = 29; i >= 0; i--) {
    if (dayProgress(i).pct === 100) streak++;
    else if (streak > 0) break;
  }

  const weekStats = [1, 2, 3, 4].map(w => {
    const idxs = allDays.map((d, i) => d.week === w ? i : -1).filter(i => i >= 0);
    const done = idxs.filter(i => dayProgress(i).pct === 100).length;
    return { week: w, done, total: idxs.length };
  });

  const typeStats = ['push', 'pull', 'legs'].map(t => {
    const idxs = allDays.map((d, i) => d.type === t ? i : -1).filter(i => i >= 0);
    const done  = idxs.filter(i => dayProgress(i).pct === 100).length;
    return { type: t, done, total: idxs.length };
  });

  // HIIT completion across all days
  const hiitStats = hiitMachines.map(m => {
    const totalDays = allDays.filter(d => d.type !== 'rest').length;
    const done = allDays.filter((d, i) => {
      if (d.type === 'rest') return false;
      const v = checks[`${d.id}_${m.id}`];
      return v === true || v?.completed === true;
    }).length;
    return { ...m, done, total: totalDays };
  });

  const currentWeekDays = allDays.slice((currentWeek - 1) * 7, currentWeek * 7);

  if (allDays.length === 0) return <div style={{ color: 'var(--text-secondary)', padding: 40, textAlign: 'center' }}>Loading…</div>;

  return (
    <div>

      {/* ── HEADER ── */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--bg-tertiary)', padding: '16px var(--page-pad)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--color-push)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>
              WEEK {currentWeek} · {user?.name}'S PLAN
            </div>
            <h1 style={{ fontSize: 'clamp(18px,5vw,24px)', fontWeight: 800 }}>Push / Pull / Legs</h1>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              BMI: <strong style={{ color: 'var(--text-primary)' }}>{user?.bmi}</strong> · Age: {user?.age}
            </div>
          </div>
          <button onClick={() => navigate('/settings')} style={{ background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', border: 'none', flexShrink: 0 }}>
            <Settings size={22} />
          </button>
        </div>
      </div>

      <div className="container" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── OVERALL PROGRESS ── */}
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Overall Progress</div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
                {completedDays}<span style={{ fontSize: 14, color: 'var(--text-tertiary)', fontWeight: 400 }}> / 30 days</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: totalPct > 0 ? typeColor.push : 'var(--text-tertiary)' }}>{totalPct}%</div>
              {streak > 0 && <div style={{ fontSize: 11, color: '#f59e0b' }}>🔥 {streak}-day streak</div>}
            </div>
          </div>
          <ProgressBar pct={totalPct} color={typeColor.push} h={8} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['0%', '25%', '50%', '75%', '100%'].map(m => (
              <div key={m} style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{m}</div>
            ))}
          </div>
        </div>

        {/* ── BY WEEK + BY SPLIT ── */}
        <div className="grid-2">

          {/* By Week */}
          <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: 2, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>By Week</div>
            {weekStats.map((w, i) => (
              <div key={w.week} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Week {w.week}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>{w.done}/{w.total}</span>
                </div>
                <ProgressBar pct={Math.round((w.done / (w.total || 1)) * 100)} color={[typeColor.push, typeColor.pull, typeColor.legs, '#8b5cf6'][i]} h={5} />
              </div>
            ))}
          </div>

          {/* By Split + HIIT */}
          <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: 2, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>By Split</div>
            {typeStats.map(s => (
              <div key={s.type} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {typeIcon[s.type]} {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>{s.done}/{s.total}</span>
                </div>
                <ProgressBar pct={Math.round((s.done / (s.total || 1)) * 100)} color={typeColor[s.type]} h={5} />
              </div>
            ))}

            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--bg-tertiary)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>HIIT Machines (all daily)</div>
              {hiitStats.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{m.icon} {m.name.split(' ')[0]}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.done}/{m.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 30-DAY CALENDAR ── */}
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: 2, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>
            30-Day Calendar — tap a day
          </div>

          {/* Week column labels */}
          <div className="calendar-grid" style={{ marginBottom: 4 }}>
            {['W1 D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'].map(l => (
              <div key={l} style={{ fontSize: 9, color: 'var(--text-tertiary)', textAlign: 'center', fontWeight: 700 }}>{l}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {allDays.map((day, i) => {
              const { pct } = dayProgress(i);
              const col    = typeColor[day.type];
              const isDone = pct === 100;
              const isLive = day.id === allDays[(currentWeek - 1) * 7 + (liveDayPos - 1)]?.id;

              return (
                <div key={i}
                  onClick={() => navigate(`/workouts?dayIdx=${i}`)}
                  style={{
                    background:    isDone ? `${col}20` : isLive ? `${col}10` : 'var(--bg-secondary)',
                    border:        isDone ? `1.5px solid ${col}` : isLive ? `1.5px dashed ${col}` : '1px solid var(--bg-tertiary)',
                    borderRadius:  10, padding: '7px 4px 6px', cursor: 'pointer',
                    textAlign:     'center', transition: 'all 0.15s',
                    boxShadow:     isDone ? `0 0 10px ${col}40` : 'none',
                    position:      'relative'
                  }}
                >
                  {/* Progress ring — responsive size */}
                  <svg viewBox="0 0 32 32" width="100%" style={{ maxWidth: 40, display: 'block', margin: '0 auto 2px' }}>
                    <circle cx="16" cy="16" r="13" fill="none" stroke="var(--bg-tertiary)" strokeWidth="2.5" />
                    {pct > 0 && (
                      <circle cx="16" cy="16" r="13" fill="none" stroke={col} strokeWidth="2.5"
                        strokeDasharray={`${(pct / 100) * 81.7} 81.7`}
                        strokeLinecap="round"
                        transform="rotate(-90 16 16)"
                        style={{ transition: 'stroke-dasharray 0.4s' }}
                      />
                    )}
                    <text x="16" y="20" textAnchor="middle" fontSize="10" fontWeight="800"
                      fill={isDone ? col : 'var(--text-tertiary)'}>
                      {isDone ? '✓' : typeIcon[day.type]}
                    </text>
                  </svg>
                  <div style={{ fontSize: 9, fontWeight: 800, color: isDone ? col : 'var(--text-secondary)' }}>D{i + 1}</div>
                  <div style={{ fontSize: 8, color: isDone ? col : 'var(--text-tertiary)', fontWeight: 700 }}>{typeLabel[day.type]}</div>
                  {pct > 0 && pct < 100 && (
                    <div style={{ fontSize: 7, color: col, marginTop: 1 }}>{pct}%</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── OVERALL CONSISTENCY LINE GRAPH ── */}
        {(() => {
          const todayIdx = (currentWeek - 1) * 7 + (liveDayPos - 1);
          const graphData = allDays.map((day, i) => {
            if (day.type === 'rest') return { day: `D${i+1}`, sets: null, pct: null, type: day.type };
            // Count total sets logged for this day
            let totalSets = 0;
            const allItems = [
              ...(day.exercises || []),
              ...(day.abs || []),
              ...(hiitMachines),
            ];
            allItems.forEach(item => {
              const log = checks[`${day.id}_${item.id}`];
              if (!log) return;
              if (log?.sets) {
                const s = typeof log.sets === 'string' ? JSON.parse(log.sets) : log.sets;
                totalSets += Array.isArray(s) ? s.filter(x => x.val1 !== '').length : 0;
              } else if (log === true || log?.completed) {
                totalSets += item.sets || 1;
              }
            });
            return { day: `D${i+1}`, sets: totalSets || null, pct: dayProgress(i).pct, type: day.type };
          });
          const maxSets = Math.max(1, ...graphData.map(d => d.sets || 0));
          const hasSomeData = graphData.some(d => d.sets > 0);

          return (
            <div className="glass-panel" style={{ padding: 20, borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <Activity size={18} color="#06b6d4" /> Overall Consistency
                </h2>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    <span style={{ color: '#06b6d4', fontWeight: 800 }}>{graphData.reduce((a, d) => a + (d.sets || 0), 0)}</span> total sets logged
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>{completedDays}</span> / 30 days done
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>Sets completed per training day · 30-day program</div>

              <div style={{ height: 180, width: '100%' }}>
                {hasSomeData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData} margin={{ top: 10, right: 8, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id="setsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--bg-tertiary)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={9} tickLine={false} axisLine={false}
                        interval={6} tick={{ fill: 'var(--text-tertiary)' }} />
                      <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false}
                        allowDecimals={false} domain={[0, maxSets + 2]} />
                      <Tooltip
                        contentStyle={{ background: 'rgba(10,10,20,0.95)', border: '1px solid var(--bg-tertiary)', borderRadius: 10, fontSize: 12, padding: '8px 12px' }}
                        labelStyle={{ color: '#06b6d4', fontWeight: 800, marginBottom: 4 }}
                        formatter={(val, name, props) => [
                          val ? `${val} sets` : 'Rest / Not started',
                          props.payload.pct ? `${props.payload.pct}% complete` : ''
                        ]}
                      />
                      <ReferenceLine x={`D${todayIdx + 1}`} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5}
                        label={{ value: 'TODAY', position: 'top', fill: '#f59e0b', fontSize: 9, fontWeight: 800 }} />
                      <Area type="monotone" dataKey="sets" stroke="#06b6d4" strokeWidth={2.5}
                        fill="url(#setsGrad)" dot={(props) => {
                          const { cx, cy, payload } = props;
                          if (!payload.sets) return <g key={payload.day} />;
                          const col = typeColor[payload.type] || '#06b6d4';
                          return (
                            <circle key={payload.day} cx={cx} cy={cy} r={payload.pct === 100 ? 5 : 3}
                              fill={col} stroke="var(--bg-primary)" strokeWidth={1.5}
                              style={{ filter: payload.pct === 100 ? `drop-shadow(0 0 4px ${col})` : 'none' }}
                            />
                          );
                        }}
                        activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                        connectNulls={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 28 }}>📈</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Log your first workout to see the graph!</div>
                  </div>
                )}
              </div>

              {/* dot legend */}
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                {['push','pull','legs'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor[t], boxShadow: `0 0 4px ${typeColor[t]}` }} />
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{typeIcon[t]} {typeLabel[t]}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 2, background: '#f59e0b' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Today</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── MUSCLE HEATMAP ── */}
        <div className="glass-panel" style={{ padding: 20, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, margin: 0 }}>Intensity Heatmap</h2>
            <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: 8, padding: 4, border: '1px solid var(--bg-tertiary)' }}>
              {['today', 'week'].map(v => (
                <button key={v}
                  onClick={() => setHeatmapView(v)}
                  style={{
                    background: heatmapView === v ? 'var(--bg-secondary)' : 'transparent',
                    color: heatmapView === v ? '#fff' : 'var(--text-tertiary)',
                    border: 'none', padding: '6px 12px', borderRadius: 6,
                    fontSize: 11, fontWeight: 700, cursor: 'pointer'
                  }}>
                  {v === 'today' ? 'TODAY' : 'THIS WEEK'}
                </button>
              ))}
            </div>
          </div>
          {allDays.length > 0 ? (
            <BodyMap
              muscleIntensity={calculateMuscleIntensity(
                heatmapView === 'today' ? [allDays[(currentWeek - 1) * 7 + (liveDayPos - 1)]] : currentWeekDays,
                checks
              )}
            />
          ) : null}
        </div>

      </div>
    </div>
  );
}
