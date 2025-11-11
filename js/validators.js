export function isEmoryEmail(value) {
  if (!value) return false;
  const parts = value.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  return parts[1] === 'emory.edu';
}

export function passwordsMatch(p1, p2) {
  return p1 && p2 && p1 === p2 && p1.length >= 8;
}

export function validUsername(value) {
  // 3–20 letters, numbers, underscore; no leading/trailing underscore doubled
  const v = (value || '').trim();
  if (v.length < 3 || v.length > 20) return false;
  if (!/^[A-Za-z0-9_]+$/.test(v)) return false;
  if (/__/.test(v)) return false;
  const reserved = ['admin','moderator','support','staff','system','eis'];
  if (reserved.includes(v.toLowerCase())) return false;
  return true;
}
