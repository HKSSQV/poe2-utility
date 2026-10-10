/**
 * A regex fragment that matches integers greater than or equal to n.
 * Example: 27 → `([3-9]\d|2[7-9]|\d{3,})`, 100 → `([2-9]\d\d|1[1-9]\d|10\d|\d{4,})`
 */
export function atLeast(n: number): string {
  const value = Math.max(0, Math.floor(n));
  if (value === 0) return "\\d+";
  const digits = String(value);
  const len = digits.length;
  const parts: string[] = [];

  // Match numbers with the same digit length that are >= n
  for (let i = 0; i < len; i += 1) {
    const prefix = digits.slice(0, i);
    const d = Number(digits[i]);
    const rest = len - i - 1;
    const tail = "\\d".repeat(rest);
    if (i === len - 1) {
      parts.push(prefix + (d === 9 ? "9" : d === 0 ? "\\d" : `[${d}-9]`) + tail);
    } else if (d < 9) {
      parts.push(prefix + (d + 1 === 9 ? "9" : `[${d + 1}-9]`) + tail);
    }
  }
  // Match numbers with more digits
  parts.push(`\\d{${len + 1},}`);
  return `(${parts.join("|")})`;
}
