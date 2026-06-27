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

  if (value.startsWith("https://") || value.startsWith("http://")) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (value.startsWith("/")) {
    return `https://www.mkwlounge.gg${value}`;
  }

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
    players.find((p) => p.player_name?.toLowerCase() === lowerName) ??
    players[0]
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get("name")?.trim();
  const mode = searchParams.get("mode")?.toLowerCase() === "ct" ? "ct" : "rt";

  if (!name) {
    return NextResponse.json(
      { error: "Lounge name is required." },
      { status: 400 }
    );
  }

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
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) continue;

      const json = await response.json();

      if (json.status !== "success") continue;

      const results: RawPlayer[] = Array.isArray(json.results)
        ? json.results
        : json.results
          ? [json.results]
          : [];

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
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { error: "Could not fetch Lounge player data." },
    { status: 500 }
  );
}