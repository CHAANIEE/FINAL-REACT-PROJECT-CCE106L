export function formatPesoInput(text) {
  if (!text) return '';

  // Start clean so the sign is never doubled
  const cleaned = text.replace(/₱/g, '');

  return cleaned.replace(/\d[\d,]*(\.\d*)?/g, (match) => {
    const [whole, decimals] = match.replace(/,/g, '').split('.');
    const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `₱${withCommas}${decimals !== undefined ? `.${decimals}` : ''}`;
  });
}