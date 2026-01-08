// utils/medicalScoring.js

function normalize(val) {
  return val ? String(val).toLowerCase().trim() : "";
}

/* ========== COMMON ========== */
export function viralScore(v) {
  v = normalize(v);
  if (v === "negative") return 0.95;
  if (v === "positive") return 0.3;
  return 0.6;
}

export function cardiacRiskScore(v) {
  v = normalize(v);
  if (v === "good") return 0.85;
  if (v === "average") return 0.65;
  if (v === "poor") return 0.4;
  return 0.6;
}

/* ========== HEART ========== */
export function echoScore(v) {
  v = normalize(v);
  if (v.includes("normal")) return 0.9;
  if (v.includes("eftr")) return 0.7;
  return 0.5;
}

export function angiographyScore(v) {
  v = normalize(v);
  if (v === "no") return 0.9;
  if (v === "yes") return 0.6;
  return 0.7;
}

/* ========== KIDNEY ========== */
export function hlaScore(v) {
  v = normalize(v);
  if (v === "high") return 0.9;
  if (v === "medium") return 0.7;
  return 0.5;
}

export function renalScore(v) {
  v = normalize(v);
  if (v === "normal") return 0.9;
  if (v === "mild") return 0.7;
  return 0.5;
}

/* ========== LIVER ========== */
export function liverFunctionScore(v) {
  v = normalize(v);
  if (v === "normal") return 0.9;
  if (v === "mild") return 0.7;
  return 0.5;
}

/* ========== CORNEA ========== */
export function eyeHealthScore(v) {
  v = normalize(v);
  if (v === "good") return 0.9;
  if (v === "average") return 0.7;
  return 0.5;
}
