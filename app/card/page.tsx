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

function modeSetting(value: string): "RT" | "CT" {
  return value === "CT" ? "CT" : "RT";
}

function labelShape(value: string): "ROUNDED" | "STAR" | "HEART" {
  const shape = value.toUpperCase();

  if (shape === "STAR") return "STAR";
  if (shape === "HEART") return "HEART";
  return "ROUNDED";
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
    mode: modeSetting(getValue(params, "mode", "RT")),
    ratingMode: ratingMode(getValue(params, "ratingMode", "MMR")),
    ratingSwitchSeconds: getNumber(
      params,
      "ratingSwitch",
      getNumber(params, "switch", 5)
    ),
    flag: getValue(params, "flag", "🇯🇵"),
    flagUrl: getValue(params, "flagUrl", ""),
    mmr: getValue(params, "mmr", "0000"),
    lr: getValue(params, "lr", "0000"),
    rank: getValue(params, "rank", "MKW Lounge"),
    icon: getValue(params, "icon", ""),
    border: color(
      getValue(params, "border", getValue(params, "main", "000000")),
      "#000000"
    ),
    flow: color(getValue(params, "flow", "ffffff"), "#ffffff"),
    flowOn: getValue(params, "flowOn", "1") !== "0",
    flowSpeed: getNumber(params, "flowSpeed", 50),
    flowLength: getNumber(params, "flowLength", 25),
    ratingEffectUseMain: getValue(params, "effectMain", "0") !== "0",
    ratingEffectColor: color(getValue(params, "effectColor", "ffffff"), "#ffffff"),
    tagTop: color(getValue(params, "tagTop", "000000"), "#000000"),
    tagBottom: color(getValue(params, "tagBottom", "ffffff"), "#ffffff"),
    tagTextTop: color(getValue(params, "tagTextTop", "ffffff"), "#ffffff"),
    tagTextBottom: color(getValue(params, "tagTextBottom", "000000"), "#000000"),
    tagBoxGradient: getValue(params, "tagBoxGradient", "0") !== "0",
    tagBoxBalance: getNumber(params, "tagBoxBalance", 50),
    tagTextGradient: getValue(params, "tagTextGradient", "0") !== "0",
    tagTextBalance: getNumber(params, "tagTextBalance", 50),
    ratingTop: color(getValue(params, "ratingTop", "000000"), "#000000"),
    ratingBottom: color(getValue(params, "ratingBottom", "ffffff"), "#ffffff"),
    ratingTextTop: color(getValue(params, "ratingTextTop", "ffffff"), "#ffffff"),
    ratingTextBottom: color(getValue(params, "ratingTextBottom", "ff0000"), "#ff0000"),
    ratingBoxGradient:
      getValue(params, "ratingBoxGradient", "0") !== "0",
    ratingBoxBalance: getNumber(params, "ratingBoxBalance", 50),
    ratingTextGradient:
      getValue(params, "ratingTextGradient", "0") !== "0",
    ratingTextBalance: getNumber(params, "ratingTextBalance", 50),
    textTop: color(getValue(params, "textTop", "ffffff"), "#ffffff"),
    textBottom: color(getValue(params, "textBottom", "000000"), "#000000"),
    textGradient: getValue(params, "textGradient", "0") !== "0",
    textBalance: getNumber(params, "textBalance", 35),
    cardBgLeft: color(getValue(params, "bgLeft", "000000"), "#000000"),
    cardBgRight: color(getValue(params, "bgRight", "ff0000"), "#ff0000"),
    cardBgGradient: getValue(params, "bgGradient", "0") !== "0",
    cardBgBalance: getNumber(params, "bgBalance", 34),
    cardBgOpacity: getNumber(params, "bgOpacity", 30),
    bg: getValue(params, "bg", ""),
    bgX: getNumber(params, "bgx", 60),
    bgY: getNumber(params, "bgy", 50),
    bgZoom: getNumber(params, "bgz", 100),
    scale: getNumber(params, "scale", 100),
    nameX: getNumber(params, "nx", 36),
    nameY: getNumber(params, "ny", 58),
    nameSize: getNumber(params, "ns", 37),
    scoreX: getNumber(params, "sx", 80),
    scoreY: getNumber(params, "sy", 50),
    scoreSize: getNumber(params, "ss", 45),
    ratingBoxX: getNumber(params, "rbx", 90),
    ratingBoxY: getNumber(params, "rby", 81),
    ratingBoxSize: getNumber(params, "rbs", 13),
    ratingTextSize: getNumber(params, "rts", 10),
    ratingTextSpacing: getNumber(params, "rspace", 0),
    labelRadius: getNumber(params, "radius", 10),
    labelShape: labelShape(getValue(params, "shape", "rounded")),
    tagX: getNumber(params, "tx", 70),
    tagY: getNumber(params, "ty", 25),
    tagSize: getNumber(params, "ts", 18),
    tagTextSize: getNumber(params, "tts", getNumber(params, "ts", 18)),
    tagTextSpacing: getNumber(params, "tspace", 0),
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
