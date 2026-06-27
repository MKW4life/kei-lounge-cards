import CardClient from "./CardClient";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getValue(
  params: Record<string, string | string[] | undefined>,
  key: string,
  fallback: string
) {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function getNumber(
  params: Record<string, string | string[] | undefined>,
  key: string,
  fallback: number
) {
  const raw = getValue(params, key, String(fallback));
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function color(value: string, fallback: string) {
  if (!value) return fallback;
  return value.startsWith("#") ? value : `#${value}`;
}

function ratingMode(value: string): "MMR" | "LR" | "SWITCH" {
  if (value === "LR") return "LR";
  if (value === "SWITCH") return "SWITCH";
  return "MMR";
}

export default async function CardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const initial = {
    name: getValue(params, "name", "Your Name"),
    lounge: getValue(params, "lounge", ""),
    mode: getValue(params, "mode", "RT") === "CT" ? "CT" : "RT",
    ratingMode: ratingMode(getValue(params, "ratingMode", "MMR")),
    switchSeconds: getNumber(params, "switch", 5),
    flag: getValue(params, "flag", "🇯🇵"),
    flagUrl: getValue(params, "flagUrl", ""),
    mmr: getValue(params, "mmr", "0000"),
    lr: getValue(params, "lr", "0000"),
    rank: getValue(params, "rank", "MKW Lounge"),
    icon: getValue(params, "icon", ""),
    main: color(getValue(params, "main", "ff0000"), "#ff0000"),
    sub: color(getValue(params, "sub", "ffffff"), "#ffffff"),
    modeColor: color(getValue(params, "modeColor", "000000"), "#000000"),
    bg: getValue(params, "bg", ""),
    bgX: getNumber(params, "bgx", 50),
    bgY: getNumber(params, "bgy", 50),
    bgZoom: getNumber(params, "bgz", 120),
    scale: getNumber(params, "scale", 100),
    nameX: getNumber(params, "nx", 36),
    nameY: getNumber(params, "ny", 54),
    nameSize: getNumber(params, "ns", 34),
    scoreX: getNumber(params, "sx", 78),
    scoreY: getNumber(params, "sy", 36),
    scoreSize: getNumber(params, "ss", 42),
    tagX: getNumber(params, "tx", 48),
    tagY: getNumber(params, "ty", 18),
    tagSize: getNumber(params, "ts", 14),
    flagX: getNumber(params, "fx", 28),
    flagY: getNumber(params, "fy", 45),
    flagSize: getNumber(params, "fs", 24),
    iconX: getNumber(params, "ix", 18),
    iconY: getNumber(params, "iy", 35),
    iconSize: getNumber(params, "isz", 68),
    auto: getValue(params, "auto", "1") !== "0",
    refresh: getNumber(params, "refresh", 60),
  } as const;

  return <CardClient initial={initial} />;
}
