export async function authWithInitData(initData: string) {
  const res = await fetch("/api/auth/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Auth failed");
  return res.json(); // { user, jwt }
}
