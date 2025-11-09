export function isEmoryEmail(value) {
  if (!value) return false;
  const parts = value.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  return parts[1] === 'emory.edu';
}

export function passwordsMatch(p1, p2) {
  return p1 && p2 && p1 === p2 && p1.length >= 8;
}

export function sixDigit(value) {
  return /^\d{6}$/.test(String(value || '').trim());
}
