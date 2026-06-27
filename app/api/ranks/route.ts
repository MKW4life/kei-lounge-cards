import { NextRequest, NextResponse } from "next/server";

type BoundaryRaw = {
  ladder_order?: number | string;
  ladder_boundary_name?: string;
  emblem?: string;
};

type ClassRaw = {
  ladder_order?: number | string;
  ladder_class_name?: string;
};

type RankEntry = {
  text: string;
  division: string;
  className: string;
  emblem: string;
};

function toOrder(value: number | string | undefined) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 999999;
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

async function fetchLoungeApi<T>(path: string, mode: "rt" | "ct") {
  const hosts = ["https://www.mkwlounge.gg", "https://mkwlounge.gg"];

  for (const host of hosts) {
    try {
      const url = new URL(`${host}${path}`);
      url.searchParams.set("ladder_type", mode);

      const response = await fetch(url.toString(), {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        continue;
      }

      const json = await response.json();

      if (json?.status !== "success") {
        continue;
      }

      const results = Array.isArray(json.results) ? json.results : [];

      return results as T[];
    } catch {
      continue;
    }
  }

  return [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode")?.toLowerCase() === "ct" ? "ct" : "rt";

  const [boundaryResults, classResults] = await Promise.all([
    fetchLoungeApi<BoundaryRaw>("/api/ladderboundary.php", mode),
    fetchLoungeApi<ClassRaw>("/api/ladderclass.php", mode),
  ]);

  const divisions = boundaryResults
    .map((item) => ({
      order: toOrder(item.ladder_order),
      name: String(item.ladder_boundary_name ?? "").trim(),
      emblem: normalizeImageUrl(item.emblem),
    }))
    .filter((item) => item.name)
    .sort((a, b) => a.order - b.order);

  const classes = classResults
    .map((item) => ({
      order: toOrder(item.ladder_order),
      name: String(item.ladder_class_name ?? "").trim(),
    }))
    .filter((item) => item.name)
    .sort((a, b) => a.order - b.order);

  let ranks: RankEntry[] = [];

  if (divisions.length > 0 && classes.length > 0) {
    ranks = divisions.flatMap((division) =>
      classes.map((rankClass) => ({
        text: `${division.name} / ${rankClass.name}`,
        division: division.name,
        className: rankClass.name,
        emblem: division.emblem,
      }))
    );
  } else if (divisions.length > 0) {
    ranks = divisions.map((division) => ({
      text: division.name,
      division: division.name,
      className: "",
      emblem: division.emblem,
    }));
  }

  return NextResponse.json({
    mode: mode.toUpperCase(),
    available: ranks.length > 0,
    ranks,
  });
}
