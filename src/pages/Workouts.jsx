import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { hiitMachines, defaultPlan } from '../utils/workoutData';
import { api } from '../utils/api';

const typeColor = { push: "#f97316", pull: "#06b6d4", legs: "#10b981", rest: "#8b5cf6" };
const typeLabel = { push: "Push", pull: "Pull", legs: "Legs", rest: "Rest" };
const typeIcon = { push: "💪", pull: "🏋️", legs: "🦵", rest: "🌿" };
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDayItems(day) {
  if (!day) return [];
  if (day.type === "rest") return ["warmup", "walk", "stretch", "foam"];
  return [
      "warmup",
      ...(day.exercises?.map(e => e.id) || []),
      ...(hiitMachines.map(m => m.id)),
      ...(day.abs?.map(a => a.id) || []),
      "cooldown",
  ];
}

export default function Workouts() {
  const location = useLocation();
  const [allDays, setAllDays] = useState([]);
  const [checks, setChecks] = useState({});
  const [selectedDayIdx, setSelectedDayIdx] = useState(null);
  
  const [liveDayPos, setLiveDayPos] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    async function loadData() {
      const plan = await api.getPlan();
      const loadedPlan = plan || defaultPlan;
      setAllDays(loadedPlan);
      
      const d = new Date();
      const dayOfWeek = d.getDay();
      const livePos = dayOfWeek === 0 ? 7 : dayOfWeek;
      setLiveDayPos(livePos);

      const storedChecks = await api.getLogs() || {};
      const storedMeta = await api.getMeta() || {};
      
      const wk = storedMeta.week || 1;
      setCurrentWeek(wk);
      setChecks(storedChecks);
      
      // Check if navigated here from calendar with a specific day
      const params = new URLSearchParams(location.search);
      const dayIdxParam = params.get('dayIdx');
      if (dayIdxParam !== null) {
        const idx = parseInt(dayIdxParam, 10);
        setSelectedDayIdx(idx);
        // Jump to the week that contains this day
        const targetWeek = loadedPlan[idx]?.week;
        if (targetWeek) setCurrentWeek(targetWeek);
      } else {
        // Default select today
        setSelectedDayIdx((wk - 1) * 7 + (livePos - 1));
      }
    }
    loadData();
  }, [location.search]);

  const persistChecks = useCallback(async (newChecks, key, data) => {
    // Optimistic UI update
    setChecks(newChecks);
    
    try {
      // Save specific log or all logs if batch
      if (key && data) {
        await api.saveLog({ check_key: key, ...data });
      } else {
        await api.saveBatchLogs(newChecks);
      }
      
      // Update dashboard historical data
      const storedMeta = await api.getMeta() || {};
      const todayStr = new Date().toLocaleDateString();
      const dayObj = allDays[(currentWeek - 1) * 7 + (liveDayPos - 1)];
      const items = getDayItems(dayObj);
      
      const doneCount = items.filter(id => {
        const val = newChecks[`d${(currentWeek - 1) * 7 + liveDayPos}_${id}`];
        return val && (val === true || val.completed === true);
      }).length;
      
      const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

      let history = storedMeta.history || [];
      const existingIdx = history.findIndex(h => h.date === todayStr);
      if (existingIdx >= 0) {
        history[existingIdx].completion = pct;
      } else {
        history.push({ date: todayStr, completion: pct, name: daysOfWeek[liveDayPos - 1] });
        if (history.length > 7) history = history.slice(-7);
      }
      
      await api.saveMeta({ historyItem: { date: todayStr, completion: pct, name: daysOfWeek[liveDayPos - 1] } });
    } catch(e) {
      console.error(e);
    }
  }, [allDays, currentWeek, liveDayPos]);

  // Log Detailed Value
  const logEntry = useCallback((dayId, itemId, data) => {
    const key = `${dayId}_${itemId}`;
    const next = { ...checks, [key]: { completed: true, ...data } };
    persistChecks(next, key, { completed: true, ...data });
  }, [checks, persistChecks]);

  // Simple toggle for warmup/cooldown/rest
  const toggleSimple = useCallback((dayId, itemId) => {
    const key = `${dayId}_${itemId}`;
    const current = checks[key];
    const isDone = current === true || current?.completed === true;
    const next = { ...checks, [key]: { completed: !isDone } };
    persistChecks(next, key, { completed: !isDone });
  }, [checks, persistChecks]);

  const markAllDone = useCallback((dayId) => {
    const day = allDays.find(d => d.id === dayId);
    if (!day) return;
    const items = getDayItems(day);
    const next = { ...checks };
    items.forEach(id => {
      if (!next[`${dayId}_${id}`]) {
        next[`${dayId}_${id}`] = { completed: true };
      }
    });
    persistChecks(next); // Uses batch save since key/data are omitted
  }, [allDays, checks, persistChecks]);

  const getDayProgress = (dayIdx) => {
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

  if (allDays.length === 0) return null;

  const currentWeekDays = allDays.slice((currentWeek - 1) * 7, currentWeek * 7);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* HEADER */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--bg-tertiary)", padding: "20px 16px" }}>
        <div className="container">
          <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--color-push)", fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>
            WEEK {currentWeek}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Workout Plan</h1>
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--text-secondary)", fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>
          This Week
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, marginBottom: 24 }}>
          {currentWeekDays.map((day, i) => {
            const globalIdx = (currentWeek - 1) * 7 + i;
            const { pct } = getDayProgress(globalIdx);
            const col = typeColor[day.type];
            const isSelected = selectedDayIdx === globalIdx;
            const isLiveDay = liveDayPos === (i + 1);
            const isDone = pct === 100;
            
            return (
              <div key={day.id} onClick={() => setSelectedDayIdx(globalIdx)}
                style={{
                    background: isSelected ? `${col}25` : isDone ? `${col}15` : "var(--bg-secondary)",
                    border: isSelected ? `2px solid ${col}` : isLiveDay ? `2px dashed var(--text-secondary)` : isDone ? `1px solid ${col}60` : "1px solid var(--bg-tertiary)",
                    borderRadius: 12, padding: "10px 4px 8px", cursor: "pointer",
                    textAlign: "center", transition: "all 0.2s",
                    boxShadow: isSelected ? `0 0 14px ${col}40` : "none",
                    position: "relative"
                }}>
                {isLiveDay && <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 10 }}>TODAY</div>}
                <div style={{ fontSize: 11, fontWeight: 800, color: isDone ? col : "var(--text-secondary)", marginBottom: 4 }}>{daysOfWeek[i]}</div>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{isDone ? <CheckCircle2 color={col} size={20} style={{ margin: '0 auto' }} /> : typeIcon[day.type]}</div>
                <div style={{ fontSize: 9, color: isDone ? col : "var(--text-tertiary)", fontWeight: 700, textTransform: 'uppercase' }}>{typeLabel[day.type]}</div>
                {pct > 0 && pct < 100 && <div style={{ fontSize: 10, color: col, marginTop: 4, fontWeight: 800 }}>{pct}%</div>}
              </div>
            );
          })}
        </div>

        {selectedDayIdx !== null && (
          <DayDetail 
            day={allDays[selectedDayIdx]} 
            dayProgress={getDayProgress(selectedDayIdx)}
            checks={checks}
            toggleSimple={toggleSimple}
            logEntry={logEntry}
            markAllDone={markAllDone}
          />
        )}
      </div>
    </div>
  );
}

function DayDetail({ day, dayProgress, checks, toggleSimple, logEntry, markAllDone }) {
  const { pct } = dayProgress;
  const col = typeColor[day.type];
  const isRest = day.type === "rest";

  const getEntry = (id) => checks[`${day.id}_${id}`];

  return (
      <div className="glass-panel fade-in" style={{
          background: `linear-gradient(160deg,${col}14 0%, var(--bg-secondary) 35%)`,
          border: `1px solid ${col}44`,
          borderRadius: 20, padding: "20px",
          marginBottom: 24
      }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                  <div style={{ fontSize: 11, color: col, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                      {daysOfWeek[day.pos - 1]} · {!isRest && `Variant ${day.variant}`}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>
                      {typeIcon[day.type]} {isRest ? "Active Recovery" : day.type === "push" ? "Push Day" : day.type === "pull" ? "Pull Day" : "Legs Day"}
                  </div>
                  {!isRest && <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{day.overload}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: pct === 100 ? col : "var(--text-secondary)", marginBottom: 4 }}>
                    {pct}%
                </div>
                {pct < 100 && (
                  <button onClick={() => markAllDone(day.id)} style={{
                    background: col, color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none'
                  }}>
                    Complete Day
                  </button>
                )}
              </div>
          </div>

          <div style={{ background: "var(--bg-tertiary)", height: 6, borderRadius: 4, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: col, width: `${pct}%`, transition: 'width 0.3s' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isRest ? (
                [
                    { id: "walk", name: "Walk 8,000–10,000 steps", detail: "Outdoors preferred" },
                    { id: "foam", name: "Foam Rolling — full body", detail: "10–15 min" },
                    { id: "stretch", name: "Static Stretching", detail: "30–45s holds, all muscle groups" },
                    { id: "warmup", name: "Hydration + Sleep", detail: "3–4L water · 7–9 hrs sleep" },
                ].map(item => (
                    <SimpleRow key={item.id} entry={getEntry(item.id)} onToggle={() => toggleSimple(day.id, item.id)} name={item.name} detail={item.detail} color={col} />
                ))
            ) : (
                <>
                    <SectionTitle title="Warm-Up" color={col} />
                    <SimpleRow entry={getEntry("warmup")} onToggle={() => toggleSimple(day.id, "warmup")} name="Dynamic stretches + mobility" detail="Arm circles · hip rotations · leg swings · 5 min" color={col} />

                    <SectionTitle title="Strength Training" color={col} />
                    {day.exercises.map((ex, i) => (
                        <LoggableRow key={ex.id} type="strength" entry={getEntry(ex.id)} onSave={(data) => logEntry(day.id, ex.id, data)}
                            name={`${i + 1}. ${ex.name}`} detail={ex.detail} color={col} badge={`${ex.sets || 3} Sets`} templateSets={ex.sets} templateReps={ex.reps} />
                    ))}

                    <SectionTitle title="HIIT (All 3)" color={col} />
                    {hiitMachines.map(m => (
                      <LoggableRow key={m.id} type="cardio" entry={getEntry(m.id)} onSave={(data) => logEntry(day.id, m.id, data)}
                            name={m.name} detail={m.protocol} color={m.color} badge={m.duration} templateSets={m.sets} templateReps={m.reps} />
                    ))}

                    <SectionTitle title="Core" color={col} />
                    {day.abs.map(a => (
                        <SimpleRow key={a.id} entry={getEntry(a.id)} onToggle={() => toggleSimple(day.id, a.id)} name={a.name} detail={a.detail} color={col} />
                    ))}
                    
                    <SectionTitle title="Cool-Down" color={col} />
                    <SimpleRow entry={getEntry("cooldown")} onToggle={() => toggleSimple(day.id, "cooldown")} name="Static stretch + breathing" detail="30–40s holds" color={col} />
                </>
            )}
          </div>
      </div>
  );
}

function SectionTitle({ title, color }) {
  return <div style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: 1, textTransform: 'uppercase', marginTop: 12, marginBottom: 4 }}>{title}</div>;
}

function SimpleRow({ entry, onToggle, name, detail, color, badge }) {
  const isDone = entry === true || entry?.completed === true;
  return (
      <div onClick={onToggle} style={{
          background: isDone ? `${color}15` : "var(--bg-secondary)", border: `1px solid ${isDone ? color + "50" : "var(--bg-tertiary)"}`,
          borderRadius: 12, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s"
      }}>
          <div style={{
              width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: isDone ? color : "transparent",
              border: `2px solid ${isDone ? color : "var(--text-tertiary)"}`, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
              {isDone && <CheckCircle2 size={16} color="#fff" />}
          </div>
          <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: isDone ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: isDone ? "line-through" : "none" }}>{name}</div>
              {detail && <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>{detail}</div>}
          </div>
          {badge && <div style={{ fontSize: 10, color, background: `${color}18`, borderRadius: 6, padding: "4px 8px", fontWeight: 700 }}>{badge}</div>}
      </div>
  );
}

function LoggableRow({ type, entry, onSave, name, detail, color, badge, templateSets, templateReps }) {
  const isDone = entry === true || entry?.completed === true;
  const [expanded, setExpanded] = useState(false);
  
  const defaultUnit = type === 'strength' ? 'kg' : 'km/h';
  
  // Local state for logging sets
  const [sets, setSets] = useState(() => {
    if (entry?.sets) return typeof entry.sets === 'string' ? JSON.parse(entry.sets) : entry.sets;
    if (entry?.val1) return [{ val1: entry.val1, val2: entry.val2 }];
    
    // Initialize from template if no entry exists
    if (templateSets) {
      return Array.from({ length: templateSets }).map(() => ({ val1: templateReps ? String(templateReps) : '', val2: '' }));
    }
    
    return [{ val1: '', val2: '' }]; // Default to 1 empty set
  });

  const [unit, setUnit] = useState(entry?.unit || defaultUnit);

  // Autosave helper
  const saveCurrentState = (currentSets, currentUnit) => {
    const validSets = currentSets.filter(s => s.val1 !== '' || s.val2 !== '');
    if (validSets.length > 0) {
      onSave({ 
        sets: JSON.stringify(validSets), 
        unit: currentUnit, 
        val1: validSets[validSets.length-1].val1, 
        val2: validSets[validSets.length-1].val2,
        completed: true 
      });
    } else {
      onSave({ completed: false, sets: null, unit: currentUnit, val1: null, val2: null });
    }
  };

  const handleAddSet = (e) => {
    e.stopPropagation();
    const newSets = [...sets, { val1: '', val2: '' }];
    setSets(newSets);
    saveCurrentState(newSets, unit);
  };

  const handleRemoveSet = (e, index) => {
    e.stopPropagation();
    const newSets = sets.filter((_, i) => i !== index);
    if (newSets.length === 0) newSets.push({ val1: '', val2: '' }); // keep at least 1 empty
    setSets(newSets);
    saveCurrentState(newSets, unit);
  };

  const updateSet = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const handleBlur = () => {
    saveCurrentState(sets, unit);
  };

  const hasData = sets.some(s => s.val1 !== '' || s.val2 !== '');
  const completedSetsCount = sets.filter(s => s.val1 !== '' || s.val2 !== '').length;

  return (
    <div style={{
      background: isDone ? `${color}15` : "var(--bg-secondary)", 
      border: `1px solid ${isDone ? color + "50" : "var(--bg-tertiary)"}`,
      borderRadius: 12, overflow: 'hidden', transition: "all 0.2s"
    }}>
      {/* Header Row */}
      <div onClick={() => setExpanded(!expanded)} style={{
        padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12
      }}>
        <div style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: isDone ? color : "transparent",
            border: `2px solid ${isDone ? color : "var(--text-tertiary)"}`, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            {isDone && <CheckCircle2 size={16} color="#fff" />}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: isDone ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: isDone ? "line-through" : "none" }}>
              {name}
            </div>
            {detail && <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>{detail}</div>}
            
            {/* Show summary of logged data if collapsed and done */}
            {!expanded && isDone && hasData && (
              <div style={{ fontSize: 12, color, marginTop: 4, fontWeight: 700 }}>
                Logged: {completedSetsCount} Sets
              </div>
            )}
        </div>
        {badge && <div style={{ fontSize: 10, color, background: `${color}18`, borderRadius: 6, padding: "4px 8px", fontWeight: 700 }}>{badge}</div>}
        <div style={{ color: "var(--text-tertiary)" }}>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expanded Logging Area */}
      {expanded && (
        <div style={{ padding: "0 16px 16px 48px", display: 'flex', flexDirection: 'column', gap: 12 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sets.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', width: 40 }}>Set {i + 1}</div>
                
                <input type="number" placeholder={type === 'strength' ? "Reps" : "Time"}
                  value={s.val1} 
                  onChange={(e) => updateSet(i, 'val1', e.target.value)}
                  onBlur={handleBlur}
                  style={{ width: 70, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--bg-tertiary)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
                />
                
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--bg-tertiary)', borderRadius: 8, overflow: 'hidden', flex: 1 }}>
                  <input type="number" placeholder={type === 'strength' ? "Weight" : "Speed"}
                    value={s.val2} 
                    onChange={(e) => updateSet(i, 'val2', e.target.value)}
                    onBlur={handleBlur}
                    style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: 'var(--text-primary)' }} 
                  />
                  {i === 0 && (
                    <select value={unit} onChange={(e) => { setUnit(e.target.value); handleBlur(); }}
                      style={{ padding: '8px', border: 'none', borderLeft: '1px solid var(--bg-tertiary)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', outline: 'none' }}
                    >
                      {type === 'strength' ? (
                        <><option value="kg">kg</option><option value="lbs">lbs</option></>
                      ) : (
                        <><option value="km/h">km/h</option><option value="mph">mph</option><option value="level">Level</option></>
                      )}
                    </select>
                  )}
                  {i > 0 && <div style={{ padding: '8px 12px', borderLeft: '1px solid var(--bg-tertiary)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12 }}>{unit}</div>}
                </div>

                <button onClick={(e) => handleRemoveSet(e, i)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>&times;</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button onClick={handleAddSet} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'transparent', color: color, border: `1px dashed ${color}`, padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13
            }}>
              + Add Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
