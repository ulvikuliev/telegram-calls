import { useEffect, useState } from "react";
import { CallClient } from "./web-rts";
import { readStartParam } from "./start-param";

export type WebRTCWindow = Window & {
  Telegram: {
    WebApp: {
      initData: string;
      initDataUnsafe: {
        start_param: string;
      };
    };
  };
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = readStartParam();
      if (!token) throw new Error("No start_param");

      // авторизация по initData — как мы делали ранее
      const initData = (window as unknown as WebRTCWindow)?.Telegram?.WebApp
        ?.initData as string;
      await fetch("/api/auth/telegram", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });

      const res = await fetch("/api/rooms/resolve", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error("Resolve failed");
      const { roomId, iceServers, jwt } = await res.json();

      const client = new CallClient(iceServers, jwt);
      const btn = document.getElementById("start")!;
      btn.addEventListener("click", async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        client.attachLocal(stream);

        client.onRemoteTrack((remote: MediaStream) => {
          const v = document.getElementById("remote") as HTMLVideoElement;
          v.srcObject = remote;
          v.play().catch(() => {});
        });

        client.wireSignaling(roomId);
        client.socket.on("be-initiator", async () => {
          await client.startCall(roomId);
        });
      });

      setReady(true);
    })().catch(console.error);
  }, []);

  return ready ? (
    <div>
      <button id="start">Подключиться</button>
      <video id="remote" playsInline />
    </div>
  ) : null;
}
