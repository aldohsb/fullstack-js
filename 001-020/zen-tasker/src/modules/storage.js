// storage.js — localStorage wrapper (2025) dengan guard & namespace
const NAMESPACE = "zen-tasker";


const safeJSON = {
parse: (raw, fallback) => {
try { return JSON.parse(raw); } catch { return fallback; }
},
stringify: (val) => JSON.stringify(val),
};


export const storage = {
get(key, fallback = null) {
const raw = localStorage.getItem(`${NAMESPACE}:${key}`);
return safeJSON.parse(raw, fallback);
},
set(key, value) {
localStorage.setItem(`${NAMESPACE}:${key}`, safeJSON.stringify(value));
},
remove(key) { localStorage.removeItem(`${NAMESPACE}:${key}`); },
keys() { return Object.keys(localStorage).filter(k => k.startsWith(`${NAMESPACE}:`)); },
};