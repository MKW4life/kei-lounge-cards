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
    sub: color(getValue(params, "sub", "000000"), "#000000"),
    modeColor: color(getValue(params, "modeColor", "ffffff"), "#ffffff"),
    bg: getValue(params, "bg", ""),
    bgX: getNumber(params, "bgx", 60),
    bgY: getNumber(params, "bgy", 67),
    bgZoom: getNumber(params, "bgz", 100),
    scale: getNumber(params, "scale", 100),
    nameX: getNumber(params, "nx", 36),
    nameY: getNumber(params, "ny", 58),
    nameSize: getNumber(params, "ns", 37),
    scoreX: getNumber(params, "sx", 79),
    scoreY: getNumber(params, "sy", 46),
    scoreSize: getNumber(params, "ss", 50),
    tagX: getNumber(params, "tx", 69),
    tagY: getNumber(params, "ty", 19),
    tagSize: getNumber(params, "ts", 14),
    rankTextX: getNumber(params, "rx", 67),
    rankTextY: getNumber(params, "ry", 83),
    rankTextSize: getNumber(params, "rs", 20),
    flagX: getNumber(params, "fx", 22),
    flagY: getNumber(params, "fy", 25),
    flagSize: getNumber(params, "fs", 24),
    iconX: getNumber(params, "ix", 12),
    iconY: getNumber(params, "iy", 26),
    iconSize: getNumber(params, "isz", 60),
    auto: getValue(params, "auto", "1") !== "0",
    refresh: getNumber(params, "refresh", 60),
  } as const;

  return <CardClient initial={initial} />;
}
