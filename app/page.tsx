"use client";

import RollingNumber from "@/components/RollingNumber";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type PreviewEffect = "win" | "loss" | "rank-up" | "rank-down" | null;
type RatingMode = "MMR" | "LR" | "SWITCH";
type ModeSetting = "RT" | "CT";
type LabelShape = "ROUNDED" | "STAR" | "HEART";
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
type ActiveMode = "RT" | "CT";
type ActiveRating = "MMR" | "LR";
type RankEffectStyle =
  | "CLASSIC"
  | "FLASH"
  | "SLIDE"
  | "BURST"
  | "STARLIGHT"
  | "METEOR";
type RatingSwitchEffectStyle = "WAVE" | "FADE" | "FLIP" | "GLITCH";

type PreviewScoreBump = {
  rating: ActiveRating;
  diff: number;
} | null;

type RankEntry = {
  text: string;
  division: string;
  className: string;
  emblem: string;
};

type RankApiResponse = {
  mode: ModeSetting;
  available: boolean;
  ranks: RankEntry[];
};

type PreviewRank = {
  text: string;
  emblem: string;
};

type Settings = {
  loungeName: string;
  displayName: string;
  mode: ModeSetting;

  ratingMode: RatingMode;
  ratingSwitchSeconds: number;
  season: string;

  flag: string;
  flagUrl: string;

  mmr: string;
  lr: string;

  rankText: string;
  rankIconUrl: string;

  borderColor: string;
  flowColor: string;
  flowEnabled: boolean;
  flowSpeed: number;
  flowLength: number;
  ratingEffectUseMainColor: boolean;
  ratingEffectColor: string;
  rankEffectStyle: RankEffectStyle;
  ratingSwitchEffectStyle: RatingSwitchEffectStyle;
  tagTopColor: string;
  tagBottomColor: string;
  tagTextTopColor: string;
  tagTextBottomColor: string;
  tagBoxGradientEnabled: boolean;
  tagBoxGradientBalance: number;
  tagTextGradientEnabled: boolean;
  tagTextGradientBalance: number;

  ratingBoxTopColor: string;
  ratingBoxBottomColor: string;
  ratingTextTopColor: string;
  ratingTextBottomColor: string;
  ratingBoxGradientEnabled: boolean;
  ratingBoxGradientBalance: number;
  ratingTextGradientEnabled: boolean;
  ratingTextGradientBalance: number;

  textTopColor: string;
  textBottomColor: string;
  textGradientEnabled: boolean;
  textGradientBalance: number;
  textFont: FontChoice;
  textShadowEnabled: boolean;
  textShadowColor: string;
  textShadowX: number;
  textShadowY: number;
  textShadowBlur: number;
  textShadowOpacity: number;
  cardBgLeft: string;
  cardBgRight: string;
  cardBgGradientEnabled: boolean;
  cardBgGradientBalance: number;
  cardBgOpacity: number;
  bgUrl: string;

  bgX: number;
  bgY: number;
  bgZoom: number;
  cardScale: number;

  nameX: number;
  nameY: number;
  nameSize: number;
  nameTextSpacing: number;

  scoreX: number;
  scoreY: number;
  scoreSize: number;
  scoreTextSpacing: number;

  ratingBoxX: number;
  ratingBoxY: number;
  ratingBoxSize: number;
  ratingTextSize: number;
  ratingTextSpacing: number;
  labelRadius: number;
  labelShape: LabelShape;

  tagX: number;
  tagY: number;
  tagSize: number;
  tagTextSize: number;
  tagTextSpacing: number;

  rankTextX: number;
  rankTextY: number;
  rankTextSize: number;

  flagX: number;
  flagY: number;
  flagSize: number;

  rankIconX: number;
  rankIconY: number;
  rankIconSize: number;

  showName: boolean;
  showRate: boolean;
  showTrackTag: boolean;
  showRatingLabel: boolean;
  showTrackTagText: boolean;
  showTrackTagBox: boolean;
  showRatingLabelText: boolean;
  showRatingLabelBox: boolean;
  showRankText: boolean;
  showFlag: boolean;
  showRankIcon: boolean;
  showBackgroundImage: boolean;
  showCardBackground: boolean;
  showCustomImage: boolean;

  customImageUrl: string;
  customImageX: number;
  customImageY: number;
  customImageZ: number;
  customImageSize: number;
  customImageGradient: number;
  overallTransparency: number;
};

type PlayerApiResponse = {
  playerName: string;
  flagEmoji: string;
  flagUrl: string;
  currentMmr: number;
  currentLr: number;
  rankText: string;
  emblemUrl: string;
  error?: string;
};

function safeJsonParse<T>(source: string): T | null {
  const text = source.trim();

  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

const defaultSettings: Settings = {
  loungeName: "",
  displayName: "Your Name",
  mode: "RT",

  ratingMode: "MMR",
  ratingSwitchSeconds: 5,
  season: "16",

  flag: "🇯🇵",
  flagUrl: "https://flagcdn.com/w80/jp.png",

  mmr: "",
  lr: "",

  rankText: "",
  rankIconUrl: "https://i.imgur.com/OwhIiNz.png",

  borderColor: "#000000",
  flowColor: "#ffffff",
  flowEnabled: true,
  flowSpeed: 50,
  flowLength: 25,
  ratingEffectUseMainColor: false,
  ratingEffectColor: "#ffffff",
  rankEffectStyle: "CLASSIC",
  ratingSwitchEffectStyle: "WAVE",
  tagTopColor: "#000000",
  tagBottomColor: "#ffffff",
  tagTextTopColor: "#ffffff",
  tagTextBottomColor: "#ff0000",
  tagBoxGradientEnabled: false,
  tagBoxGradientBalance: 50,
  tagTextGradientEnabled: false,
  tagTextGradientBalance: 50,

  ratingBoxTopColor: "#000000",
  ratingBoxBottomColor: "#ffffff",
  ratingTextTopColor: "#ffffff",
  ratingTextBottomColor: "#ff0000",
  ratingBoxGradientEnabled: false,
  ratingBoxGradientBalance: 50,
  ratingTextGradientEnabled: false,
  ratingTextGradientBalance: 50,

  textTopColor: "#ffffff",
  textBottomColor: "#ff0000",
  textGradientEnabled: false,
  textGradientBalance: 50,
  textFont: "DEFAULT",
  textShadowEnabled: false,
  textShadowColor: "#000000",
  textShadowX: 50,
  textShadowY: 35,
  textShadowBlur: 35,
  textShadowOpacity: 70,
  cardBgLeft: "#000000",
  cardBgRight: "#005e70",
  cardBgGradientEnabled: true,
  cardBgGradientBalance: 60,
  cardBgOpacity: 30,
  bgUrl: "",

  bgX: 50,
  bgY: 50,
  bgZoom: 106.25,
  cardScale: 100,

  nameX: 36,
  nameY: 58,
  nameSize: 37,
  nameTextSpacing: 0,

  scoreX: 80,
  scoreY: 50,
  scoreSize: 45,
  scoreTextSpacing: 0,

  ratingBoxX: 90,
  ratingBoxY: 81,
  ratingBoxSize: 13,
  ratingTextSize: 22.92,
  ratingTextSpacing: 0,
  labelRadius: 10,
  labelShape: "ROUNDED",

  tagX: 70,
  tagY: 25,
  tagSize: 18,
  tagTextSize: 25.5,
  tagTextSpacing: 0,

  rankTextX: 67,
  rankTextY: 83,
  rankTextSize: 20,

  flagX: 22,
  flagY: 25,
  flagSize: 24,

  rankIconX: 12,
  rankIconY: 26,
  rankIconSize: 60,

  showName: true,
  showRate: true,
  showTrackTag: true,
  showRatingLabel: true,
  showTrackTagText: true,
  showTrackTagBox: true,
  showRatingLabelText: true,
  showRatingLabelBox: true,
  showRankText: true,
  showFlag: true,
  showRankIcon: true,
  showBackgroundImage: true,
  showCardBackground: true,
  showCustomImage: true,

  customImageUrl: "",
  customImageX: 50,
  customImageY: 50,
  customImageZ: 1,
  customImageSize: 325,
  customImageGradient: 0,
  overallTransparency: 0,
};

const designSettingKeys: Array<keyof Settings> = [
  "borderColor",
  "flowColor",
  "flowEnabled",
  "flowSpeed",
  "flowLength",
  "ratingEffectUseMainColor",
  "ratingEffectColor",
  "rankEffectStyle",
  "ratingSwitchEffectStyle",
  "tagTextTopColor",
  "tagTextBottomColor",
  "tagTextGradientEnabled",
  "tagTextGradientBalance",
  "ratingTextTopColor",
  "ratingTextBottomColor",
  "ratingTextGradientEnabled",
  "ratingTextGradientBalance",
  "textTopColor",
  "textBottomColor",
  "textGradientEnabled",
  "textGradientBalance",
  "textShadowEnabled",
  "textShadowColor",
  "textShadowX",
  "textShadowY",
  "textShadowBlur",
  "textShadowOpacity",
  "cardBgLeft",
  "cardBgRight",
  "cardBgGradientEnabled",
  "cardBgGradientBalance",
  "cardBgOpacity",
  "bgUrl",
  "bgX",
  "bgY",
  "bgZoom",
  "cardScale",
  "nameX",
  "nameY",
  "nameSize",
  "nameTextSpacing",
  "scoreX",
  "scoreY",
  "scoreSize",
  "scoreTextSpacing",
  "ratingBoxX",
  "ratingBoxY",
  "ratingTextSize",
  "ratingTextSpacing",
  "tagX",
  "tagY",
  "tagTextSize",
  "tagTextSpacing",
  "rankTextX",
  "rankTextY",
  "rankTextSize",
  "flagX",
  "flagY",
  "flagSize",
  "rankIconX",
  "rankIconY",
  "rankIconSize",
  "showName",
  "showRate",
  "showTrackTag",
  "showRatingLabel",
  "showRankText",
  "showFlag",
  "showRankIcon",
  "showBackgroundImage",
  "showCardBackground",
  "showCustomImage",
  "customImageUrl",
  "customImageX",
  "customImageY",
  "customImageZ",
  "customImageSize",
  "customImageGradient",
  "textFont",
  "showTrackTagText",
  "showRatingLabelText",
  "overallTransparency",
];


function createDefaultDesignSettings() {
  const defaults: Partial<Settings> = {};

  designSettingKeys.forEach((key) => {
    defaults[key] = defaultSettings[key] as never;
  });

  return defaults;
}

function encodeDesignValue(value: Settings[keyof Settings]) {
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  if (typeof value === "number") {
    return String(Math.round(value * 100) / 100);
  }

  if (typeof value === "string") {
    return value.includes(",") ? encodeURIComponent(value) : value;
  }

  return "";
}


function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function isColorDesignKey(key: keyof Settings) {
  return [
    "borderColor",
    "flowColor",
    "ratingEffectColor",
    "tagTopColor",
    "tagBottomColor",
    "tagTextTopColor",
    "tagTextBottomColor",
    "ratingBoxTopColor",
    "ratingBoxBottomColor",
    "ratingTextTopColor",
    "ratingTextBottomColor",
    "textTopColor",
    "textBottomColor",
    "textShadowColor",
    "cardBgLeft",
    "cardBgRight",
  ].includes(key);
}

function isUrlDesignKey(key: keyof Settings) {
  return key === "bgUrl" || key === "customImageUrl";
}

function clampDesignNumber(key: keyof Settings, value: number) {
  const ranges: Partial<Record<keyof Settings, [number, number]>> = {
    flowSpeed: [0, 100],
    flowLength: [4, 45],
    tagBoxGradientBalance: [0, 100],
    tagTextGradientBalance: [0, 100],
    ratingBoxGradientBalance: [0, 100],
    ratingTextGradientBalance: [0, 100],
    textGradientBalance: [0, 100],
    textShadowX: [0, 100],
    textShadowY: [0, 100],
    textShadowBlur: [0, 100],
    textShadowOpacity: [0, 100],
    cardBgGradientBalance: [0, 100],
    cardBgOpacity: [0, 100],
    bgX: [0, 100],
    bgY: [0, 100],
    bgZoom: [80, 250],
    cardScale: [20, 200],
    nameX: [0, 100],
    nameY: [0, 100],
    nameSize: [16, 60],
    nameTextSpacing: [0, 100],
    scoreX: [0, 100],
    scoreY: [0, 100],
    scoreSize: [20, 80],
    scoreTextSpacing: [0, 100],
    ratingBoxX: [0, 100],
    ratingBoxY: [0, 100],
    ratingBoxSize: [8, 30],
    ratingTextSize: [8, 30],
    ratingTextSpacing: [0, 30],
    labelRadius: [0, 15],
    tagX: [0, 100],
    tagY: [0, 100],
    tagSize: [8, 30],
    tagTextSize: [8, 30],
    tagTextSpacing: [0, 30],
    rankTextX: [0, 100],
    rankTextY: [0, 100],
    rankTextSize: [6, 28],
    flagX: [0, 100],
    flagY: [0, 100],
    flagSize: [12, 50],
    rankIconX: [0, 100],
    rankIconY: [0, 100],
    rankIconSize: [20, 120],
    customImageX: [0, 100],
    customImageY: [0, 100],
    customImageZ: [0, 10],
    customImageSize: [20, 500],
    customImageGradient: [0, 100],
    overallTransparency: [0, 100],
  };

  const range = ranges[key];

  if (!range) {
    return Math.round(value);
  }

  return Math.min(range[1], Math.max(range[0], Math.round(value * 100) / 100));
}

function decodeDesignValue(key: keyof Settings, token: string) {
  const defaultValue = defaultSettings[key];
  const value = token.trim();

  if (typeof defaultValue === "boolean") {
    const lowered = value.toLowerCase();

    if (lowered === "1" || lowered === "true") {
      return true as never;
    }

    if (lowered === "0" || lowered === "false") {
      return false as never;
    }

    return defaultValue as never;
  }

  if (typeof defaultValue === "number") {
    const number = Number(value);

    return (Number.isFinite(number)
      ? clampDesignNumber(key, number)
      : defaultValue) as never;
  }

  if (typeof defaultValue === "string") {
    let decoded = value;

    try {
      decoded = decodeURIComponent(value);
    } catch {
      decoded = value;
    }

    if (key === "labelShape") {
      const shape = decoded.toUpperCase();

      return (shape === "STAR" || shape === "HEART" || shape === "ROUNDED"
        ? shape
        : defaultValue) as never;
    }

    if (key === "textFont") {
      return normalizeFontChoice(decoded) as never;
    }

    if (key === "rankEffectStyle") {
      return ([
        "CLASSIC",
        "FLASH",
        "SLIDE",
        "BURST",
        "STARLIGHT",
        "METEOR",
      ].includes(decoded.toUpperCase())
        ? decoded.toUpperCase()
        : defaultValue) as never;
    }

    if (key === "ratingSwitchEffectStyle") {
      return (["WAVE", "FADE", "FLIP", "GLITCH"].includes(
        decoded.toUpperCase()
      )
        ? decoded.toUpperCase()
        : defaultValue) as never;
    }

    if (isColorDesignKey(key)) {
      return (isHexColor(decoded) ? decoded : defaultValue) as never;
    }

    if (isUrlDesignKey(key)) {
      return (/^(https?:|data:|\/|\.)/i.test(decoded) ? decoded : defaultValue) as never;
    }

    return decoded as never;
  }

  return defaultValue as never;
}

function createCompactDesignPreset(settings: Settings) {
  const values = designSettingKeys.map((key) => {
    if (settings[key] === defaultSettings[key]) {
      return "";
    }

    return encodeDesignValue(settings[key]);
  });

  while (values.length > 0 && values[values.length - 1] === "") {
    values.pop();
  }

  return values.length > 0 ? values.join(",") : "~";
}

function parseCompactDesignPreset(text: string) {
  const raw = text.trim();
  const updates = createDefaultDesignSettings();

  if (!raw || raw === "~") {
    return updates;
  }

  const parts = raw.split(",");

  designSettingKeys.forEach((key, index) => {
    const token = parts[index];

    if (token === undefined || token === "") {
      return;
    }

    updates[key] = decodeDesignValue(key, token);
  });

  return updates;
}

function parseDesignObject(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }

  const data = input as Partial<Settings> & Record<string, unknown>;
  const updates = createDefaultDesignSettings();

  const setIfDefined = <K extends keyof Settings>(
    key: K,
    value: Settings[K] | undefined
  ) => {
    if (value !== undefined) {
      updates[key] = value as never;
    }
  };

  designSettingKeys.forEach((key) => {
    const value = data[key];

    if (value !== undefined) {
      updates[key] = value as never;
    }
  });

  updates.labelShape = "ROUNDED";
  updates.labelRadius = 10;
  updates.showTrackTagBox = true;
  updates.showRatingLabelBox = true;

  if (data.textFont !== undefined) {
    updates.textFont = normalizeFontChoice(String(data.textFont));
  }

  if (data.showTrackTagText === undefined && data.showTrackTag !== undefined) {
    updates.showTrackTagText = Boolean(data.showTrackTag);
  }

  if (data.showTrackTagBox === undefined && data.showTrackTag !== undefined) {
    updates.showTrackTagBox = Boolean(data.showTrackTag);
  }

  if (
    data.showRatingLabelText === undefined &&
    data.showRatingLabel !== undefined
  ) {
    updates.showRatingLabelText = Boolean(data.showRatingLabel);
  }

  if (
    data.showRatingLabelBox === undefined &&
    data.showRatingLabel !== undefined
  ) {
    updates.showRatingLabelBox = Boolean(data.showRatingLabel);
  }

  setIfDefined(
    "borderColor",
    (data.borderColor ?? data.mainColor) as Settings["borderColor"] | undefined
  );
  setIfDefined(
    "flowColor",
    (data.flowColor ?? data.mainColor) as Settings["flowColor"] | undefined
  );
  setIfDefined(
    "tagTopColor",
    (data.tagTopColor ?? data.modeColor) as Settings["tagTopColor"] | undefined
  );
  setIfDefined(
    "tagBottomColor",
    (data.tagBottomColor ?? data.modeColor) as Settings["tagBottomColor"] | undefined
  );
  setIfDefined(
    "tagTextTopColor",
    (data.tagTextTopColor ?? data.textTopColor) as Settings["tagTextTopColor"] | undefined
  );
  setIfDefined(
    "tagTextBottomColor",
    (data.tagTextBottomColor ?? data.textBottomColor) as Settings["tagTextBottomColor"] | undefined
  );
  setIfDefined(
    "ratingBoxTopColor",
    data.ratingBoxTopColor as Settings["ratingBoxTopColor"] | undefined
  );
  setIfDefined(
    "ratingBoxBottomColor",
    data.ratingBoxBottomColor as Settings["ratingBoxBottomColor"] | undefined
  );
  setIfDefined(
    "ratingTextTopColor",
    data.ratingTextTopColor as Settings["ratingTextTopColor"] | undefined
  );
  setIfDefined(
    "ratingTextBottomColor",
    data.ratingTextBottomColor as Settings["ratingTextBottomColor"] | undefined
  );
  setIfDefined(
    "ratingTextSize",
    (data.ratingTextSize ?? data.ratingBoxSize) as Settings["ratingTextSize"] | undefined
  );
  setIfDefined(
    "ratingEffectColor",
    (data.ratingEffectColor ?? data.flowColor ?? data.mainColor) as Settings["ratingEffectColor"] | undefined
  );

  return updates;
}



function normalizeFontChoice(value: string | undefined): FontChoice {
  const normalized = String(value ?? "DEFAULT").toUpperCase();
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

function fontFamily(value: FontChoice | string | undefined) {
  switch (normalizeFontChoice(value)) {
    case "OEDO_KANTEIRYU":
      return '"Oedo Kanteiryu Local", "FOT-大江戸勘亭流 Std E", "FOT-OedKtr Std E", "OedKtrStd-E", "FOT-大江戸勘亭流 Std", "FOT-OedKtr Std", serif';
    case "YU_GOTHIC":
      return '"Yu Gothic", "YuGothic", "Hiragino Kaku Gothic ProN", sans-serif';
    case "MEIRYO":
      return 'Meiryo, "メイリオ", sans-serif';
    case "MINCHO":
      return '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", serif';
    case "ARIAL":
      return 'Arial, Helvetica, sans-serif';
    case "IMPACT":
      return 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif';
    case "TREBUCHET":
      return '"Trebuchet MS", Arial, sans-serif';
    case "VERDANA":
      return 'Verdana, Geneva, sans-serif';
    case "GEORGIA":
      return 'Georgia, "Times New Roman", serif';
    case "TIMES":
      return '"Times New Roman", Times, serif';
    case "COURIER":
      return '"Courier New", Courier, monospace';
    case "COMIC_SANS":
      return '"Comic Sans MS", "Comic Sans", cursive';
    default:
      return 'Arial, Helvetica, sans-serif';
  }
}

function numberParam(value: number) {
  return String(Math.round(value * 100) / 100);
}

function alphaHexFromPercent(value: number | undefined, fallback: number) {
  const opacity = Math.min(100, Math.max(0, Number(value ?? fallback)));

  if (!Number.isFinite(opacity)) {
    return Math.round((fallback / 100) * 255)
      .toString(16)
      .padStart(2, "0");
  }

  return Math.round((opacity / 100) * 255)
    .toString(16)
    .padStart(2, "0");
}

function hexWithAlpha(color: string | undefined, alpha: string) {
  const value = (color || "").trim();

  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return `${value}${alpha}`;
  }

  return value || "transparent";
}

function percent(value: number | undefined, fallback: number) {
  const number = Number(value ?? fallback);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(number)));
}

function sliderToValue(value: number, minValue: number, maxValue: number) {
  const normalized = percent(value, 0) / 100;
  return Math.round((minValue + normalized * (maxValue - minValue)) * 100) / 100;
}

function valueToSlider(value: number, minValue: number, maxValue: number) {
  if (maxValue <= minValue) return 0;
  return percent(((value - minValue) / (maxValue - minValue)) * 100, 0);
}

function verticalSliderValue(storedTopValue: number) {
  return 100 - percent(storedTopValue, 50);
}

function storedTopValue(sliderValue: number) {
  return 100 - percent(sliderValue, 50);
}

function shadowOffsetX(value: number) {
  return sliderToValue(value, -24, 24);
}

function shadowOffsetY(value: number) {
  return sliderToValue(100 - percent(value, 50), -24, 24);
}

function shadowBlur(value: number) {
  return sliderToValue(value, 0, 32);
}

function flowDuration(value: number | undefined) {
  const speed = percent(value, 65);
  const seconds = 8 - speed * 0.072;

  return `${Math.max(0.8, Math.min(8, seconds)).toFixed(2)}s`;
}

function gradientStops(value: number | undefined, fallback: number) {
  const balance = percent(value, fallback);

  if (balance <= 0) {
    return {
      topStop: 0,
      bottomStart: 0,
    };
  }

  if (balance >= 100) {
    return {
      topStop: 100,
      bottomStart: 100,
    };
  }

  const center = balance;
  const blend = 12;

  return {
    topStop: Math.min(100, Math.max(0, center - blend)),
    bottomStart: Math.min(100, Math.max(0, center + blend)),
  };
}

function cleanRankText(text: string) {
  return text.replace(/\s*,\s*/g, " / ");
}

function normalizeRankForCompare(text: string) {
  return cleanRankText(text)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function splitRankText(text: string) {
  const cleaned = cleanRankText(text || "").trim();
  const parts = cleaned.split("/").map((part) => part.trim());

  return {
    division: parts[0] || "",
    className: parts.slice(1).join(" / "),
  };
}

function getDivisionOrder(rankOrder: RankEntry[]) {
  const divisions: {
    division: string;
    emblem: string;
  }[] = [];

  const seen = new Set<string>();

  for (const rank of rankOrder) {
    const division = rank.division || splitRankText(rank.text).division;
    const normalized = normalizeRankForCompare(division);

    if (!division || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);

    divisions.push({
      division,
      emblem: rank.emblem || "",
    });
  }

  return divisions;
}

function initialActiveRating(mode: RatingMode): ActiveRating {
  return mode === "LR" ? "LR" : "MMR";
}

function initialActiveMode(mode: ModeSetting): ActiveMode {
  return mode === "CT" ? "CT" : "RT";
}

function safeRatingMode(_mode: ModeSetting, ratingMode: RatingMode): RatingMode {
  return ratingMode;
}

function applyPreviewBump(
  value: string,
  activeRating: ActiveRating,
  previewScoreBump: PreviewScoreBump
) {
  if (!previewScoreBump || previewScoreBump.rating !== activeRating) {
    return value;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  // Negative MMR is valid. Clamping the preview to zero made the rate jump to
  // an unrelated value during Rank Up/Down previews and broke the sequence.
  return String(number + previewScoreBump.diff);
}

function getPreviewRank(
  rankText: string,
  effect: PreviewEffect,
  rankOrder: RankEntry[]
): PreviewRank {
  const currentText = cleanRankText(rankText || "MKW Lounge");
  const currentRank = splitRankText(currentText);

  if (effect !== "rank-up" && effect !== "rank-down") {
    return {
      text: currentText,
      emblem: "",
    };
  }

  if (!currentRank.division || rankOrder.length === 0) {
    return {
      text: currentText,
      emblem: "",
    };
  }

  const divisions = getDivisionOrder(rankOrder);

  const currentIndex = divisions.findIndex(
    (rank) =>
      normalizeRankForCompare(rank.division) ===
      normalizeRankForCompare(currentRank.division)
  );

  if (currentIndex === -1) {
    return {
      text: currentText,
      emblem: "",
    };
  }

  const nextIndex =
    effect === "rank-up"
      ? Math.min(currentIndex + 1, divisions.length - 1)
      : Math.max(currentIndex - 1, 0);

  const nextDivision = divisions[nextIndex];

  if (!nextDivision || nextIndex === currentIndex) {
    return {
      text: currentText,
      emblem: "",
    };
  }

  const nextText = currentRank.className
    ? `${nextDivision.division} / ${currentRank.className}`
    : nextDivision.division;

  return {
    text: nextText,
    emblem: nextDivision.emblem || "",
  };
}

export default function Home() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [copied, setCopied] = useState(false);
  const [settingsCopied, setSettingsCopied] = useState(false);
  const [showImportSettings, setShowImportSettings] = useState(false);
  const [importSettingsText, setImportSettingsText] = useState("");
  const [importSettingsStatus, setImportSettingsStatus] = useState("");
  const [apiStatus, setApiStatus] = useState(
    "Lounge nameを入れると自動取得します"
  );

  const [origin, setOrigin] = useState("");
  const [rankOrder, setRankOrder] = useState<RankEntry[]>([]);
  const [rankStatus, setRankStatus] = useState("ランク一覧を取得中...");

  const [previewEffect, setPreviewEffect] = useState<PreviewEffect>(null);
  const [previewRankRevealVisible, setPreviewRankRevealVisible] =
    useState(false);
  const [previewScoreBump, setPreviewScoreBump] =
    useState<PreviewScoreBump>(null);
  const [previewScoreAnimationToken, setPreviewScoreAnimationToken] =
    useState(0);
  const [previewSwitchAnimationToken, setPreviewSwitchAnimationToken] =
    useState(0);

  const [previewActiveRating, setPreviewActiveRating] = useState<ActiveRating>(
    initialActiveRating(defaultSettings.ratingMode)
  );


  const previewEffectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRankTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRevealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("kei-lounge-card-settings");
    if (!saved) return;

    try {
      const parsed = safeJsonParse<
        Partial<Settings> & { switchSeconds?: number }
      >(saved);

      if (!parsed) {
        localStorage.removeItem("kei-lounge-card-settings");
        setSettings(defaultSettings);
        return;
      }
      const merged = { ...defaultSettings, ...parsed };

      merged.mode = parsed.mode === "CT" ? "CT" : "RT";

      merged.ratingSwitchSeconds =
        parsed.ratingSwitchSeconds ??
        parsed.switchSeconds ??
        defaultSettings.ratingSwitchSeconds;

      merged.ratingBoxTopColor =
        parsed.ratingBoxTopColor ?? defaultSettings.ratingBoxTopColor;
      merged.ratingBoxBottomColor =
        parsed.ratingBoxBottomColor ?? defaultSettings.ratingBoxBottomColor;
      merged.ratingTextTopColor =
        parsed.ratingTextTopColor ?? defaultSettings.ratingTextTopColor;
      merged.ratingTextBottomColor =
        parsed.ratingTextBottomColor ?? defaultSettings.ratingTextBottomColor;
      merged.ratingBoxGradientEnabled =
        parsed.ratingBoxGradientEnabled ?? defaultSettings.ratingBoxGradientEnabled;
      merged.ratingBoxGradientBalance =
        parsed.ratingBoxGradientBalance ?? defaultSettings.ratingBoxGradientBalance;
      merged.ratingTextGradientEnabled =
        parsed.ratingTextGradientEnabled ?? defaultSettings.ratingTextGradientEnabled;
      merged.ratingTextGradientBalance =
        parsed.ratingTextGradientBalance ?? defaultSettings.ratingTextGradientBalance;

      merged.tagTextSize =
        parsed.tagTextSize ?? parsed.tagSize ?? defaultSettings.tagTextSize;
      merged.tagTextSpacing =
        parsed.tagTextSpacing ?? defaultSettings.tagTextSpacing;

      merged.ratingBoxX =
        parsed.ratingBoxX ?? defaultSettings.ratingBoxX;
      merged.ratingBoxY =
        parsed.ratingBoxY ?? defaultSettings.ratingBoxY;
      merged.ratingBoxSize =
        parsed.ratingBoxSize ?? defaultSettings.ratingBoxSize;
      merged.ratingTextSize =
        parsed.ratingTextSize ?? defaultSettings.ratingTextSize;
      merged.ratingTextSpacing =
        parsed.ratingTextSpacing ?? defaultSettings.ratingTextSpacing;
      merged.labelRadius =
        parsed.labelRadius ?? defaultSettings.labelRadius;
      merged.labelShape =
        parsed.labelShape === "STAR" || parsed.labelShape === "HEART"
          ? parsed.labelShape
          : "ROUNDED";
      merged.textFont = normalizeFontChoice(parsed.textFont);
      merged.showTrackTagText =
        parsed.showTrackTagText ?? parsed.showTrackTag ?? true;
      merged.showTrackTagBox = true;
      merged.showRatingLabelText =
        parsed.showRatingLabelText ?? parsed.showRatingLabel ?? true;
      merged.showRatingLabelBox = true;
      merged.labelShape = "ROUNDED";
      merged.labelRadius = 10;
      merged.overallTransparency =
        parsed.overallTransparency ?? defaultSettings.overallTransparency;
      merged.ratingEffectUseMainColor =
        parsed.ratingEffectUseMainColor ?? defaultSettings.ratingEffectUseMainColor;
      merged.ratingEffectColor =
        parsed.ratingEffectColor ?? parsed.flowColor ?? defaultSettings.ratingEffectColor;

      setSettings(merged);
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("kei-lounge-card-settings", JSON.stringify(settings));
  }, [settings]);

  const fetchRanks = useCallback(async () => {
    setRankStatus("ランク一覧を取得中...");

    try {
      const params = new URLSearchParams({
        mode: settings.mode,
      });

      const response = await fetch(`/api/ranks?${params.toString()}`, {
        cache: "no-store",
      });

      const data = safeJsonParse<RankApiResponse>(await response.text());

      if (!response.ok || !data?.available) {
        setRankOrder([]);
        setRankStatus("ランク一覧を取得できませんでした");
        return;
      }

      setRankOrder(data.ranks || []);
      setRankStatus(`${settings.mode} のランク一覧を反映しました`);
    } catch {
      setRankOrder([]);
      setRankStatus("ランク一覧を取得できませんでした");
    }
  }, [settings.mode]);

  useEffect(() => {
    fetchRanks();
  }, [fetchRanks]);

  useEffect(() => {
    if (settings.ratingMode !== "SWITCH") {
      setPreviewActiveRating(initialActiveRating(settings.ratingMode));
      return;
    }

    setPreviewActiveRating("MMR");

    const seconds = Math.max(settings.ratingSwitchSeconds ?? 5, 3);

    const interval = setInterval(() => {
      setPreviewActiveRating((prev) => {
        const next = prev === "MMR" ? "LR" : "MMR";
        setPreviewSwitchAnimationToken((token) => token + 1);
        return next;
      });
    }, seconds * 1000);

    return () => clearInterval(interval);
  }, [settings.ratingMode, settings.ratingSwitchSeconds]);

  useEffect(() => {
    return () => {
      if (previewEffectTimer.current) {
        clearTimeout(previewEffectTimer.current);
      }

      if (previewRankTimer.current) {
        clearTimeout(previewRankTimer.current);
      }

      if (previewRevealTimer.current) {
        clearTimeout(previewRevealTimer.current);
      }
    };
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const fetchPlayer = useCallback(async () => {
    const name = settings.loungeName.trim();

    if (name.length < 2) {
      setApiStatus("Lounge nameを入れると自動取得します");
      return;
    }

    setApiStatus("取得中...");

    try {
      const params = new URLSearchParams({
        name,
        mode: settings.mode,
      });

      const response = await fetch(`/api/player?${params.toString()}`, {
        cache: "no-store",
      });

      const parsedData = safeJsonParse<PlayerApiResponse>(await response.text());
      const data = parsedData ?? {
        playerName: "",
        flagEmoji: "",
        flagUrl: "",
        currentMmr: 0,
        currentLr: 0,
        rankText: "",
        emblemUrl: "",
        error: "Player data could not be read.",
      };

      if (!response.ok || !parsedData) {
        setApiStatus(data.error ?? "プレイヤーが見つかりませんでした");
        return;
      }

      setSettings((prev) => ({
        ...prev,
        displayName:
          prev.displayName.trim() && prev.displayName !== "Your Name"
            ? prev.displayName
            : data.playerName || prev.displayName,
        flag: data.flagEmoji || prev.flag,
        flagUrl: data.flagUrl || prev.flagUrl,
        mmr: String(data.currentMmr || 0),
        lr: String(data.currentLr || 0),
        rankText: cleanRankText(data.rankText || prev.rankText),
        rankIconUrl: data.emblemUrl || prev.rankIconUrl,
      }));

      setApiStatus(`${data.playerName} / ${settings.mode} を反映しました`);
    } catch {
      setApiStatus("取得に失敗しました");
    }
  }, [settings.loungeName, settings.mode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlayer();
    }, 800);

    return () => clearTimeout(timer);
  }, [fetchPlayer]);

  function clearPreviewTimers() {
    if (previewEffectTimer.current) {
      clearTimeout(previewEffectTimer.current);
    }

    if (previewRankTimer.current) {
      clearTimeout(previewRankTimer.current);
    }

    if (previewRevealTimer.current) {
      clearTimeout(previewRevealTimer.current);
    }
  }

  function triggerPreviewEffect(effect: PreviewEffect) {
    if (!effect) return;

    clearPreviewTimers();

    setPreviewEffect(null);
    setPreviewRankRevealVisible(false);
    setPreviewScoreBump(null);

    const isRankEffect = effect === "rank-up" || effect === "rank-down";
    const scoreEffect: PreviewEffect =
      effect === "rank-up" ? "win" : effect === "rank-down" ? "loss" : effect;
    const scoreDiff = scoreEffect === "win" ? 100 : -100;

    window.setTimeout(() => {
      setPreviewEffect(scoreEffect);

      if (scoreEffect === "win" || scoreEffect === "loss") {
        setPreviewScoreBump({
          rating: previewActiveRating,
          diff: scoreDiff,
        });
        setPreviewScoreAnimationToken((prev) => prev + 1);
      }
    }, 20);

    if (isRankEffect) {
      // First show the standalone RANK UP / RANK DOWN announcement.
      previewRankTimer.current = setTimeout(() => {
        setPreviewEffect(effect);
        setPreviewRankRevealVisible(false);
      }, 1700);

      // After the announcement has been readable, start the selected reveal.
      previewRevealTimer.current = setTimeout(() => {
        setPreviewRankRevealVisible(true);
      }, 4000);
    }

    const duration = isRankEffect ? 7100 : 1800;

    previewEffectTimer.current = setTimeout(() => {
      setPreviewEffect(null);
      setPreviewRankRevealVisible(false);
      setPreviewScoreBump(null);
    }, duration);
  }

  const cardUrl = useMemo(() => {
    const params = new URLSearchParams();

    params.set(
      "name",
      settings.displayName || settings.loungeName || "Your Name"
    );

    params.set("lounge", settings.loungeName);
    params.set("mode", settings.mode === "CT" ? "CT" : "RT");

    params.set("ratingMode", settings.ratingMode);
    params.set("ratingSwitch", numberParam(settings.ratingSwitchSeconds ?? 5));
    params.set("switch", numberParam(settings.ratingSwitchSeconds ?? 5));
    params.set("season", settings.season);

    params.set("flag", settings.flag);
    if (settings.flagUrl) params.set("flagUrl", settings.flagUrl);

    params.set("mmr", settings.mmr);
    params.set("lr", settings.lr);

    params.set("rank", cleanRankText(settings.rankText));

    params.set("border", (settings.borderColor ?? "#ff0000").replace("#", ""));
    params.set("flow", (settings.flowColor ?? "#ff3030").replace("#", ""));
    params.set("flowOn", settings.flowEnabled ? "1" : "0");
    params.set("flowSpeed", numberParam(settings.flowSpeed ?? 65));
    params.set("flowLength", numberParam(settings.flowLength ?? 16));
    params.set("effectMain", settings.ratingEffectUseMainColor ? "1" : "0");
    params.set("effectColor", (settings.ratingEffectColor ?? "#ff3030").replace("#", ""));
    params.set("rankEffect", settings.rankEffectStyle);
    params.set("switchEffect", settings.ratingSwitchEffectStyle);
    params.set("tagTextTop", (settings.tagTextTopColor ?? "#ffffff").replace("#", ""));
    params.set("tagTextBottom", (settings.tagTextBottomColor ?? "#ff3030").replace("#", ""));
    params.set("tagTextGradient", settings.tagTextGradientEnabled ? "1" : "0");
    params.set("tagTextBalance", numberParam(settings.tagTextGradientBalance ?? 40));
    params.set("ratingTop", (settings.ratingBoxTopColor ?? "#b90000").replace("#", ""));
    params.set("ratingBottom", (settings.ratingBoxBottomColor ?? "#000000").replace("#", ""));
    params.set("ratingTextTop", (settings.ratingTextTopColor ?? "#ffffff").replace("#", ""));
    params.set("ratingTextBottom", (settings.ratingTextBottomColor ?? "#ff3030").replace("#", ""));
    params.set("ratingTextGradient", settings.ratingTextGradientEnabled ? "1" : "0");
    params.set("ratingTextBalance", numberParam(settings.ratingTextGradientBalance ?? 40));
    params.set("textTop", (settings.textTopColor ?? "#ffffff").replace("#", ""));
    params.set("textBottom", (settings.textBottomColor ?? "#ff3030").replace("#", ""));
    params.set("textGradient", settings.textGradientEnabled ? "1" : "0");
    params.set("textBalance", numberParam(settings.textGradientBalance ?? 40));
    params.set("font", settings.textFont ?? "DEFAULT");
    params.set("shadowOn", settings.textShadowEnabled ? "1" : "0");
    params.set("shadowColor", settings.textShadowColor.replace("#", ""));
    params.set("shadowX", numberParam(settings.textShadowX));
    params.set("shadowY", numberParam(settings.textShadowY));
    params.set("shadowBlur", numberParam(settings.textShadowBlur));
    params.set("shadowOpacity", numberParam(settings.textShadowOpacity));
    params.set("bgLeft", (settings.cardBgLeft ?? "#130716").replace("#", ""));
    params.set("bgRight", (settings.cardBgRight ?? "#005e70").replace("#", ""));
    params.set("bgGradient", settings.cardBgGradientEnabled ? "1" : "0");
    params.set("bgBalance", numberParam(settings.cardBgGradientBalance ?? 50));
    params.set("bgOpacity", numberParam(settings.cardBgOpacity ?? 86));

    params.set("auto", "1");
    params.set("refresh", "60");

    if (settings.bgUrl) params.set("bg", settings.bgUrl);
    if (settings.rankIconUrl) params.set("icon", settings.rankIconUrl);

    params.set("bgx", numberParam(settings.bgX));
    params.set("bgy", numberParam(settings.bgY));
    params.set("bgz", numberParam(settings.bgZoom));
    params.set("scale", numberParam(settings.cardScale));

    params.set("nx", numberParam(settings.nameX));
    params.set("ny", numberParam(settings.nameY));
    params.set("ns", numberParam(settings.nameSize));
    params.set("nspace", numberParam(settings.nameTextSpacing));

    params.set("sx", numberParam(settings.scoreX));
    params.set("sy", numberParam(settings.scoreY));
    params.set("ss", numberParam(settings.scoreSize));
    params.set("sspace", numberParam(settings.scoreTextSpacing));

    params.set("rbx", numberParam(settings.ratingBoxX));
    params.set("rby", numberParam(settings.ratingBoxY));
    params.set("rts", numberParam(settings.ratingTextSize));
    params.set("rspace", numberParam(settings.ratingTextSpacing));

    params.set("tx", numberParam(settings.tagX));
    params.set("ty", numberParam(settings.tagY));
    params.set("tts", numberParam(settings.tagTextSize));
    params.set("tspace", numberParam(settings.tagTextSpacing));

    params.set("rx", numberParam(settings.rankTextX));
    params.set("ry", numberParam(settings.rankTextY));
    params.set("rs", numberParam(settings.rankTextSize));

    params.set("fx", numberParam(settings.flagX));
    params.set("fy", numberParam(settings.flagY));
    params.set("fs", numberParam(settings.flagSize));

    params.set("ix", numberParam(settings.rankIconX));
    params.set("iy", numberParam(settings.rankIconY));
    params.set("isz", numberParam(settings.rankIconSize));

    params.set("vname", settings.showName ? "1" : "0");
    params.set("vrate", settings.showRate ? "1" : "0");
    params.set(
      "vtrack",
      settings.showTrackTagText ? "1" : "0"
    );
    params.set(
      "vrating",
      settings.showRatingLabelText ? "1" : "0"
    );
    params.set("vtracktext", settings.showTrackTagText ? "1" : "0");
    params.set("vratingtext", settings.showRatingLabelText ? "1" : "0");
    params.set("vrank", settings.showRankText ? "1" : "0");
    params.set("vflag", settings.showFlag ? "1" : "0");
    params.set("vicon", settings.showRankIcon ? "1" : "0");
    params.set("vbg", settings.showBackgroundImage ? "1" : "0");
    params.set("vcard", settings.showCardBackground ? "1" : "0");
    params.set("vimage", settings.showCustomImage ? "1" : "0");

    if (settings.customImageUrl) params.set("overlay", settings.customImageUrl);
    params.set("ox", numberParam(settings.customImageX));
    params.set("oy", numberParam(settings.customImageY));
    params.set("oz", numberParam(settings.customImageZ));
    params.set("os", numberParam(settings.customImageSize));
    params.set("ograd", numberParam(settings.customImageGradient));
    params.set(
      "opacity",
      numberParam(settings.overallTransparency ?? 0)
    );

    const path = `/card?${params.toString()}`;

    return origin ? `${origin}${path}` : path;
  }, [settings, origin]);

  const settingsText = useMemo(() => {
    const designSettings: Partial<Settings> = {};

    designSettingKeys.forEach((key) => {
      designSettings[key] = settings[key] as never;
    });

    return JSON.stringify(designSettings, null, 2);
  }, [settings]);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const copySettingsText = async () => {
    await navigator.clipboard.writeText(settingsText);
    setSettingsCopied(true);
    setTimeout(() => setSettingsCopied(false), 1200);
  };

  const toggleImportSettings = () => {
    setShowImportSettings((prev) => !prev);
    setImportSettingsStatus("");
  };

  const importSettings = () => {
    try {
      const raw = importSettingsText.trim();

      if (!raw) {
        setImportSettingsStatus("設定テキストを入力してください");
        return;
      }

      const designUpdates =
        raw.startsWith("{")
          ? parseDesignObject(safeJsonParse<unknown>(raw))
          : parseCompactDesignPreset(raw);

      if (!designUpdates) {
        setImportSettingsStatus("設定データの形式が違います");
        return;
      }

      setSettings((prev) => ({
        ...prev,
        ...designUpdates,
      }));

      setImportSettingsStatus("デザイン設定を読み込みました");
      setTimeout(() => setImportSettingsStatus(""), 1600);
    } catch {
      setImportSettingsStatus("設定データを読み込めませんでした");
    }
  };

  return (
    <main className="builder-page">
      <section className="hero">
        <h1>
          Kei <span>Lounge Cards</span>
        </h1>
      </section>

      <div className="builder-layout">
        <section className="panel settings-panel">
          <h2>Basic</h2>

          <div className="two-col">
            <label>
              Lounge name
              <input
                value={settings.loungeName}
                onChange={(e) => update("loungeName", e.target.value)}
                placeholder="exact lounge name"
              />
            </label>

            <label>
              Display name
              <input
                value={settings.displayName}
                onChange={(e) => update("displayName", e.target.value)}
                placeholder="shown name"
              />
            </label>
          </div>

          <div className="basic-rating-row">
            <label>
              Track
              <select
                value={settings.mode}
                onChange={(e) => update("mode", e.target.value as ModeSetting)}
              >
                <option value="RT">RT</option>
                <option value="CT">CT</option>
              </select>
            </label>

            <label>
              Rating display
              <select
                value={settings.ratingMode}
                onChange={(e) =>
                  update("ratingMode", e.target.value as RatingMode)
                }
              >
                <option value="MMR">MMR only</option>
                <option value="LR">LR only</option>
                <option value="SWITCH">MMR / LR switch</option>
              </select>
            </label>

            <label>
              MMR / LR sec
              <NumberStepper
                min={3}
                max={60}
                disabled={settings.ratingMode !== "SWITCH"}
                value={settings.ratingSwitchSeconds ?? 5}
                onChange={(value) => update("ratingSwitchSeconds", value)}
              />
            </label>
          </div>

          <div className="two-col">
            <label>
              Flag text
              <input
                value={settings.flag}
                onChange={(e) => update("flag", e.target.value)}
                placeholder="🇯🇵"
              />
            </label>

            <label>
              Flag image URL
              <input
                value={settings.flagUrl}
                onChange={(e) => update("flagUrl", e.target.value)}
                placeholder="auto fetched"
              />
            </label>
          </div>

          <div className="two-col">
            <label>
              MMR
              <input
                value={settings.mmr}
                onChange={(e) => update("mmr", e.target.value)}
                placeholder="0000"
              />
            </label>

            <label>
              LR
              <input
                value={settings.lr}
                onChange={(e) => update("lr", e.target.value)}
                placeholder="0000"
              />
            </label>
          </div>

          <div className="two-col">
            <label>
              Rank text
              <input
                value={settings.rankText}
                onChange={(e) =>
                  update("rankText", cleanRankText(e.target.value))
                }
                placeholder="Iron / Low Tier"
              />
            </label>

            <label>
              Rank icon URL
              <input
                value={settings.rankIconUrl}
                onChange={(e) => update("rankIconUrl", e.target.value)}
                placeholder="auto fetched"
              />
            </label>
          </div>

          <h2>Design</h2>

                              <details className="design-group" open>
            <summary>
              <span className="summary-copy">
                <span className="summary-title">Visibility</span>
                <small>表示する要素と、オーバーレイ全体の透明度を設定します。</small>
              </span>
            </summary>

            <div className="design-group-body">
              <Slider
                label="Overall transparency"
                value={settings.overallTransparency}
                min={0}
                max={100}
                onChange={(v) => update("overallTransparency", v)}
              />
              <p className="control-note">
                0 = fully visible / 100 = fully transparent
              </p>

              <div className="visibility-pairs">
                <div className="visibility-pair">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showName}
                      onChange={(e) => update("showName", e.target.checked)}
                    />
                    Display name
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showRate}
                      onChange={(e) => update("showRate", e.target.checked)}
                    />
                    Rate number
                  </label>
                </div>

                <div className="visibility-pair">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showTrackTagText}
                      onChange={(e) =>
                        update("showTrackTagText", e.target.checked)
                      }
                    />
                    Track tag
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showRatingLabelText}
                      onChange={(e) =>
                        update("showRatingLabelText", e.target.checked)
                      }
                    />
                    Rating label
                  </label>
                </div>

                <div className="visibility-pair">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showRankText}
                      onChange={(e) =>
                        update("showRankText", e.target.checked)
                      }
                    />
                    Rank text
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showRankIcon}
                      onChange={(e) =>
                        update("showRankIcon", e.target.checked)
                      }
                    />
                    Rank icon
                  </label>
                </div>

                <div className="visibility-pair">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showFlag}
                      onChange={(e) => update("showFlag", e.target.checked)}
                    />
                    Flag
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showCustomImage}
                      onChange={(e) =>
                        update("showCustomImage", e.target.checked)
                      }
                    />
                    Custom image
                  </label>
                </div>

                <div className="visibility-pair">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showBackgroundImage}
                      onChange={(e) =>
                        update("showBackgroundImage", e.target.checked)
                      }
                    />
                    Background image
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showCardBackground}
                      onChange={(e) =>
                        update("showCardBackground", e.target.checked)
                      }
                    />
                    Card background
                  </label>
                </div>
              </div>
            </div>
          </details>

<details className="design-group" open>
            <summary>
              <span className="summary-copy">
                <span className="summary-title">Background</span>
                <small>カード背景色と背景画像を設定します。</small>
              </span>
            </summary>

            <div className="design-group-body">
              <fieldset
                className={`setting-scope ${settings.showCardBackground ? "" : "is-disabled"}`}
                disabled={!(settings.showCardBackground)}
              >
              <div className="two-col">
                <label>
                  Card bg left
                  <input
                    type="color"
                    value={settings.cardBgLeft ?? "#130716"}
                    onChange={(e) => update("cardBgLeft", e.target.value)}
                  />
                </label>

                <label>
                  Card bg right
                  <input
                    type="color"
                    value={settings.cardBgRight ?? "#005e70"}
                    onChange={(e) => update("cardBgRight", e.target.value)}
                  />
                </label>
              </div>

              <OptionSlider
                label="Card bg balance"
                optionLabel="Card bg gradient"
                checked={settings.cardBgGradientEnabled}
                onCheckedChange={(checked) =>
                  update("cardBgGradientEnabled", checked)
                }
                value={settings.cardBgGradientBalance ?? 50}
                min={0}
                max={100}
                disabled={!settings.cardBgGradientEnabled}
                onChange={(v) => update("cardBgGradientBalance", v)}
              />

              <Slider
                label="Card bg opacity"
                value={settings.cardBgOpacity ?? 86}
                min={0}
                max={100}
                onChange={(v) => update("cardBgOpacity", v)}
              />

              </fieldset>

              <fieldset
                className={`setting-scope ${settings.showBackgroundImage ? "" : "is-disabled"}`}
                disabled={!(settings.showBackgroundImage)}
              >
              <label>
                Background image / GIF URL
                <input
                  value={settings.bgUrl}
                  onChange={(e) => update("bgUrl", e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <Slider
                label="Background X"
                value={settings.bgX}
                min={0}
                max={100}
                onChange={(v) => update("bgX", v)}
              />

              <Slider
                label="Background Y"
                value={verticalSliderValue(settings.bgY)}
                min={0}
                max={100}
                onChange={(v) => update("bgY", storedTopValue(v))}
              />

              <MappedSlider
                label="Background zoom"
                value={settings.bgZoom}
                minValue={25}
                maxValue={350}
                onChange={(v) => update("bgZoom", v)}
              />
              </fieldset>

            </div>
          </details>

          <details className="design-group">
            <summary>
              <span className="summary-copy">
                <span className="summary-title">Main Text</span>
                <small>名前・レート・ランクの文字と位置を設定します。</small>
              </span>
            </summary>

            <div className="design-group-body">
              <fieldset
                className={`setting-scope ${settings.showName || settings.showRate || settings.showRankText || settings.showTrackTagText || settings.showRatingLabelText ? "" : "is-disabled"}`}
                disabled={!(settings.showName || settings.showRate || settings.showRankText || settings.showTrackTagText || settings.showRatingLabelText)}
              >
                            <label>
                Text font
                <select
                  value={settings.textFont ?? "DEFAULT"}
                  onChange={(e) =>
                    update("textFont", e.target.value as FontChoice)
                  }
                >
                  <option value="DEFAULT">Default</option>
                  <option value="OEDO_KANTEIRYU">大江戸勘亭流</option>
                  <option value="YU_GOTHIC">Yu Gothic</option>
                  <option value="MEIRYO">Meiryo</option>
                  <option value="MINCHO">Yu Mincho</option>
                  <option value="ARIAL">Arial</option>
                  <option value="IMPACT">Impact</option>
                  <option value="TREBUCHET">Trebuchet MS</option>
                  <option value="VERDANA">Verdana</option>
                  <option value="GEORGIA">Georgia</option>
                  <option value="TIMES">Times New Roman</option>
                  <option value="COURIER">Courier New</option>
                  <option value="COMIC_SANS">Comic Sans MS</option>
                </select>
              </label>

<div className="two-col">
                <label>
                  Text top color
                  <input
                    type="color"
                    value={settings.textTopColor ?? "#ffffff"}
                    onChange={(e) => update("textTopColor", e.target.value)}
                  />
                </label>

                <label>
                  Text bottom color
                  <input
                    type="color"
                    value={settings.textBottomColor ?? "#cfd6ff"}
                    onChange={(e) => update("textBottomColor", e.target.value)}
                  />
                </label>
              </div>

              <OptionSlider
                label="Text gradient balance"
                optionLabel="Text gradient"
                checked={settings.textGradientEnabled}
                onCheckedChange={(checked) => update("textGradientEnabled", checked)}
                value={settings.textGradientBalance ?? 40}
                min={0}
                max={100}
                disabled={!settings.textGradientEnabled}
                onChange={(v) => update("textGradientBalance", v)}
              />

              <div className="design-subtitle">Text shadow</div>

              <div className="two-col">
                <label>
                  Shadow color
                  <input
                    type="color"
                    value={settings.textShadowColor}
                    disabled={!settings.textShadowEnabled}
                    onChange={(e) => update("textShadowColor", e.target.value)}
                  />
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.textShadowEnabled}
                    onChange={(e) => update("textShadowEnabled", e.target.checked)}
                  />
                  Text shadow
                </label>
              </div>

              <Slider label="Shadow X" value={settings.textShadowX} min={0} max={100} disabled={!settings.textShadowEnabled} onChange={(v) => update("textShadowX", v)} />
              <Slider label="Shadow Y" value={settings.textShadowY} min={0} max={100} disabled={!settings.textShadowEnabled} onChange={(v) => update("textShadowY", v)} />
              <Slider label="Shadow blur" value={settings.textShadowBlur} min={0} max={100} disabled={!settings.textShadowEnabled} onChange={(v) => update("textShadowBlur", v)} />
              <Slider label="Shadow opacity" value={settings.textShadowOpacity} min={0} max={100} disabled={!settings.textShadowEnabled} onChange={(v) => update("textShadowOpacity", v)} />

              </fieldset>

              <fieldset
                className={`setting-scope ${settings.showName ? "" : "is-disabled"}`}
                disabled={!(settings.showName)}
              >
              <div className="design-subtitle">Name text position</div>

              <Slider
                label="Name X"
                value={settings.nameX}
                min={0}
                max={100}
                onChange={(v) => update("nameX", v)}
              />

              <Slider
                label="Name Y"
                value={verticalSliderValue(settings.nameY)}
                min={0}
                max={100}
                onChange={(v) => update("nameY", storedTopValue(v))}
              />

              <MappedSlider
                label="Name size"
                value={settings.nameSize}
                minValue={4}
                maxValue={120}
                onChange={(v) => update("nameSize", v)}
              />

              <MappedSlider
                label="Name spacing"
                value={settings.nameTextSpacing}
                minValue={0}
                maxValue={40}
                onChange={(v) => update("nameTextSpacing", v)}
              />


              </fieldset>

              <fieldset
                className={`setting-scope ${settings.showRate ? "" : "is-disabled"}`}
                disabled={!(settings.showRate)}
              >
              <div className="design-subtitle">Rate number layout</div>

              <Slider
                label="Rate X"
                value={settings.scoreX}
                min={0}
                max={100}
                onChange={(v) => update("scoreX", v)}
              />

              <Slider
                label="Rate Y"
                value={verticalSliderValue(settings.scoreY)}
                min={0}
                max={100}
                onChange={(v) => update("scoreY", storedTopValue(v))}
              />

              <MappedSlider
                label="Rate size"
                value={settings.scoreSize}
                minValue={6}
                maxValue={160}
                onChange={(v) => update("scoreSize", v)}
              />

              <MappedSlider
                label="Rate spacing"
                value={settings.scoreTextSpacing}
                minValue={0}
                maxValue={40}
                onChange={(v) => update("scoreTextSpacing", v)}
              />

              </fieldset>

              <fieldset
                className={`setting-scope ${settings.showRankText ? "" : "is-disabled"}`}
                disabled={!(settings.showRankText)}
              >
              <div className="design-subtitle">Rank text layout</div>

              <Slider
                label="Rank text X"
                value={settings.rankTextX}
                min={0}
                max={100}
                onChange={(v) => update("rankTextX", v)}
              />

              <Slider
                label="Rank text Y"
                value={verticalSliderValue(settings.rankTextY)}
                min={0}
                max={100}
                onChange={(v) => update("rankTextY", storedTopValue(v))}
              />

              <MappedSlider
                label="Rank text size"
                value={settings.rankTextSize}
                minValue={4}
                maxValue={90}
                onChange={(v) => update("rankTextSize", v)}
              />
              </fieldset>

              <fieldset
                className={`setting-scope ${settings.showRankIcon ? "" : "is-disabled"}`}
                disabled={!settings.showRankIcon}
              >
                <div className="design-subtitle">Rank icon layout</div>
                <Slider label="Rank icon X" value={settings.rankIconX} min={0} max={100} onChange={(v) => update("rankIconX", v)} />
                <Slider label="Rank icon Y" value={verticalSliderValue(settings.rankIconY)} min={0} max={100} onChange={(v) => update("rankIconY", storedTopValue(v))} />
                <MappedSlider label="Rank icon size" value={settings.rankIconSize} minValue={0} maxValue={150} onChange={(v) => update("rankIconSize", v)} />
              </fieldset>

            </div>
          </details>

<details className="design-group">
            <summary>
              <span className="summary-copy">
                <span className="summary-title">Track / Rating Labels</span>
                <small>RT/CTとMMR/LRの文字スタイルと位置を設定します。</small>
              </span>
            </summary>

            <div className="design-group-body">

              <fieldset
                className={`setting-scope ${settings.showTrackTagText ? "" : "is-disabled"}`}
                disabled={!(settings.showTrackTagText)}
              >
              <div className="two-col">
                <label>
                  Track text top
                  <input
                    type="color"
                    value={settings.tagTextTopColor ?? "#ffffff"}
                    onChange={(e) => update("tagTextTopColor", e.target.value)}
                  />
                </label>

                <label>
                  Track text bottom
                  <input
                    type="color"
                    value={settings.tagTextBottomColor ?? "#ff3030"}
                    onChange={(e) =>
                      update("tagTextBottomColor", e.target.value)
                    }
                  />
                </label>
              </div>

              <OptionSlider
                label="Track text balance"
                optionLabel="Track text gradient"
                checked={settings.tagTextGradientEnabled}
                onCheckedChange={(checked) =>
                  update("tagTextGradientEnabled", checked)
                }
                value={settings.tagTextGradientBalance ?? 40}
                min={0}
                max={100}
                disabled={!settings.tagTextGradientEnabled}
                onChange={(v) => update("tagTextGradientBalance", v)}
              />

              </fieldset>

              <fieldset
                className={`setting-scope ${settings.showTrackTagText ? "" : "is-disabled"}`}
                disabled={!(settings.showTrackTagText)}
              >
              <div className="design-subtitle">Track text layout</div>

              <Slider
                label="Track text X"
                value={settings.tagX}
                min={0}
                max={100}
                onChange={(v) => update("tagX", v)}
              />

              <Slider
                label="Track text Y"
                value={verticalSliderValue(settings.tagY)}
                min={0}
                max={100}
                onChange={(v) => update("tagY", storedTopValue(v))}
              />

              <MappedSlider
                label="Track tag text size"
                value={settings.tagTextSize}
                minValue={4}
                maxValue={90}
                onChange={(v) => update("tagTextSize", v)}
              />

              <MappedSlider
                label="Track tag text spacing"
                value={settings.tagTextSpacing}
                minValue={0}
                maxValue={50}
                onChange={(v) => update("tagTextSpacing", v)}
              />

              </fieldset>

              <div className="design-subtitle">Rating label</div>

              <fieldset
                className={`setting-scope ${settings.showRatingLabelText ? "" : "is-disabled"}`}
                disabled={!(settings.showRatingLabelText)}
              >
              <div className="two-col">
                <label>
                  Rating text top
                  <input
                    type="color"
                    value={settings.ratingTextTopColor ?? "#ffffff"}
                    onChange={(e) =>
                      update("ratingTextTopColor", e.target.value)
                    }
                  />
                </label>

                <label>
                  Rating text bottom
                  <input
                    type="color"
                    value={settings.ratingTextBottomColor ?? "#ff3030"}
                    onChange={(e) =>
                      update("ratingTextBottomColor", e.target.value)
                    }
                  />
                </label>
              </div>

              <OptionSlider
                label="Rating text balance"
                optionLabel="Rating text gradient"
                checked={settings.ratingTextGradientEnabled}
                onCheckedChange={(checked) =>
                  update("ratingTextGradientEnabled", checked)
                }
                value={settings.ratingTextGradientBalance ?? 40}
                min={0}
                max={100}
                disabled={!settings.ratingTextGradientEnabled}
                onChange={(v) => update("ratingTextGradientBalance", v)}
              />

              <MappedSlider
                label="Rating text size"
                value={settings.ratingTextSize}
                minValue={4}
                maxValue={90}
                onChange={(v) => update("ratingTextSize", v)}
              />

              <MappedSlider
                label="Rating text spacing"
                value={settings.ratingTextSpacing}
                minValue={0}
                maxValue={50}
                onChange={(v) => update("ratingTextSpacing", v)}
              />

              </fieldset>

              <fieldset
                className={`setting-scope ${settings.showRatingLabelText ? "" : "is-disabled"}`}
                disabled={!(settings.showRatingLabelText)}
              >
              <div className="design-subtitle">Rating text layout</div>

              <Slider
                label="Rating text X"
                value={settings.ratingBoxX}
                min={0}
                max={100}
                onChange={(v) => update("ratingBoxX", v)}
              />

              <Slider
                label="Rating text Y"
                value={verticalSliderValue(settings.ratingBoxY)}
                min={0}
                max={100}
                onChange={(v) => update("ratingBoxY", storedTopValue(v))}
              />

              </fieldset>

            </div>
          </details>

          <details className="design-group">
            <summary>
              <span className="summary-copy">
                <span className="summary-title">Effects</span>
                <small>レート切り替えとランク変動の演出を選びます。</small>
              </span>
            </summary>

            <div className="design-group-body">
              <div className="design-subtitle">Rank change effect</div>
              <label>
                Rank Up / Down style
                <select
                  value={settings.rankEffectStyle}
                  onChange={(e) =>
                    update("rankEffectStyle", e.target.value as RankEffectStyle)
                  }
                >
                  <option value="CLASSIC">Classic reveal</option>
                  <option value="FLASH">Light flash</option>
                  <option value="SLIDE">Side slide</option>
                  <option value="BURST">Energy burst</option>
                  <option value="STARLIGHT">Starlight</option>
                  <option value="METEOR">Meteor shower</option>
                </select>
              </label>

              <div className="design-subtitle">MMR / LR switch effect</div>
              <label>
                Switch style
                <select
                  value={settings.ratingSwitchEffectStyle}
                  onChange={(e) =>
                    update(
                      "ratingSwitchEffectStyle",
                      e.target.value as RatingSwitchEffectStyle
                    )
                  }
                >
                  <option value="WAVE">Wave</option>
                  <option value="FADE">Soft fade</option>
                  <option value="FLIP">3D flip</option>
                  <option value="GLITCH">Digital glitch</option>
                </select>
              </label>

              <div className="design-subtitle">Effect color</div>
              <div className="two-col">
                <label>
                  Effect color
                  <input
                    type="color"
                    value={settings.ratingEffectColor ?? "#ff3030"}
                    disabled={settings.ratingEffectUseMainColor}
                    onChange={(e) => update("ratingEffectColor", e.target.value)}
                  />
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.ratingEffectUseMainColor}
                    onChange={(e) =>
                      update("ratingEffectUseMainColor", e.target.checked)
                    }
                  />
                  Use border color
                </label>
              </div>
            </div>
          </details>

          <details className="design-group">
            <summary>
              <span className="summary-copy">
                <span className="summary-title">Border / Flow</span>
                <small>カード外枠と流れる光を設定します。</small>
              </span>
            </summary>

            <div className="design-group-body">
              <div className="design-subtitle">Border colors</div>
              <div className="two-col">
                <label>
                  Border color
                  <input
                    type="color"
                    value={settings.borderColor ?? "#ff0000"}
                    onChange={(e) => update("borderColor", e.target.value)}
                  />
                </label>

                <label>
                  Flowing border color
                  <input
                    type="color"
                    value={settings.flowColor ?? "#ff3030"}
                    onChange={(e) => update("flowColor", e.target.value)}
                  />
                </label>
              </div>

              <div className="design-subtitle">Flow animation</div>

              <OptionSlider
                label="Flow speed"
                optionLabel="Flowing border"
                checked={settings.flowEnabled}
                onCheckedChange={(checked) => update("flowEnabled", checked)}
                value={settings.flowSpeed ?? 65}
                min={0}
                max={100}
                disabled={!settings.flowEnabled}
                onChange={(v) => update("flowSpeed", v)}
              />

              <MappedSlider
                label="Flow length"
                value={settings.flowLength ?? 16}
                minValue={1}
                maxValue={96}
                disabled={!settings.flowEnabled}
                onChange={(v) => update("flowLength", v)}
              />


            </div>
          </details>

          

          <details className="design-group">
            <summary>
              <span className="summary-copy">
                <span className="summary-title">Other</span>
                <small>旗と好きな画像の配置を設定します。</small>
              </span>
            </summary>

            <div className="design-group-body">
              <fieldset
                className={`setting-scope ${settings.showCustomImage ? "" : "is-disabled"}`}
                disabled={!(settings.showCustomImage)}
              >
              <label>
                Image URL
                <input
                  value={settings.customImageUrl}
                  onChange={(e) => update("customImageUrl", e.target.value)}
                  placeholder="https://example.com/image.png"
                />
              </label>

              <Slider label="Image X" value={settings.customImageX} min={0} max={100} onChange={(v) => update("customImageX", v)} />
              <Slider label="Image Y" value={verticalSliderValue(settings.customImageY)} min={0} max={100} onChange={(v) => update("customImageY", storedTopValue(v))} />
              <MappedSlider label="Image Z" value={settings.customImageZ} minValue={0} maxValue={100} onChange={(v) => update("customImageZ", v)} />
              <MappedSlider label="Image size" value={settings.customImageSize} minValue={0} maxValue={650} onChange={(v) => update("customImageSize", v)} />
              <Slider label="Image transparency" value={settings.customImageGradient} min={0} max={100} onChange={(v) => update("customImageGradient", v)} />
              <p className="control-note">0 = fully visible / 100 = fully transparent</p>
              </fieldset>

              <div className="design-subtitle">Flag layout</div>
              <fieldset
                className={`setting-scope ${settings.showFlag ? "" : "is-disabled"}`}
                disabled={!(settings.showFlag)}
              >
              <Slider
                label="Flag X"
                value={settings.flagX}
                min={0}
                max={100}
                onChange={(v) => update("flagX", v)}
              />

              <Slider
                label="Flag Y"
                value={verticalSliderValue(settings.flagY)}
                min={0}
                max={100}
                onChange={(v) => update("flagY", storedTopValue(v))}
              />

              <MappedSlider
                label="Flag size"
                value={settings.flagSize}
                minValue={4}
                maxValue={100}
                onChange={(v) => update("flagSize", v)}
              />

              </fieldset>

            </div>
          </details>

        </section>

        <section className="panel preview-panel">
          <h2>Live preview</h2>

          <div className="preview-stage">
            <Card
              settings={settings}
              effect={previewEffect}
              rankRevealVisible={previewRankRevealVisible}
              activeMode={settings.mode === "CT" ? "CT" : "RT"}
              activeRating={previewActiveRating}
              previewScoreBump={previewScoreBump}
              previewScoreAnimationToken={previewScoreAnimationToken}
              previewSwitchAnimationToken={previewSwitchAnimationToken}
              rankOrder={rankOrder}
            />
          </div>

          <div className="animation-buttons">
            <button type="button" onClick={() => triggerPreviewEffect("win")}>
              Win
            </button>

            <button type="button" onClick={() => triggerPreviewEffect("loss")}>
              Loss
            </button>

            <button
              type="button"
              onClick={() => triggerPreviewEffect("rank-up")}
            >
              Rank Up
            </button>

            <button
              type="button"
              onClick={() => triggerPreviewEffect("rank-down")}
            >
              Rank Down
            </button>
          </div>

          <h2>OBS Browser Source URL</h2>

          <div className="url-row">
            <input readOnly value={cardUrl} />
            <button onClick={copyUrl}>{copied ? "Copied" : "Copy"}</button>
          </div>

          <a className="open-link" href={cardUrl} target="_blank">
            Open card in new tab ↗
          </a>

          <h2>Share design JSON</h2>

          <div className="share-buttons">
            <button type="button" onClick={copySettingsText}>
              {settingsCopied ? "Copied" : "Copy design"}
            </button>

            <button type="button" onClick={toggleImportSettings}>
              {showImportSettings ? "Close paste box" : "Paste design"}
            </button>
          </div>

          {showImportSettings && (
            <div className="share-import-area">
              <label>
                Paste design text
                <textarea
                  className="settings-textarea"
                  value={importSettingsText}
                  onChange={(e) => setImportSettingsText(e.target.value)}
                  placeholder='{"borderColor":"#000000","bgZoom":100} などのJSON'
                />
              </label>

              <button
                type="button"
                className="load-settings-button"
                onClick={importSettings}
              >
                Load pasted design
              </button>
            </div>
          )}

          {importSettingsStatus && (
            <p className="share-status">{importSettingsStatus}</p>
          )}

          <button
            className="reset-button"
            onClick={() => setSettings(defaultSettings)}
          >
            Reset settings
          </button>

          <details className="version-history">
            <summary>Version history</summary>
            <div className="version-history-body">
              <div>
                <b>v1.9.4</b>
                <span>Increased the opacity and contrast of the Rank Up / Rank Down announcement and New Rank reveal so the text, emblem, stars, and meteor effects remain clearly visible.</span>
              </div>
              <div>
                <b>v1.9.3</b>
                <span>Reduced all MMR / LR Switch effects to quieter, smaller transitions with softer movement, glow, flip, and glitch intensity.</span>
              </div>
              <div>
                <b>v1.9.2</b>
                <span>Fixed the MMR / LR Switch effect styles and changed the default Card bg right color to RGB 0, 94, 112.</span>
              </div>
              <div>
                <b>v1.9.1</b>
                <span>Reduced the full-card rate arrows from 24 to 12 while keeping their larger, thicker appearance and full-width coverage.</span>
              </div>
              <div>
                <b>v1.9.0</b>
                <span>Made the full-card rate arrows substantially larger and thicker by switching to filled arrow glyphs and stronger outlines.</span>
              </div>
              <div>
                <b>v1.8.9</b>
                <span>Expanded the rate-change arrows across the full card, increased their size and count, and fixed the colors to green for gains and red for losses.</span>
              </div>
              <div>
                <b>v1.8.8</b>
                <span>Fixed the invisible rate arrows and corrected Meteor Shower so each meteor travels from the upper right toward the lower left with the glowing head leading.</span>
              </div>
              <div>
                <b>v1.8.7</b>
                <span>Added a directional arrow stream during rate changes while preserving the rate change → rank announcement → new rank reveal sequence.</span>
              </div>
              <div>
                <b>v1.8.6</b>
                <span>Restored the RANK UP / RANK DOWN announcement and delayed the selected rank reveal until after the announcement finishes.</span>
              </div>
              <div>
                <b>v1.8.5</b>
                <span>Separated the rank reveal from the RANK UP / DOWN text to prevent overlap, added Starlight and Meteor Shower reveal styles, and expanded star-based rank visuals.</span>
              </div>
              <div>
                <b>v1.8.3</b>
                <span>Removed the score settle artifact, moved Track / Rating Labels directly after Main Text, and added direction-specific Rank Up / Rank Down reveal effects.</span>
              </div>
              <div>
                <b>v1.8.2</b>
                <span>Updated the default design preset, preserved decimal mapped values, and removed the stray Win/Loss floating text while keeping the score and card animations.</span>
              </div>
              <div>
                <b>v1.8.1</b>
                <span>Hardened saved/design/API JSON parsing and switched local development to Webpack to prevent stale Turbopack JSON runtime failures.</span>
              </div>
              <div>
                <b>v1.8.0</b>
                <span>Fixed negative-MMR rank transitions, added selectable rank and rating-switch effects, added name/rate spacing controls, and introduced a black multi-accent builder theme.</span>
              </div>
              <div>
                <b>v1.7.0</b>
                <span>Normalized all sliders to 0–100, expanded placement and sizing ranges, fixed text gradients, merged label controls, added configurable text shadows, reorganized design groups, and refreshed the builder theme.</span>
              </div>
              <div>
                <b>v1.6.8</b>
                <span>Registered the remade font file as 大江戸勘亭流 using public/fonts/remake.otf.</span>
              </div>
              <div>
                <b>v1.6.7</b>
                <span>Corrected FOT-大江戸勘亭流 Std E using its exact internal names and original filename.</span>
              </div>
              <div>
                <b>v1.6.6</b>
                <span>Changed the default MMR, LR, and Rank Text values to blank.</span>
              </div>
              <div>
                <b>v1.6.5</b>
                <span>Changed the default background image URL to blank.</span>
              </div>
              <div>
                <b>v1.6.4</b>
                <span>Updated the default card preset, background, flag, rank icon, rating, and layout values.</span>
              </div>
              <div>
                <b>v1.6.3</b>
                <span>Removed the remaining Track Tag and Rating Label visual boxes and box-size controls.</span>
              </div>
              <div>
                <b>v1.6.2</b>
                <span>Removed Track Tag and Rating Label box color/gradient controls.</span>
              </div>
              <div>
                <b>v1.6.1</b>
                <span>Removed label box/shape controls and added overall overlay transparency.</span>
              </div>
              <div>
                <b>v1.6.0</b>
                <span>Rating Label behavior aligned with Track Tag, visibility-linked controls, persistent category descriptions, and corrected FOT-大江戸勘亭流 Std E support.</span>
              </div>
              <div>
                <b>v1.5.0</b>
                <span>Text / Box visibility split, image transparency fix, and font selector including 大江戸勘亭流 Std.</span>
              </div>
              <div>
                <b>v1.4.0</b>
                <span>Visibility toggles, custom image overlay, sizing fixes, and display-name fix.</span>
              </div>
              <div>
                <b>v1.3.0</b>
                <span>Soft Star / Heart labels and independent text spacing controls.</span>
              </div>
              <div>
                <b>v1.2.0</b>
                <span>JSON design sharing and independent Track / Rating styling.</span>
              </div>
              <p>Older OBS URLs and design JSON remain supported. New settings use safe defaults when missing.</p>
            </div>
          </details>

          <div className="bottom-fetch-block">
            <div className="fetch-button-row">
              <button type="button" onClick={fetchPlayer}>
                Fetch player
              </button>

              <button type="button" onClick={fetchRanks}>
                Rank list
              </button>
            </div>

            <div className="fetch-status-row">
              <span>{apiStatus}</span>
              <span>{rankStatus}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


function NumberStepper(props: {
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const clamp = (value: number) =>
    Math.min(props.max, Math.max(props.min, value));

  return (
    <div className={`number-stepper ${props.disabled ? "is-disabled" : ""}`}>
      <button
        type="button"
        disabled={props.disabled || props.value <= props.min}
        onClick={() => props.onChange(clamp(props.value - 1))}
        aria-label="Decrease"
      >
        −
      </button>

      <input
        type="number"
        min={props.min}
        max={props.max}
        disabled={props.disabled}
        value={props.value}
        onChange={(e) => props.onChange(clamp(Number(e.target.value) || props.min))}
      />

      <button
        type="button"
        disabled={props.disabled || props.value >= props.max}
        onClick={() => props.onChange(clamp(props.value + 1))}
        aria-label="Increase"
      >
        ＋
      </button>
    </div>
  );
}

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className={`slider-label ${props.disabled ? "is-disabled" : ""}`}>
      <span>
        {props.label ? <span>{props.label}</span> : <span />}
        <b>{props.value}</b>
      </span>

      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        disabled={props.disabled}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  );
}

function MappedSlider(props: {
  label: string;
  value: number;
  minValue: number;
  maxValue: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <Slider
      label={props.label}
      value={valueToSlider(props.value, props.minValue, props.maxValue)}
      min={0}
      max={100}
      disabled={props.disabled}
      onChange={(value) =>
        props.onChange(sliderToValue(value, props.minValue, props.maxValue))
      }
    />
  );
}

function OptionSlider(props: {
  label: string;
  optionLabel: string;
  checked: boolean;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  onChange: (value: number) => void;
}) {
  return (
    <div className="option-slider">
      <div className="option-slider-head">
        {props.label ? <span>{props.label}</span> : <span />}
        <b>{props.value}</b>

        <label className="mini-checkbox">
          <input
            type="checkbox"
            checked={props.checked}
            onChange={(e) => props.onCheckedChange(e.target.checked)}
          />
          <span>{props.optionLabel}</span>
        </label>
      </div>

      <Slider
        label=""
        value={props.value}
        min={props.min}
        max={props.max}
        disabled={props.disabled}
        onChange={props.onChange}
      />
    </div>
  );
}

function Card({
  settings,
  effect,
  rankRevealVisible,
  activeMode,
  activeRating,
  previewScoreBump,
  previewScoreAnimationToken,
  previewSwitchAnimationToken,
  rankOrder,
}: {
  settings: Settings;
  effect: PreviewEffect;
  rankRevealVisible: boolean;
  activeMode: ActiveMode;
  activeRating: ActiveRating;
  previewScoreBump: PreviewScoreBump;
  previewScoreAnimationToken: number;
  previewSwitchAnimationToken: number;
  rankOrder: RankEntry[];
}) {
  const name = settings.displayName || settings.loungeName || "Your Name";
  const baseScore = activeRating === "MMR" ? settings.mmr : settings.lr;
  const shownScore = applyPreviewBump(
    baseScore,
    activeRating,
    previewScoreBump
  );

  const cardBgStops = gradientStops(settings.cardBgGradientBalance, 50);
  const cardBgAlpha = alphaHexFromPercent(settings.cardBgOpacity, 86);

  const visibleBackgroundUrl = settings.showBackgroundImage ? settings.bgUrl : "";

  const cardBackground = settings.cardBgGradientEnabled
    ? visibleBackgroundUrl
      ? `linear-gradient(90deg, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} 0%, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} ${cardBgStops.topStop}%, ${hexWithAlpha(settings.cardBgRight, cardBgAlpha)} ${cardBgStops.bottomStart}%, ${hexWithAlpha(settings.cardBgRight, cardBgAlpha)} 100%), url(${visibleBackgroundUrl})`
      : `linear-gradient(90deg, ${settings.cardBgLeft ?? "#130716"} 0%, ${settings.cardBgLeft ?? "#130716"} ${cardBgStops.topStop}%, ${settings.cardBgRight ?? "#005e70"} ${cardBgStops.bottomStart}%, ${settings.cardBgRight ?? "#005e70"} 100%)`
    : visibleBackgroundUrl
      ? `linear-gradient(90deg, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} 0%, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} 100%), url(${visibleBackgroundUrl})`
      : `linear-gradient(90deg, ${settings.cardBgLeft ?? "#130716"} 0%, ${settings.cardBgLeft ?? "#130716"} 100%)`;

  const customImageTransparency = percent(settings.customImageGradient, 0);
  const customImageOpacity = Math.max(
    0,
    Math.min(1, 1 - customImageTransparency / 100)
  );

  const previewRank = getPreviewRank(settings.rankText, effect, rankOrder);
  const previewRankIcon = previewRank.emblem || settings.rankIconUrl;

  const tagBoxStops = gradientStops(settings.tagBoxGradientBalance, 50);
  const tagTextStops = gradientStops(settings.tagTextGradientBalance, 40);
  const ratingBoxStops = gradientStops(settings.ratingBoxGradientBalance, 50);
  const ratingTextStops = gradientStops(settings.ratingTextGradientBalance, 40);
  const textStops = gradientStops(settings.textGradientBalance, 40);
  const ratingEffectColor = settings.ratingEffectUseMainColor
    ? settings.borderColor
    : settings.ratingEffectColor;
  const textShadowColor = settings.textShadowEnabled
    ? hexWithAlpha(
        settings.textShadowColor,
        alphaHexFromPercent(settings.textShadowOpacity, 70)
      )
    : "transparent";


  return (
    <div
      className={`card-shell ${
        settings.textFont === "OEDO_KANTEIRYU" ? "font-oedo-kanteiryu" : ""
      } ${!settings.flowEnabled ? "no-flow" : ""} ${
        !settings.tagBoxGradientEnabled ? "no-tag-box-gradient" : ""
      } ${!settings.tagTextGradientEnabled ? "no-tag-text-gradient" : ""} ${
        !settings.ratingBoxGradientEnabled ? "no-rating-box-gradient" : ""
      } ${!settings.ratingTextGradientEnabled ? "no-rating-text-gradient" : ""} ${
        !settings.textGradientEnabled ? "no-text-gradient" : ""
      } ${!settings.cardBgGradientEnabled ? "no-card-bg-gradient" : ""} label-shape-rounded ${
        `rank-effect-style-${settings.rankEffectStyle.toLowerCase()} rating-switch-style-${settings.ratingSwitchEffectStyle.toLowerCase()}`
      } ${
        effect ? `effect-${effect}` : ""
      }`}
      style={
        {
          opacity: Math.max(
            0,
            Math.min(1, 1 - (settings.overallTransparency ?? 0) / 100)
          ),
          transform: `scale(${settings.cardScale / 100})`,
          backgroundImage: settings.showCardBackground ? cardBackground : "none",
          backgroundPosition: `${settings.bgX}% ${settings.bgY}%`,
          backgroundSize: `${settings.bgZoom}%`,
          borderColor: "transparent",
          boxShadow: `0 0 28px ${(settings.borderColor ?? "#ff0000")}44, inset 0 0 24px #ffffff10`,
          "--border-color": settings.borderColor ?? "#ff0000",
          "--flow-color": settings.flowColor ?? "#ff3030",
          "--rating-effect-color": ratingEffectColor ?? "#ff3030",
          "--flow-speed": flowDuration(settings.flowSpeed),
          "--flow-length": String(percent(settings.flowLength, 16)),
          "--flow-gap": String(100 - percent(settings.flowLength, 16)),
          "--tag-top-color": settings.tagTopColor ?? "#b90000",
          "--tag-bottom-color": settings.tagBottomColor ?? "#000000",
          "--tag-text-top-color": settings.tagTextTopColor ?? "#ffffff",
          "--tag-text-bottom-color": settings.tagTextBottomColor ?? "#ff3030",
          "--tag-box-top-stop": `${tagBoxStops.topStop}%`,
          "--tag-box-bottom-start": `${tagBoxStops.bottomStart}%`,
          "--tag-text-top-stop": `${tagTextStops.topStop}%`,
          "--tag-text-bottom-start": `${tagTextStops.bottomStart}%`,
          "--rating-top-color": settings.ratingBoxTopColor ?? "#b90000",
          "--rating-bottom-color": settings.ratingBoxBottomColor ?? "#000000",
          "--rating-text-top-color": settings.ratingTextTopColor ?? "#ffffff",
          "--rating-text-bottom-color": settings.ratingTextBottomColor ?? "#ff3030",
          "--rating-box-top-stop": `${ratingBoxStops.topStop}%`,
          "--rating-box-bottom-start": `${ratingBoxStops.bottomStart}%`,
          "--rating-text-top-stop": `${ratingTextStops.topStop}%`,
          "--rating-text-bottom-start": `${ratingTextStops.bottomStart}%`,
          "--label-radius": `${settings.labelRadius ?? 10}px`,
          "--card-font": fontFamily(settings.textFont),
          "--text-top-color": settings.textTopColor ?? "#ffffff",
          "--text-bottom-color": settings.textBottomColor ?? "#ff3030",
          "--text-top-stop": `${textStops.topStop}%`,
          "--text-bottom-start": `${textStops.bottomStart}%`,
          "--text-shadow-x": `${shadowOffsetX(settings.textShadowX)}px`,
          "--text-shadow-y": `${shadowOffsetY(settings.textShadowY)}px`,
          "--text-shadow-blur": `${shadowBlur(settings.textShadowBlur)}px`,
          "--text-shadow-color": textShadowColor,
        } as CSSProperties
      }
    >
      <svg
        className="flow-border-svg"
        viewBox="0 0 650 150"
        aria-hidden="true"
      >
        <rect
          className="flow-border-path"
          x="1"
          y="1"
          width="648"
          height="148"
          rx="69"
          ry="69"
          pathLength={100}
        />
      </svg>

      {settings.showCustomImage && settings.customImageUrl && (
        <img
          className="custom-overlay-image"
          src={settings.customImageUrl}
          alt=""
          style={{
            left: `${settings.customImageX}%`,
            top: `${settings.customImageY}%`,
            zIndex: settings.customImageZ,
            width: settings.customImageSize,
            opacity: customImageOpacity,
          }}
        />
      )}

      {settings.showRankIcon && settings.rankIconUrl && (
        <img
          className="rank-icon"
          src={settings.rankIconUrl}
          alt=""
          style={{
            left: `${settings.rankIconX}%`,
            top: `${settings.rankIconY}%`,
            width: settings.rankIconSize,
            height: settings.rankIconSize,
          }}
        />
      )}

      {(settings.showTrackTagText) && (
        <div
          className="mode-tag"
          style={{
            left: `${settings.tagX}%`,
            top: `${settings.tagY}%`,
            fontSize: settings.tagTextSize,
            letterSpacing: `${(settings.tagTextSpacing ?? 0) / 100}em`,
          }}
        >
          {settings.showTrackTagText && (
            <span className="tag-text">{activeMode}</span>
          )}
        </div>
      )}

      {settings.showFlag && (
        <div
          className={`flag-badge ${settings.flagUrl ? "has-image" : ""}`}
          style={{
            left: `${settings.flagX}%`,
            top: `${settings.flagY}%`,
            width: Math.round(settings.flagSize * 1.92),
            height: Math.round(settings.flagSize * 1.42),
            fontSize: settings.flagSize,
            background: settings.flagUrl
              ? "rgba(255, 255, 255, .92)"
              : (settings.borderColor ?? "#000000"),
          }}
        >
          {settings.flagUrl ? (
            <img className="flag-image" src={settings.flagUrl} alt="" />
          ) : (
            settings.flag
          )}
        </div>
      )}

      {settings.showName && (
        <div
          className="card-name"
          style={{
            left: `${settings.nameX}%`,
            top: `${settings.nameY}%`,
            fontSize: settings.nameSize,
            letterSpacing: `${(settings.nameTextSpacing ?? 0) / 100}em`,
          }}
        >
          {name}
        </div>
      )}

      {settings.showRate && settings.ratingMode === "SWITCH" && previewSwitchAnimationToken > 0 && (
        <div
          key={`preview-switch-wave-${previewSwitchAnimationToken}`}
          className={`rating-switch-effect rating-switch-effect-${settings.ratingSwitchEffectStyle.toLowerCase()}`}
          style={{
            left: `${settings.scoreX}%`,
            top: `${settings.scoreY}%`,
          }}
        />
      )}

      {(effect === "win" || effect === "loss") && (
        <div
          className={`rating-arrow-stream ${
            effect === "win" ? "is-up" : "is-down"
          }`}
          style={{
            left: `${settings.scoreX}%`,
            top: `${settings.scoreY}%`,
          }}
          aria-hidden="true"
        >
          {Array.from({ length: 12 }, (_, index) => {
            const x = 5 + index * 8.18;
            const delay = index * 0.075;
            const duration = 1.25 + (index % 4) * 0.14;
            const size = [42, 50, 60, 46, 56, 44][index % 6];

            return (
              <span
                className="rating-arrow-particle"
                key={`preview-rating-arrow-${index}`}
                style={
                  {
                    "--arrow-x": `${x}%`,
                    "--arrow-delay": `${delay}s`,
                    "--arrow-duration": `${duration}s`,
                    "--arrow-size": `${size}px`,
                  } as CSSProperties
                }
              >
                {effect === "win" ? "⬆" : "⬇"}
              </span>
            );
          })}
        </div>
      )}

      {settings.showRate && (
        <RollingNumber
          key={`preview-score-${activeRating}-${previewSwitchAnimationToken}`}
          value={shownScore || "0000"}
          animateToken={previewScoreAnimationToken}
          className={`card-score ${
            previewSwitchAnimationToken > 0
              ? `rating-score-switch rating-score-switch-${settings.ratingSwitchEffectStyle.toLowerCase()}`
              : ""
          }`}
          style={{
            left: `${settings.scoreX}%`,
            top: `${settings.scoreY}%`,
            fontSize: settings.scoreSize,
            letterSpacing: `${(settings.scoreTextSpacing ?? 0) / 100}em`,
            columnGap: `${(settings.scoreTextSpacing ?? 0) / 100}em`,
          }}
        />
      )}

      {(settings.showRatingLabelText) && (
      <div
        key={`preview-rating-label-${activeRating}-${previewSwitchAnimationToken}`}
        className={`rating-label ${
          previewSwitchAnimationToken > 0
            ? `rating-label-switch rating-label-switch-${settings.ratingSwitchEffectStyle.toLowerCase()}`
            : ""
        }`}
        style={{
          left: `${settings.ratingBoxX}%`,
          top: `${settings.ratingBoxY}%`,
          fontSize: settings.ratingTextSize,
          letterSpacing: `${(settings.ratingTextSpacing ?? 0) / 100}em`,
        }}
      >
        {settings.showRatingLabelText && (
          <span className="tag-text">{activeRating}</span>
        )}
      </div>
      )}

      {settings.showRankText && (
      <div
        className="rank-line"
        style={{
          left: `${settings.rankTextX}%`,
          top: `${settings.rankTextY}%`,
          fontSize: settings.rankTextSize,
        }}
      >
        {cleanRankText(settings.rankText || "MKW Lounge")}
      </div>
      )}

      {(effect === "rank-up" || effect === "rank-down") &&
        !rankRevealVisible && (
          <div className={`effect-burst rank-announcement ${effect}`}>
            {effect === "rank-up" ? "RANK UP" : "RANK DOWN"}
          </div>
        )}

      {(effect === "rank-up" || effect === "rank-down") &&
        rankRevealVisible && (
        <div
          className={`rank-reveal ${effect} preview-rank-reveal rank-reveal-style-${settings.rankEffectStyle.toLowerCase()}`}
        >
          <div className="rank-reveal-stars" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => (
              <span key={`preview-rank-star-${index}`} />
            ))}
          </div>

          <div className="rank-reveal-meteors" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={`preview-rank-meteor-${index}`} />
            ))}
          </div>

          {previewRankIcon && (
            <img className="rank-reveal-bg" src={previewRankIcon} alt="" />
          )}

          <div className="rank-reveal-label">
            {effect === "rank-up" ? "NEW RANK" : "RANK CHANGED"}
          </div>

          <div className="rank-reveal-text">{previewRank.text}</div>
        </div>
      )}
    </div>
  );
}


