export function assertHttpsUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: "${url}"`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(
      `Blocked non-HTTPS protocol: "${parsed.protocol}" in URL "${url}"`,
    );
  }
}
