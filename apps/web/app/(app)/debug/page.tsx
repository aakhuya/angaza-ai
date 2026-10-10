import { headers } from "next/headers";

import { API_BASE_URL } from "@/lib/api";
import { getMe } from "@/lib/auth-server";

export default async function DebugPage() {
  const h = await headers();
  const cookieHeader = h.get("cookie");
  const me = await getMe();

  return (
    <div className="space-y-4 font-mono text-xs">
      <h1 className="text-base font-semibold">Auth diagnostics</h1>
      <div>
        <div className="text-text-faint">API_BASE_URL</div>
        <div>{API_BASE_URL}</div>
      </div>
      <div>
        <div className="text-text-faint">Incoming cookie header (Next → browser)</div>
        <div className="break-all">{cookieHeader ?? "(none)"}</div>
      </div>
      <div>
        <div className="text-text-faint">getMe() result</div>
        <div>{me ? JSON.stringify(me) : "null"}</div>
      </div>
    </div>
  );
}
