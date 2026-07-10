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

type FontChoice =
  | "DEFAULT"
  | "OEDO_KANTEIRYU"
  | "YU_GOTHIC"
  | "MEIRYO"
  | "MINCHO"
  | "ARIAL"
  | "IMPACT"
  | "TREBUCHET"
  | "VERDANA"
  | "GEORGIA"
  | "TIMES"
  | "COURIER"
  | "COMIC_SANS";

function fontChoice(value: string): FontChoice {
  const normalized = value.toUpperCase();
  const allowed: FontChoice[] = [
    "DEFAULT",
    "OEDO_KANTEIRYU",
    "YU_GOTHIC",
    "MEIRYO",
    "MINCHO",
    "ARIAL",
    "IMPACT",
    "TREBUCHET",
    "VERDANA",
    "GEORGIA",
    "TIMES",
    "COURIER",
    "COMIC_SANS",
  ];

  return allowed.includes(normalized as FontChoice)
    ? (normalized as FontChoice)
    : "DEFAULT";
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
  const legacyTrackVisible = getValue(params, "vtrack", "1") !== "0";
  const legacyRatingVisible = getValue(params, "vrating", "1") !== "0";

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
    flagUrl: getValue(params, "flagUrl", "https://flagcdn.com/w80/jp.png"),
    mmr: getValue(params, "mmr", "1253"),
    lr: getValue(params, "lr", "770"),
    rank: getValue(params, "rank", "Iron / Low Tier"),
    icon: getValue(params, "icon", "https://i.imgur.com/OwhIiNz.png"),
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
    ratingTextBottom: color(getValue(params, "ratingTextBottom", "ffffff"), "#ffffff"),
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
    textFont: fontChoice(getValue(params, "font", "DEFAULT")),
    cardBgLeft: color(getValue(params, "bgLeft", "000000"), "#000000"),
    cardBgRight: color(getValue(params, "bgRight", "ffffff"), "#ffffff"),
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
    ratingTextSize: getNumber(params, "rts", 15),
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
    showName: getValue(params, "vname", "1") !== "0",
    showRate: getValue(params, "vrate", "1") !== "0",
    showTrackTag: legacyTrackVisible,
    showRatingLabel: legacyRatingVisible,
    showTrackTagText:
      getValue(params, "vtracktext", legacyTrackVisible ? "1" : "0") !== "0",
    showTrackTagBox:
      getValue(params, "vtrackbox", legacyTrackVisible ? "1" : "0") !== "0",
    showRatingLabelText:
      getValue(params, "vratingtext", legacyRatingVisible ? "1" : "0") !== "0",
    showRatingLabelBox:
      getValue(params, "vratingbox", legacyRatingVisible ? "1" : "0") !== "0",
    showRankText: getValue(params, "vrank", "1") !== "0",
    showFlag: getValue(params, "vflag", "1") !== "0",
    showRankIcon: getValue(params, "vicon", "1") !== "0",
    showBackgroundImage: getValue(params, "vbg", "1") !== "0",
    showCardBackground: getValue(params, "vcard", "1") !== "0",
    showCustomImage: getValue(params, "vimage", "1") !== "0",
    customImageUrl: getValue(params, "overlay", ""),
    customImageX: getNumber(params, "ox", 50),
    customImageY: getNumber(params, "oy", 50),
    customImageZ: getNumber(params, "oz", 1),
    customImageSize: getNumber(params, "os", 120),
    customImageGradient: getNumber(params, "ograd", 0),
    overallTransparency: getNumber(params, "opacity", 0),
    auto: getValue(params, "auto", "1") !== "0",
    refresh: getNumber(params, "refresh", 60),
  } as const;

  return <CardClient initial={initial} />;
}
