import { NextRequest, NextResponse } from "next/server";

type RawPlayer = {
  player_id?: number;
  player_name?: string;
  player_country_flag?: string;
  current_mmr?: number;
  current_lr?: number;
  peak_mmr?: number;
  peak_lr?: number;
  lowest_mmr?: number;
  lowest_lr?: number;
  ranking?: string | number;
  previous_ranking?: string | number;
  percentile?: string | number;
  previous_percentile?: string | number;
  current_division?: string;
  current_class?: string;
  current_emblem?: string;
  total_events?: number;
  wins10?: number;
  loss10?: number;
  win_percentage?: number;
};

let playerNameCache: { expiresAt: number; names: string[] } | null = null;
let playerNamePromise: Promise<string[]> | null = null;

function normalizeCountryCode(code: string) {
  let normalized = code.trim().toUpperCase();
  if (normalized === "UK") normalized = "GB";
  if (!/^[A-Z]{2}$/.test(normalized)) return "";
  return normalized;
}

function countryCodeToEmoji(code: string) {
  const normalized = normalizeCountryCode(code);
  if (!normalized) return "🏳️";

  return normalized
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

function countryCodeToFlagUrl(code: string) {
  const normalized = normalizeCountryCode(code);
  if (!normalized) return "";
  return `https://flagcdn.com/w80/${normalized.toLowerCase()}.png`;
}

function normalizeImageUrl(url: string | undefined) {
  if (!url) return "";
  const value = url.trim();

  if (value.startsWith("https://") || value.startsWith("http://")) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `https://www.mkwlounge.gg${value}`;

  return `https://www.mkwlounge.gg/${value}`;
}

function toRankNumber(value: string | number | undefined) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).replace(/[^\d.-]/g, "");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function pickPlayer(players: RawPlayer[], name: string) {
  const lowerName = name.toLowerCase();

  return (
    players.find((player) => player.player_name?.toLowerCase() === lowerName) ??
    players[0]
  );
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function extractNamesFromCsv(csv: string) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]).map((value) =>
    value.trim().toLowerCase()
  );

  const preferred = [
    "player_name",
    "player",
    "name",
    "lounge_name",
    "loungename",
  ];

  let nameIndex = -1;

  for (const key of preferred) {
    const index = header.indexOf(key);
    if (index >= 0) {
      nameIndex = index;
      break;
    }
  }

  if (nameIndex < 0) {
    nameIndex = header.findIndex(
      (value) => value.includes("player") && !value.includes("id")
    );
  }

  if (nameIndex < 0) return [];

  return lines
    .slice(1)
    .map((line) => parseCsvLine(line)[nameIndex]?.trim() ?? "")
    .filter((name) => name.length >= 2 && name.length <= 40);
}

async function fetchNameCsv(url: string) {
  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: "text/csv,text/plain,*/*" },
    });

    if (!response.ok) return [];
    return extractNamesFromCsv(await response.text());
  } catch {
    return [];
  }
}

async function loadPlayerNameIndex() {
  if (playerNameCache && playerNameCache.expiresAt > Date.now()) {
    return playerNameCache.names;
  }

  if (playerNamePromise) return playerNamePromise;

  playerNamePromise = (async () => {
    const lists = await Promise.all([
      fetchNameCsv("https://mkwlounge.gg/csv/leaderboard_ladder_id_13.csv"),
      fetchNameCsv("https://mkwlounge.gg/csv/leaderboard_ladder_id_12.csv"),
    ]);

    const names = Array.from(new Set(lists.flat()))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    playerNameCache = {
      expiresAt: Date.now() + 5 * 60 * 1000,
      names,
    };

    return names;
  })();

  try {
    return await playerNamePromise;
  } finally {
    playerNamePromise = null;
  }
}

function filterNames(names: string[], query: string) {
  const lowerQuery = query.toLowerCase();

  return names
    .filter((name) => name.toLowerCase().startsWith(lowerQuery))
    .sort((a, b) => a.length - b.length || a.localeCompare(b))
    .slice(0, 8);
}

async function fetchFilteredLeaderboardSuggestions(
  query: string,
  mode: "rt" | "ct"
) {
  const ladderId = mode === "ct" ? "12" : "13";

  try {
    const url = new URL("https://mkwlounge.gg/ladder/index.php");
    url.searchParams.set("hide_unranked", "0");
    url.searchParams.set("ladder_id", ladderId);
    url.searchParams.set("filter", query);
    url.searchParams.set("full", "0");
    url.searchParams.set("page_start", "0");

    const response = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "text/html" },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const lowerQuery = query.toLowerCase();
    const names: string[] = [];

    const rows = html.match(/<tr\b[\s\S]*?<\/tr>/gi) ?? [];

    for (const row of rows) {
      const cells = Array.from(
        row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)
      ).map((match) =>
        match[1]
          .replace(/<[^>]*>/g, " ")
          .replace(/&nbsp;/gi, " ")
          .replace(/&amp;/gi, "&")
          .replace(/&#039;|&#39;/gi, "'")
          .replace(/\s+/g, " ")
          .trim()
      );

      const candidate = cells.find((cell) =>
        cell.toLowerCase().startsWith(lowerQuery)
      );

      if (
        candidate &&
        candidate.length >= 2 &&
        candidate.length <= 40 &&
        !/^\d+(?:\.\d+)?$/.test(candidate)
      ) {
        names.push(candidate);
      }

      if (names.length >= 8) break;
    }

    return filterNames(Array.from(new Set(names)), query);
  } catch {
    return [];
  }
}

async function fetchPlayerResults(mode: "rt" | "ct", name: string) {
  const endpoints = [
    "https://www.mkwlounge.gg/api/ladderplayer.php",
    "https://mkwlounge.gg/api/ladderplayer.php",
  ];

  for (const endpoint of endpoints) {
    try {
      const url = new URL(endpoint);
      url.searchParams.set("ladder_type", mode);
      url.searchParams.set("player_name", name);

      const response = await fetch(url.toString(), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) continue;

      const json = await response.json();
      if (json.status !== "success") continue;

      const results: RawPlayer[] = Array.isArray(json.results)
        ? json.results
        : json.results
          ? [json.results]
          : [];

      if (results.length > 0) return results;
    } catch {
      continue;
    }
  }

  return [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const suggestAll = searchParams.get("suggestAll") === "1";

  if (suggestAll) {
    const names = await loadPlayerNameIndex();

    return NextResponse.json(
      { names },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  }

  const name = searchParams.get("name")?.trim();
  const mode = searchParams.get("mode")?.toLowerCase() === "ct" ? "ct" : "rt";
  const suggest = searchParams.get("suggest") === "1";

  if (!name) {
    return NextResponse.json(
      { error: "Lounge name is required.", suggestions: [] },
      { status: 400 }
    );
  }

  if (suggest) {
    // Always query the live ladder first so recent name changes are reflected.
    const direct = await fetchFilteredLeaderboardSuggestions(name, mode);

    // Refresh the full prefix index in the background for instant local matches.
    void loadPlayerNameIndex();

    return NextResponse.json(
      { suggestions: direct },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  const results = await fetchPlayerResults(mode, name);

  if (results.length === 0) {
    return NextResponse.json(
      { error: "Player not found." },
      { status: 404 }
    );
  }

  const player = pickPlayer(results, name);
  const countryCode = player.player_country_flag ?? "";

  const rankText = [player.current_division, player.current_class]
    .filter(Boolean)
    .join(" / ");

  return NextResponse.json({
    playerId: player.player_id ?? null,
    playerName: player.player_name ?? name,

    countryCode,
    flagEmoji: countryCodeToEmoji(countryCode),
    flagUrl: countryCodeToFlagUrl(countryCode),

    currentMmr: player.current_mmr ?? 0,
    currentLr: player.current_lr ?? 0,

    peakMmr: player.peak_mmr ?? 0,
    peakLr: player.peak_lr ?? 0,
    lowestMmr: player.lowest_mmr ?? 0,
    lowestLr: player.lowest_lr ?? 0,

    ranking: player.ranking ?? "",
    rankNumber: toRankNumber(player.ranking),
    previousRanking: player.previous_ranking ?? "",
    previousRankNumber: toRankNumber(player.previous_ranking),

    percentile: player.percentile ?? "",
    previousPercentile: player.previous_percentile ?? "",

    rankText,
    division: player.current_division ?? "",
    playerClass: player.current_class ?? "",
    emblemUrl: normalizeImageUrl(player.current_emblem),

    totalEvents: player.total_events ?? 0,
    wins10: player.wins10 ?? 0,
    loss10: player.loss10 ?? 0,
    winPercentage: player.win_percentage ?? 0,
  });
}
