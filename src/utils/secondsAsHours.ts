export function secondsAsHours(seconds: number, chars = 2): string {
  const pow = Math.pow(10, chars)
  return `${Math.round(seconds * pow/3600) / pow}`;
}