"use client";

import RollingNumber from "@/components/RollingNumber";
import { useEffect, useRef, useState, type CSSProperties } from "react";

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
type EffectKind = "win" | "loss" | "rank-up" | "rank-down";
type EffectPhase = "change" | "rank-reveal";

type EffectState = {
  kind: EffectKind;
  phase: EffectPhase;
  text: string;
  rankText?: string;
  rankIcon?: string;
} | null;

type InitialCardSettings = {
  name: string;
  lounge: string;
  mode: ModeSetting;

  ratingMode: RatingMode;
  ratingSwitchSeconds: number;

  flag: string;
  flagUrl: string;

  mmr: string;
  lr: string;

  rank: string;
  icon: string;

  border: string;
  flow: string;
  flowOn: boolean;
  flowSpeed: number;
  flowLength: number;
  ratingEffectUseMain: boolean;
  ratingEffectColor: string;
  tagTop: string;
  tagBottom: string;
  tagTextTop: string;
  tagTextBottom: string;
  tagBoxGradient: boolean;
  tagBoxBalance: number;
  tagTextGradient: boolean;
  tagTextBalance: number;
  ratingTop: string;
  ratingBottom: string;
  ratingTextTop: string;
  ratingTextBottom: string;
  ratingBoxGradient: boolean;
  ratingBoxBalance: number;
  ratingTextGradient: boolean;
  ratingTextBalance: number;
  textTop: string;
  textBottom: string;
  textGradient: boolean;
  textBalance: number;
  textFont: FontChoice;
  cardBgLeft: string;
  cardBgRight: string;
  cardBgGradient: boolean;
  cardBgBalance: number;
  cardBgOpacity: number;
  bg: string;

  bgX: number;
  bgY: number;
  bgZoom: number;
  scale: number;

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

  iconX: number;
  iconY: number;
  iconSize: number;

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

  auto: boolean;
  refresh: number;
};

type PlayerApiResponse = {
  playerName: string;
  flagEmoji: string;
  flagUrl: string;
  currentMmr: number;
  currentLr: number;
  rankText: string;
  emblemUrl: string;
  rankNumber: number | null;
};

type DisplayState = {
  name: string;
  flag: string;
  flagUrl: string;
  mmr: string;
  lr: string;
  rank: string;
  icon: string;
};

function getInitialActiveRating(mode: RatingMode): ActiveRating {
  return mode === "LR" ? "LR" : "MMR";
}

function getInitialActiveMode(mode: ModeSetting): ActiveMode {
  return mode === "CT" ? "CT" : "RT";
}

function getSafeRatingMode(_mode: ModeSetting, ratingMode: RatingMode): RatingMode {
  return ratingMode;
}


function cleanRankText(text: string) {
  return text.replace(/\s*,\s*/g, " / ");
}

function normalizeRankText(text: string) {
  return cleanRankText(text)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function waitForImage(src: string) {
  if (!src || typeof window === "undefined") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const image = new window.Image();
    let finished = false;

    const done = () => {
      if (finished) return;
      finished = true;
      resolve();
    };

    image.onload = done;
    image.onerror = done;
    window.setTimeout(done, 900);
    image.src = src;
  });
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


function fontFamily(value: FontChoice | string | undefined) {
  switch (value) {
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

export default function CardClient({
  initial,
}: {
  initial: InitialCardSettings;
}) {
  const initialDisplay: DisplayState = {
    name: initial.name,
    flag: initial.flag,
    flagUrl: initial.flagUrl,
    mmr: initial.mmr,
    lr: initial.lr,
    rank: cleanRankText(initial.rank),
    icon: initial.icon,
  };

  const [display, setDisplay] = useState<DisplayState>(initialDisplay);

  const activeMode: ActiveMode = initial.mode;

  const [activeRating, setActiveRating] = useState<ActiveRating>(
    getInitialActiveRating(initial.ratingMode)
  );

  const [effect, setEffect] = useState<EffectState>(null);
  const [scoreAnimationToken, setScoreAnimationToken] = useState(0);
  const [switchAnimationToken, setSwitchAnimationToken] = useState(0);

  const activeRatingRef = useRef<ActiveRating>(
    getInitialActiveRating(initial.ratingMode)
  );


  const lastMmrRef = useRef<number | null>(null);
  const lastLrRef = useRef<number | null>(null);
  const lastRankRef = useRef<number | null>(null);
  const lastRankTextRef = useRef<string>("");

  const effectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rankChangeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstFetchRef = useRef(true);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlBackground = html.style.background;
    const prevHtmlBackgroundColor = html.style.backgroundColor;
    const prevHtmlWidth = html.style.width;
    const prevHtmlHeight = html.style.height;
    const prevHtmlOverflow = html.style.overflow;

    const prevBodyBackground = body.style.background;
    const prevBodyBackgroundColor = body.style.backgroundColor;
    const prevBodyMargin = body.style.margin;
    const prevBodyWidth = body.style.width;
    const prevBodyHeight = body.style.height;
    const prevBodyOverflow = body.style.overflow;

    html.classList.add("obs-transparent");
    body.classList.add("obs-transparent");

    html.style.setProperty("background", "transparent", "important");
    html.style.setProperty("background-color", "transparent", "important");
    html.style.setProperty("width", "650px", "important");
    html.style.setProperty("height", "150px", "important");
    html.style.setProperty("overflow", "hidden", "important");

    body.style.setProperty("background", "transparent", "important");
    body.style.setProperty("background-color", "transparent", "important");
    body.style.setProperty("margin", "0", "important");
    body.style.setProperty("width", "650px", "important");
    body.style.setProperty("height", "150px", "important");
    body.style.setProperty("overflow", "hidden", "important");

    return () => {
      html.classList.remove("obs-transparent");
      body.classList.remove("obs-transparent");

      html.style.background = prevHtmlBackground;
      html.style.backgroundColor = prevHtmlBackgroundColor;
      html.style.width = prevHtmlWidth;
      html.style.height = prevHtmlHeight;
      html.style.overflow = prevHtmlOverflow;

      body.style.background = prevBodyBackground;
      body.style.backgroundColor = prevBodyBackgroundColor;
      body.style.margin = prevBodyMargin;
      body.style.width = prevBodyWidth;
      body.style.height = prevBodyHeight;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    activeRatingRef.current = activeRating;
  }, [activeRating]);

  useEffect(() => {
    if (initial.ratingMode !== "SWITCH") {
      const next = getInitialActiveRating(initial.ratingMode);
      setActiveRating(next);
      activeRatingRef.current = next;
      return;
    }

    setActiveRating("MMR");
    activeRatingRef.current = "MMR";

    const seconds = Math.max(initial.ratingSwitchSeconds ?? 5, 3);

    const interval = setInterval(() => {
      setActiveRating((prev) => {
        const next = prev === "MMR" ? "LR" : "MMR";
        activeRatingRef.current = next;
        setSwitchAnimationToken((token) => token + 1);
        return next;
      });
    }, seconds * 1000);

    return () => clearInterval(interval);
  }, [initial.ratingMode, initial.ratingSwitchSeconds]);

  function clearEffectTimers() {
    if (effectTimerRef.current) {
      clearTimeout(effectTimerRef.current);
    }

    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
    }

    if (rankChangeTimerRef.current) {
      clearTimeout(rankChangeTimerRef.current);
    }
  }

  function triggerRateEffect(kind: "win" | "loss", text: string) {
    clearEffectTimers();

    setEffect(null);
    setScoreAnimationToken((prev) => prev + 1);

    window.setTimeout(() => {
      setEffect({
        kind,
        phase: "change",
        text,
      });
    }, 20);

    effectTimerRef.current = setTimeout(() => {
      setEffect(null);
    }, 1800);
  }

  function triggerRankEffect(
    kind: "rank-up" | "rank-down",
    text: string,
    rankText: string,
    rankIcon: string
  ) {
    clearEffectTimers();

    setEffect(null);

    window.setTimeout(() => {
      setEffect({
        kind,
        phase: "change",
        text,
        rankText,
        rankIcon,
      });
    }, 20);

    revealTimerRef.current = setTimeout(() => {
      setEffect({
        kind,
        phase: "rank-reveal",
        text: rankText || "NEW RANK",
        rankText: rankText || "NEW RANK",
        rankIcon,
      });
    }, 3800);

    effectTimerRef.current = setTimeout(() => {
      setEffect(null);
    }, 7000);
  }

  function triggerRateThenRankEffect(
    rateKind: "win" | "loss",
    rateText: string,
    rankKind: "rank-up" | "rank-down",
    rankText: string,
    rankIcon: string
  ) {
    clearEffectTimers();

    setEffect(null);
    setScoreAnimationToken((prev) => prev + 1);

    window.setTimeout(() => {
      setEffect({
        kind: rateKind,
        phase: "change",
        text: rateText,
      });
    }, 20);

    rankChangeTimerRef.current = setTimeout(() => {
      setEffect({
        kind: rankKind,
        phase: "change",
        text: rankKind === "rank-up" ? "RANK UP" : "RANK DOWN",
        rankText,
        rankIcon,
      });
    }, 1700);

    revealTimerRef.current = setTimeout(() => {
      setEffect({
        kind: rankKind,
        phase: "rank-reveal",
        text: rankText || "NEW RANK",
        rankText: rankText || "NEW RANK",
        rankIcon,
      });
    }, 5200);

    effectTimerRef.current = setTimeout(() => {
      setEffect(null);
    }, 8200);
  }

  useEffect(() => {
    if (!initial.auto || !initial.lounge.trim()) return;

    let active = true;

    async function fetchLivePlayer() {
      try {
        const params = new URLSearchParams({
          name: initial.lounge,
          mode: initial.mode,
        });

        const response = await fetch(`/api/player?${params.toString()}`, {
          cache: "no-store",
        });

        const data = (await response.json()) as PlayerApiResponse;

        if (!active || !response.ok) return;

        const nextMmr = data.currentMmr;
        const nextLr = data.currentLr;
        const nextRank = data.rankNumber;

        if (!firstFetchRef.current) {
          const previousMmr = lastMmrRef.current;
          const previousLr = lastLrRef.current;
          const previousRank = lastRankRef.current;
          const previousRankText = lastRankTextRef.current;

          const nextRankText = cleanRankText(data.rankText || "NEW RANK");
          const nextRankIcon = data.emblemUrl || "";

          const rankNumberChanged =
            nextRank !== null &&
            previousRank !== null &&
            nextRank !== previousRank;

          const rankTextChanged =
            Boolean(previousRankText) &&
            Boolean(nextRankText) &&
            normalizeRankText(previousRankText) !== normalizeRankText(nextRankText);

          const rankChanged = rankNumberChanged || rankTextChanged;

          const mmrDiff = previousMmr !== null ? nextMmr - previousMmr : 0;
          const lrDiff = previousLr !== null ? nextLr - previousLr : 0;

          if (rankChanged) {
            const rankKind: "rank-up" | "rank-down" = rankNumberChanged
              ? nextRank !== null && previousRank !== null && nextRank < previousRank
                ? "rank-up"
                : "rank-down"
              : mmrDiff > 0 || lrDiff > 0
                ? "rank-up"
                : "rank-down";

            const ratingForEffect =
              initial.ratingMode === "SWITCH"
                ? activeRatingRef.current
                : initial.ratingMode;

            let rateText = "";
            let rateKind: "win" | "loss" = "win";

            if (ratingForEffect === "LR" && lrDiff !== 0) {
              rateText = `${lrDiff > 0 ? "+" : ""}${lrDiff} LR`;
              rateKind = lrDiff > 0 ? "win" : "loss";
            } else if (mmrDiff !== 0) {
              rateText = `${mmrDiff > 0 ? "+" : ""}${mmrDiff} MMR`;
              rateKind = mmrDiff > 0 ? "win" : "loss";
            } else if (lrDiff !== 0) {
              rateText = `${lrDiff > 0 ? "+" : ""}${lrDiff} LR`;
              rateKind = lrDiff > 0 ? "win" : "loss";
            }

            if (rateText) {
              triggerRateThenRankEffect(
                rateKind,
                rateText,
                rankKind,
                nextRankText,
                nextRankIcon
              );
            } else {
              triggerRankEffect(
                rankKind,
                rankKind === "rank-up" ? "RANK UP" : "RANK DOWN",
                nextRankText,
                nextRankIcon
              );
            }
          } else {
            const ratingForEffect =
              initial.ratingMode === "SWITCH"
                ? activeRatingRef.current
                : initial.ratingMode;

            if (ratingForEffect === "LR") {
              if (previousLr !== null && nextLr !== previousLr) {
                const diff = nextLr - previousLr;

                triggerRateEffect(
                  diff > 0 ? "win" : "loss",
                  `${diff > 0 ? "+" : ""}${diff} LR`
                );
              }
            } else {
              if (previousMmr !== null && nextMmr !== previousMmr) {
                const diff = nextMmr - previousMmr;

                triggerRateEffect(
                  diff > 0 ? "win" : "loss",
                  `${diff > 0 ? "+" : ""}${diff} MMR`
                );
              }
            }
          }
        }

        firstFetchRef.current = false;
        lastMmrRef.current = nextMmr;
        lastLrRef.current = nextLr;
        lastRankRef.current = nextRank;
        lastRankTextRef.current = cleanRankText(data.rankText || initial.rank);

        const nextDisplay: DisplayState = {
          name: initial.name,
          flag: data.flagEmoji || initial.flag,
          flagUrl: data.flagUrl || initial.flagUrl,
          mmr: String(nextMmr || 0),
          lr: String(nextLr || 0),
          rank: cleanRankText(data.rankText || initial.rank),
          icon: data.emblemUrl || initial.icon,
        };

        await waitForImage(nextDisplay.icon);

        if (!active) return;

        setDisplay(nextDisplay);
      } catch {
        // OBS表示中に一時的に取得できなくても、前回表示を維持する
      }
    }

    fetchLivePlayer();

    const refreshMs = Math.max(initial.refresh, 15) * 1000;
    const interval = setInterval(fetchLivePlayer, refreshMs);

    return () => {
      active = false;
      clearInterval(interval);
      clearEffectTimers();
    };
  }, [initial]);

  const shownScore = activeRating === "MMR" ? display.mmr : display.lr;

  const cardBgStops = gradientStops(initial.cardBgBalance, 50);
  const cardBgAlpha = alphaHexFromPercent(initial.cardBgOpacity, 86);
  const tagBoxStops = gradientStops(initial.tagBoxBalance, 50);
  const tagTextStops = gradientStops(initial.tagTextBalance, 40);
  const ratingBoxStops = gradientStops(initial.ratingBoxBalance, 50);
  const ratingTextStops = gradientStops(initial.ratingTextBalance, 40);
  const textStops = gradientStops(initial.textBalance, 40);
  const ratingEffectColor = initial.ratingEffectUseMain
    ? initial.border
    : initial.ratingEffectColor;

  const visibleBackgroundUrl = initial.showBackgroundImage ? initial.bg : "";

  const cardBackground = initial.cardBgGradient
    ? visibleBackgroundUrl
      ? `linear-gradient(90deg, ${hexWithAlpha(initial.cardBgLeft, cardBgAlpha)} 0%, ${hexWithAlpha(initial.cardBgLeft, cardBgAlpha)} ${cardBgStops.topStop}%, ${hexWithAlpha(initial.cardBgRight, cardBgAlpha)} ${cardBgStops.bottomStart}%, ${hexWithAlpha(initial.cardBgRight, cardBgAlpha)} 100%), url(${visibleBackgroundUrl})`
      : `linear-gradient(90deg, ${initial.cardBgLeft || "#130716"} 0%, ${initial.cardBgLeft || "#130716"} ${cardBgStops.topStop}%, ${initial.cardBgRight || "#0a1024"} ${cardBgStops.bottomStart}%, ${initial.cardBgRight || "#0a1024"} 100%)`
    : visibleBackgroundUrl
      ? `linear-gradient(90deg, ${hexWithAlpha(initial.cardBgLeft, cardBgAlpha)} 0%, ${hexWithAlpha(initial.cardBgLeft, cardBgAlpha)} 100%), url(${visibleBackgroundUrl})`
      : `linear-gradient(90deg, ${initial.cardBgLeft || "#130716"} 0%, ${initial.cardBgLeft || "#130716"} 100%)`;

  const customImageTransparency = percent(initial.customImageGradient, 0);
  const customImageOpacity = Math.max(
    0,
    Math.min(1, 1 - customImageTransparency / 100)
  );

  return (
    <main className="obs-page">
      <div
        className={`card-shell ${
          initial.textFont === "OEDO_KANTEIRYU"
            ? "font-oedo-kanteiryu"
            : ""
        } ${!initial.flowOn ? "no-flow" : ""} ${
          !initial.tagBoxGradient ? "no-tag-box-gradient" : ""
        } ${!initial.tagTextGradient ? "no-tag-text-gradient" : ""} ${
          !initial.ratingBoxGradient ? "no-rating-box-gradient" : ""
        } ${!initial.ratingTextGradient ? "no-rating-text-gradient" : ""} ${
          !initial.textGradient ? "no-text-gradient" : ""
        } ${!initial.cardBgGradient ? "no-card-bg-gradient" : ""} label-shape-${(
          initial.labelShape ?? "ROUNDED"
        ).toLowerCase()} ${
          effect ? `effect-${effect.kind} effect-phase-${effect.phase}` : ""
        }`}
        style={
          {
            opacity: Math.max(
              0,
              Math.min(1, 1 - (initial.overallTransparency ?? 0) / 100)
            ),
            transform: `scale(${initial.scale / 100})`,
            backgroundImage: initial.showCardBackground ? cardBackground : "none",
            backgroundPosition: `${initial.bgX}% ${initial.bgY}%`,
            backgroundSize: `${initial.bgZoom}%`,
            borderColor: "transparent",
            boxShadow: `0 0 28px ${initial.border}44, inset 0 0 24px #ffffff10`,
            "--border-color": initial.border,
            "--flow-color": initial.flow || "#ff3030",
            "--rating-effect-color": ratingEffectColor || "#ff3030",
            "--flow-speed": flowDuration(initial.flowSpeed),
            "--flow-length": String(percent(initial.flowLength, 16)),
            "--flow-gap": String(100 - percent(initial.flowLength, 16)),
            "--tag-top-color": initial.tagTop || "#b90000",
            "--tag-bottom-color": initial.tagBottom || "#000000",
            "--tag-text-top-color": initial.tagTextTop || "#ffffff",
            "--tag-text-bottom-color": initial.tagTextBottom || "#ff3030",
            "--tag-box-top-stop": `${tagBoxStops.topStop}%`,
            "--tag-box-bottom-start": `${tagBoxStops.bottomStart}%`,
            "--tag-text-top-stop": `${tagTextStops.topStop}%`,
            "--tag-text-bottom-start": `${tagTextStops.bottomStart}%`,
            "--rating-top-color": initial.ratingTop || "#b90000",
            "--rating-bottom-color": initial.ratingBottom || "#000000",
            "--rating-text-top-color": initial.ratingTextTop || "#ffffff",
            "--rating-text-bottom-color": initial.ratingTextBottom || "#ff3030",
            "--rating-box-top-stop": `${ratingBoxStops.topStop}%`,
            "--rating-box-bottom-start": `${ratingBoxStops.bottomStart}%`,
            "--rating-text-top-stop": `${ratingTextStops.topStop}%`,
            "--rating-text-bottom-start": `${ratingTextStops.bottomStart}%`,
            "--label-radius": `${initial.labelRadius ?? 10}px`,
            "--card-font": fontFamily(initial.textFont),
            "--text-top-color": initial.textTop || "#ffffff",
            "--text-bottom-color": initial.textBottom || "#ff3030",
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

        {initial.showCustomImage && initial.customImageUrl && (
          <img
            className="custom-overlay-image"
            src={initial.customImageUrl}
            alt=""
            style={{
              left: `${initial.customImageX}%`,
              top: `${initial.customImageY}%`,
              zIndex: initial.customImageZ,
              width: initial.customImageSize,
              opacity: customImageOpacity,
            }}
          />
        )}

        {initial.showRankIcon && display.icon && (
          <img
            className="rank-icon"
            src={display.icon}
            alt=""
            style={{
              left: `${initial.iconX}%`,
              top: `${initial.iconY}%`,
              width: initial.iconSize,
              height: initial.iconSize,
            }}
          />
        )}

        {initial.showTrackTagText && (
          <div
            className="mode-tag"
            style={{
              left: `${initial.tagX}%`,
              top: `${initial.tagY}%`,
              fontSize: initial.tagTextSize,
              letterSpacing: `${(initial.tagTextSpacing ?? 0) / 100}em`,
            }}
          >
            {initial.showTrackTagText && (
              <span className="tag-text">{activeMode}</span>
            )}
          </div>
        )}

        {initial.showFlag && (
          <div
            className={`flag-badge ${display.flagUrl ? "has-image" : ""}`}
            style={{
              left: `${initial.flagX}%`,
              top: `${initial.flagY}%`,
              width: Math.round(initial.flagSize * 1.92),
              height: Math.round(initial.flagSize * 1.42),
              fontSize: initial.flagSize,
              background: display.flagUrl
                ? "rgba(255, 255, 255, .92)"
                : initial.border,
            }}
          >
            {display.flagUrl ? (
              <img className="flag-image" src={display.flagUrl} alt="" />
            ) : (
              display.flag
            )}
          </div>
        )}

        {initial.showName && (
          <div
            className="card-name"
            style={{
              left: `${initial.nameX}%`,
              top: `${initial.nameY}%`,
              fontSize: initial.nameSize,
            }}
          >
            {display.name}
          </div>
        )}

        {initial.showRate && initial.ratingMode === "SWITCH" && switchAnimationToken > 0 && (
          <div
            key={`switch-wave-${switchAnimationToken}`}
            className="rating-switch-wave"
            style={{
              left: `${initial.scoreX}%`,
              top: `${initial.scoreY}%`,
            }}
          />
        )}

        {initial.showRate && (
          <RollingNumber
            key={`score-${activeRating}-${switchAnimationToken}`}
            value={shownScore}
            animateToken={scoreAnimationToken}
            className={`card-score ${
              switchAnimationToken > 0 ? "rating-score-switch" : ""
            }`}
            style={{
              left: `${initial.scoreX}%`,
              top: `${initial.scoreY}%`,
              fontSize: initial.scoreSize,
            }}
          />
        )}

        {initial.showRatingLabelText && (
        <div
          className="rating-label"
          style={{
            left: `${initial.ratingBoxX}%`,
            top: `${initial.ratingBoxY}%`,
            fontSize: initial.ratingTextSize,
            letterSpacing: `${(initial.ratingTextSpacing ?? 0) / 100}em`,
          }}
        >
          {initial.showRatingLabelText && (
            <span className="tag-text">{activeRating}</span>
          )}
        </div>
        )}

        {initial.showRankText && (
        <div
          className="rank-line"
          style={{
            left: `${initial.rankTextX}%`,
            top: `${initial.rankTextY}%`,
            fontSize: initial.rankTextSize,
          }}
        >
          {display.rank || "MKW Lounge"}
        </div>
        )}

        {effect && effect.phase === "change" && (
          <div className={`effect-burst ${effect.kind}`}>{effect.text}</div>
        )}

        {effect && effect.phase === "rank-reveal" && (
          <div className={`rank-reveal ${effect.kind}`}>
            {effect.rankIcon && (
              <img className="rank-reveal-bg" src={effect.rankIcon} alt="" />
            )}

            <div className="rank-reveal-label">
              {effect.kind === "rank-up" ? "NEW RANK" : "RANK CHANGED"}
            </div>

            <div className="rank-reveal-text">
              {cleanRankText(effect.rankText || "NEW RANK")}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
