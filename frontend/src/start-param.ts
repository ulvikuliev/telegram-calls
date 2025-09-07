import type { WebRTCWindow } from "./App";

export function readStartParam(): string | null {
  const telegramWindow = window as unknown as WebRTCWindow;
  const fromSdk = telegramWindow?.Telegram?.WebApp?.initDataUnsafe
    ?.start_param as string | undefined;
  if (fromSdk) return fromSdk;

  const url = new URL(window.location.href);
  return url.searchParams.get("tgWebAppStartParam");
}
