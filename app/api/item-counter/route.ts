import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  DEFAULT_STATE,
  ITEM_IDS,
  type CounterState,
  type ItemId,
  normalizeState,
} from "../../item-counter/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BlobAuth = {
  token: string;
  storeId: string;
};

type VercelRequestContext = {
  headers?: Record<string, string>;
};

const VERCEL_REQUEST_CONTEXT = Symbol.for("@vercel/request-context");

function getRequestContextOidcToken(): string | undefined {
  const scopedGlobal = globalThis as typeof globalThis & {
    [VERCEL_REQUEST_CONTEXT]?: {
      get?: () => VercelRequestContext;
    };
  };

  const contextToken =
    scopedGlobal[VERCEL_REQUEST_CONTEXT]?.get?.().headers?.[
      "x-vercel-oidc-token"
    ];

  const envToken = process.env.VERCEL_OIDC_TOKEN;

  const token = (contextToken ?? envToken)?.trim();
  return token || undefined;
}

type StateRead = {
  state: CounterState;
  etag: string | null;
  exists: boolean;
};

type RedisConfig = {
  url: string;
  token: string;
};

function getRedisConfig(): RedisConfig | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim();

  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

function redisKey(key: string): string {
  return `mkw:item-counter:${createHash("sha256").update(key).digest("hex")}`;
}

async function redisCommand(
  config: RedisConfig,
  command: Array<string | number>
): Promise<unknown> {
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = (await response.text()).replace(/\s+/g, " ").slice(0, 180);
    throw new Error(
      `redis_${response.status}${detail ? `_${detail}` : ""}`
    );
  }

  const body = (await response.json()) as {
    result?: unknown;
    error?: string;
  };

  if (body.error) {
    throw new Error(`redis_error_${body.error}`);
  }

  return body.result;
}

function getBlobAuth(): BlobAuth {
  const readWriteToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (readWriteToken) {
    const storeId = readWriteToken.split("_")[3]?.trim();
    if (!storeId) {
      throw new Error("storage_not_configured");
    }
    return { token: readWriteToken, storeId };
  }

  const oidcToken = getRequestContextOidcToken();
  const rawStoreId = process.env.BLOB_STORE_ID?.trim();
  const storeId = rawStoreId?.startsWith("store_")
    ? rawStoreId.slice("store_".length)
    : rawStoreId;
  if (oidcToken && storeId) {
    return { token: oidcToken, storeId };
  }

  throw new Error("storage_not_configured");
}

function validateKey(value: string | null): string {
  const key = value?.trim() ?? "";
  if (!/^[A-Za-z0-9_-]{24,160}$/.test(key)) {
    throw new Error("invalid_key");
  }
  return key;
}

function blobPath(key: string): string {
  const digest = createHash("sha256").update(key).digest("hex");
  return `mkw-item-counter/${digest}.json`;
}

function blobUrl(auth: BlobAuth, path: string): string {
  return `https://${auth.storeId}.private.blob.vercel-storage.com/${path}`;
}

async function readState(key: string): Promise<StateRead> {
  const redis = getRedisConfig();
  if (redis) {
    const raw = await redisCommand(redis, ["GET", redisKey(key)]);
    if (typeof raw !== "string" || !raw) {
      return {
        state: structuredClone(DEFAULT_STATE),
        etag: null,
        exists: false,
      };
    }

    return {
      state: normalizeState(JSON.parse(raw)),
      etag: null,
      exists: true,
    };
  }

  const auth = getBlobAuth();
  const path = blobPath(key);
  const url = new URL(blobUrl(auth, path));
  url.searchParams.set("cache", "0");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return {
      state: structuredClone(DEFAULT_STATE),
      etag: null,
      exists: false,
    };
  }

  if (!response.ok) {
    const detail = (await response.text()).replace(/\s+/g, " ").slice(0, 180);
    throw new Error(
      `blob_read_${response.status}${detail ? `_${detail}` : ""}`
    );
  }

  const parsed = normalizeState(await response.json());
  return {
    state: parsed,
    etag: response.headers.get("etag"),
    exists: true,
  };
}

async function writeState(
  key: string,
  state: CounterState,
  etag: string | null,
  exists: boolean
): Promise<"ok" | "retry"> {
  const redis = getRedisConfig();
  if (redis) {
    await redisCommand(redis, [
      "SET",
      redisKey(key),
      JSON.stringify(state),
    ]);
    return "ok";
  }

  const auth = getBlobAuth();
  const path = blobPath(key);
  const headers: Record<string, string> = {
    authorization: `Bearer ${auth.token}`,
    "content-type": "application/json; charset=utf-8",
    "x-content-type": "application/json; charset=utf-8",
    "x-vercel-blob-store-id": auth.storeId,
    "x-api-version": "12",
    "x-api-blob-request-id": `${auth.storeId}:${Date.now()}:${randomUUID()}`,
    "x-api-blob-request-attempt": "0",
    "x-vercel-blob-access": "private",
    "x-add-random-suffix": "0",
    "x-allow-overwrite": exists ? "1" : "0",
  };

  if (etag) {
    headers["x-if-match"] = etag;
    headers["x-allow-overwrite"] = "1";
  }

  const endpoint = new URL("https://vercel.com/api/blob/");
  endpoint.searchParams.set("pathname", path);

  const response = await fetch(endpoint, {
    method: "PUT",
    headers,
    body: JSON.stringify(state),
    cache: "no-store",
  });

  if (response.ok) return "ok";
  if (response.status === 409 || response.status === 412) return "retry";

  const detail = (await response.text()).replace(/\s+/g, " ").slice(0, 180);
  throw new Error(
    `blob_write_${response.status}${detail ? `_${detail}` : ""}`
  );
}

function isItemId(value: unknown): value is ItemId {
  return (
    typeof value === "string" &&
    (ITEM_IDS as readonly string[]).includes(value)
  );
}

function applyAction(
  state: CounterState,
  payload: Record<string, unknown>
): CounterState {
  const next = normalizeState(state);
  const action = String(payload.action ?? "");
  const id = payload.id;

  switch (action) {
    case "delta": {
      if (!isItemId(id)) throw new Error("invalid_item");
      const amount = Number(payload.amount);
      if (!Number.isFinite(amount) || Math.abs(amount) > 1000) {
        throw new Error("invalid_amount");
      }
      next.items[id].count = Math.max(
        0,
        Math.floor(next.items[id].count + amount)
      );
      break;
    }
    case "hotkeyIncrement": {
      const index = Math.floor(Number(payload.index));
      if (!Number.isFinite(index) || index < 1 || index > 7) {
        throw new Error("invalid_hotkey_index");
      }
      const hotkeyId = next.order[index - 1];
      if (!hotkeyId) throw new Error("invalid_hotkey_index");
      next.items[hotkeyId].count = Math.max(
        0,
        Math.floor(next.items[hotkeyId].count + 1)
      );
      break;
    }
    case "setCount": {
      if (!isItemId(id)) throw new Error("invalid_item");
      const count = Number(payload.count);
      if (!Number.isFinite(count) || count < 0 || count > 999999) {
        throw new Error("invalid_count");
      }
      next.items[id].count = Math.floor(count);
      break;
    }
    case "setVisible": {
      if (!isItemId(id)) throw new Error("invalid_item");
      next.items[id].visible = Boolean(payload.visible);
      break;
    }
    case "setOrder": {
      if (!Array.isArray(payload.order)) throw new Error("invalid_order");
      const order: ItemId[] = [];
      for (const value of payload.order) {
        if (isItemId(value) && !order.includes(value)) order.push(value);
      }
      for (const itemId of ITEM_IDS) {
        if (!order.includes(itemId)) order.push(itemId);
      }
      next.order = order;
      break;
    }
    case "reset": {
      if (!isItemId(id)) throw new Error("invalid_item");
      next.items[id].count = 0;
      break;
    }
    case "resetAll": {
      for (const itemId of ITEM_IDS) next.items[itemId].count = 0;
      break;
    }
    default:
      throw new Error("invalid_action");
  }

  next.updatedAt = Date.now();
  return next;
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "unknown_error";
  const status =
    message === "storage_not_configured"
      ? 503
      : message === "invalid_key" ||
          message === "invalid_item" ||
          message === "invalid_amount" ||
          message === "invalid_count" ||
          message === "invalid_order" ||
          message === "invalid_hotkey_index" ||
          message === "invalid_action"
        ? 400
        : 500;

  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function GET(request: Request) {
  try {
    const key = validateKey(new URL(request.url).searchParams.get("key"));
    const { state } = await readState(key);
    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const key = validateKey(new URL(request.url).searchParams.get("key"));
    const payload = (await request.json()) as Record<string, unknown>;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const current = await readState(key);
      const next = applyAction(current.state, payload);
      const result = await writeState(
        key,
        next,
        current.etag,
        current.exists
      );
      if (result === "ok") {
        return NextResponse.json(next, {
          headers: { "Cache-Control": "no-store" },
        });
      }
    }

    throw new Error("write_conflict");
  } catch (error) {
    return errorResponse(error);
  }
}
