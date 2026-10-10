export function summary(entries, month, reservePercent = 20) {
  const selected = entries.filter(e => e.date.startsWith(month));
  const income = selected.filter(e => e.type === 'income').reduce((s,e) => s + e.cents, 0);
  const spent = selected.filter(e => e.type === 'expense').reduce((s,e) => s + e.cents, 0);
  const limit = Math.floor(income * (100 - reservePercent) / 100);
  return {income, spent, limit, remaining:limit-spent, balance:income-spent, reserve:income-limit};
}
