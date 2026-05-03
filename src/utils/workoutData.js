export const pushA = [
  { id: "pa1", name: "Flat Barbell Bench Press", detail: "Chest (mid) · elbows 45°",         parts: ["chest","triceps","front_delts"], sets: 4, reps: "8-12", weight: 60,  unit: "kg" },
  { id: "pa2", name: "Incline DB Press",          detail: "Chest (upper) · 15–30° incline",   parts: ["chest","triceps","front_delts"], sets: 3, reps: "10-12",weight: 22,  unit: "kg" },
  { id: "pa3", name: "DB Shoulder Press",          detail: "Shoulders · seated, neutral grip", parts: ["shoulders","triceps"],           sets: 3, reps: "10-12",weight: 18,  unit: "kg" },
  { id: "pa4", name: "Lateral Raises",             detail: "Side delts · lead with elbows",    parts: ["shoulders"],                    sets: 3, reps: "15",    weight: 8,   unit: "kg" },
  { id: "pa5", name: "Tricep Rope Pushdown",       detail: "Triceps · flare at bottom",        parts: ["triceps"],                      sets: 3, reps: "12-15", weight: 25,  unit: "kg" },
  { id: "pa6", name: "Overhead Tricep Extension",  detail: "Long head · elbows close",         parts: ["triceps"],                      sets: 3, reps: "12",    weight: 20,  unit: "kg" },
];
export const pushB = [
  { id: "pb1", name: "DB Bench Press",    detail: "Chest (mid) · full stretch at bottom", parts: ["chest","triceps"],              sets: 4, reps: "10-12",weight: 24,  unit: "kg" },
  { id: "pb2", name: "Cable Chest Fly",   detail: "Chest inner · slight forward lean",    parts: ["chest"],                       sets: 3, reps: "12-15",weight: 15,  unit: "kg" },
  { id: "pb3", name: "Arnold Press",      detail: "All delt heads · full rotation",        parts: ["shoulders","triceps"],          sets: 3, reps: "10-12",weight: 14,  unit: "kg" },
  { id: "pb4", name: "Rear Delt Fly",     detail: "Rear delts · bent over, arms wide",    parts: ["rear_delts","back"],            sets: 3, reps: "15",    weight: 8,   unit: "kg" },
  { id: "pb5", name: "Skull Crushers",    detail: "Triceps · elbows fixed",               parts: ["triceps"],                     sets: 3, reps: "10-12",weight: 20,  unit: "kg" },
  { id: "pb6", name: "Weighted Dips",     detail: "Chest + triceps · slight lean",         parts: ["chest","triceps","lower_chest"],sets: 3, reps: "8-10", weight: 10,  unit: "kg" },
];
export const pullA = [
  { id: "pla1", name: "Pull-ups / Lat Pulldown",    detail: "Lats width · drive elbows down",          parts: ["lats","back","biceps"],         sets: 4, reps: "8-12", weight: 0,  unit: "bw" },
  { id: "pla2", name: "Seated Cable Row",            detail: "Mid back · squeeze scapula",              parts: ["mid_back","lats","biceps"],     sets: 3, reps: "10-12",weight: 55, unit: "kg" },
  { id: "pla3", name: "Single-Arm DB Row",           detail: "Lats + rhomboids · elbow past torso",     parts: ["lats","mid_back","biceps"],     sets: 3, reps: "10-12",weight: 26, unit: "kg" },
  { id: "pla4", name: "Face Pulls",                  detail: "Rear delts · external rotation",          parts: ["rear_delts","traps"],           sets: 3, reps: "15",   weight: 20, unit: "kg" },
  { id: "pla5", name: "Barbell Curl",                detail: "Biceps · no swing",                       parts: ["biceps"],                      sets: 3, reps: "10-12",weight: 30, unit: "kg" },
  { id: "pla6", name: "Hammer Curls",                detail: "Brachialis · alternating neutral grip",   parts: ["biceps","forearms"],            sets: 3, reps: "12",   weight: 12, unit: "kg" },
];
export const pullB = [
  { id: "plb1", name: "Deadlift",                      detail: "Full posterior chain · bar close to shins", parts: ["lower_back","glutes","hamstrings","traps","forearms"], sets: 4, reps: "5-6",  weight: 80, unit: "kg" },
  { id: "plb2", name: "Wide-Grip Lat Pulldown",        detail: "Lats width · lean back slightly",           parts: ["lats","biceps"],                                      sets: 3, reps: "10-12",weight: 55, unit: "kg" },
  { id: "plb3", name: "T-Bar Row",                     detail: "Mid + lower back · full stretch",           parts: ["mid_back","lats","biceps"],                            sets: 3, reps: "10-12",weight: 40, unit: "kg" },
  { id: "plb4", name: "Cable Straight-Arm Pulldown",   detail: "Lats isolation · arms straight",            parts: ["lats"],                                               sets: 3, reps: "12-15",weight: 30, unit: "kg" },
  { id: "plb5", name: "Incline DB Curl",               detail: "Biceps long head · full stretch",           parts: ["biceps"],                                             sets: 3, reps: "10-12",weight: 12, unit: "kg" },
  { id: "plb6", name: "Concentration Curl",            detail: "Biceps peak · elbow on inner knee",         parts: ["biceps"],                                             sets: 3, reps: "12",   weight: 10, unit: "kg" },
];
export const legsA = [
  { id: "la1", name: "Barbell Back Squat",  detail: "Quads + glutes · depth below parallel", parts: ["quads","glutes","core"],      sets: 4, reps: "8-10", weight: 70, unit: "kg" },
  { id: "la2", name: "Romanian Deadlift",   detail: "Hamstrings · hip hinge, flat back",     parts: ["hamstrings","glutes","lower_back"], sets: 3, reps: "10-12",weight: 60, unit: "kg" },
  { id: "la3", name: "Leg Press",           detail: "Quads · don't lock knees",              parts: ["quads","glutes"],             sets: 3, reps: "12",   weight: 100,unit: "kg" },
  { id: "la4", name: "Lying Leg Curl",      detail: "Hamstrings · full contraction",         parts: ["hamstrings","calves"],        sets: 3, reps: "12-15",weight: 35, unit: "kg" },
  { id: "la5", name: "Walking Lunges (DB)", detail: "Quads + glutes · 12/leg",               parts: ["quads","glutes"],             sets: 3, reps: "12",   weight: 16, unit: "kg" },
  { id: "la6", name: "Standing Calf Raises",detail: "Gastrocnemius · full ROM slow",         parts: ["calves"],                    sets: 4, reps: "15-20",weight: 40, unit: "kg" },
];
export const legsB = [
  { id: "lb1", name: "Goblet Squat",          detail: "Quads + core · heels slightly elevated",parts: ["quads","glutes","core"],  sets: 3, reps: "12",   weight: 24, unit: "kg" },
  { id: "lb2", name: "Bulgarian Split Squat", detail: "Quads + glutes · rear foot elevated",   parts: ["quads","glutes"],         sets: 3, reps: "10",   weight: 20, unit: "kg" },
  { id: "lb3", name: "Hack Squat / Smith",    detail: "Quads sweep · feet forward",            parts: ["quads","glutes"],         sets: 4, reps: "10-12",weight: 60, unit: "kg" },
  { id: "lb4", name: "Seated Leg Curl",       detail: "Hamstrings · toes pointed",             parts: ["hamstrings"],             sets: 3, reps: "12-15",weight: 30, unit: "kg" },
  { id: "lb5", name: "Hip Thrust (Barbell)",  detail: "Glutes · full extension at top",        parts: ["glutes","hamstrings"],    sets: 4, reps: "10-12",weight: 70, unit: "kg" },
  { id: "lb6", name: "Seated Calf Raises",    detail: "Soleus · slow stretch, knees 90°",      parts: ["calves"],                 sets: 4, reps: "15-20",weight: 30, unit: "kg" },
];

export const absPool = [
  [
    { id: "ab1",  name: "Plank Hold",       detail: "3×45s · engage glutes",        parts: ["core"],                    sets: 3, reps: "45s",  weight: 0, unit: "bw" },
    { id: "ab2",  name: "Leg Raises",       detail: "3×15 · lower slowly",          parts: ["core","lower_abs"],         sets: 3, reps: "15",   weight: 0, unit: "bw" },
    { id: "ab3",  name: "Crunches",         detail: "3×20 · don't pull neck",       parts: ["core","upper_abs"],         sets: 3, reps: "20",   weight: 0, unit: "bw" },
  ],
  [
    { id: "ab4",  name: "Russian Twists",   detail: "3×20 · with weight plate",     parts: ["core","obliques"],          sets: 3, reps: "20",   weight: 5, unit: "kg" },
    { id: "ab5",  name: "Bicycle Crunches", detail: "3×20 · elbow to knee",         parts: ["core","obliques"],          sets: 3, reps: "20",   weight: 0, unit: "bw" },
    { id: "ab6",  name: "Mountain Climbers",detail: "3×30s · fast pace",            parts: ["core","cardio"],            sets: 3, reps: "30s",  weight: 0, unit: "bw" },
  ],
  [
    { id: "ab7",  name: "V-Ups",            detail: "3×15 · arms and legs meet",    parts: ["core","upper_abs","lower_abs"],sets: 3, reps: "15", weight: 0, unit: "bw" },
    { id: "ab8",  name: "Flutter Kicks",    detail: "3×30s · small fast kicks",     parts: ["core","lower_abs"],         sets: 3, reps: "30s",  weight: 0, unit: "bw" },
    { id: "ab9",  name: "Hollow Body Hold", detail: "3×30s · lower back flat",      parts: ["core"],                    sets: 3, reps: "30s",  weight: 0, unit: "bw" },
  ],
  [
    { id: "ab10", name: "Dead Bug",         detail: "3×10/side · spine neutral",    parts: ["core"],                    sets: 3, reps: "10",   weight: 0, unit: "bw" },
    { id: "ab11", name: "Side Plank",       detail: "3×30s/side · hips up",         parts: ["core","obliques"],          sets: 3, reps: "30s",  weight: 0, unit: "bw" },
    { id: "ab12", name: "Cable Crunches",   detail: "3×20 · round spine fully",     parts: ["core","upper_abs"],         sets: 3, reps: "20",   weight: 15,unit: "kg" },
  ],
];

export const hiitMachines = [
  {
    id: "treadmill", name: "Treadmill HIIT", icon: "🏃", color: "#f97316",
    protocol: "30s sprint (12–14 km/h, incline 2°) + 60s walk",
    rounds: "5 rounds", duration: "~7.5 min", cue: "Push to 85–90% max HR on sprints",
    parts: ["cardio","calves","quads"],
    sets: 5, reps: "30s", unit: "km/h"
  },
  {
    id: "elliptical", name: "Elliptical / Cross Trainer", icon: "⚡", color: "#06b6d4",
    protocol: "40s fast stride (resistance 7–9) + 20s slow recovery",
    rounds: "7 rounds", duration: "~7 min", cue: "Use arm handles — full body push + pull",
    parts: ["cardio","quads","glutes"],
    sets: 7, reps: "40s", unit: "level"
  },
  {
    id: "bike", name: "Stationary Bike", icon: "🚴", color: "#10b981",
    protocol: "20s max sprint (90–100 RPM, high res.) + 40s easy spin",
    rounds: "7 rounds", duration: "~7 min", cue: "Alternate sit/stand each sprint round",
    parts: ["cardio","quads","calves"],
    sets: 7, reps: "20s", unit: "level"
  },
];



export function buildDay(n) {
  const week = Math.ceil(n / 7);
  const pos = ((n - 1) % 7) + 1;

  if (n === 7 || n === 14 || n === 21 || n === 28) {
    return { id: `d${n}`, type: "rest", week, pos };
  }

  const typeMap = { 1: "push", 2: "pull", 3: "legs", 4: "push", 5: "pull", 6: "legs" };
  const varMap  = { 1: "A",    2: "A",    3: "A",    4: "B",    5: "B",    6: "B"    };
  const type    = typeMap[pos];
  const variant = varMap[pos];

  const exercises =
    type === "push" ? (variant === "A" ? pushA : pushB) :
    type === "pull" ? (variant === "A" ? pullA : pullB) :
                      (variant === "A" ? legsA : legsB);

  const abs = absPool[(n - 1) % 4];
  const overload = [
    "Foundation — focus form, moderate weight",
    "Build — add 5% load vs Week 1",
    "Intensify — add 10% load, drop to 6–10 reps",
    "Peak — add 15% load, push strength limits",
  ][week - 1] || "";

  return { id: `d${n}`, type, variant, exercises, abs, week, overload, pos };
}

export const defaultPlan = Array.from({ length: 30 }, (_, i) => buildDay(i + 1));
