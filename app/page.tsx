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
type LayoutMode = "STANDARD" | "COMPACT";
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
type RatingSwitchEffectStyle = "WAVE" | "FADE" | "SLIDE" | "PULSE" | "SWEEP" | "GLITCH";
type ResultEffectStyle = "DEFAULT" | "THROTTLE" | "SKY" | "REINCARNATION" | "STARSTRUCK" | "NEONRUSH" | "SHOCKWAVE";
type EventFormat = "EVENTS" | "PREFIX" | "HASH" | "NUMBER";
type RankTextFormat = "DIVISION" | "FULL_SLASH" | "CLASS" | "FULL_BREAK";

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
  layoutMode: LayoutMode;

  ratingMode: RatingMode;
  ratingSwitchSeconds: number;
  season: string;

  flag: string;
  flagUrl: string;

  mmr: string;
  lr: string;

  rankText: string;
  rankTextFormat: RankTextFormat;
  rankIconUrl: string;
  events: string;
  otherText: string;

  borderColor: string;
  flowColor: string;
  flowEnabled: boolean;
  flowSpeed: number;
  flowLength: number;
  ratingEffectUseMainColor: boolean;
  ratingEffectColor: string;
  rankEffectStyle: RankEffectStyle;
  ratingSwitchEffectStyle: RatingSwitchEffectStyle;
  resultEffectStyle: ResultEffectStyle;
  labelIndependentColors: boolean;
  eventsFormat: EventFormat;
  eventsUseMainColor: boolean;
  eventsColor: string;
  otherTextUseMainColor: boolean;
  otherTextColor: string;
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
  rankTextSpacing: number;

  eventsX: number;
  eventsY: number;
  eventsSize: number;
  eventsSpacing: number;

  otherTextX: number;
  otherTextY: number;
  otherTextSize: number;
  otherTextSpacing: number;

  flagX: number;
  flagY: number;
  flagSize: number;

  rankIconX: number;
  rankIconY: number;
  rankIconSize: number;

  compactNameX: number;
  compactNameY: number;
  compactNameSize: number;
  compactScoreX: number;
  compactScoreY: number;
  compactScoreSize: number;
  compactRatingX: number;
  compactRatingY: number;
  compactRatingSize: number;
  compactTagX: number;
  compactTagY: number;
  compactTagSize: number;
  compactRankTextX: number;
  compactRankTextY: number;
  compactRankTextSize: number;
  compactEventsX: number;
  compactEventsY: number;
  compactEventsSize: number;
  compactOtherTextX: number;
  compactOtherTextY: number;
  compactOtherTextSize: number;
  compactFlagX: number;
  compactFlagY: number;
  compactFlagSize: number;
  compactRankIconX: number;
  compactRankIconY: number;
  compactRankIconSize: number;

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
  showEvents: boolean;
  showOtherText: boolean;

  nameTransparency: number;
  rateTransparency: number;
  trackTransparency: number;
  ratingTransparency: number;
  rankTextTransparency: number;
  rankIconTransparency: number;
  flagTransparency: number;
  backgroundImageTransparency: number;
  cardBackgroundTransparency: number;
  eventsTransparency: number;
  otherTextTransparency: number;

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
  totalEvents?: number;
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
  layoutMode: "STANDARD",

  ratingMode: "MMR",
  ratingSwitchSeconds: 5,
  season: "16",

  flag: "🇯🇵",
  flagUrl: "https://flagcdn.com/w80/jp.png",

  mmr: "",
  lr: "",

  rankText: "",
  rankTextFormat: "FULL_SLASH",
  rankIconUrl: "https://i.imgur.com/OwhIiNz.png",
  events: "",
  otherText: "",

  borderColor: "#000000",
  flowColor: "#ffffff",
  flowEnabled: true,
  flowSpeed: 50,
  flowLength: 25,
  ratingEffectUseMainColor: false,
  ratingEffectColor: "#ffffff",
  rankEffectStyle: "CLASSIC",
  ratingSwitchEffectStyle: "WAVE",
  resultEffectStyle: "DEFAULT",
  labelIndependentColors: false,
  eventsFormat: "EVENTS",
  eventsUseMainColor: true,
  eventsColor: "#ffffff",
  otherTextUseMainColor: true,
  otherTextColor: "#ffffff",
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
  cardScale: 98,

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
  rankTextSpacing: 0,

  eventsX: 84,
  eventsY: 22,
  eventsSize: 18,
  eventsSpacing: 0,

  otherTextX: 50,
  otherTextY: 50,
  otherTextSize: 18,
  otherTextSpacing: 0,

  flagX: 22,
  flagY: 25,
  flagSize: 24,

  rankIconX: 12,
  rankIconY: 26,
  rankIconSize: 60,

  compactNameX: 31,
  compactNameY: 23,
  compactNameSize: 25,
  compactScoreX: 31,
  compactScoreY: 53,
  compactScoreSize: 36,
  compactRatingX: 61,
  compactRatingY: 54,
  compactRatingSize: 14,
  compactTagX: 73,
  compactTagY: 54,
  compactTagSize: 14,
  compactRankTextX: 31,
  compactRankTextY: 82,
  compactRankTextSize: 14,
  compactEventsX: 88,
  compactEventsY: 80,
  compactEventsSize: 12,
  compactOtherTextX: 83,
  compactOtherTextY: 27,
  compactOtherTextSize: 11,
  compactFlagX: 90,
  compactFlagY: 20,
  compactFlagSize: 16,
  compactRankIconX: 13.5,
  compactRankIconY: 50,
  compactRankIconSize: 86,

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
  showEvents: false,
  showOtherText: false,

  nameTransparency: 0,
  rateTransparency: 0,
  trackTransparency: 0,
  ratingTransparency: 0,
  rankTextTransparency: 0,
  rankIconTransparency: 0,
  flagTransparency: 0,
  backgroundImageTransparency: 0,
  cardBackgroundTransparency: 0,
  eventsTransparency: 0,
  otherTextTransparency: 0,

  customImageUrl: "",
  customImageX: 50,
  customImageY: 50,
  customImageZ: 1,
  customImageSize: 325,
  customImageGradient: 0,
  overallTransparency: 0,
};

const designSettingKeys: Array<keyof Settings> = [
  "layoutMode",
  "borderColor",
  "flowColor",
  "flowEnabled",
  "flowSpeed",
  "flowLength",
  "ratingEffectUseMainColor",
  "ratingEffectColor",
  "rankEffectStyle",
  "ratingSwitchEffectStyle",
  "resultEffectStyle",
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
  "rankTextSpacing",
  "flagX",
  "flagY",
  "flagSize",
  "rankIconX",
  "rankIconY",
  "rankIconSize",
  "compactNameX",
  "compactNameY",
  "compactNameSize",
  "compactScoreX",
  "compactScoreY",
  "compactScoreSize",
  "compactRatingX",
  "compactRatingY",
  "compactRatingSize",
  "compactTagX",
  "compactTagY",
  "compactTagSize",
  "compactRankTextX",
  "compactRankTextY",
  "compactRankTextSize",
  "compactEventsX",
  "compactEventsY",
  "compactEventsSize",
  "compactOtherTextX",
  "compactOtherTextY",
  "compactOtherTextSize",
  "compactFlagX",
  "compactFlagY",
  "compactFlagSize",
  "compactRankIconX",
  "compactRankIconY",
  "compactRankIconSize",
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
  "labelIndependentColors",
  "eventsFormat",
  "eventsUseMainColor",
  "eventsColor",
  "eventsX",
  "eventsY",
  "eventsSize",
  "eventsSpacing",
  "showEvents",
  "eventsTransparency",
  "otherText",
  "otherTextUseMainColor",
  "otherTextColor",
  "otherTextX",
  "otherTextY",
  "otherTextSize",
  "otherTextSpacing",
  "showOtherText",
  "otherTextTransparency",
  "nameTransparency",
  "rateTransparency",
  "trackTransparency",
  "ratingTransparency",
  "rankTextTransparency",
  "rankIconTransparency",
  "flagTransparency",
  "backgroundImageTransparency",
  "cardBackgroundTransparency",
  "rankTextFormat",
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
    "eventsColor",
    "otherTextColor",
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
    nameTextSpacing: [-50, 50],
    scoreX: [0, 100],
    scoreY: [0, 100],
    scoreSize: [20, 80],
    scoreTextSpacing: [-50, 50],
    ratingBoxX: [0, 100],
    ratingBoxY: [0, 100],
    ratingBoxSize: [8, 30],
    ratingTextSize: [8, 30],
    ratingTextSpacing: [-50, 50],
    labelRadius: [0, 15],
    tagX: [0, 100],
    tagY: [0, 100],
    tagSize: [8, 30],
    tagTextSize: [8, 30],
    tagTextSpacing: [-50, 50],
    rankTextX: [0, 100],
    rankTextY: [0, 100],
    rankTextSize: [6, 90],
    rankTextSpacing: [-50, 50],
    eventsX: [0, 100],
    eventsY: [0, 100],
    eventsSize: [4, 100],
    eventsSpacing: [-50, 50],
    otherTextX: [0, 100],
    otherTextY: [0, 100],
    otherTextSize: [4, 100],
    otherTextSpacing: [-50, 50],
    nameTransparency: [0, 100],
    rateTransparency: [0, 100],
    trackTransparency: [0, 100],
    ratingTransparency: [0, 100],
    rankTextTransparency: [0, 100],
    rankIconTransparency: [0, 100],
    flagTransparency: [0, 100],
    backgroundImageTransparency: [0, 100],
    cardBackgroundTransparency: [0, 100],
    eventsTransparency: [0, 100],
    otherTextTransparency: [0, 100],
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

    if (key === "layoutMode") {
      const mode = decoded.toUpperCase();
      return (mode === "COMPACT" || mode === "STANDARD" ? mode : defaultValue) as never;
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
      const normalized = decoded.toUpperCase();
      const migrated = normalized === "FLIP" ? "SLIDE" : normalized;
      return (["WAVE", "FADE", "SLIDE", "PULSE", "SWEEP", "GLITCH"].includes(
        migrated
      )
        ? migrated
        : defaultValue) as never;
    }

    if (key === "resultEffectStyle") {
      return (["DEFAULT", "THROTTLE", "SKY", "REINCARNATION", "STARSTRUCK", "NEONRUSH", "SHOCKWAVE"].includes(
        decoded.toUpperCase()
      )
        ? decoded.toUpperCase()
        : defaultValue) as never;
    }

    if (key === "eventsFormat") {
      const normalized = decoded.toUpperCase();
      const migrated =
        normalized === "SHORT"
          ? "PREFIX"
          : normalized === "COMPACT"
            ? "NUMBER"
            : normalized;

      return (["EVENTS", "PREFIX", "HASH", "NUMBER"].includes(migrated)
        ? migrated
        : defaultValue) as never;
    }

    if (key === "rankTextFormat") {
      const normalized = decoded.toUpperCase();
      return (["DIVISION", "FULL_SLASH", "CLASS", "FULL_BREAK"].includes(normalized)
        ? normalized
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

function opacityFromTransparency(value: number | undefined) {
  return Math.max(0, Math.min(1, 1 - percent(value, 0) / 100));
}

function formatEvents(value: string, format: EventFormat) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  switch (format) {
    case "PREFIX":
      return `Events ${text}`;
    case "HASH":
      return `#${text}`;
    case "NUMBER":
      return text;
    default:
      return `${text} Events`;
  }
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

function formatRankText(text: string, format: RankTextFormat) {
  const cleaned = cleanRankText(text || "").trim();
  if (!cleaned) return "";

  const { division, className } = splitRankText(cleaned);

  if (!className) {
    return division || cleaned;
  }

  switch (format) {
    case "DIVISION":
      return division;
    case "CLASS":
      return className;
    case "FULL_BREAK":
      return `${division}\n${className}`;
    default:
      return `${division}/${className}`;
  }
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

const VERSION_HISTORY = [
  {
    version: "v2.0.5–v2.2.7",
    en: "Improved Undo / Redo, Lounge-name autocomplete, JP / EN wording, Preview / OBS parity, selectable Win / Loss effects, automatic player refresh, and Compact mode customization. All player text elements now support adjustable character spacing, including Rank text, and Rank text can be shown as division only, division/tier, tier only, or on two lines. MMR / LR switch effects now preserve text shadows; 3D Flip was replaced with Slide In, Pulse, and Light Sweep.",
    jp: "Undo / Redo、Lounge名予測変換、JP / EN表記、Preview / OBSの一致、勝利 / 敗北演出、Lounge名変更時の自動更新、コンパクトモードの調整機能を改善しました。名前・レート・RT/CT・MMR/LR・ランク・模擬数・追加テキストのすべてで文字間隔を狭く／広く調整できるようにし、ランク文字はDivisionのみ・Division/Tier・Tierのみ・2行表示から選択できるようにしました。MMR / LR切替のソフトフェードでも文字の影を維持するよう修正し、3Dフリップを削除してスライドイン・パルス・ライトスイープを追加しました。",
  },
  {
    version: "v2.0.0–v2.0.4",
    en: "Added Events, extra text, per-element transparency, project navigation, full JP / EN UI, automatic Lounge data fetch, clipboard design import, and reorganized the Design panel.",
    jp: "模擬数、追加テキスト、要素別透明度、プロジェクトナビ、JP / EN UI、Loungeデータ自動取得、クリップボードからのデザイン読込を追加し、Design画面を再構成しました。",
  },
  {
    version: "v1.9.0–v1.9.4",
    en: "Refined rate-change arrows, MMR / LR switch effects, Rank Up / Rank Down visibility, and New Rank presentation.",
    jp: "レート変動矢印、MMR / LR切替演出、Rank Up / Rank DownとNew Rank演出の見やすさを改善しました。",
  },
  {
    version: "v1.8.5–v1.8.9",
    en: "Built the Rank Up / Rank Down → New Rank sequence and added Starlight, Meteor Shower, and directional rate-change effects.",
    jp: "Rank Up / Rank Down → New Rankの演出順を整備し、Starlight・Meteor Shower・方向付きレート変動演出を追加しました。",
  },
  {
    version: "v1.8.0–v1.8.3",
    en: "Improved rank transitions, MMR / LR switching, spacing, initial design settings, JSON handling, and RT/CT / MMR/LR placement.",
    jp: "ランク変動、MMR / LR切替、文字間隔、初期デザイン、JSON処理、RT/CT・MMR/LR配置を改善しました。",
  },
  {
    version: "v1.7.0",
    en: "Standardized sliders to 0–100 and reorganized position, size, text-gradient, shadow, and design categories.",
    jp: "スライダーを0–100へ統一し、配置・サイズ・文字グラデーション・影・設定カテゴリを大幅に整理しました。",
  },
  {
    version: "v1.6.0–v1.6.8",
    en: "Simplified RT/CT and MMR/LR styling, improved visibility and transparency, updated defaults, and expanded font support.",
    jp: "RT/CT・MMR/LR表示を簡素化し、表示設定・透明度・初期プリセット・フォント対応を改善しました。",
  },
  {
    version: "v1.4.0–v1.5.0",
    en: "Expanded core card customization with visibility, custom images, image transparency, and font selection.",
    jp: "表示切替、追加画像、画像透明度、フォント選択などカードデザインの基本機能を拡充しました。",
  },
  {
    version: "v1.2.0–v1.3.0",
    en: "Added design sharing, early RT/CT and MMR/LR styling, label designs, and independent text-spacing controls.",
    jp: "デザイン共有、初期のRT/CT・MMR/LRスタイル、ラベルデザイン、文字間隔設定を追加しました。",
  },
] as const;



function ResultOpeningEffect({
  kind,
  style,
}: {
  kind: "win" | "loss";
  style: ResultEffectStyle;
}) {
  const isWin = kind === "win";
  const normalizedStyle =
    style === "SKY" ? "NEONRUSH" : style === "REINCARNATION" ? "SHOCKWAVE" : style;

  if (normalizedStyle === "DEFAULT") {
    return (
      <div className={`rating-arrow-stream ${isWin ? "is-up" : "is-down"}`} aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => {
          const x = 5 + index * 8.18;
          const delay = index * 0.075;
          const duration = 1.25 + (index % 4) * 0.14;
          const size = [42, 50, 60, 46, 56, 44][index % 6];

          return (
            <span
              className="rating-arrow-particle"
              key={`result-arrow-${index}`}
              style={{
                "--arrow-x": `${x}%`,
                "--arrow-delay": `${delay}s`,
                "--arrow-duration": `${duration}s`,
                "--arrow-size": `${size}px`,
              } as CSSProperties}
            >
              {isWin ? "⬆" : "⬇"}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`result-opening-fx result-opening-${normalizedStyle.toLowerCase()} ${
        isWin ? "is-win" : "is-loss"
      }`}
      aria-hidden="true"
    >
      {normalizedStyle === "THROTTLE" && (
        <>
          <div className="throttle-dim" />
          <div className="throttle-aura" />
          <div className="throttle-overscan-ring" />
          <div className="throttle-streaks">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={`throttle-streak-${index}`} />
            ))}
          </div>
          <div className="throttle-gauge">
            <div className="throttle-gauge-inner">
              <span className="throttle-gauge-status">{isWin ? "WIN" : "LOSS"}</span>
              <div className="throttle-marks">
                {Array.from({ length: 13 }, (_, index) => (
                  <span key={`throttle-mark-${index}`} />
                ))}
              </div>
              <div className="throttle-red-zone" />
              <span className="throttle-needle" />
              <span className="throttle-hub" />
            </div>
          </div>
        </>
      )}

      {normalizedStyle === "NEONRUSH" && (
        <>
          <div className="neon-rush-glow" />
          <div className="neon-rush-lines">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={`neon-rush-line-${index}`} />
            ))}
          </div>
          <div className="neon-rush-rings">
            <span />
            <span />
            <span />
          </div>
        </>
      )}

      {normalizedStyle === "SHOCKWAVE" && (
        <>
          <div className="shockwave-core" />
          <div className="shockwave-rings">
            <span />
            <span />
            <span />
          </div>
          <div className="shockwave-shards">
            {Array.from({ length: 10 }, (_, index) => (
              <span key={`shockwave-shard-${index}`} />
            ))}
          </div>
        </>
      )}

      {normalizedStyle === "STARSTRUCK" && (
        <div className="starstruck-particles">
          {Array.from({ length: 16 }, (_, index) => (
            <span key={`starstruck-${index}`}>{index % 3 === 0 ? "♥" : index % 2 === 0 ? "✦" : "★"}</span>
          ))}
        </div>
      )}
    </div>
  );
}

type UiLanguage = "JP" | "EN";

const SETTING_LABELS: Partial<Record<keyof Settings, { en: string; jp: string }>> = {
  loungeName: { en: "Lounge name", jp: "Lounge名" },
  displayName: { en: "Display name", jp: "表示名" },
  mode: { en: "Track", jp: "トラック" },
  layoutMode: { en: "Card layout", jp: "カードレイアウト" },
  ratingMode: { en: "Rating display", jp: "レート表示" },
  ratingSwitchSeconds: { en: "MMR / LR interval", jp: "MMR / LR切替間隔" },
  flag: { en: "Flag text", jp: "国旗テキスト" },
  flagUrl: { en: "Flag image", jp: "国旗画像" },
  mmr: { en: "MMR", jp: "MMR" },
  lr: { en: "LR", jp: "LR" },
  events: { en: "Events", jp: "Events" },
  rankText: { en: "Rank text", jp: "ランク文字" },
  rankTextFormat: { en: "Rank format", jp: "ランク表示形式" },
  rankIconUrl: { en: "Rank icon", jp: "ランク画像" },
  borderColor: { en: "Border color", jp: "枠線色" },
  flowColor: { en: "Flow color", jp: "枠線カラー" },
  flowEnabled: { en: "Flowing border", jp: "枠線" },
  flowSpeed: { en: "Flow speed", jp: "枠線速度" },
  flowLength: { en: "Flow length", jp: "枠線長さ" },
  ratingEffectUseMainColor: { en: "Effect color source", jp: "エフェクト色" },
  ratingEffectColor: { en: "Effect color", jp: "エフェクト色" },
  rankEffectStyle: { en: "Rank effect", jp: "ランク演出" },
  ratingSwitchEffectStyle: { en: "MMR / LR switch effect", jp: "MMR / LR切替演出" },
  resultEffectStyle: { en: "Win / Loss opening effect", jp: "勝利 / 敗北 前半演出" },
  labelIndependentColors: { en: "Track / Rating colors", jp: "Track / Rating色" },
  tagTextTopColor: { en: "Track top color", jp: "Track上色" },
  tagTextBottomColor: { en: "Track bottom color", jp: "Track下色" },
  ratingTextTopColor: { en: "Rating top color", jp: "Rating上色" },
  ratingTextBottomColor: { en: "Rating bottom color", jp: "Rating下色" },
  textTopColor: { en: "Text top color", jp: "文字上色" },
  textBottomColor: { en: "Text bottom color", jp: "文字下色" },
  textGradientEnabled: { en: "Text gradient", jp: "文字グラデーション" },
  textGradientBalance: { en: "Gradient balance", jp: "グラデーション比率" },
  textFont: { en: "Text font", jp: "文字フォント" },
  textShadowEnabled: { en: "Text shadow", jp: "文字影" },
  textShadowColor: { en: "Shadow color", jp: "影色" },
  textShadowX: { en: "Shadow X", jp: "影 X" },
  textShadowY: { en: "Shadow Y", jp: "影 Y" },
  textShadowBlur: { en: "Shadow blur", jp: "影ぼかし" },
  textShadowOpacity: { en: "Shadow opacity", jp: "影透明度" },
  cardBgLeft: { en: "Card background left", jp: "カード背景 左" },
  cardBgRight: { en: "Card background right", jp: "カード背景 右" },
  cardBgGradientEnabled: { en: "Card background gradient", jp: "カード背景グラデーション" },
  cardBgGradientBalance: { en: "Card background balance", jp: "カード背景カラー比率" },
  cardBgOpacity: { en: "Card background opacity", jp: "カード背景不透明度" },
  bgUrl: { en: "Background image", jp: "背景画像" },
  bgX: { en: "Background X", jp: "背景 X" },
  bgY: { en: "Background Y", jp: "背景 Y" },
  bgZoom: { en: "Background zoom", jp: "背景ズーム" },
  nameX: { en: "Name X", jp: "名前 X" },
  nameY: { en: "Name Y", jp: "名前 Y" },
  nameSize: { en: "Name size", jp: "名前サイズ" },
  nameTextSpacing: { en: "Name spacing", jp: "名前文字間隔" },
  scoreX: { en: "Rate X", jp: "レート X" },
  scoreY: { en: "Rate Y", jp: "レート Y" },
  scoreSize: { en: "Rate size", jp: "レートサイズ" },
  scoreTextSpacing: { en: "Rate spacing", jp: "レート文字間隔" },
  ratingBoxX: { en: "MMR/LR X", jp: "MMR/LR X" },
  ratingBoxY: { en: "MMR/LR Y", jp: "MMR/LR Y" },
  ratingTextSize: { en: "MMR/LR size", jp: "MMR/LR サイズ" },
  ratingTextSpacing: { en: "MMR/LR spacing", jp: "MMR/LR 文字間隔" },
  tagX: { en: "RT/CT X", jp: "RT/CT X" },
  tagY: { en: "RT/CT Y", jp: "RT/CT Y" },
  tagTextSize: { en: "RT/CT size", jp: "RT/CT サイズ" },
  tagTextSpacing: { en: "RT/CT spacing", jp: "RT/CT 文字間隔" },
  rankTextX: { en: "Rank text X", jp: "ランク X" },
  rankTextY: { en: "Rank text Y", jp: "ランク Y" },
  rankTextSize: { en: "Rank text size", jp: "ランクサイズ" },
  rankTextSpacing: { en: "Rank spacing", jp: "ランク文字間隔" },
  flagX: { en: "Flag X", jp: "国旗 X" },
  flagY: { en: "Flag Y", jp: "国旗 Y" },
  flagSize: { en: "Flag size", jp: "国旗サイズ" },
  rankIconX: { en: "Rank icon X", jp: "ランク画像 X" },
  rankIconY: { en: "Rank icon Y", jp: "ランク画像 Y" },
  rankIconSize: { en: "Rank icon size", jp: "ランク画像サイズ" },
  compactNameX: { en: "Compact name X", jp: "コンパクト 名前 X" },
  compactNameY: { en: "Compact name Y", jp: "コンパクト 名前 Y" },
  compactNameSize: { en: "Compact name size", jp: "コンパクト 名前サイズ" },
  compactScoreX: { en: "Compact rate X", jp: "コンパクト レート X" },
  compactScoreY: { en: "Compact rate Y", jp: "コンパクト レート Y" },
  compactScoreSize: { en: "Compact rate size", jp: "コンパクト レートサイズ" },
  compactRatingX: { en: "Compact MMR/LR X", jp: "コンパクト MMR/LR X" },
  compactRatingY: { en: "Compact MMR/LR Y", jp: "コンパクト MMR/LR Y" },
  compactRatingSize: { en: "Compact MMR/LR size", jp: "コンパクト MMR/LRサイズ" },
  compactTagX: { en: "Compact RT/CT X", jp: "コンパクト RT/CT X" },
  compactTagY: { en: "Compact RT/CT Y", jp: "コンパクト RT/CT Y" },
  compactTagSize: { en: "Compact RT/CT size", jp: "コンパクト RT/CTサイズ" },
  compactRankTextX: { en: "Compact rank X", jp: "コンパクト ランク X" },
  compactRankTextY: { en: "Compact rank Y", jp: "コンパクト ランク Y" },
  compactRankTextSize: { en: "Compact rank size", jp: "コンパクト ランクサイズ" },
  compactEventsX: { en: "Compact Events X", jp: "コンパクト 模擬数 X" },
  compactEventsY: { en: "Compact Events Y", jp: "コンパクト 模擬数 Y" },
  compactEventsSize: { en: "Compact Events size", jp: "コンパクト 模擬数サイズ" },
  compactOtherTextX: { en: "Compact extra text X", jp: "コンパクト 追加テキスト X" },
  compactOtherTextY: { en: "Compact extra text Y", jp: "コンパクト 追加テキスト Y" },
  compactOtherTextSize: { en: "Compact extra text size", jp: "コンパクト 追加テキストサイズ" },
  compactFlagX: { en: "Compact flag X", jp: "コンパクト 国旗 X" },
  compactFlagY: { en: "Compact flag Y", jp: "コンパクト 国旗 Y" },
  compactFlagSize: { en: "Compact flag size", jp: "コンパクト 国旗サイズ" },
  compactRankIconX: { en: "Compact rank icon X", jp: "コンパクト ランク画像 X" },
  compactRankIconY: { en: "Compact rank icon Y", jp: "コンパクト ランク画像 Y" },
  compactRankIconSize: { en: "Compact rank icon size", jp: "コンパクト ランク画像サイズ" },
  eventsFormat: { en: "Events format", jp: "Events形式" },
  eventsUseMainColor: { en: "Events color source", jp: "Events色" },
  eventsColor: { en: "Events color", jp: "Events色" },
  eventsX: { en: "Events X", jp: "模擬数 X" },
  eventsY: { en: "Events Y", jp: "模擬数 Y" },
  eventsSize: { en: "Events size", jp: "模擬数サイズ" },
  eventsSpacing: { en: "Events spacing", jp: "模擬数文字間隔" },
  otherText: { en: "Extra text", jp: "追加テキスト" },
  otherTextUseMainColor: { en: "Other text color source", jp: "追加テキスト色" },
  otherTextColor: { en: "Other text color", jp: "追加テキスト色" },
  otherTextX: { en: "Other text X", jp: "追加テキスト X" },
  otherTextY: { en: "Other text Y", jp: "追加テキスト Y" },
  otherTextSize: { en: "Other text size", jp: "追加テキストサイズ" },
  otherTextSpacing: { en: "Other text spacing", jp: "追加テキスト文字間隔" },
  showName: { en: "Display name visibility", jp: "表示名の表示" },
  showRate: { en: "Rate visibility", jp: "レートの表示" },
  showTrackTagText: { en: "RT/CT visibility", jp: "RT/CTの表示" },
  showRatingLabelText: { en: "MMR/LR visibility", jp: "MMR/LRの表示" },
  showRankText: { en: "Rank text visibility", jp: "ランクの表示" },
  showFlag: { en: "Flag visibility", jp: "国旗の表示" },
  showRankIcon: { en: "Rank icon visibility", jp: "ランク画像の表示" },
  showBackgroundImage: { en: "Background image visibility", jp: "背景画像の表示" },
  showCardBackground: { en: "Card background visibility", jp: "カード背景の表示" },
  showCustomImage: { en: "Custom image visibility", jp: "追加画像の表示" },
  showEvents: { en: "Events visibility", jp: "模擬数の表示" },
  showOtherText: { en: "Other text visibility", jp: "追加テキストの表示" },
  customImageUrl: { en: "Custom image", jp: "追加画像" },
  customImageX: { en: "Custom image X", jp: "追加画像 X" },
  customImageY: { en: "Custom image Y", jp: "追加画像 Y" },
  customImageZ: { en: "Custom image layer", jp: "追加画像レイヤー" },
  customImageSize: { en: "Custom image size", jp: "追加画像サイズ" },
  customImageGradient: { en: "Custom image transparency", jp: "追加画像透明度" },
  overallTransparency: { en: "Overall transparency", jp: "全体透明度" },
  nameTransparency: { en: "Name transparency", jp: "名前透明度" },
  rateTransparency: { en: "Rate transparency", jp: "レート透明度" },
  trackTransparency: { en: "RT/CT transparency", jp: "RT/CT透明度" },
  ratingTransparency: { en: "MMR/LR transparency", jp: "MMR/LR透明度" },
  rankTextTransparency: { en: "Rank text transparency", jp: "ランク透明度" },
  rankIconTransparency: { en: "Rank icon transparency", jp: "ランク画像透明度" },
  flagTransparency: { en: "Flag transparency", jp: "国旗透明度" },
  backgroundImageTransparency: { en: "Background transparency", jp: "背景画像透明度" },
  cardBackgroundTransparency: { en: "Card background transparency", jp: "カード背景透明度" },
  eventsTransparency: { en: "Events transparency", jp: "模擬数透明度" },
  otherTextTransparency: { en: "Other text transparency", jp: "追加テキスト透明度" },
};

function describeSettingsDifference(
  current: Settings,
  target: Settings,
  language: UiLanguage
) {
  const changed = (Object.keys(current) as Array<keyof Settings>).filter(
    (key) => current[key] !== target[key]
  );

  if (changed.length === 0) return "";

  if (changed.length > 3) {
    return language === "JP"
      ? `${changed.length}項目の変更`
      : `${changed.length} setting changes`;
  }

  return changed
    .map((key) => {
      const label = SETTING_LABELS[key];
      if (!label) return String(key);
      return language === "JP" ? label.jp : label.en;
    })
    .join(" / ");
}

export default function Home() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const settingsRef = useRef<Settings>(defaultSettings);
  const [copied, setCopied] = useState(false);
  const [settingsCopied, setSettingsCopied] = useState(false);
  const [showImportSettings, setShowImportSettings] = useState(false);
  const [importSettingsText, setImportSettingsText] = useState("");
  const [importSettingsStatus, setImportSettingsStatus] = useState("");
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>("JP");
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [undoStack, setUndoStack] = useState<Settings[]>([]);
  const [redoStack, setRedoStack] = useState<Settings[]>([]);
  const undoStackRef = useRef<Settings[]>([]);
  const redoStackRef = useRef<Settings[]>([]);
  const [historyLog, setHistoryLog] = useState("");
  const [playerSuggestions, setPlayerSuggestions] = useState<string[]>([]);
  const [playerNameIndex, setPlayerNameIndex] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const playerFetchRequestRef = useRef(0);
  const historyMetaRef = useRef<{ key: keyof Settings | "__bulk__" | null; time: number }>({
    key: null,
    time: 0,
  });
  const [apiStatus, setApiStatus] = useState("");

  const [origin, setOrigin] = useState("");
  const [rankOrder, setRankOrder] = useState<RankEntry[]>([]);
  const [rankStatus, setRankStatus] = useState("");

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

  const text = useCallback(
    (en: string, jp: string) => (uiLanguage === "JP" ? jp : en),
    [uiLanguage]
  );
  const isCompactLayout = settings.layoutMode === "COMPACT";


  useEffect(() => {
    setOrigin(window.location.origin);
    const savedLanguage = localStorage.getItem("kei-lounge-cards-language");
    if (savedLanguage === "EN" || savedLanguage === "JP") {
      setUiLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("kei-lounge-cards-language", uiLanguage);
  }, [uiLanguage]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

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
    setRankStatus(text("Fetching rank list...", "ランク一覧を取得中..."));

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
        setRankStatus(text("Could not fetch rank list", "ランク一覧を取得できませんでした"));
        return;
      }

      setRankOrder(data.ranks || []);
      setRankStatus(text(`${settings.mode} rank list applied`, `${settings.mode} のランク一覧を反映しました`));
    } catch {
      setRankOrder([]);
      setRankStatus(text("Could not fetch rank list", "ランク一覧を取得できませんでした"));
    }
  }, [settings.mode, text]);

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

  const pushUndoSnapshot = useCallback((snapshot: Settings) => {
    const lastSnapshot = undoStackRef.current[undoStackRef.current.length - 1];

    if (lastSnapshot && JSON.stringify(lastSnapshot) === JSON.stringify(snapshot)) {
      return;
    }

    const nextUndo = [...undoStackRef.current.slice(-59), snapshot];
    undoStackRef.current = nextUndo;
    redoStackRef.current = [];

    setUndoStack(nextUndo);
    setRedoStack([]);
  }, []);

  const settingActionLabel = useCallback(
    (key: keyof Settings) => {
      const label = SETTING_LABELS[key];
      if (!label) return String(key);
      return uiLanguage === "JP" ? label.jp : label.en;
    },
    [uiLanguage]
  );

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const now = Date.now();
    const last = historyMetaRef.current;
    const current = settingsRef.current;

    // Slider drags and typing on the same field are grouped into one undo step.
    if (last.key !== key || now - last.time > 650) {
      pushUndoSnapshot(current);
    }

    const next = { ...current, [key]: value };
    historyMetaRef.current = { key, time: now };
    settingsRef.current = next;
    setSettings(next);
    setHistoryLog(
      text(
        `Changed: ${settingActionLabel(key)}`,
        `変更: ${settingActionLabel(key)}`
      )
    );
  };

  const applySettingsWithoutHistory = useCallback(
    (
      next:
        | Settings
        | ((previous: Settings) => Settings)
    ) => {
      const current = settingsRef.current;
      const resolved =
        typeof next === "function" ? next(current) : next;

      settingsRef.current = resolved;
      setSettings(resolved);
    },
    []
  );

  const applySettingsWithHistory = useCallback(
    (
      next:
        | Settings
        | ((previous: Settings) => Settings)
    ) => {
      const current = settingsRef.current;
      pushUndoSnapshot(current);
      historyMetaRef.current = { key: "__bulk__", time: Date.now() };

      const resolved =
        typeof next === "function" ? next(current) : next;

      settingsRef.current = resolved;
      setSettings(resolved);
      setHistoryLog(
        text("Changed: design settings", "変更: デザイン設定")
      );
    },
    [pushUndoSnapshot, text]
  );

  const undoSettings = useCallback(() => {
    const currentUndo = undoStackRef.current;
    if (currentUndo.length === 0) return;

    const previous = currentUndo[currentUndo.length - 1];
    const current = settingsRef.current;
    const nextUndo = currentUndo.slice(0, -1);
    const nextRedo = [...redoStackRef.current.slice(-59), current];

    undoStackRef.current = nextUndo;
    redoStackRef.current = nextRedo;
    setUndoStack(nextUndo);
    setRedoStack(nextRedo);

    const actionName =
      describeSettingsDifference(current, previous, uiLanguage) ||
      text("settings", "設定");

    historyMetaRef.current = { key: null, time: 0 };
    settingsRef.current = previous;
    setSettings(previous);
    setHistoryLog(text(`Undo: ${actionName}`, `戻す: ${actionName}`));
  }, [text, uiLanguage]);

  const redoSettings = useCallback(() => {
    const currentRedo = redoStackRef.current;
    if (currentRedo.length === 0) return;

    const next = currentRedo[currentRedo.length - 1];
    const current = settingsRef.current;
    const nextRedo = currentRedo.slice(0, -1);
    const nextUndo = [...undoStackRef.current.slice(-59), current];

    redoStackRef.current = nextRedo;
    undoStackRef.current = nextUndo;
    setRedoStack(nextRedo);
    setUndoStack(nextUndo);

    const actionName =
      describeSettingsDifference(current, next, uiLanguage) ||
      text("settings", "設定");

    historyMetaRef.current = { key: null, time: 0 };
    settingsRef.current = next;
    setSettings(next);
    setHistoryLog(text(`Redo: ${actionName}`, `進む: ${actionName}`));
  }, [text, uiLanguage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTextField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (isTextField || !(event.ctrlKey || event.metaKey)) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undoSettings();
      } else if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        redoSettings();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redoSettings, undoSettings]);

  useEffect(() => {
    let cancelled = false;

    const loadNameIndex = async () => {
      const sessionKey = "kei-lounge-player-name-index-v2";
      const sessionTtlMs = 5 * 60 * 1000;

      try {
        const cached = sessionStorage.getItem(sessionKey);
        if (cached) {
          const parsed = safeJsonParse<{ savedAt?: number; names?: string[] }>(cached);
          const isFresh =
            typeof parsed?.savedAt === "number" &&
            Date.now() - parsed.savedAt < sessionTtlMs;

          if (isFresh && Array.isArray(parsed?.names) && parsed.names.length > 0) {
            setPlayerNameIndex(parsed.names);
          }
        }
      } catch {
        // Continue with the network preload.
      }

      try {
        const response = await fetch("/api/player?suggestAll=1", {
          cache: "no-store",
        });

        const data = safeJsonParse<{ names?: string[] }>(await response.text());

        if (cancelled || !response.ok || !Array.isArray(data?.names)) return;

        const names = data!.names
          .filter((name) => typeof name === "string" && name.trim())
          .map((name) => name.trim());

        setPlayerNameIndex(names);

        try {
          sessionStorage.setItem(
            sessionKey,
            JSON.stringify({ savedAt: Date.now(), names })
          );
        } catch {
          // In-memory index still works.
        }
      } catch {
        // The fresh direct-query fallback below still works.
      }
    };

    void loadNameIndex();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const query = settings.loungeName.trim();

    if (query.length < 2) {
      setPlayerSuggestions([]);
      setSuggestionsOpen(false);
      setSuggestionsLoading(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const localSuggestions = playerNameIndex
      .filter((name) => name.toLowerCase().startsWith(lowerQuery))
      .sort((a, b) => a.length - b.length || a.localeCompare(b))
      .slice(0, 8);

    setPlayerSuggestions(localSuggestions);
    setSuggestionsOpen(
      localSuggestions.length > 0 &&
        !(localSuggestions.length === 1 &&
          localSuggestions[0].toLowerCase() === lowerQuery)
    );

    let cancelled = false;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setSuggestionsLoading(true);

      try {
        const params = new URLSearchParams({
          name: query,
          mode: settings.mode,
          suggest: "1",
        });

        const response = await fetch(`/api/player?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = safeJsonParse<{ suggestions?: string[] }>(
          await response.text()
        );

        if (cancelled || !response.ok) return;

        const suggestions = Array.isArray(data?.suggestions)
          ? data!.suggestions
              .filter(
                (name) =>
                  typeof name === "string" &&
                  name.toLowerCase().startsWith(lowerQuery)
              )
              .sort((a, b) => a.length - b.length || a.localeCompare(b))
              .slice(0, 8)
          : [];

        // Fresh live results replace the cached list, so old names disappear quickly.
        setPlayerSuggestions(suggestions);
        setSuggestionsOpen(
          suggestions.length > 0 &&
            !(suggestions.length === 1 &&
              suggestions[0].toLowerCase() === lowerQuery)
        );
      } catch (error) {
        if (
          !cancelled &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          // Keep the instant local prefix matches if the live lookup fails.
          setPlayerSuggestions(localSuggestions);
          setSuggestionsOpen(localSuggestions.length > 0);
        }
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    }, 120);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [playerNameIndex, settings.loungeName, settings.mode]);

  const fetchPlayerData = useCallback(
    async (
      name: string,
      mode: ModeSetting,
      options?: { silent?: boolean; exactOnly?: boolean }
    ) => {
      const trimmedName = name.trim();
      const silent = options?.silent ?? false;
      const exactOnly = options?.exactOnly ?? false;

      if (trimmedName.length < 2) {
        if (!silent) {
          setApiStatus(text("Enter a Lounge name", "Lounge名を入力してください"));
        }
        return false;
      }

      const requestId = playerFetchRequestRef.current + 1;
      playerFetchRequestRef.current = requestId;

      if (!silent) setApiStatus(text("Fetching...", "取得中..."));

      try {
        const params = new URLSearchParams({
          name: trimmedName,
          mode,
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
          totalEvents: 0,
          rankText: "",
          emblemUrl: "",
          error: "Player data could not be read.",
        };

        if (requestId !== playerFetchRequestRef.current) return false;

        if (!response.ok || !parsedData) {
          if (!silent) {
            setApiStatus(
              data.error ?? text("Player not found", "プレイヤーが見つかりませんでした")
            );
          }
          return false;
        }

        if (
          exactOnly &&
          data.playerName.trim().toLowerCase() !== trimmedName.toLowerCase()
        ) {
          return false;
        }

        applySettingsWithoutHistory((prev) => ({
          ...prev,
          displayName: data.playerName || prev.displayName,
          flag: data.flagEmoji || prev.flag,
          flagUrl: data.flagUrl || prev.flagUrl,
          mmr: String(data.currentMmr || 0),
          lr: String(data.currentLr || 0),
          events:
            data.totalEvents !== undefined && data.totalEvents !== null
              ? String(data.totalEvents)
              : prev.events,
          rankText: cleanRankText(data.rankText || prev.rankText),
          rankIconUrl: data.emblemUrl || prev.rankIconUrl,
        }));

        setApiStatus(
          text(
            `${data.playerName} / ${mode} applied`,
            `${data.playerName} / ${mode} を反映しました`
          )
        );
        return true;
      } catch {
        if (requestId === playerFetchRequestRef.current && !silent) {
          setApiStatus(text("Fetch failed", "取得に失敗しました"));
        }
        return false;
      }
    },
    [applySettingsWithoutHistory, text]
  );

  const fetchPlayer = useCallback(async () => {
    await fetchPlayerData(settings.loungeName, settings.mode, {
      silent: false,
      exactOnly: false,
    });
  }, [fetchPlayerData, settings.loungeName, settings.mode]);

  useEffect(() => {
    const name = settings.loungeName.trim();
    if (name.length < 2) return;

    const timer = window.setTimeout(() => {
      void fetchPlayerData(name, settings.mode, {
        silent: true,
        exactOnly: true,
      });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [fetchPlayerData, settings.loungeName, settings.mode]);

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
    params.set("layout", settings.layoutMode === "COMPACT" ? "compact" : "standard");

    params.set("ratingMode", settings.ratingMode);
    params.set("ratingSwitch", numberParam(settings.ratingSwitchSeconds ?? 5));
    params.set("switch", numberParam(settings.ratingSwitchSeconds ?? 5));
    params.set("season", settings.season);

    params.set("flag", settings.flag);
    if (settings.flagUrl) params.set("flagUrl", settings.flagUrl);

    params.set("mmr", settings.mmr);
    params.set("lr", settings.lr);

    params.set("rank", cleanRankText(settings.rankText));
    params.set("rankFormat", settings.rankTextFormat);
    params.set("events", settings.events);
    params.set("eventFormat", settings.eventsFormat);
    params.set("otherText", settings.otherText);

    params.set("border", (settings.borderColor ?? "#ff0000").replace("#", ""));
    params.set("flow", (settings.flowColor ?? "#ff3030").replace("#", ""));
    params.set("flowOn", settings.flowEnabled ? "1" : "0");
    params.set("flowSpeed", numberParam(settings.flowSpeed ?? 65));
    params.set("flowLength", numberParam(settings.flowLength ?? 16));
    params.set("effectMain", settings.ratingEffectUseMainColor ? "1" : "0");
    params.set("effectColor", (settings.ratingEffectColor ?? "#ff3030").replace("#", ""));
    params.set("rankEffect", settings.rankEffectStyle);
    params.set("switchEffect", settings.ratingSwitchEffectStyle);
    params.set("resultEffect", settings.resultEffectStyle);
    params.set("labelIndependent", "0");
    params.set("eventMain", settings.eventsUseMainColor ? "1" : "0");
    params.set("eventColor", settings.eventsColor.replace("#", ""));
    params.set("otherMain", settings.otherTextUseMainColor ? "1" : "0");
    params.set("otherColor", settings.otherTextColor.replace("#", ""));
    params.set("tagTop", (settings.tagTopColor ?? "#000000").replace("#", ""));
    params.set("tagBottom", (settings.tagBottomColor ?? "#ffffff").replace("#", ""));
    params.set("tagBoxGradient", settings.tagBoxGradientEnabled ? "1" : "0");
    params.set("tagBoxBalance", numberParam(settings.tagBoxGradientBalance ?? 50));
    params.set("tagTextTop", (settings.tagTextTopColor ?? "#ffffff").replace("#", ""));
    params.set("tagTextBottom", (settings.tagTextBottomColor ?? "#ff3030").replace("#", ""));
    params.set("tagTextGradient", settings.tagTextGradientEnabled ? "1" : "0");
    params.set("tagTextBalance", numberParam(settings.tagTextGradientBalance ?? 40));
    params.set("ratingTop", (settings.ratingBoxTopColor ?? "#b90000").replace("#", ""));
    params.set("ratingBoxGradient", settings.ratingBoxGradientEnabled ? "1" : "0");
    params.set("ratingBoxBalance", numberParam(settings.ratingBoxGradientBalance ?? 50));
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
    params.set("scale", "98");

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

    params.set("radius", numberParam(settings.labelRadius ?? 10));
    params.set("shape", settings.labelShape ?? "ROUNDED");

    params.set("tx", numberParam(settings.tagX));
    params.set("ty", numberParam(settings.tagY));
    params.set("tts", numberParam(settings.tagTextSize));
    params.set("tspace", numberParam(settings.tagTextSpacing));

    params.set("rx", numberParam(settings.rankTextX));
    params.set("ry", numberParam(settings.rankTextY));
    params.set("rs", numberParam(settings.rankTextSize));
    params.set("rankspace", numberParam(settings.rankTextSpacing));

    params.set("ex", numberParam(settings.eventsX));
    params.set("ey", numberParam(settings.eventsY));
    params.set("esz", numberParam(settings.eventsSize));
    params.set("espace", numberParam(settings.eventsSpacing));

    params.set("otx", numberParam(settings.otherTextX));
    params.set("oty", numberParam(settings.otherTextY));
    params.set("ots", numberParam(settings.otherTextSize));
    params.set("otspace", numberParam(settings.otherTextSpacing));

    params.set("fx", numberParam(settings.flagX));
    params.set("fy", numberParam(settings.flagY));
    params.set("fs", numberParam(settings.flagSize));

    params.set("ix", numberParam(settings.rankIconX));
    params.set("iy", numberParam(settings.rankIconY));
    params.set("isz", numberParam(settings.rankIconSize));

    params.set("cnx", numberParam(settings.compactNameX));
    params.set("cny", numberParam(settings.compactNameY));
    params.set("cns", numberParam(settings.compactNameSize));
    params.set("csx", numberParam(settings.compactScoreX));
    params.set("csy", numberParam(settings.compactScoreY));
    params.set("cssz", numberParam(settings.compactScoreSize));
    params.set("crlx", numberParam(settings.compactRatingX));
    params.set("crly", numberParam(settings.compactRatingY));
    params.set("crls", numberParam(settings.compactRatingSize));
    params.set("ctx", numberParam(settings.compactTagX));
    params.set("cty", numberParam(settings.compactTagY));
    params.set("cts", numberParam(settings.compactTagSize));
    params.set("crx", numberParam(settings.compactRankTextX));
    params.set("cry", numberParam(settings.compactRankTextY));
    params.set("crs", numberParam(settings.compactRankTextSize));
    params.set("cex", numberParam(settings.compactEventsX));
    params.set("cey", numberParam(settings.compactEventsY));
    params.set("ces", numberParam(settings.compactEventsSize));
    params.set("cox", numberParam(settings.compactOtherTextX));
    params.set("coy", numberParam(settings.compactOtherTextY));
    params.set("cos", numberParam(settings.compactOtherTextSize));
    params.set("cfx", numberParam(settings.compactFlagX));
    params.set("cfy", numberParam(settings.compactFlagY));
    params.set("cfs", numberParam(settings.compactFlagSize));
    params.set("cix", numberParam(settings.compactRankIconX));
    params.set("ciy", numberParam(settings.compactRankIconY));
    params.set("cis", numberParam(settings.compactRankIconSize));

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
    params.set("vevents", settings.showEvents ? "1" : "0");
    params.set("vothertext", settings.showOtherText ? "1" : "0");

    params.set("nameOpacity", numberParam(settings.nameTransparency));
    params.set("rateOpacity", numberParam(settings.rateTransparency));
    params.set("trackOpacity", numberParam(settings.trackTransparency));
    params.set("ratingOpacity", numberParam(settings.ratingTransparency));
    params.set("rankOpacity", numberParam(settings.rankTextTransparency));
    params.set("iconOpacity", numberParam(settings.rankIconTransparency));
    params.set("flagOpacity", numberParam(settings.flagTransparency));
    params.set("bgImageOpacity", numberParam(settings.backgroundImageTransparency));
    params.set("cardLayerOpacity", numberParam(settings.cardBackgroundTransparency));
    params.set("eventsOpacity", numberParam(settings.eventsTransparency));
    params.set("otherTextOpacity", numberParam(settings.otherTextTransparency));

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

  const applyDesignText = useCallback(
    (source: string) => {
      try {
        const raw = source.trim();

        if (!raw) {
          setImportSettingsStatus(text("No design data found in the clipboard", "クリップボードにデザイン設定がありません"));
          return false;
        }

        const designUpdates =
          raw.startsWith("{")
            ? parseDesignObject(safeJsonParse<unknown>(raw))
            : parseCompactDesignPreset(raw);

        if (!designUpdates) {
          setImportSettingsStatus(text("Unsupported design data format", "設定データの形式が違います"));
          return false;
        }

        applySettingsWithHistory((prev) => ({
          ...prev,
          ...designUpdates,
        }));

        setImportSettingsText(raw);
        setImportSettingsStatus(text("Clipboard design applied", "クリップボードのデザインを反映しました"));
        setShowImportSettings(false);
        setTimeout(() => setImportSettingsStatus(""), 1800);
        return true;
      } catch {
        setImportSettingsStatus(text("Could not read design data", "設定データを読み込めませんでした"));
        return false;
      }
    },
    [applySettingsWithHistory, text]
  );

  const pasteDesignFromClipboard = useCallback(async () => {
    try {
      if (!navigator.clipboard?.readText) {
        throw new Error("Clipboard API unavailable");
      }

      const raw = await navigator.clipboard.readText();

      if (!applyDesignText(raw)) {
        setShowImportSettings(true);
      }
    } catch {
      // Browsers can deny clipboard reads. Keep the manual box as a fallback.
      setShowImportSettings(true);
      setImportSettingsStatus(
        text(
          "Clipboard access was blocked. Paste the design below.",
          "クリップボードを直接読めませんでした。下の欄に貼り付けてください"
        )
      );
    }
  }, [applyDesignText, text]);

  const importSettings = () => {
    applyDesignText(importSettingsText);
  };

  return (
    <main className="builder-page">
      <nav className="project-nav" aria-label="Kei projects">
        <details>
          <summary>Kei Projects</summary>
          <div className="project-nav-menu">
            <a href="/">Kei Lounge Cards</a>
            <a href="https://kei-brstm-hub.vercel.app/" target="_blank" rel="noreferrer">Kei Music Hub</a>
          </div>
        </details>
      </nav>

      <div className="top-page-actions">
        <button
          type="button"
          className="language-toggle-button"
          onClick={() => setUiLanguage((current) => current === "JP" ? "EN" : "JP")}
          title={text("Switch language", "言語を切り替え")}
        >
          {uiLanguage === "JP" ? "EN" : "JP"}
        </button>
        <button
          type="button"
          className="history-top-button"
          onClick={() => setShowVersionHistory(true)}
        >
          {text("Version history", "バージョン履歴")}
        </button>
      </div>

      <section className="hero">
        <h1>
          Kei <span>Lounge Cards</span>
        </h1>
      </section>

      <div className="builder-layout">
        <section className="panel settings-panel">
          <details className="basic-settings-group" open>
            <summary>{text("Basic", "基本設定")}</summary>
            <div className="basic-settings-body">
              <div className="layout-mode-control">
                <label>
                  {text("Card layout", "カードレイアウト")}
                  <select
                    value={settings.layoutMode}
                    onChange={(e) => update("layoutMode", e.target.value as LayoutMode)}
                  >
                    <option value="STANDARD">{text("Standard (650 × 150)", "標準 (650 × 150)")}</option>
                    <option value="COMPACT">{text("Compact — narrow (380 × 150)", "コンパクト — 横幅短縮 (380 × 150)")}</option>
                  </select>
                </label>


              </div>

              <div className="two-col">
                <label>
                  {text("Lounge name", "Lounge名")}
                  <div className="player-suggest-field">
                    <input
                      value={settings.loungeName}
                      onChange={(e) => {
                        update("loungeName", e.target.value);
                        setSuggestionsOpen(true);
                      }}
                      onFocus={() => {
                        if (playerSuggestions.length > 0) setSuggestionsOpen(true);
                      }}
                      onBlur={() => {
                        window.setTimeout(() => setSuggestionsOpen(false), 140);
                      }}
                      placeholder={text("Type a Lounge name", "Lounge名を入力")}
                      autoComplete="off"
                    />
                    {(suggestionsOpen || suggestionsLoading) && (
                      <div className="player-suggestion-menu">
                        {suggestionsLoading && (
                          <div className="player-suggestion-status">
                            {text("Searching...", "候補を検索中...")}
                          </div>
                        )}
                        {!suggestionsLoading &&
                          playerSuggestions.map((name) => (
                            <button
                              type="button"
                              key={name}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                update("loungeName", name);
                                setSuggestionsOpen(false);
                                void fetchPlayerData(name, settings.mode, {
                                  silent: true,
                                  exactOnly: true,
                                });
                              }}
                            >
                              {name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </label>

                <label>
                  {text("Display name", "表示名")}
                  <input
                    value={settings.displayName}
                    onChange={(e) => update("displayName", e.target.value)}
                    placeholder={text("Shown name", "カードに表示する名前")}
                  />
                </label>
              </div>

          <div className="basic-rating-row">
            <label>
              {text("Track", "トラック")}
              <select
                value={settings.mode}
                onChange={(e) => update("mode", e.target.value as ModeSetting)}
              >
                <option value="RT">RT</option>
                <option value="CT">CT</option>
              </select>
            </label>

            <label>
              {text("Rating display", "レート表示")}
              <select
                value={settings.ratingMode}
                onChange={(e) =>
                  update("ratingMode", e.target.value as RatingMode)
                }
              >
                <option value="MMR">{text("MMR only", "MMRのみ")}</option>
                <option value="LR">{text("LR only", "LRのみ")}</option>
                <option value="SWITCH">{text("MMR / LR switch", "MMR / LR切替")}</option>
              </select>
            </label>

            <label>
              {text("MMR / LR sec", "MMR / LR 秒")}
              <NumberStepper
                min={3}
                max={60}
                disabled={settings.ratingMode !== "SWITCH"}
                value={settings.ratingSwitchSeconds ?? 5}
                onChange={(value) => update("ratingSwitchSeconds", value)}
              />
            </label>
          </div>

          <div className="basic-rating-row basic-stat-row">
            <label>
              MMR
              <input value={settings.mmr} onChange={(e) => update("mmr", e.target.value)} placeholder="0000" />
            </label>
            <label>
              LR
              <input value={settings.lr} onChange={(e) => update("lr", e.target.value)} placeholder="0000" />
            </label>
            <label>
              {text("Events", "模擬数")}
              <input value={settings.events} onChange={(e) => update("events", e.target.value)} placeholder={text("Auto fetched", "自動取得")} />
            </label>
          </div>

          <div className="two-col">
            <label>
              {text("Flag text", "国旗テキスト")}
              <input value={settings.flag} onChange={(e) => update("flag", e.target.value)} placeholder="🇯🇵" />
            </label>
            <label>
              {text("Rank text", "ランク")}
              <input
                value={settings.rankText}
                onChange={(e) => update("rankText", cleanRankText(e.target.value))}
                placeholder={text("Iron / Low Tier", "Iron / Low Tier")}
              />
            </label>
          </div>
            </div>
          </details>

          <div className="design-heading-row">
            <h2>{text("Design", "デザイン")}</h2>
          </div>

          <details className="design-group" open>
            <summary>
              <span className="summary-copy">
                <span className="summary-title">{text("Card / Global", "カード / 全体")}</span>
                
              </span>
              <SummaryToggle label={text("BG", "背景")} checked={settings.showCardBackground} onChange={(v) => update("showCardBackground", v)} />
            </summary>
            <div className="design-group-body">
              <Slider label={text("Overall transparency", "全体透明度")} value={settings.overallTransparency} min={0} max={100} onChange={(v) => update("overallTransparency", v)} />

              <div className="design-subtitle">{text("Card background", "カード背景")}</div>
              <TransparencyControl language={uiLanguage} label={text("Card background", "カード背景")} value={settings.cardBackgroundTransparency} onChange={(v) => update("cardBackgroundTransparency", v)} disabled={!settings.showCardBackground} />
              <fieldset className={`setting-scope ${settings.showCardBackground ? "" : "is-disabled"}`} disabled={!settings.showCardBackground}>
                <div className="two-col">
                  <label>{text("Card bg left", "カード背景 左")}<input type="color" value={settings.cardBgLeft ?? "#000000"} onChange={(e) => update("cardBgLeft", e.target.value)} /></label>
                  <label>{text("Card bg right", "カード背景 右")}<input type="color" value={settings.cardBgRight ?? "#005e70"} onChange={(e) => update("cardBgRight", e.target.value)} /></label>
                </div>
                <OptionSlider label={text("Card bg balance", "カード背景カラー比率")} optionLabel="Card bg gradient" checked={settings.cardBgGradientEnabled} onCheckedChange={(checked) => update("cardBgGradientEnabled", checked)} value={settings.cardBgGradientBalance ?? 50} min={0} max={100} disabled={!settings.cardBgGradientEnabled} onChange={(v) => update("cardBgGradientBalance", v)} />
                <Slider label={text("Card bg opacity", "カード背景不透明度")} value={settings.cardBgOpacity ?? 86} min={0} max={100} onChange={(v) => update("cardBgOpacity", v)} />
              </fieldset>
            </div>
          </details>

          <details className="design-group" open>
            <summary>
              <span className="summary-copy">
                <span className="summary-title">{text("Main Text Style", "メイン文字スタイル")}</span>
                
              </span>
            </summary>
            <div className="design-group-body">
              <label>
                {text("Text font", "文字フォント")}
                <select value={settings.textFont ?? "DEFAULT"} onChange={(e) => update("textFont", e.target.value as FontChoice)}>
                  <option value="DEFAULT">Default</option><option value="OEDO_KANTEIRYU">大江戸勘亭流</option><option value="YU_GOTHIC">Yu Gothic</option><option value="MEIRYO">Meiryo</option><option value="MINCHO">Yu Mincho</option><option value="ARIAL">Arial</option><option value="IMPACT">Impact</option><option value="TREBUCHET">Trebuchet MS</option><option value="VERDANA">Verdana</option><option value="GEORGIA">Georgia</option><option value="TIMES">Times New Roman</option><option value="COURIER">Courier New</option><option value="COMIC_SANS">Comic Sans MS</option>
                </select>
              </label>
              <div className="two-col">
                <label>{text("Text top color", "文字 上色")}<input type="color" value={settings.textTopColor} onChange={(e) => update("textTopColor", e.target.value)} /></label>
                <label>{text("Text bottom color", "文字 下色")}<input type="color" value={settings.textBottomColor} onChange={(e) => update("textBottomColor", e.target.value)} /></label>
              </div>
              <OptionSlider label={text("Vertical gradient balance", "文字グラデーション比率")} optionLabel="Top / bottom gradient" checked={settings.textGradientEnabled} onCheckedChange={(checked) => update("textGradientEnabled", checked)} value={settings.textGradientBalance} min={0} max={100} disabled={!settings.textGradientEnabled} onChange={(v) => update("textGradientBalance", v)} />

              <div className="design-subtitle">{text("Text shadow", "文字影")}</div>
              <div className="two-col">
                <label>{text("Shadow color", "影色")}<input type="color" value={settings.textShadowColor} disabled={!settings.textShadowEnabled} onChange={(e) => update("textShadowColor", e.target.value)} /></label>
                <label className="checkbox-label"><input type="checkbox" checked={settings.textShadowEnabled} onChange={(e) => update("textShadowEnabled", e.target.checked)} />{text("Text shadow", "文字影")}</label>
              </div>
              <Slider label={text("Shadow X", "影 X")} value={settings.textShadowX} min={0} max={100} disabled={!settings.textShadowEnabled} onChange={(v) => update("textShadowX", v)} />
              <Slider label={text("Shadow Y", "影 Y")} value={settings.textShadowY} min={0} max={100} disabled={!settings.textShadowEnabled} onChange={(v) => update("textShadowY", v)} />
              <Slider label={text("Shadow blur", "影ぼかし")} value={settings.textShadowBlur} min={0} max={100} disabled={!settings.textShadowEnabled} onChange={(v) => update("textShadowBlur", v)} />
              <Slider label={text("Shadow opacity", "影透明度")} value={settings.textShadowOpacity} min={0} max={100} disabled={!settings.textShadowEnabled} onChange={(v) => update("textShadowOpacity", v)} />
            </div>
          </details>

          <div className="design-section-label">{text("Player information", "プレイヤー情報")}</div>
          {isCompactLayout && (
            <div className="compact-edit-note">
              {text(
                "Compact layout is active. Position and size controls below now edit the compact layout only.",
                "コンパクトモード中です。以下の位置・サイズ設定はコンパクト専用として保存されます。"
              )}
            </div>
          )}

          <details className="design-group">
            <summary><span className="summary-copy"><span className="summary-title">{text("Display Name", "表示名")}</span></span><SummaryToggle label={text("Name", "名前")} checked={settings.showName} onChange={(v) => update("showName", v)} /></summary>
            <div className="design-group-body">
              <TransparencyControl language={uiLanguage} label={text("Display name", "表示名")} value={settings.nameTransparency} onChange={(v) => update("nameTransparency", v)} disabled={!settings.showName} />
              <fieldset className={`setting-scope ${settings.showName ? "" : "is-disabled"}`} disabled={!settings.showName}>
                <Slider label={text("Name X", "名前 X")} value={isCompactLayout ? settings.compactNameX : settings.nameX} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactNameX" : "nameX", v)} />
                <Slider label={text("Name Y", "名前 Y")} value={verticalSliderValue(isCompactLayout ? settings.compactNameY : settings.nameY)} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactNameY" : "nameY", storedTopValue(v))} />
                <MappedSlider label={text("Name size", "名前サイズ")} value={isCompactLayout ? settings.compactNameSize : settings.nameSize} minValue={4} maxValue={120} onChange={(v) => update(isCompactLayout ? "compactNameSize" : "nameSize", v)} />
                <Slider label={text("Name spacing", "名前文字間隔")} value={settings.nameTextSpacing} min={-50} max={50} onChange={(v) => update("nameTextSpacing", v)} />
              </fieldset>
            </div>
          </details>

          <details className="design-group">
            <summary>
              <span className="summary-copy"><span className="summary-title">{text("Rate / RT/CT / MMR/LR", "レート / ラベル")}</span></span>
              <span className="summary-toggle-cluster">
                <SummaryToggle label={text("Rate", "レート")} checked={settings.showRate} onChange={(v) => update("showRate", v)} />
                <SummaryToggle label={text("Track", "Track")} checked={settings.showTrackTagText} onChange={(v) => update("showTrackTagText", v)} />
                <SummaryToggle label={text("Label", "ラベル")} checked={settings.showRatingLabelText} onChange={(v) => update("showRatingLabelText", v)} />
              </span>
            </summary>
            <div className="design-group-body">
              <div className="design-subtitle">{text("Rate number", "レート数値")}</div>
              <TransparencyControl language={uiLanguage} label={text("Rate number", "レート数値")} value={settings.rateTransparency} onChange={(v) => update("rateTransparency", v)} disabled={!settings.showRate} />
              <fieldset className={`setting-scope ${settings.showRate ? "" : "is-disabled"}`} disabled={!settings.showRate}>
                <Slider label={text("Rate X", "レート X")} value={isCompactLayout ? settings.compactScoreX : settings.scoreX} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactScoreX" : "scoreX", v)} />
                <Slider label={text("Rate Y", "レート Y")} value={verticalSliderValue(isCompactLayout ? settings.compactScoreY : settings.scoreY)} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactScoreY" : "scoreY", storedTopValue(v))} />
                <MappedSlider label={text("Rate size", "レートサイズ")} value={isCompactLayout ? settings.compactScoreSize : settings.scoreSize} minValue={6} maxValue={160} onChange={(v) => update(isCompactLayout ? "compactScoreSize" : "scoreSize", v)} />
                <Slider label={text("Rate spacing", "レート文字間隔")} value={settings.scoreTextSpacing} min={-50} max={50} onChange={(v) => update("scoreTextSpacing", v)} />
              </fieldset>

              <div className="design-subtitle">{text("RT/CT", "RT/CT")}</div>
              <TransparencyControl language={uiLanguage} label={text("RT/CT", "RT/CT")} value={settings.trackTransparency} onChange={(v) => update("trackTransparency", v)} disabled={!settings.showTrackTagText} />
              <fieldset className={`setting-scope ${settings.showTrackTagText ? "" : "is-disabled"}`} disabled={!settings.showTrackTagText}>
                <Slider label={text("RT/CT X", "RT/CT X")} value={isCompactLayout ? settings.compactTagX : settings.tagX} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactTagX" : "tagX", v)} />
                <Slider label={text("RT/CT Y", "RT/CT Y")} value={verticalSliderValue(isCompactLayout ? settings.compactTagY : settings.tagY)} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactTagY" : "tagY", storedTopValue(v))} />
                <MappedSlider label={text("RT/CT size", "RT/CT サイズ")} value={isCompactLayout ? settings.compactTagSize : settings.tagTextSize} minValue={4} maxValue={90} onChange={(v) => update(isCompactLayout ? "compactTagSize" : "tagTextSize", v)} />
                <Slider label={text("RT/CT spacing", "RT/CT 文字間隔")} value={settings.tagTextSpacing} min={-50} max={50} onChange={(v) => update("tagTextSpacing", v)} />
              </fieldset>

              <div className="design-subtitle">{text("MMR/LR", "MMR/LR")}</div>
              <TransparencyControl language={uiLanguage} label={text("MMR/LR", "MMR/LR")} value={settings.ratingTransparency} onChange={(v) => update("ratingTransparency", v)} disabled={!settings.showRatingLabelText} />
              <fieldset className={`setting-scope ${settings.showRatingLabelText ? "" : "is-disabled"}`} disabled={!settings.showRatingLabelText}>
                <Slider label={text("MMR/LR X", "MMR/LR X")} value={isCompactLayout ? settings.compactRatingX : settings.ratingBoxX} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactRatingX" : "ratingBoxX", v)} />
                <Slider label={text("MMR/LR Y", "MMR/LR Y")} value={verticalSliderValue(isCompactLayout ? settings.compactRatingY : settings.ratingBoxY)} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactRatingY" : "ratingBoxY", storedTopValue(v))} />
                <MappedSlider label={text("MMR/LR size", "MMR/LR サイズ")} value={isCompactLayout ? settings.compactRatingSize : settings.ratingTextSize} minValue={4} maxValue={90} onChange={(v) => update(isCompactLayout ? "compactRatingSize" : "ratingTextSize", v)} />
                <Slider label={text("MMR/LR spacing", "MMR/LR 文字間隔")} value={settings.ratingTextSpacing} min={-50} max={50} onChange={(v) => update("ratingTextSpacing", v)} />
              </fieldset>
            </div>
          </details>

          <details className="design-group">
            <summary>
              <span className="summary-copy"><span className="summary-title">{text("Rank", "ランク")}</span></span>
              <span className="summary-toggle-cluster">
                <SummaryToggle label={text("Text", "文字")} checked={settings.showRankText} onChange={(v) => update("showRankText", v)} />
                <SummaryToggle label={text("Icon", "画像")} checked={settings.showRankIcon} onChange={(v) => update("showRankIcon", v)} />
              </span>
            </summary>
            <div className="design-group-body">
              <div className="design-subtitle">{text("Rank text", "ランク")}</div>
              <label>
                {text("Rank format", "ランク表示形式")}
                <select
                  value={settings.rankTextFormat}
                  onChange={(e) => update("rankTextFormat", e.target.value as RankTextFormat)}
                >
                  <option value="DIVISION">Silver</option>
                  <option value="FULL_SLASH">Silver/Mid Tier</option>
                  <option value="CLASS">Mid Tier</option>
                  <option value="FULL_BREAK">{text("Silver ↵ Mid Tier", "Silver ↵ Mid Tier（改行）")}</option>
                </select>
              </label>
              <TransparencyControl language={uiLanguage} label={text("Rank text", "ランク")} value={settings.rankTextTransparency} onChange={(v) => update("rankTextTransparency", v)} disabled={!settings.showRankText} />
              <fieldset className={`setting-scope ${settings.showRankText ? "" : "is-disabled"}`} disabled={!settings.showRankText}>
                <Slider label={text("Rank X", "ランク X")} value={isCompactLayout ? settings.compactRankTextX : settings.rankTextX} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactRankTextX" : "rankTextX", v)} />
                <Slider label={text("Rank Y", "ランク Y")} value={verticalSliderValue(isCompactLayout ? settings.compactRankTextY : settings.rankTextY)} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactRankTextY" : "rankTextY", storedTopValue(v))} />
                <MappedSlider label={text("Rank size", "ランクサイズ")} value={isCompactLayout ? settings.compactRankTextSize : settings.rankTextSize} minValue={4} maxValue={90} onChange={(v) => update(isCompactLayout ? "compactRankTextSize" : "rankTextSize", v)} /><Slider label={text("Rank spacing", "ランク文字間隔")} value={settings.rankTextSpacing} min={-50} max={50} onChange={(v) => update("rankTextSpacing", v)} />
              </fieldset>

              <div className="design-subtitle">{text("Rank icon", "ランク画像")}</div>
              <TransparencyControl language={uiLanguage} label={text("Rank icon", "ランク画像")} value={settings.rankIconTransparency} onChange={(v) => update("rankIconTransparency", v)} disabled={!settings.showRankIcon} />
              <fieldset className={`setting-scope ${settings.showRankIcon ? "" : "is-disabled"}`} disabled={!settings.showRankIcon}>
                <Slider label={text("Rank icon X", "ランク画像 X")} value={isCompactLayout ? settings.compactRankIconX : settings.rankIconX} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactRankIconX" : "rankIconX", v)} />
                <Slider label={text("Rank icon Y", "ランク画像 Y")} value={verticalSliderValue(isCompactLayout ? settings.compactRankIconY : settings.rankIconY)} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactRankIconY" : "rankIconY", storedTopValue(v))} />
                <MappedSlider label={text("Rank icon size", "ランク画像サイズ")} value={isCompactLayout ? settings.compactRankIconSize : settings.rankIconSize} minValue={0} maxValue={150} onChange={(v) => update(isCompactLayout ? "compactRankIconSize" : "rankIconSize", v)} />
              </fieldset>
            </div>
          </details>

          <details className="design-group">
            <summary><span className="summary-copy"><span className="summary-title">Events</span></span><SummaryToggle label="Events" checked={settings.showEvents} onChange={(v) => update("showEvents", v)} /></summary>
            <div className="design-group-body">
              <TransparencyControl language={uiLanguage} label="Events" value={settings.eventsTransparency} onChange={(v) => update("eventsTransparency", v)} disabled={!settings.showEvents} />
              <fieldset className={`setting-scope ${settings.showEvents ? "" : "is-disabled"}`} disabled={!settings.showEvents}>
                <label>{text("Events format", "模擬数形式")}<select value={settings.eventsFormat} onChange={(e) => update("eventsFormat", e.target.value as EventFormat)}><option value="EVENTS">100 Events</option><option value="PREFIX">Events 100</option><option value="HASH">#100</option><option value="NUMBER">100</option></select></label>
                <div className="two-col"><label>{text("Events color", "模擬数色")}<input type="color" value={settings.eventsColor} disabled={settings.eventsUseMainColor} onChange={(e) => update("eventsColor", e.target.value)} /></label><label className="checkbox-label"><input type="checkbox" checked={settings.eventsUseMainColor} onChange={(e) => update("eventsUseMainColor", e.target.checked)} />{text("Use Main Text colors", "Main Textの色を使用")}</label></div>
                <Slider label={text("Events X", "模擬数 X")} value={isCompactLayout ? settings.compactEventsX : settings.eventsX} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactEventsX" : "eventsX", v)} /><Slider label={text("Events Y", "模擬数 Y")} value={verticalSliderValue(isCompactLayout ? settings.compactEventsY : settings.eventsY)} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactEventsY" : "eventsY", storedTopValue(v))} /><MappedSlider label={text("Events size", "模擬数サイズ")} value={isCompactLayout ? settings.compactEventsSize : settings.eventsSize} minValue={4} maxValue={100} onChange={(v) => update(isCompactLayout ? "compactEventsSize" : "eventsSize", v)} /><Slider label={text("Events spacing", "模擬数文字間隔")} value={settings.eventsSpacing} min={-50} max={50} onChange={(v) => update("eventsSpacing", v)} />
              </fieldset>
            </div>
          </details>

          <details className="design-group">
            <summary><span className="summary-copy"><span className="summary-title">{text("Flag", "国旗")}</span></span><SummaryToggle label={text("Flag", "国旗")} checked={settings.showFlag} onChange={(v) => update("showFlag", v)} /></summary>
            <div className="design-group-body">
              <TransparencyControl language={uiLanguage} label={text("Flag", "国旗")} value={settings.flagTransparency} onChange={(v) => update("flagTransparency", v)} disabled={!settings.showFlag} />
              <fieldset className={`setting-scope ${settings.showFlag ? "" : "is-disabled"}`} disabled={!settings.showFlag}>
                <Slider label={text("Flag X", "国旗 X")} value={isCompactLayout ? settings.compactFlagX : settings.flagX} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactFlagX" : "flagX", v)} /><Slider label={text("Flag Y", "国旗 Y")} value={verticalSliderValue(isCompactLayout ? settings.compactFlagY : settings.flagY)} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactFlagY" : "flagY", storedTopValue(v))} /><MappedSlider label={text("Flag size", "国旗サイズ")} value={isCompactLayout ? settings.compactFlagSize : settings.flagSize} minValue={4} maxValue={100} onChange={(v) => update(isCompactLayout ? "compactFlagSize" : "flagSize", v)} />
              </fieldset>
            </div>
          </details>

          <div className="design-section-label">{text("Images / extras", "画像 / その他")}</div>

          <details className="design-group">
            <summary><span className="summary-copy"><span className="summary-title">{text("Background Image", "背景画像")}</span></span><SummaryToggle label={text("BG Image", "背景画像")} checked={settings.showBackgroundImage} onChange={(v) => update("showBackgroundImage", v)} /></summary>
            <div className="design-group-body">
              <TransparencyControl language={uiLanguage} label={text("Background image", "背景画像")} value={settings.backgroundImageTransparency} onChange={(v) => update("backgroundImageTransparency", v)} disabled={!settings.showBackgroundImage} />
              <fieldset className={`setting-scope ${settings.showBackgroundImage ? "" : "is-disabled"}`} disabled={!settings.showBackgroundImage}>
                <label>{text("Background image / GIF URL", "背景画像 / GIF URL")}<input value={settings.bgUrl} onChange={(e) => update("bgUrl", e.target.value)} placeholder="https://..." /></label><Slider label={text("Background X", "背景 X")} value={settings.bgX} min={0} max={100} onChange={(v) => update("bgX", v)} /><Slider label={text("Background Y", "背景 Y")} value={verticalSliderValue(settings.bgY)} min={0} max={100} onChange={(v) => update("bgY", storedTopValue(v))} /><MappedSlider label={text("Background zoom", "背景ズーム")} value={settings.bgZoom} minValue={25} maxValue={350} onChange={(v) => update("bgZoom", v)} />
              </fieldset>
            </div>
          </details>

          <details className="design-group">
            <summary><span className="summary-copy"><span className="summary-title">{text("Custom Image", "追加画像")}</span></span><SummaryToggle label={text("Image", "画像")} checked={settings.showCustomImage} onChange={(v) => update("showCustomImage", v)} /></summary>
            <div className="design-group-body">
              <TransparencyControl language={uiLanguage} label={text("Custom image", "追加画像")} value={settings.customImageGradient} onChange={(v) => update("customImageGradient", v)} disabled={!settings.showCustomImage} />
              <fieldset className={`setting-scope ${settings.showCustomImage ? "" : "is-disabled"}`} disabled={!settings.showCustomImage}>
                <label>{text("Image URL", "画像URL")}<input value={settings.customImageUrl} onChange={(e) => update("customImageUrl", e.target.value)} placeholder="https://example.com/image.png" /></label><Slider label={text("Image X", "画像 X")} value={settings.customImageX} min={0} max={100} onChange={(v) => update("customImageX", v)} /><Slider label={text("Image Y", "画像 Y")} value={verticalSliderValue(settings.customImageY)} min={0} max={100} onChange={(v) => update("customImageY", storedTopValue(v))} /><MappedSlider label="Image Z" value={settings.customImageZ} minValue={0} maxValue={10} onChange={(v) => update("customImageZ", v)} /><MappedSlider label={text("Image size", "画像サイズ")} value={settings.customImageSize} minValue={0} maxValue={650} onChange={(v) => update("customImageSize", v)} />
              </fieldset>
            </div>
          </details>

          <details className="design-group">
            <summary><span className="summary-copy"><span className="summary-title">{text("Extra Text", "追加テキスト")}</span></span><SummaryToggle label={text("Text", "文字")} checked={settings.showOtherText} onChange={(v) => update("showOtherText", v)} /></summary>
            <div className="design-group-body">
              <TransparencyControl language={uiLanguage} label={text("Extra text", "追加テキスト")} value={settings.otherTextTransparency} onChange={(v) => update("otherTextTransparency", v)} disabled={!settings.showOtherText} />
              <fieldset className={`setting-scope ${settings.showOtherText ? "" : "is-disabled"}`} disabled={!settings.showOtherText}>
                <label>{text("Text", "テキスト")}<input value={settings.otherText} onChange={(e) => update("otherText", e.target.value)} placeholder="Any text..." /></label><div className="two-col"><label>{text("Text color", "追加テキスト色")}<input type="color" value={settings.otherTextColor} disabled={settings.otherTextUseMainColor} onChange={(e) => update("otherTextColor", e.target.value)} /></label><label className="checkbox-label"><input type="checkbox" checked={settings.otherTextUseMainColor} onChange={(e) => update("otherTextUseMainColor", e.target.checked)} />{text("Use Main Text colors", "Main Textの色を使用")}</label></div><Slider label={text("Text X", "文字 X")} value={isCompactLayout ? settings.compactOtherTextX : settings.otherTextX} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactOtherTextX" : "otherTextX", v)} /><Slider label={text("Text Y", "文字 Y")} value={verticalSliderValue(isCompactLayout ? settings.compactOtherTextY : settings.otherTextY)} min={0} max={100} onChange={(v) => update(isCompactLayout ? "compactOtherTextY" : "otherTextY", storedTopValue(v))} /><MappedSlider label={text("Text size", "文字サイズ")} value={isCompactLayout ? settings.compactOtherTextSize : settings.otherTextSize} minValue={4} maxValue={100} onChange={(v) => update(isCompactLayout ? "compactOtherTextSize" : "otherTextSize", v)} /><Slider label={text("Text spacing", "文字間隔")} value={settings.otherTextSpacing} min={-50} max={50} onChange={(v) => update("otherTextSpacing", v)} />
              </fieldset>
            </div>
          </details>

          <div className="design-section-label">{text("Effects", "エフェクト")}</div>
          <details className="design-group">
            <summary><span className="summary-copy"><span className="summary-title">{text("Effects", "エフェクト")}</span></span><SummaryToggle label={text("Flow", "枠線")} checked={settings.flowEnabled} onChange={(v) => update("flowEnabled", v)} /></summary>
            <div className="design-group-body">
              <div className="design-subtitle">{text("Win / Loss opening effect", "勝利 / 敗北 前半演出")}</div>
              <label>
                {text("Opening style", "前半演出")}
                <select
                  value={settings.resultEffectStyle}
                  onChange={(e) => update("resultEffectStyle", e.target.value as ResultEffectStyle)}
                >
                  <option value="DEFAULT">{text("Default", "デフォルト")}</option>
                  <option value="THROTTLE">{text("Full Throttle!", "アクセル全開！")}</option>
                  <option value="STARSTRUCK">{text("Star Struck", "スターストラック")}</option>
                  <option value="NEONRUSH">{text("Neon Rush", "ネオンラッシュ")}</option>
                  <option value="SHOCKWAVE">{text("Shockwave", "ショックウェーブ")}</option>
                </select>
              </label>
              <div className="design-subtitle">{text("Rank change effect", "ランク変動演出")}</div><label>{text("Rank Up / Down style", "Rank Up / Down演出")}<select value={settings.rankEffectStyle} onChange={(e) => update("rankEffectStyle", e.target.value as RankEffectStyle)}><option value="CLASSIC">{text("Classic reveal", "クラシック")}</option><option value="FLASH">{text("Light flash", "ライトフラッシュ")}</option><option value="SLIDE">{text("Side slide", "サイドスライド")}</option><option value="BURST">{text("Energy burst", "エナジーバースト")}</option><option value="STARLIGHT">{text("Starlight", "スターライト")}</option><option value="METEOR">{text("Meteor shower", "流星群")}</option></select></label>
              <div className="design-subtitle">{text("MMR / LR switch effect", "MMR / LR切替演出")}</div><label>{text("Switch style", "切替演出")}<select value={settings.ratingSwitchEffectStyle} onChange={(e) => update("ratingSwitchEffectStyle", e.target.value as RatingSwitchEffectStyle)}><option value="WAVE">{text("Wave", "ウェーブ")}</option><option value="FADE">{text("Soft fade", "ソフトフェード")}</option><option value="SLIDE">{text("Slide in", "スライドイン")}</option><option value="PULSE">{text("Pulse", "パルス")}</option><option value="SWEEP">{text("Light sweep", "ライトスイープ")}</option><option value="GLITCH">{text("Digital glitch", "デジタルグリッチ")}</option></select></label>
              <div className="design-subtitle">{text("Effect color", "エフェクト色")}</div><div className="two-col"><label>{text("Effect color", "エフェクト色")}<input type="color" value={settings.ratingEffectColor} disabled={settings.ratingEffectUseMainColor} onChange={(e) => update("ratingEffectColor", e.target.value)} /></label><label className="checkbox-label"><input type="checkbox" checked={settings.ratingEffectUseMainColor} onChange={(e) => update("ratingEffectUseMainColor", e.target.checked)} />{text("Use border color", "枠線色を使用")}</label></div>
              <div className="design-subtitle">{text("Border", "枠線")}</div><div className="two-col"><label>{text("Border color", "枠線色")}<input type="color" value={settings.borderColor} onChange={(e) => update("borderColor", e.target.value)} /></label><label>{text("Animated border color", "枠線カラー")}<input type="color" value={settings.flowColor} onChange={(e) => update("flowColor", e.target.value)} /></label></div><OptionSlider label={text("Border speed", "枠線速度")} optionLabel={text("Border animation", "枠線")} checked={settings.flowEnabled} onCheckedChange={(checked) => update("flowEnabled", checked)} value={settings.flowSpeed} min={0} max={100} disabled={!settings.flowEnabled} onChange={(v) => update("flowSpeed", v)} /><MappedSlider label={text("Border length", "枠線長さ")} value={settings.flowLength} minValue={1} maxValue={96} disabled={!settings.flowEnabled} onChange={(v) => update("flowLength", v)} />
            </div>
          </details>
        </section>

        <section className="panel preview-panel">
          <h2>{text("Live preview", "ライブプレビュー")}</h2>

          <div className={`preview-stage ${settings.layoutMode === "COMPACT" ? "compact-preview-stage" : ""}`}>
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

          <div className="preview-action-row">
            <div className="animation-buttons">
              <button type="button" onClick={() => triggerPreviewEffect("rank-up")}>
                {text("Win", "勝利")}
              </button>

              <button type="button" onClick={() => triggerPreviewEffect("rank-down")}>
                {text("Loss", "敗北")}
              </button>
            </div>

            <div className="preview-history-controls">
              <button
                type="button"
                onClick={undoSettings}
                disabled={undoStack.length === 0}
                title={text("Undo (Ctrl+Z)", "1つ戻す (Ctrl+Z)")}
              >
                ↶ {text("Undo", "戻す")}
              </button>

              <button
                type="button"
                onClick={redoSettings}
                disabled={redoStack.length === 0}
                title={text("Redo (Ctrl+Y)", "1つ進む (Ctrl+Y)")}
              >
                ↷ {text("Redo", "進む")}
              </button>
            </div>

            <div
              className={`preview-history-log ${historyLog ? "" : "is-empty"}`}
              aria-live="polite"
              title={historyLog}
            >
              {historyLog || text("No edit history yet", "操作履歴なし")}
            </div>
          </div>

          <h2>{text("OBS Browser Source URL", "OBSブラウザソースURL")}</h2>

          <div className="url-row">
            <input readOnly value={cardUrl} />
            <button onClick={copyUrl}>{copied ? text("Copied", "コピー済み") : text("Copy", "コピー")}</button>
          </div>

          <div className={`obs-size-hint ${settings.layoutMode === "COMPACT" ? "is-compact" : ""}`}>
            {settings.layoutMode === "COMPACT"
              ? text("OBS source size: 380 × 150 (then scale freely in OBS)", "OBSソースサイズ: 380 × 150（その後OBS側で自由に縮小）")
              : text("OBS source size: 650 × 150", "OBSソースサイズ: 650 × 150")}
          </div>

          <a className="open-link" href={cardUrl} target="_blank">
            {text("Open card in new tab ↗", "カードを新しいタブで開く ↗")}
          </a>

          <h2>{text("Share design JSON", "デザインJSON共有")}</h2>

          <div className="share-buttons">
            <button type="button" onClick={copySettingsText}>
              {settingsCopied ? text("Copied", "コピー済み") : text("Copy design", "デザインをコピー")}
            </button>

            <button type="button" onClick={pasteDesignFromClipboard}>
              {text("Paste design", "デザインを貼り付け")}
            </button>
          </div>

          {showImportSettings && (
            <div className="share-import-area">
              <label>
                {text("Paste design text", "デザイン文字列を貼り付け")}
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
                {text("Load pasted design", "貼り付けたデザインを読込")}
              </button>
            </div>
          )}

          {importSettingsStatus && (
            <p className="share-status">{importSettingsStatus}</p>
          )}

          <button
            className="reset-button"
            onClick={() => applySettingsWithHistory(defaultSettings)}
          >
            {text("Reset settings", "設定をリセット")}
          </button>

          <div className="bottom-fetch-block">
            <div className="fetch-button-row">
              <button type="button" onClick={fetchPlayer}>
                {text("Fetch player", "プレイヤー取得")}
              </button>

              <button type="button" onClick={fetchRanks}>
                {text("Rank list", "ランク一覧")}
              </button>
            </div>

            <div className="fetch-status-row">
              <span>{apiStatus}</span>
              <span>{rankStatus}</span>
            </div>

            <details className="fetched-assets-panel">
              <summary>{text("Fetched image URLs", "取得画像を確認")}</summary>
              <div className="fetched-asset-grid">
                <label>
                  {text("Flag image URL", "国旗画像URL")}
                  <input value={settings.flagUrl} onChange={(e) => update("flagUrl", e.target.value)} placeholder={text("Auto fetched", "自動取得")} />
                  {settings.flagUrl && <img className="fetched-asset-preview flag-preview" src={settings.flagUrl} alt="Flag preview" />}
                </label>
                <label>
                  {text("Rank icon URL", "ランク画像URL")}
                  <input value={settings.rankIconUrl} onChange={(e) => update("rankIconUrl", e.target.value)} placeholder={text("Auto fetched", "自動取得")} />
                  {settings.rankIconUrl && <img className="fetched-asset-preview" src={settings.rankIconUrl} alt="Rank icon preview" />}
                </label>
              </div>
            </details>
          </div>
        </section>
      </div>

      {showVersionHistory && (
        <div
          className="version-history-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setShowVersionHistory(false);
          }}
        >
          <section
            className="version-history-modal"
            role="dialog"
            aria-modal="true"
            aria-label={text("Version history", "バージョン履歴")}
          >
            <div className="version-history-modal-head">
              <h2>{text("Version history", "バージョン履歴")}</h2>
              <button
                type="button"
                onClick={() => setShowVersionHistory(false)}
                aria-label={text("Close", "閉じる")}
              >
                ×
              </button>
            </div>
            <div className="version-history-body">
              {VERSION_HISTORY.map((entry) => (
                <div key={entry.version}>
                  <b>{entry.version}</b>
                  <span>{uiLanguage === "JP" ? entry.jp : entry.en}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}


function SummaryToggle(props: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className="summary-toggle"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      title={`${props.label}: ${props.checked ? "ON" : "OFF"}`}
    >
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(event) => props.onChange(event.target.checked)}
        onClick={(event) => event.stopPropagation()}
      />
      <span>{props.label}</span>
    </label>
  );
}

function TransparencyControl(props: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  language: UiLanguage;
}) {
  return (
    <Slider
      label={`${props.label} ${props.language === "JP" ? "透明度" : "transparency"}`}
      value={props.value}
      min={0}
      max={100}
      disabled={props.disabled}
      onChange={props.onChange}
    />
  );
}

function VisibilityControl(props: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  transparency: number;
  onTransparencyChange: (value: number) => void;
}) {
  return (
    <div className={`visibility-control ${props.checked ? "" : "is-disabled"}`}>
      <label className="checkbox-label">
        <input type="checkbox" checked={props.checked} onChange={(e) => props.onCheckedChange(e.target.checked)} />
        {props.label}
      </label>
      <div className="visibility-opacity-control">
        <span>Transparency <b>{Math.round(props.transparency)}</b></span>
        <input type="range" min={0} max={100} value={props.transparency} disabled={!props.checked} onChange={(e) => props.onTransparencyChange(Number(e.target.value))} />
      </div>
    </div>
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
  const effectiveCardBgOpacity = (settings.cardBgOpacity ?? 86) * opacityFromTransparency(settings.cardBackgroundTransparency);
  const cardBgAlpha = alphaHexFromPercent(effectiveCardBgOpacity, 86);

  const cardBackground = settings.cardBgGradientEnabled
    ? `linear-gradient(90deg, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} 0%, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} ${cardBgStops.topStop}%, ${hexWithAlpha(settings.cardBgRight, cardBgAlpha)} ${cardBgStops.bottomStart}%, ${hexWithAlpha(settings.cardBgRight, cardBgAlpha)} 100%)`
    : `linear-gradient(90deg, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} 0%, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} 100%)`;

  const customImageTransparency = percent(settings.customImageGradient, 0);
  const customImageOpacity = Math.max(
    0,
    Math.min(1, 1 - customImageTransparency / 100)
  );

  const previewRank = getPreviewRank(settings.rankText, effect, rankOrder);
  const previewRankIcon = previewRank.emblem || settings.rankIconUrl;

  const tagBoxStops = gradientStops(settings.tagBoxGradientBalance, 50);
  const ratingBoxStops = gradientStops(settings.ratingBoxGradientBalance, 50);
  const effectiveTagTop = settings.textTopColor;
  const effectiveTagBottom = settings.textBottomColor;
  const effectiveTagGradient = settings.textGradientEnabled;
  const effectiveTagBalance = settings.textGradientBalance;
  const effectiveRatingTop = settings.textTopColor;
  const effectiveRatingBottom = settings.textBottomColor;
  const effectiveRatingGradient = settings.textGradientEnabled;
  const effectiveRatingBalance = settings.textGradientBalance;
  const textStops = gradientStops(settings.textGradientBalance, 50);
  const effectiveTagTextStops = gradientStops(effectiveTagBalance, 50);
  const effectiveRatingTextStops = gradientStops(effectiveRatingBalance, 50);
  const ratingEffectColor = settings.ratingEffectUseMainColor
    ? settings.borderColor
    : settings.ratingEffectColor;
  const textShadowColor = settings.textShadowEnabled
    ? hexWithAlpha(
        settings.textShadowColor,
        alphaHexFromPercent(settings.textShadowOpacity, 70)
      )
    : "transparent";

  const compactLayout = settings.layoutMode === "COMPACT";
  const layoutNameX = compactLayout ? settings.compactNameX : settings.nameX;
  const layoutNameY = compactLayout ? settings.compactNameY : settings.nameY;
  const layoutNameSize = compactLayout ? settings.compactNameSize : settings.nameSize;
  const layoutScoreX = compactLayout ? settings.compactScoreX : settings.scoreX;
  const layoutScoreY = compactLayout ? settings.compactScoreY : settings.scoreY;
  const layoutScoreSize = compactLayout ? settings.compactScoreSize : settings.scoreSize;
  const layoutRatingX = compactLayout ? settings.compactRatingX : settings.ratingBoxX;
  const layoutRatingY = compactLayout ? settings.compactRatingY : settings.ratingBoxY;
  const layoutRatingSize = compactLayout ? settings.compactRatingSize : settings.ratingTextSize;
  const layoutTagX = compactLayout ? settings.compactTagX : settings.tagX;
  const layoutTagY = compactLayout ? settings.compactTagY : settings.tagY;
  const layoutTagSize = compactLayout ? settings.compactTagSize : settings.tagTextSize;
  const layoutRankX = compactLayout ? settings.compactRankTextX : settings.rankTextX;
  const layoutRankY = compactLayout ? settings.compactRankTextY : settings.rankTextY;
  const layoutRankSize = compactLayout ? settings.compactRankTextSize : settings.rankTextSize;
  const layoutEventsX = compactLayout ? settings.compactEventsX : settings.eventsX;
  const layoutEventsY = compactLayout ? settings.compactEventsY : settings.eventsY;
  const layoutEventsSize = compactLayout ? settings.compactEventsSize : settings.eventsSize;
  const layoutOtherX = compactLayout ? settings.compactOtherTextX : settings.otherTextX;
  const layoutOtherY = compactLayout ? settings.compactOtherTextY : settings.otherTextY;
  const layoutOtherSize = compactLayout ? settings.compactOtherTextSize : settings.otherTextSize;
  const layoutFlagX = compactLayout ? settings.compactFlagX : settings.flagX;
  const layoutFlagY = compactLayout ? settings.compactFlagY : settings.flagY;
  const layoutFlagSize = compactLayout ? settings.compactFlagSize : settings.flagSize;
  const layoutIconX = compactLayout ? settings.compactRankIconX : settings.rankIconX;
  const layoutIconY = compactLayout ? settings.compactRankIconY : settings.rankIconY;
  const layoutIconSize = compactLayout ? settings.compactRankIconSize : settings.rankIconSize;

  return (
    <div
      className={`card-shell ${settings.layoutMode === "COMPACT" ? "compact-mode" : ""} ${
        settings.textFont === "OEDO_KANTEIRYU" ? "font-oedo-kanteiryu" : ""
      } ${!settings.flowEnabled ? "no-flow" : ""} ${
        !settings.tagBoxGradientEnabled ? "no-tag-box-gradient" : ""
      } ${!effectiveTagGradient ? "no-tag-text-gradient" : ""} ${
        !settings.ratingBoxGradientEnabled ? "no-rating-box-gradient" : ""
      } ${!effectiveRatingGradient ? "no-rating-text-gradient" : ""} ${
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
          transform: "scale(0.98)",
          backgroundImage: settings.showCardBackground ? cardBackground : "none",
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
          "--tag-text-top-color": effectiveTagTop ?? "#ffffff",
          "--tag-text-bottom-color": effectiveTagBottom ?? "#ff3030",
          "--tag-box-top-stop": `${tagBoxStops.topStop}%`,
          "--tag-box-bottom-start": `${tagBoxStops.bottomStart}%`,
          "--tag-text-gradient-balance": `${effectiveTagBalance}%`,
          "--tag-text-top-stop": `${effectiveTagTextStops.topStop}%`,
          "--tag-text-bottom-start": `${effectiveTagTextStops.bottomStart}%`,
          "--rating-top-color": settings.ratingBoxTopColor ?? "#b90000",
          "--rating-bottom-color": settings.ratingBoxBottomColor ?? "#000000",
          "--rating-text-top-color": effectiveRatingTop ?? "#ffffff",
          "--rating-text-bottom-color": effectiveRatingBottom ?? "#ff3030",
          "--rating-box-top-stop": `${ratingBoxStops.topStop}%`,
          "--rating-box-bottom-start": `${ratingBoxStops.bottomStart}%`,
          "--rating-text-gradient-balance": `${effectiveRatingBalance}%`,
          "--rating-text-top-stop": `${effectiveRatingTextStops.topStop}%`,
          "--rating-text-bottom-start": `${effectiveRatingTextStops.bottomStart}%`,
          "--label-radius": `${settings.labelRadius ?? 10}px`,
          "--card-font": fontFamily(settings.textFont),
          "--text-top-color": settings.textTopColor ?? "#ffffff",
          "--text-bottom-color": settings.textBottomColor ?? "#ff3030",
          "--text-gradient-balance": `${settings.textGradientBalance}%`,
          "--text-top-stop": `${textStops.topStop}%`,
          "--text-bottom-start": `${textStops.bottomStart}%`,
          "--text-shadow-x": `${shadowOffsetX(settings.textShadowX)}px`,
          "--text-shadow-y": `${shadowOffsetY(settings.textShadowY)}px`,
          "--text-shadow-blur": `${shadowBlur(settings.textShadowBlur)}px`,
          "--text-shadow-color": textShadowColor,
        } as CSSProperties
      }
    >
      {settings.showBackgroundImage && settings.bgUrl && (
        <div
          className="card-background-image-layer"
          style={{
            backgroundImage: `url(${settings.bgUrl})`,
            backgroundPosition: `${settings.bgX}% ${settings.bgY}%`,
            backgroundSize: `${settings.bgZoom}%`,
            opacity: opacityFromTransparency(settings.backgroundImageTransparency),
          }}
          aria-hidden="true"
        />
      )}

      <svg
        className="flow-border-svg"
        viewBox={settings.layoutMode === "COMPACT" ? "0 0 380 150" : "0 0 650 150"}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect
          className="flow-border-path"
          x="1"
          y="1"
          width={settings.layoutMode === "COMPACT" ? "378" : "648"}
          height="148"
          rx={settings.layoutMode === "COMPACT" ? "61" : "69"}
          ry={settings.layoutMode === "COMPACT" ? "61" : "69"}
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
            left: `${layoutIconX}%`,
            top: `${layoutIconY}%`,
            width: layoutIconSize,
            height: layoutIconSize,
            opacity: opacityFromTransparency(settings.rankIconTransparency),
          }}
        />
      )}

      {(settings.showTrackTagText) && (
        <div
          className="mode-tag"
          style={{
            left: `${layoutTagX}%`,
            top: `${layoutTagY}%`,
            fontSize: layoutTagSize,
            letterSpacing: `${(settings.tagTextSpacing ?? 0) / 100}em`,
            opacity: opacityFromTransparency(settings.trackTransparency),
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
            left: `${layoutFlagX}%`,
            top: `${layoutFlagY}%`,
            width: Math.round(layoutFlagSize * 1.92),
            height: Math.round(layoutFlagSize * 1.42),
            fontSize: layoutFlagSize,
            opacity: opacityFromTransparency(settings.flagTransparency),
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
            left: `${layoutNameX}%`,
            top: `${layoutNameY}%`,
            fontSize: layoutNameSize,
            letterSpacing: `${(settings.nameTextSpacing ?? 0) / 100}em`,
            opacity: opacityFromTransparency(settings.nameTransparency),
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
            left: `${layoutScoreX}%`,
            top: `${layoutScoreY}%`,
          }}
        />
      )}

      {(effect === "win" || effect === "loss") && (
        <ResultOpeningEffect kind={effect} style={settings.resultEffectStyle} />
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
            left: `${layoutScoreX}%`,
            top: `${layoutScoreY}%`,
            fontSize: layoutScoreSize,
            "--score-digit-spacing": `${(settings.scoreTextSpacing ?? 0) / 100}em`,
            opacity: opacityFromTransparency(settings.rateTransparency),
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
          left: `${layoutRatingX}%`,
          top: `${layoutRatingY}%`,
          fontSize: layoutRatingSize,
          letterSpacing: `${(settings.ratingTextSpacing ?? 0) / 100}em`,
          opacity: opacityFromTransparency(settings.ratingTransparency),
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
          left: `${layoutRankX}%`,
          top: `${layoutRankY}%`,
          fontSize: layoutRankSize,
          letterSpacing: `${(settings.rankTextSpacing ?? 0) / 100}em`,
          opacity: opacityFromTransparency(settings.rankTextTransparency),
          whiteSpace: settings.rankTextFormat === "FULL_BREAK" ? "pre-line" : "nowrap",
          lineHeight: settings.rankTextFormat === "FULL_BREAK" ? 0.9 : 1,
          textAlign: "center",
        }}
      >
        {formatRankText(settings.rankText || "MKW Lounge", settings.rankTextFormat)}
      </div>
      )}

      {settings.showEvents && formatEvents(settings.events, settings.eventsFormat) && (
        <div
          className={`event-line ${settings.eventsUseMainColor ? "main-gradient-text" : "solid-custom-text"}`}
          style={{
            left: `${layoutEventsX}%`,
            top: `${layoutEventsY}%`,
            fontSize: layoutEventsSize,
            letterSpacing: `${(settings.eventsSpacing ?? 0) / 100}em`,
            color: settings.eventsUseMainColor ? undefined : settings.eventsColor,
            opacity: opacityFromTransparency(settings.eventsTransparency),
          }}
        >
          {formatEvents(settings.events, settings.eventsFormat)}
        </div>
      )}

      {settings.showOtherText && settings.otherText && (
        <div
          className={`other-text-line ${settings.otherTextUseMainColor ? "main-gradient-text" : "solid-custom-text"}`}
          style={{
            left: `${layoutOtherX}%`,
            top: `${layoutOtherY}%`,
            fontSize: layoutOtherSize,
            letterSpacing: `${(settings.otherTextSpacing ?? 0) / 100}em`,
            color: settings.otherTextUseMainColor ? undefined : settings.otherTextColor,
            opacity: opacityFromTransparency(settings.otherTextTransparency),
          }}
        >
          {settings.otherText}
        </div>
      )}

      {(effect === "rank-up" || effect === "rank-down") &&
        !rankRevealVisible && (
          <div className={`effect-burst rank-announcement ${effect}`} style={{ letterSpacing: `${(settings.rankTextSpacing ?? 0) / 100}em` }}>
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

          <div className="rank-reveal-label" style={{ letterSpacing: `${(settings.rankTextSpacing ?? 0) / 100}em` }}>
            {effect === "rank-up" ? "NEW RANK" : "RANK CHANGED"}
          </div>

          <div
            className="rank-reveal-text"
            style={{
              letterSpacing: `${(settings.rankTextSpacing ?? 0) / 100}em`,
              whiteSpace: settings.rankTextFormat === "FULL_BREAK" ? "pre-line" : "nowrap",
              lineHeight: settings.rankTextFormat === "FULL_BREAK" ? 0.9 : undefined,
            }}
          >
            {formatRankText(previewRank.text, settings.rankTextFormat)}
          </div>
        </div>
      )}
    </div>
  );
}


