import type { CSSProperties } from "react";

export type ResultEffectStyle =
  | "DEFAULT"
  | "THROTTLE"
  | "SKY"
  | "REINCARNATION"
  | "STARSTRUCK"
  | "NEONRUSH"
  | "SHOCKWAVE";

/** Shared by the editor preview and /card (OBS). No app state or timers. */
export default function ResultOpeningEffect({
  kind,
  style,
}: {
  kind: "win" | "loss";
  style: ResultEffectStyle;
}) {
  const isWin = kind === "win";
  const selected =
    style === "SKY" ? "NEONRUSH" :
    style === "REINCARNATION" ? "SHOCKWAVE" : style;

  if (selected === "DEFAULT") {
    return (
      <div
        className={`rating-arrow-stream ${isWin ? "is-up" : "is-down"}`}
        aria-hidden="true"
      >
        {Array.from({ length: 10 }, (_, index) => (
          <span
            className="rating-arrow-particle"
            key={index}
            style={{
              "--arrow-x": `${8 + index * 9}%`,
              "--arrow-delay": `${index * 0.075}s`,
              "--arrow-duration": `${1.1 + (index % 3) * 0.12}s`,
              "--arrow-size": `${19 + (index % 3) * 5}px`,
            } as CSSProperties}
          >
            <i className="arrow-glyph" />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`result-opening-fx result-opening-${selected.toLowerCase()} ${isWin ? "is-win" : "is-loss"}`}
      aria-hidden="true"
    >
      {selected === "THROTTLE" && (
        <>
          <div className="speed-fx-scrim" />
          <div className="tachometer" aria-hidden="true">
            <div className="tachometer-dial" />
            <div className="tachometer-needle" />
            <div className="tachometer-hub" />
          </div>
          <div className="speed-fx-lines">
            {Array.from({ length: 12 }, (_, index) => (
              <span
                key={index}
                style={{
                  "--line-y": `${8 + index * 7.6}%`,
                  "--line-delay": `${(index % 5) * 0.043}s`,
                  "--line-width": `${31 + (index % 4) * 13}%`,
                } as CSSProperties}
              />
            ))}
          </div>
        </>
      )}

      {selected === "NEONRUSH" && (
        <>
          <div className="neon-asset-frame" />
          <div className="neon-asset-trail" />
        </>
      )}

      {selected === "SHOCKWAVE" && (
        <>
          <div className="shock-asset-core" />
          <div className="shock-asset-ring" />
          <div className="shockwave-shards">
            {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
          </div>
        </>
      )}

      {selected === "STARSTRUCK" && (
        <div className="starstruck-particles">
          {Array.from({ length: 16 }, (_, index) => (
            <span key={index}>{index % 3 === 0 ? "♥" : index % 2 === 0 ? "✦" : "★"}</span>
          ))}
        </div>
      )}
    </div>
  );
}
