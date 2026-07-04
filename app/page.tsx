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
type ActiveMode = "RT" | "CT";
type ActiveRating = "MMR" | "LR";

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

  scoreX: number;
  scoreY: number;
  scoreSize: number;

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

const defaultSettings: Settings = {
  loungeName: "",
  displayName: "Your Name",
  mode: "RT",

  ratingMode: "MMR",
  ratingSwitchSeconds: 5,
  season: "16",

  flag: "🇯🇵",
  flagUrl: "",

  mmr: "0000",
  lr: "0000",

  rankText: "",
  rankIconUrl: "",

  borderColor: "#000000",
  flowColor: "#ffffff",
  flowEnabled: true,
  flowSpeed: 50,
  flowLength: 25,
  ratingEffectUseMainColor: false,
  ratingEffectColor: "#ffffff",
  tagTopColor: "#000000",
  tagBottomColor: "#ffffff",
  tagTextTopColor: "#ffffff",
  tagTextBottomColor: "#000000",
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
  textBottomColor: "#000000",
  textGradientEnabled: false,
  textGradientBalance: 35,
  cardBgLeft: "#000000",
  cardBgRight: "#ff0000",
  cardBgGradientEnabled: false,
  cardBgGradientBalance: 34,
  cardBgOpacity: 30,
  bgUrl: "",

  bgX: 60,
  bgY: 50,
  bgZoom: 100,
  cardScale: 100,

  nameX: 36,
  nameY: 58,
  nameSize: 37,

  scoreX: 80,
  scoreY: 50,
  scoreSize: 45,

  ratingBoxX: 90,
  ratingBoxY: 81,
  ratingBoxSize: 13,
  ratingTextSize: 10,
  ratingTextSpacing: 0,
  labelRadius: 10,
  labelShape: "ROUNDED",

  tagX: 70,
  tagY: 25,
  tagSize: 18,
  tagTextSize: 18,
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
};

const designSettingKeys: Array<keyof Settings> = [
  "borderColor",
  "flowColor",
  "flowEnabled",
  "flowSpeed",
  "flowLength",
  "ratingEffectUseMainColor",
  "ratingEffectColor",
  "tagTopColor",
  "tagBottomColor",
  "tagTextTopColor",
  "tagTextBottomColor",
  "tagBoxGradientEnabled",
  "tagBoxGradientBalance",
  "tagTextGradientEnabled",
  "tagTextGradientBalance",
  "ratingBoxTopColor",
  "ratingBoxBottomColor",
  "ratingTextTopColor",
  "ratingTextBottomColor",
  "ratingBoxGradientEnabled",
  "ratingBoxGradientBalance",
  "ratingTextGradientEnabled",
  "ratingTextGradientBalance",
  "textTopColor",
  "textBottomColor",
  "textGradientEnabled",
  "textGradientBalance",
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
  "scoreX",
  "scoreY",
  "scoreSize",
  "ratingBoxX",
  "ratingBoxY",
  "ratingBoxSize",
  "ratingTextSize",
  "ratingTextSpacing",
  "labelRadius",
  "labelShape",
  "tagX",
  "tagY",
  "tagSize",
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
    return String(Math.round(value));
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
    "cardBgLeft",
    "cardBgRight",
  ].includes(key);
}

function isUrlDesignKey(key: keyof Settings) {
  return key === "bgUrl";
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
    cardBgGradientBalance: [0, 100],
    cardBgOpacity: [0, 100],
    bgX: [0, 100],
    bgY: [0, 100],
    bgZoom: [80, 250],
    cardScale: [20, 200],
    nameX: [0, 100],
    nameY: [0, 100],
    nameSize: [16, 60],
    scoreX: [0, 100],
    scoreY: [0, 100],
    scoreSize: [20, 80],
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
    rankIconSize: [20, 90],
  };

  const range = ranges[key];

  if (!range) {
    return Math.round(value);
  }

  return Math.min(range[1], Math.max(range[0], Math.round(value)));
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

  if (data.labelShape !== undefined) {
    const shape = String(data.labelShape).toUpperCase();

    updates.labelShape =
      shape === "STAR" || shape === "HEART" || shape === "ROUNDED"
        ? (shape as LabelShape)
        : defaultSettings.labelShape;
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


function numberParam(value: number) {
  return String(Math.round(value));
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

function flowDuration(value: number | undefined) {
  const speed = percent(value, 65);
  const seconds = 8 - speed * 0.072;

  return `${Math.max(0.8, Math.min(8, seconds)).toFixed(2)}s`;
}

function gradientStops(value: number | undefined, fallback: number) {
  const balance = percent(value, fallback);

  if (balance <= 0) {
    return {
      topStop: 100,
      bottomStart: 100,
    };
  }

  if (balance >= 100) {
    return {
      topStop: 0,
      bottomStart: 0,
    };
  }

  const center = 100 - balance;
  const blend = 18;

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

  return String(Math.max(0, number + previewScoreBump.diff));
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

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("kei-lounge-card-settings");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
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

      const data = (await response.json()) as RankApiResponse;

      if (!response.ok || !data.available) {
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

      const data = (await response.json()) as PlayerApiResponse;

      if (!response.ok) {
        setApiStatus(data.error ?? "プレイヤーが見つかりませんでした");
        return;
      }

      setSettings((prev) => ({
        ...prev,
        displayName: data.playerName || prev.displayName,
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
  }

  function triggerPreviewEffect(effect: PreviewEffect) {
    if (!effect) return;

    clearPreviewTimers();

    setPreviewEffect(null);
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
      previewRankTimer.current = setTimeout(() => {
        setPreviewEffect(effect);
      }, 1700);
    }

    const duration = isRankEffect ? 7600 : 1800;

    previewEffectTimer.current = setTimeout(() => {
      setPreviewEffect(null);
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
    params.set("tagTop", (settings.tagTopColor ?? "#b90000").replace("#", ""));
    params.set("tagBottom", (settings.tagBottomColor ?? "#000000").replace("#", ""));
    params.set("tagTextTop", (settings.tagTextTopColor ?? "#ffffff").replace("#", ""));
    params.set("tagTextBottom", (settings.tagTextBottomColor ?? "#ff3030").replace("#", ""));
    params.set("tagBoxGradient", settings.tagBoxGradientEnabled ? "1" : "0");
    params.set("tagBoxBalance", numberParam(settings.tagBoxGradientBalance ?? 50));
    params.set("tagTextGradient", settings.tagTextGradientEnabled ? "1" : "0");
    params.set("tagTextBalance", numberParam(settings.tagTextGradientBalance ?? 40));
    params.set("ratingTop", (settings.ratingBoxTopColor ?? "#b90000").replace("#", ""));
    params.set("ratingBottom", (settings.ratingBoxBottomColor ?? "#000000").replace("#", ""));
    params.set("ratingTextTop", (settings.ratingTextTopColor ?? "#ffffff").replace("#", ""));
    params.set("ratingTextBottom", (settings.ratingTextBottomColor ?? "#ff3030").replace("#", ""));
    params.set("ratingBoxGradient", settings.ratingBoxGradientEnabled ? "1" : "0");
    params.set("ratingBoxBalance", numberParam(settings.ratingBoxGradientBalance ?? 50));
    params.set("ratingTextGradient", settings.ratingTextGradientEnabled ? "1" : "0");
    params.set("ratingTextBalance", numberParam(settings.ratingTextGradientBalance ?? 40));
    params.set("textTop", (settings.textTopColor ?? "#ffffff").replace("#", ""));
    params.set("textBottom", (settings.textBottomColor ?? "#ff3030").replace("#", ""));
    params.set("textGradient", settings.textGradientEnabled ? "1" : "0");
    params.set("textBalance", numberParam(settings.textGradientBalance ?? 40));
    params.set("bgLeft", (settings.cardBgLeft ?? "#130716").replace("#", ""));
    params.set("bgRight", (settings.cardBgRight ?? "#0a1024").replace("#", ""));
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

    params.set("sx", numberParam(settings.scoreX));
    params.set("sy", numberParam(settings.scoreY));
    params.set("ss", numberParam(settings.scoreSize));

    params.set("rbx", numberParam(settings.ratingBoxX));
    params.set("rby", numberParam(settings.ratingBoxY));
    params.set("rbs", numberParam(settings.ratingBoxSize));
    params.set("rts", numberParam(settings.ratingTextSize));
    params.set("rspace", numberParam(settings.ratingTextSpacing));
    params.set("radius", numberParam(settings.labelRadius));
    params.set("shape", (settings.labelShape ?? "ROUNDED").toLowerCase());

    params.set("tx", numberParam(settings.tagX));
    params.set("ty", numberParam(settings.tagY));
    params.set("ts", numberParam(settings.tagSize));
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
          ? parseDesignObject(JSON.parse(raw))
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
              <span>Background</span>
            </summary>

            <div className="design-group-body">
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
                    value={settings.cardBgRight ?? "#0a1024"}
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
                value={settings.bgY}
                min={0}
                max={100}
                onChange={(v) => update("bgY", v)}
              />

              <Slider
                label="Background zoom"
                value={settings.bgZoom}
                min={80}
                max={250}
                onChange={(v) => update("bgZoom", v)}
              />
            </div>
          </details>

          <details className="design-group">
            <summary>
              <span>Main Text</span>
            </summary>

            <div className="design-group-body">
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
                value={settings.nameY}
                min={0}
                max={100}
                onChange={(v) => update("nameY", v)}
              />

              <Slider
                label="Name size"
                value={settings.nameSize}
                min={16}
                max={60}
                onChange={(v) => update("nameSize", v)}
              />


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
                value={settings.scoreY}
                min={0}
                max={100}
                onChange={(v) => update("scoreY", v)}
              />

              <Slider
                label="Rate size"
                value={settings.scoreSize}
                min={20}
                max={80}
                onChange={(v) => update("scoreSize", v)}
              />

              <div className="design-subtitle">Rate switch effect</div>

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
                value={settings.rankTextY}
                min={0}
                max={100}
                onChange={(v) => update("rankTextY", v)}
              />

              <Slider
                label="Rank text size"
                value={settings.rankTextSize}
                min={6}
                max={28}
                onChange={(v) => update("rankTextSize", v)}
              />
            </div>
          </details>

          <details className="design-group">
            <summary>
              <span>Border / Flow</span>
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

              <Slider
                label="Flow length"
                value={settings.flowLength ?? 16}
                min={4}
                max={45}
                disabled={!settings.flowEnabled}
                onChange={(v) => update("flowLength", v)}
              />


            </div>
          </details>

          <details className="design-group">
            <summary>
              <span>Track Tag</span>
            </summary>

            <div className="design-group-body">
              <div className="design-subtitle">Track tag colors</div>

              <div className="two-col">
                <label>
                  Track box top
                  <input
                    type="color"
                    value={settings.tagTopColor ?? "#b90000"}
                    onChange={(e) => update("tagTopColor", e.target.value)}
                  />
                </label>

                <label>
                  Track box bottom
                  <input
                    type="color"
                    value={settings.tagBottomColor ?? "#000000"}
                    onChange={(e) => update("tagBottomColor", e.target.value)}
                  />
                </label>
              </div>

              <OptionSlider
                label="Track box balance"
                optionLabel="Track box gradient"
                checked={settings.tagBoxGradientEnabled}
                onCheckedChange={(checked) =>
                  update("tagBoxGradientEnabled", checked)
                }
                value={settings.tagBoxGradientBalance ?? 50}
                min={0}
                max={100}
                disabled={!settings.tagBoxGradientEnabled}
                onChange={(v) => update("tagBoxGradientBalance", v)}
              />

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

              <div className="design-subtitle">Track tag layout</div>

              <Slider
                label="Track tag X"
                value={settings.tagX}
                min={0}
                max={100}
                onChange={(v) => update("tagX", v)}
              />

              <Slider
                label="Track tag Y"
                value={settings.tagY}
                min={0}
                max={100}
                onChange={(v) => update("tagY", v)}
              />

              <Slider
                label="Track tag size"
                value={settings.tagSize}
                min={8}
                max={30}
                onChange={(v) => update("tagSize", v)}
              />

              <Slider
                label="Track tag text size"
                value={settings.tagTextSize}
                min={8}
                max={30}
                onChange={(v) => update("tagTextSize", v)}
              />

              <Slider
                label="Track tag text spacing"
                value={settings.tagTextSpacing}
                min={0}
                max={30}
                onChange={(v) => update("tagTextSpacing", v)}
              />

              <div className="design-subtitle">Shared radius</div>

              <Slider
                label="Track / Rating radius"
                value={settings.labelRadius}
                min={0}
                max={15}
                onChange={(v) => update("labelRadius", v)}
              />

              <label>
                Track / Rating shape
                <select
                  value={settings.labelShape ?? "ROUNDED"}
                  onChange={(e) =>
                    update("labelShape", e.target.value as LabelShape)
                  }
                >
                  <option value="ROUNDED">Rounded</option>
                  <option value="STAR">Soft Star</option>
                  <option value="HEART">Heart</option>
                </select>
              </label>
            </div>
          </details>

          <details className="design-group">
            <summary>
              <span>Rating Label</span>
            </summary>

            <div className="design-group-body">
              <div className="design-subtitle">Rating label colors</div>

              <div className="two-col">
                <label>
                  Rating box top
                  <input
                    type="color"
                    value={settings.ratingBoxTopColor ?? "#b90000"}
                    onChange={(e) => update("ratingBoxTopColor", e.target.value)}
                  />
                </label>

                <label>
                  Rating box bottom
                  <input
                    type="color"
                    value={settings.ratingBoxBottomColor ?? "#000000"}
                    onChange={(e) =>
                      update("ratingBoxBottomColor", e.target.value)
                    }
                  />
                </label>
              </div>

              <OptionSlider
                label="Rating box balance"
                optionLabel="Rating box gradient"
                checked={settings.ratingBoxGradientEnabled}
                onCheckedChange={(checked) =>
                  update("ratingBoxGradientEnabled", checked)
                }
                value={settings.ratingBoxGradientBalance ?? 50}
                min={0}
                max={100}
                disabled={!settings.ratingBoxGradientEnabled}
                onChange={(v) => update("ratingBoxGradientBalance", v)}
              />

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

              <Slider
                label="Rating text size"
                value={settings.ratingTextSize}
                min={8}
                max={30}
                onChange={(v) => update("ratingTextSize", v)}
              />

              <Slider
                label="Rating text spacing"
                value={settings.ratingTextSpacing}
                min={0}
                max={30}
                onChange={(v) => update("ratingTextSpacing", v)}
              />

              <div className="design-subtitle">Rating label layout</div>

              <Slider
                label="Rating box X"
                value={settings.ratingBoxX}
                min={0}
                max={100}
                onChange={(v) => update("ratingBoxX", v)}
              />

              <Slider
                label="Rating box Y"
                value={settings.ratingBoxY}
                min={0}
                max={100}
                onChange={(v) => update("ratingBoxY", v)}
              />

              <Slider
                label="Rating box size"
                value={settings.ratingBoxSize}
                min={8}
                max={30}
                onChange={(v) => update("ratingBoxSize", v)}
              />

            </div>
          </details>

          <details className="design-group">
            <summary>
              <span>Other</span>
            </summary>

            <div className="design-group-body">
              <div className="design-subtitle">Flag layout</div>

              <Slider
                label="Flag X"
                value={settings.flagX}
                min={0}
                max={100}
                onChange={(v) => update("flagX", v)}
              />

              <Slider
                label="Flag Y"
                value={settings.flagY}
                min={0}
                max={100}
                onChange={(v) => update("flagY", v)}
              />

              <Slider
                label="Flag size"
                value={settings.flagSize}
                min={12}
                max={50}
                onChange={(v) => update("flagSize", v)}
              />

              <div className="design-subtitle">Rank icon layout</div>

              <Slider
                label="Rank icon X"
                value={settings.rankIconX}
                min={0}
                max={100}
                onChange={(v) => update("rankIconX", v)}
              />

              <Slider
                label="Rank icon Y"
                value={settings.rankIconY}
                min={0}
                max={100}
                onChange={(v) => update("rankIconY", v)}
              />

              <Slider
                label="Rank icon size"
                value={settings.rankIconSize}
                min={20}
                max={120}
                onChange={(v) => update("rankIconSize", v)}
              />
            </div>
          </details>

        </section>

        <section className="panel preview-panel">
          <h2>Live preview</h2>

          <div className="preview-stage">
            <Card
              settings={settings}
              effect={previewEffect}
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
  activeMode,
  activeRating,
  previewScoreBump,
  previewScoreAnimationToken,
  previewSwitchAnimationToken,
  rankOrder,
}: {
  settings: Settings;
  effect: PreviewEffect;
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

  const cardBackground = settings.cardBgGradientEnabled
    ? settings.bgUrl
      ? `linear-gradient(90deg, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} 0%, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} ${cardBgStops.topStop}%, ${hexWithAlpha(settings.cardBgRight, cardBgAlpha)} ${cardBgStops.bottomStart}%, ${hexWithAlpha(settings.cardBgRight, cardBgAlpha)} 100%), url(${settings.bgUrl})`
      : `linear-gradient(90deg, ${settings.cardBgLeft ?? "#130716"} 0%, ${settings.cardBgLeft ?? "#130716"} ${cardBgStops.topStop}%, ${settings.cardBgRight ?? "#0a1024"} ${cardBgStops.bottomStart}%, ${settings.cardBgRight ?? "#0a1024"} 100%)`
    : settings.bgUrl
      ? `linear-gradient(90deg, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} 0%, ${hexWithAlpha(settings.cardBgLeft, cardBgAlpha)} 100%), url(${settings.bgUrl})`
      : `linear-gradient(90deg, ${settings.cardBgLeft ?? "#130716"} 0%, ${settings.cardBgLeft ?? "#130716"} 100%)`;

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

  const effectText =
    effect === "win"
      ? `+100 ${activeRating}`
      : effect === "loss"
        ? `-100 ${activeRating}`
        : effect === "rank-up"
          ? "RANK UP"
          : effect === "rank-down"
            ? "RANK DOWN"
            : "";

  return (
    <div
      className={`card-shell ${!settings.flowEnabled ? "no-flow" : ""} ${
        !settings.tagBoxGradientEnabled ? "no-tag-box-gradient" : ""
      } ${!settings.tagTextGradientEnabled ? "no-tag-text-gradient" : ""} ${
        !settings.ratingBoxGradientEnabled ? "no-rating-box-gradient" : ""
      } ${!settings.ratingTextGradientEnabled ? "no-rating-text-gradient" : ""} ${
        !settings.textGradientEnabled ? "no-text-gradient" : ""
      } ${!settings.cardBgGradientEnabled ? "no-card-bg-gradient" : ""} label-shape-${(
        settings.labelShape ?? "ROUNDED"
      ).toLowerCase()} ${
        effect ? `effect-${effect}` : ""
      }`}
      style={
        {
          transform: `scale(${settings.cardScale / 100})`,
          backgroundImage: cardBackground,
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
          "--tag-shape-size": `${Math.max(
            44,
            Math.round((settings.tagSize ?? 18) * 4.4)
          )}px`,
          "--rating-shape-size": `${Math.max(
            48,
            Math.round((settings.ratingBoxSize ?? 13) * 5.2)
          )}px`,
          "--text-top-color": settings.textTopColor ?? "#ffffff",
          "--text-bottom-color": settings.textBottomColor ?? "#ff3030",
          "--text-top-stop": `${textStops.topStop}%`,
          "--text-bottom-start": `${textStops.bottomStart}%`,
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

      {settings.rankIconUrl && (
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

      <div
        className="mode-tag"
        style={{
          left: `${settings.tagX}%`,
          top: `${settings.tagY}%`,
          fontSize: settings.tagTextSize,
          letterSpacing: `${(settings.tagTextSpacing ?? 0) / 100}em`,
        }}
      >
        <span className="tag-text">{activeMode}</span>
      </div>

      <div
        className={`flag-badge ${settings.flagUrl ? "has-image" : ""}`}
        style={{
          left: `${settings.flagX}%`,
          top: `${settings.flagY}%`,
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

      <div
        className="card-name"
        style={{
          left: `${settings.nameX}%`,
          top: `${settings.nameY}%`,
          fontSize: settings.nameSize,
        }}
      >
        {name}
      </div>

      {settings.ratingMode === "SWITCH" && previewSwitchAnimationToken > 0 && (
        <div
          key={`preview-switch-wave-${previewSwitchAnimationToken}`}
          className="rating-switch-wave"
          style={{
            left: `${settings.scoreX}%`,
            top: `${settings.scoreY}%`,
          }}
        />
      )}

      <RollingNumber
        key={`preview-score-${activeRating}-${previewSwitchAnimationToken}`}
        value={shownScore || "0000"}
        animateToken={previewScoreAnimationToken}
        className={`card-score ${
          previewSwitchAnimationToken > 0 ? "rating-score-switch" : ""
        }`}
        style={{
          left: `${settings.scoreX}%`,
          top: `${settings.scoreY}%`,
          fontSize: settings.scoreSize,
        }}
      />

      <div
        key={`label-${activeRating}-${previewSwitchAnimationToken}`}
        className="rating-label rating-switch-in"
        style={{
          left: `${settings.ratingBoxX}%`,
          top: `${settings.ratingBoxY}%`,
          fontSize: settings.ratingTextSize,
          letterSpacing: `${(settings.ratingTextSpacing ?? 0) / 100}em`,
          padding: `${Math.max(2, Math.round((settings.ratingBoxSize ?? 13) * 0.35))}px ${Math.max(5, Math.round((settings.ratingBoxSize ?? 13) * 0.75))}px`,
        }}
      >
        <span className="tag-text">{activeRating}</span>
      </div>

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

      {effect && <div className={`effect-burst ${effect}`}>{effectText}</div>}

      {(effect === "rank-up" || effect === "rank-down") && (
        <div className={`rank-reveal ${effect} preview-rank-reveal`}>
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
