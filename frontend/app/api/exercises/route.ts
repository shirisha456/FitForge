import { authedBackendFetch, toNextResponse } from "@/lib/auth/authedFetch";

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  const result = await authedBackendFetch(`/v1/exercises${search}`);
  return toNextResponse(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await authedBackendFetch("/v1/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return toNextResponse(result);
}
