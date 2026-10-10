export function withTagumCity(text) {
  const value = (text || '').trim().replace(/[,\s]+$/, '');
  if (!value) return '';
  if (/tagum/i.test(value)) return value;
  return `${value}, Tagum City`;
}