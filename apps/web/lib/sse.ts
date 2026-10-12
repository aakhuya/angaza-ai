// EventSource opens a browser connection, so it must go through the
// same origin. next.config.ts proxies /api/* to the backend.
const SSE_BASE = "/api";


export type SseHandler = (event: { type: string; data: unknown }) => void;

export function openMatchStream(matchId: string, onEvent: SseHandler): () => void {
  const url = `${SSE_BASE}/matches/${encodeURIComponent(matchId)}/stream`;
  const source = new EventSource(url, { withCredentials: true });

  const listen = (type: string) => (ev: MessageEvent) => {
    let parsed: unknown = null;
    try { parsed = JSON.parse(ev.data); } catch { /* ignore malformed frames */ }
    onEvent({ type, data: parsed });
  };

  const handlers: Array<[string, (ev: MessageEvent) => void]> = [
    ["event", listen("event")],
    ["state", listen("state")],
    ["insight", listen("insight")],
    ["importance", listen("importance")],
    ["status", listen("status")],
  ];
  for (const [name, fn] of handlers) source.addEventListener(name, fn as EventListener);

  return () => {
    for (const [name, fn] of handlers) source.removeEventListener(name, fn as EventListener);
    source.close();
  };
}
