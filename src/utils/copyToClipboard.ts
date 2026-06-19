export function copyToClipboard(copyText: string): void {
  navigator.clipboard.writeText(copyText);
}
