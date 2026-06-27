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
  mode: "RT" | "CT";
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
  mode: "RT" | "CT";

  ratingMode: RatingMode;
  switchSeconds: number;
  season: string;

  flag: string;
  flagUrl: string;

  mmr: string;
  lr: string;

  rankText: string;
  rankIconUrl: string;

  mainColor: string;
  subColor: string;
  modeColor: string;
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

  tagX: number;
  tagY: number;
  tagSize: number;

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
  switchSeconds: 5,
  season: "16",

  flag: "🇯🇵",
  flagUrl: "",

  mmr: "0000",
  lr: "0000",

  rankText: "",
  rankIconUrl: "",

  mainColor: "#ff0000",
  subColor: "#ffffff",
  modeColor: "#000000",
  bgUrl: "",

  bgX: 50,
  bgY: 50,
  bgZoom: 120,
  cardScale: 100,

  nameX: 36,
  nameY: 54,
  nameSize: 34,

  scoreX: 78,
  scoreY: 36,
  scoreSize: 42,

  tagX: 48,
  tagY: 18,
  tagSize: 14,

  flagX: 28,
  flagY: 45,
  flagSize: 24,

  rankIconX: 18,
  rankIconY: 35,
  rankIconSize: 68,
};

function numberParam(value: number) {
  return String(Math.round(value));
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

  const [previewActiveRating, setPreviewActiveRating] = useState<ActiveRating>(
    initialActiveRating(defaultSettings.ratingMode)
  );

  const previewEffectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("kei-lounge-card-settings");
    if (!saved) return;

    try {
      setSettings({ ...defaultSettings, ...JSON.parse(saved) });
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

    const seconds = Math.max(settings.switchSeconds, 1);

    const interval = setInterval(() => {
      setPreviewActiveRating((prev) => (prev === "MMR" ? "LR" : "MMR"));
    }, seconds * 1000);

    return () => clearInterval(interval);
  }, [settings.ratingMode, settings.switchSeconds]);

  useEffect(() => {
    return () => {
      if (previewEffectTimer.current) {
        clearTimeout(previewEffectTimer.current);
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

  function triggerPreviewEffect(effect: PreviewEffect) {
    if (!effect) return;

    setPreviewEffect(null);
    setPreviewScoreBump(null);

    window.setTimeout(() => {
      setPreviewEffect(effect);

      if (effect === "win") {
        setPreviewScoreBump({
          rating: previewActiveRating,
          diff: 100,
        });
        setPreviewScoreAnimationToken((prev) => prev + 1);
      }

      if (effect === "loss") {
        setPreviewScoreBump({
          rating: previewActiveRating,
          diff: -100,
        });
        setPreviewScoreAnimationToken((prev) => prev + 1);
      }
    }, 20);

    if (previewEffectTimer.current) {
      clearTimeout(previewEffectTimer.current);
    }

    const duration =
      effect === "rank-up" || effect === "rank-down" ? 3600 : 1800;

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
    params.set("mode", settings.mode);

    params.set("ratingMode", settings.ratingMode);
    params.set("switch", numberParam(settings.switchSeconds));
    params.set("season", settings.season);

    params.set("flag", settings.flag);
    if (settings.flagUrl) params.set("flagUrl", settings.flagUrl);

    params.set("mmr", settings.mmr);
    params.set("lr", settings.lr);

    params.set("rank", cleanRankText(settings.rankText));

    params.set("main", settings.mainColor.replace("#", ""));
    params.set("sub", settings.subColor.replace("#", ""));
    params.set("modeColor", (settings.modeColor ?? "#000000").replace("#", ""));

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

    params.set("tx", numberParam(settings.tagX));
    params.set("ty", numberParam(settings.tagY));
    params.set("ts", numberParam(settings.tagSize));

    params.set("fx", numberParam(settings.flagX));
    params.set("fy", numberParam(settings.flagY));
    params.set("fs", numberParam(settings.flagSize));

    params.set("ix", numberParam(settings.rankIconX));
    params.set("iy", numberParam(settings.rankIconY));
    params.set("isz", numberParam(settings.rankIconSize));

    const path = `/card?${params.toString()}`;

    return origin ? `${origin}${path}` : path;
  }, [settings, origin]);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="builder-page">
      <section className="hero">
        <h1>
          Kei <span>Lounge Cards</span>
        </h1>
        <p>RT / CT 専用のOBSカード作成ツール</p>
      </section>

      <div className="builder-layout">
        <section className="panel settings-panel">
          <h2>Basic</h2>

          <label>
            Lounge name
            <input
              value={settings.loungeName}
              onChange={(e) => update("loungeName", e.target.value)}
              placeholder="exact lounge name"
            />
          </label>

          <div className="fetch-row">
            <button type="button" onClick={fetchPlayer}>
              Fetch player
            </button>
            <span>{apiStatus}</span>
          </div>

          <div className="fetch-row">
            <button type="button" onClick={fetchRanks}>
              Rank list
            </button>
            <span>{rankStatus}</span>
          </div>

          <label>
            Display name
            <input
              value={settings.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              placeholder="shown name"
            />
          </label>

          <div className="two-col">
            <label>
              Mode
              <select
                value={settings.mode}
                onChange={(e) => update("mode", e.target.value as "RT" | "CT")}
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
          </div>

          <label>
            Switch seconds
            <input
              type="number"
              min={1}
              max={60}
              value={settings.switchSeconds}
              onChange={(e) =>
                update("switchSeconds", Number(e.target.value) || 1)
              }
            />
          </label>

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

          <h2>Design</h2>

          <div className="two-col">
            <label>
              Main color
              <input
                type="color"
                value={settings.mainColor}
                onChange={(e) => update("mainColor", e.target.value)}
              />
            </label>

            <label>
              Sub color
              <input
                type="color"
                value={settings.subColor}
                onChange={(e) => update("subColor", e.target.value)}
              />
            </label>
          </div>

          <label>
            Mode color
            <input
              type="color"
              value={settings.modeColor}
              onChange={(e) => update("modeColor", e.target.value)}
            />
          </label>

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

          <Slider
            label="Card scale"
            value={settings.cardScale}
            min={70}
            max={140}
            onChange={(v) => update("cardScale", v)}
          />

          <h2>Position</h2>

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

          <Slider
            label="Score X"
            value={settings.scoreX}
            min={0}
            max={100}
            onChange={(v) => update("scoreX", v)}
          />

          <Slider
            label="Score Y"
            value={settings.scoreY}
            min={0}
            max={100}
            onChange={(v) => update("scoreY", v)}
          />

          <Slider
            label="Score size"
            value={settings.scoreSize}
            min={20}
            max={80}
            onChange={(v) => update("scoreSize", v)}
          />

          <Slider
            label="Mode tag X"
            value={settings.tagX}
            min={0}
            max={100}
            onChange={(v) => update("tagX", v)}
          />

          <Slider
            label="Mode tag Y"
            value={settings.tagY}
            min={0}
            max={100}
            onChange={(v) => update("tagY", v)}
          />

          <Slider
            label="Mode tag size"
            value={settings.tagSize}
            min={8}
            max={30}
            onChange={(v) => update("tagSize", v)}
          />

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
        </section>

        <section className="panel preview-panel">
          <h2>Live preview</h2>

          <div className="preview-stage">
            <Card
              settings={settings}
              effect={previewEffect}
              activeRating={previewActiveRating}
              previewScoreBump={previewScoreBump}
              previewScoreAnimationToken={previewScoreAnimationToken}
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

          <button
            className="reset-button"
            onClick={() => setSettings(defaultSettings)}
          >
            Reset settings
          </button>
        </section>
      </div>
    </main>
  );
}

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider-label">
      <span>
        {props.label}
        <b>{props.value}</b>
      </span>

      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Card({
  settings,
  effect,
  activeRating,
  previewScoreBump,
  previewScoreAnimationToken,
  rankOrder,
}: {
  settings: Settings;
  effect: PreviewEffect;
  activeRating: ActiveRating;
  previewScoreBump: PreviewScoreBump;
  previewScoreAnimationToken: number;
  rankOrder: RankEntry[];
}) {
  const name = settings.displayName || settings.loungeName || "Your Name";
  const baseScore = activeRating === "MMR" ? settings.mmr : settings.lr;
  const shownScore = applyPreviewBump(
    baseScore,
    activeRating,
    previewScoreBump
  );

  const previewRank = getPreviewRank(settings.rankText, effect, rankOrder);
  const previewRankIcon = previewRank.emblem || settings.rankIconUrl;

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
      className={`card-shell ${effect ? `effect-${effect}` : ""}`}
      style={
        {
          transform: `scale(${settings.cardScale / 100})`,
          backgroundImage: settings.bgUrl
            ? `linear-gradient(90deg, rgba(5, 7, 20, .86), rgba(5, 7, 20, .56)), url(${settings.bgUrl})`
            : "linear-gradient(90deg, rgba(10, 12, 28, .96), rgba(20, 20, 42, .88))",
          backgroundPosition: `${settings.bgX}% ${settings.bgY}%`,
          backgroundSize: `${settings.bgZoom}%`,
          borderColor: "transparent",
          boxShadow: `0 0 28px ${settings.mainColor}44, inset 0 0 24px #ffffff10`,
          "--main-color": settings.mainColor,
          "--sub-color": settings.subColor,
        } as CSSProperties
      }
    >
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
          fontSize: settings.tagSize,
          background: settings.modeColor,
          color: settings.subColor,
        }}
      >
        {settings.mode}
      </div>

      <div
        className={`flag-badge ${settings.flagUrl ? "has-image" : ""}`}
        style={{
          left: `${settings.flagX}%`,
          top: `${settings.flagY}%`,
          fontSize: settings.flagSize,
          background: settings.flagUrl
            ? "rgba(255, 255, 255, .92)"
            : settings.mainColor,
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

      <RollingNumber
        value={shownScore || "0000"}
        animateToken={previewScoreAnimationToken}
        className="card-score"
        style={{
          left: `${settings.scoreX}%`,
          top: `${settings.scoreY}%`,
          fontSize: settings.scoreSize,
        }}
      />

      <div
        key={`label-${activeRating}`}
        className="rating-label rating-switch-in"
      >
        {activeRating}
      </div>

      <div className="rank-line">
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
