import { useEffect, useState } from "react";

export function useMedia(enable: boolean) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      if (!enable) return;
      const s = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      if (active) setStream(s);
    })().catch(console.error);
    return () => {
      active = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [enable]);
  return stream;
}
