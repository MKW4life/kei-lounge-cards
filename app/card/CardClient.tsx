"use client";

import RollingNumber from "@/components/RollingNumber";
import { useEffect, useRef, useState, type CSSProperties } from "react";

type RatingMode = "MMR" | "LR" | "SWITCH";
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
  mode: "RT" | "CT";

  ratingMode: RatingMode;
  switchSeconds: number;

  flag: string;
  flagUrl: string;

  mmr: string;
  lr: string;

  rank: string;
  icon: string;

  main: string;
  sub: string;
  modeColor: string;
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

  tagX: number;
  tagY: number;
  tagSize: number;

  rankTextX: number;
  rankTextY: number;
  rankTextSize: number;

  flagX: number;
  flagY: number;
  flagSize: number;

  iconX: number;
  iconY: number;
  iconSize: number;

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

function getInitialActiveRating(mode: RatingMode): ActiveRating {
  return mode === "LR" ? "LR" : "MMR";
}

function cleanRankText(text: string) {
  return text.replace(/\s*,\s*/g, " / ");
}

export default function CardClient({
  initial,
}: {
  initial: InitialCardSettings;
}) {
  const [display, setDisplay] = useState({
    name: initial.name,
    flag: initial.flag,
    flagUrl: initial.flagUrl,
    mmr: initial.mmr,
    lr: initial.lr,
    rank: cleanRankText(initial.rank),
    icon: initial.icon,
  });

  const [activeRating, setActiveRating] = useState<ActiveRating>(
    getInitialActiveRating(initial.ratingMode)
  );

  const [effect, setEffect] = useState<EffectState>(null);
  const [scoreAnimationToken, setScoreAnimationToken] = useState(0);

  const activeRatingRef = useRef<ActiveRating>(
    getInitialActiveRating(initial.ratingMode)
  );

  const lastMmrRef = useRef<number | null>(null);
  const lastLrRef = useRef<number | null>(null);
  const lastRankRef = useRef<number | null>(null);

  const effectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

    const seconds = Math.max(initial.switchSeconds, 1);

    const interval = setInterval(() => {
      setActiveRating((prev) => {
        const next = prev === "MMR" ? "LR" : "MMR";
        activeRatingRef.current = next;
        return next;
      });
    }, seconds * 1000);

    return () => clearInterval(interval);
  }, [initial.ratingMode, initial.switchSeconds]);

  function clearEffectTimers() {
    if (effectTimerRef.current) {
      clearTimeout(effectTimerRef.current);
    }

    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
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
    }, 1150);

    effectTimerRef.current = setTimeout(() => {
      setEffect(null);
    }, 3600);
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

          if (
            nextRank !== null &&
            previousRank !== null &&
            nextRank !== previousRank
          ) {
            const nextRankText = cleanRankText(data.rankText || "NEW RANK");
            const nextRankIcon = data.emblemUrl || "";

            if (nextRank < previousRank) {
              triggerRankEffect(
                "rank-up",
                "RANK UP",
                nextRankText,
                nextRankIcon
              );
            }

            if (nextRank > previousRank) {
              triggerRankEffect(
                "rank-down",
                "RANK DOWN",
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

        setDisplay({
          name: data.playerName || initial.name,
          flag: data.flagEmoji || initial.flag,
          flagUrl: data.flagUrl || initial.flagUrl,
          mmr: String(nextMmr || 0),
          lr: String(nextLr || 0),
          rank: cleanRankText(data.rankText || initial.rank),
          icon: data.emblemUrl || initial.icon,
        });
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

  return (
    <main className="obs-page">
      <div
        className={`card-shell ${
          effect ? `effect-${effect.kind} effect-phase-${effect.phase}` : ""
        }`}
        style={
          {
            transform: `scale(${initial.scale / 100})`,
            backgroundImage: initial.bg
              ? `linear-gradient(90deg, rgba(5, 7, 20, .86), rgba(5, 7, 20, .56)), url(${initial.bg})`
              : "linear-gradient(90deg, rgba(10, 12, 28, .96), rgba(20, 20, 42, .88))",
            backgroundPosition: `${initial.bgX}% ${initial.bgY}%`,
            backgroundSize: `${initial.bgZoom}%`,
            borderColor: "transparent",
            boxShadow: `0 0 28px ${initial.main}44, inset 0 0 24px #ffffff10`,
            "--main-color": initial.main,
            "--sub-color": initial.sub,
          } as CSSProperties
        }
      >
        {display.icon && (
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

        <div
          className="mode-tag"
          style={{
            left: `${initial.tagX}%`,
            top: `${initial.tagY}%`,
            fontSize: initial.tagSize,
            background: initial.modeColor || "#ffffff",
            color: initial.sub || "#000000",
          }}
        >
          {initial.mode}
        </div>

        <div
          className={`flag-badge ${display.flagUrl ? "has-image" : ""}`}
          style={{
            left: `${initial.flagX}%`,
            top: `${initial.flagY}%`,
            fontSize: initial.flagSize,
            background: display.flagUrl
              ? "rgba(255, 255, 255, .92)"
              : initial.main,
          }}
        >
          {display.flagUrl ? (
            <img className="flag-image" src={display.flagUrl} alt="" />
          ) : (
            display.flag
          )}
        </div>

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

        <RollingNumber
          value={shownScore}
          animateToken={scoreAnimationToken}
          className="card-score"
          style={{
            left: `${initial.scoreX}%`,
            top: `${initial.scoreY}%`,
            fontSize: initial.scoreSize,
          }}
        />

        <div
          key={`label-${activeRating}`}
          className="rating-label rating-switch-in"
        >
          {activeRating}
        </div>

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
