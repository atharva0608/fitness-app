import React, { useState } from 'react';

export const MUSCLE_GROUPS = {
  chest: "Chest", lower_chest: "Lower Chest", triceps: "Triceps", biceps: "Biceps", forearms: "Forearms",
  shoulders: "Shoulders", front_delts: "Front Delts", rear_delts: "Rear Delts", back: "Back", lats: "Lats",
  mid_back: "Mid Back", lower_back: "Lower Back", traps: "Traps", core: "Core", upper_abs: "Upper Abs",
  lower_abs: "Lower Abs", obliques: "Obliques", quads: "Quads", hamstrings: "Hamstrings", glutes: "Glutes",
  calves: "Calves", cardio: "Cardio / Stamina"
};

export function calculateMuscleIntensity(days, checks) {
  const muscleData = {};
  const processItem = (item, dayId) => {
    if (!item.parts) return;
    const log = checks[`${dayId}_${item.id}`];
    if (log === true || log?.completed) {
      let vol = 0, setCount = 0;
      const parsedSets = log?.sets ? (typeof log.sets === 'string' ? JSON.parse(log.sets) : log.sets) : null;
      if (parsedSets?.length > 0) {
        setCount = parsedSets.length;
        parsedSets.forEach(s => { vol += (s.val1 && s.val2) ? parseFloat(s.val1) * parseFloat(s.val2) : parseFloat(s.val1 || 0); });
      } else if (log?.val1 && log?.val2) { vol = parseFloat(log.val1) * parseFloat(log.val2); setCount = 1; }
      else if (log?.val1) { vol = parseFloat(log.val1); setCount = 1; }
      else { vol = 100; setCount = 1; }
      item.parts.forEach(p => {
        if (!muscleData[p]) muscleData[p] = { volume: 0, sets: 0 };
        muscleData[p].volume += vol; muscleData[p].sets += setCount;
      });
    }
  };
  days.forEach(day => {
    if (!day || day.type === 'rest') return;
    day.exercises?.forEach(ex => processItem(ex, day.id));
    day.abs?.forEach(ab => processItem(ab, day.id));
  });
  return muscleData;
}

// ── SVG body silhouette paths ─────────────────────────────────────────────────
// ViewBox per body: "0 0 110 320"

const FRONT_SILHOUETTE = `
  M55,2 C67,2 70,8 70,18 C70,28 65,35 55,35 C45,35 40,28 40,18 C40,8 43,2 55,2 Z
  M49,35 L61,35 L63,44 L47,44 Z
  M30,44 C18,46 10,56 11,72 L14,125 L10,165 L8,168 L14,170 L18,168 L22,130 L24,155 L26,210 L22,255 L20,292 L28,293 L32,255 L36,210 L38,185 L44,185 L46,210 L48,255 L50,295 L60,295 L62,255 L64,210 L66,185 L72,185 L74,210 L78,255 L82,292 L90,293 L88,255 L84,210 L86,155 L88,130 L92,168 L96,170 L102,168 L100,165 L96,125 L99,72 C100,56 92,46 80,44 Z
`;

const BACK_SILHOUETTE = `
  M55,2 C67,2 70,8 70,18 C70,28 65,35 55,35 C45,35 40,28 40,18 C40,8 43,2 55,2 Z
  M49,35 L61,35 L63,44 L47,44 Z
  M30,44 C18,46 10,56 11,72 L14,125 L10,165 L8,168 L14,170 L18,168 L22,130 L24,155 L26,210 L22,255 L20,292 L28,293 L32,255 L36,210 L38,185 L44,185 L46,210 L48,255 L50,295 L60,295 L62,255 L64,210 L66,185 L72,185 L74,210 L78,255 L82,292 L90,293 L88,255 L84,210 L86,155 L88,130 L92,168 L96,170 L102,168 L100,165 L96,125 L99,72 C100,56 92,46 80,44 Z
`;

// Muscle region shapes for front view
const FRONT_MUSCLES = [
  { key: 'traps_f',      parts: ['traps'],                   d: 'M44,42 Q55,37 66,42 L70,56 Q55,52 40,56 Z' },
  { key: 'l_delt',       parts: ['front_delts','shoulders'], d: 'M15,55 C10,58 8,68 12,78 L22,78 L24,56 Z' },
  { key: 'r_delt',       parts: ['front_delts','shoulders'], d: 'M95,55 C100,58 102,68 98,78 L88,78 L86,56 Z' },
  { key: 'chest',        parts: ['chest','lower_chest'],     d: 'M34,50 Q55,44 76,50 L78,74 Q55,78 32,74 Z' },
  { key: 'l_bicep',      parts: ['biceps'],                  d: 'M13,82 L22,80 L24,118 L13,120 Z' },
  { key: 'r_bicep',      parts: ['biceps'],                  d: 'M97,82 L88,80 L86,118 L97,120 Z' },
  { key: 'l_forearm',    parts: ['forearms'],                d: 'M12,124 L22,122 L20,160 L10,162 Z' },
  { key: 'r_forearm',    parts: ['forearms'],                d: 'M98,124 L88,122 L90,160 L100,162 Z' },
  { key: 'upper_abs',    parts: ['core','upper_abs'],        d: 'M34,76 L76,76 L74,104 L36,104 Z' },
  { key: 'lower_abs',    parts: ['core','lower_abs'],        d: 'M36,106 L74,106 L72,126 L38,126 Z' },
  { key: 'l_oblique',    parts: ['obliques'],                d: 'M24,76 L34,76 L38,126 L26,120 Z' },
  { key: 'r_oblique',    parts: ['obliques'],                d: 'M86,76 L76,76 L72,126 L84,120 Z' },
  { key: 'l_quad',       parts: ['quads'],                   d: 'M30,140 L54,138 L52,210 L28,214 Z' },
  { key: 'r_quad',       parts: ['quads'],                   d: 'M80,140 L56,138 L58,210 L82,214 Z' },
  { key: 'l_calf_f',     parts: ['calves'],                  d: 'M29,218 L52,215 L50,275 L27,278 Z' },
  { key: 'r_calf_f',     parts: ['calves'],                  d: 'M81,218 L58,215 L60,275 L83,278 Z' },
];

// Muscle region shapes for back view
const BACK_MUSCLES = [
  { key: 'traps_b',      parts: ['traps'],                   d: 'M36,42 Q55,34 74,42 L80,68 Q55,60 30,68 Z' },
  { key: 'l_rdelt',      parts: ['rear_delts','shoulders'],  d: 'M14,55 C8,58 7,70 12,80 L23,80 L25,56 Z' },
  { key: 'r_rdelt',      parts: ['rear_delts','shoulders'],  d: 'M96,55 C102,58 103,70 98,80 L87,80 L85,56 Z' },
  { key: 'l_tricep',     parts: ['triceps'],                 d: 'M13,84 L24,82 L26,120 L14,122 Z' },
  { key: 'r_tricep',     parts: ['triceps'],                 d: 'M97,84 L86,82 L84,120 L96,122 Z' },
  { key: 'l_forearm_b',  parts: ['forearms'],                d: 'M12,126 L24,123 L22,162 L10,165 Z' },
  { key: 'r_forearm_b',  parts: ['forearms'],                d: 'M98,126 L86,123 L88,162 L100,165 Z' },
  { key: 'l_lat',        parts: ['lats','back','mid_back'],  d: 'M30,68 L50,66 L52,122 L26,128 Q24,100 26,80 Z' },
  { key: 'r_lat',        parts: ['lats','back','mid_back'],  d: 'M80,68 L60,66 L58,122 L84,128 Q86,100 84,80 Z' },
  { key: 'lower_back',   parts: ['lower_back'],              d: 'M38,124 L72,124 L74,144 L36,144 Z' },
  { key: 'glutes',       parts: ['glutes'],                  d: 'M28,148 Q55,140 82,148 L84,194 Q55,200 26,194 Z' },
  { key: 'l_hamstring',  parts: ['hamstrings'],              d: 'M27,197 L53,197 L51,268 L25,272 Z' },
  { key: 'r_hamstring',  parts: ['hamstrings'],              d: 'M83,197 L57,197 L59,268 L85,272 Z' },
  { key: 'l_calf_b',     parts: ['calves'],                  d: 'M26,275 L51,272 L49,310 L24,313 Z' },
  { key: 'r_calf_b',     parts: ['calves'],                  d: 'M84,275 L59,272 L61,310 L86,313 Z' },
];

export default function BodyMap({ muscleIntensity }) {
  const [tooltip, setTooltip] = useState(null);

  const maxVol = Math.max(1, ...Object.values(muscleIntensity).map(m => m.volume));

  const getColor = (parts) => {
    let best = 0;
    let bestKey = null;
    parts.forEach(p => {
      if (muscleIntensity[p]?.volume > best) { best = muscleIntensity[p].volume; bestKey = p; }
    });
    if (!bestKey) return null;
    const ratio = best / maxVol;
    const hue = Math.max(0, 220 - ratio * 220);
    return { fill: `hsl(${hue},80%,52%)`, opacity: 0.75 + ratio * 0.25, glow: `hsl(${hue},80%,52%)`, ratio };
  };

  const handleEnter = (e, parts, label) => {
    const stats = parts.filter(p => muscleIntensity[p]).map(p => ({
      name: MUSCLE_GROUPS[p] || p,
      sets: muscleIntensity[p].sets,
      volume: Math.round(muscleIntensity[p].volume),
    }));
    if (stats.length === 0) return;
    setTooltip({ x: e.clientX, y: e.clientY, stats });
  };

  const renderMuscle = (m) => {
    const col = getColor(m.parts);
    const base = { fill: 'var(--bg-tertiary)', opacity: 0.35, cursor: 'pointer', transition: 'all 0.4s' };
    const active = col ? { fill: col.fill, opacity: col.opacity, filter: `drop-shadow(0 0 6px ${col.glow})`, cursor: 'pointer', transition: 'all 0.4s' } : base;
    return (
      <path key={m.key} d={m.d}
        style={col ? active : base}
        onMouseEnter={(e) => handleEnter(e, m.parts, m.label)}
        onMouseLeave={() => setTooltip(null)}
      />
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x + 14, top: tooltip.y + 14, zIndex: 9999, pointerEvents: 'none',
          background: 'rgba(10,10,20,0.96)', backdropFilter: 'blur(12px)', border: '1px solid var(--bg-tertiary)',
          padding: '10px 14px', borderRadius: 12, minWidth: 140, boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          {tooltip.stats.map(s => (
            <div key={s.name} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 12, marginTop: 2 }}>
                <span>Sets: <b style={{ color: '#fff' }}>{s.sets}</b></span>
                <span>Vol: <b style={{ color: '#fff' }}>{s.volume}</b></span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* FRONT VIEW */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Front</div>
          <svg viewBox="0 0 110 310" width="130" height="295" style={{ overflow: 'visible' }}>
            {/* Body silhouette */}
            <path d={FRONT_SILHOUETTE} fill="var(--bg-tertiary)" opacity="0.5" />
            {/* Muscle overlays */}
            {FRONT_MUSCLES.map(renderMuscle)}
          </svg>
        </div>

        {/* BACK VIEW */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Back</div>
          <svg viewBox="0 0 110 310" width="130" height="295" style={{ overflow: 'visible' }}>
            <path d={BACK_SILHOUETTE} fill="var(--bg-tertiary)" opacity="0.5" />
            {BACK_MUSCLES.map(renderMuscle)}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, gap: 20, fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--bg-tertiary)' }} /> Not trained
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'hsl(220,80%,52%)' }} /> Low
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'hsl(0,80%,52%)' }} /> High
        </div>
      </div>
    </div>
  );
}
