import type { CSSProperties } from "react";

export type ResultEffectStyle =
  | "DEFAULT"
  | "THROTTLE"
  | "SKY"
  | "REINCARNATION"
  | "STARSTRUCK"
  | "NEONRUSH"
  | "SHOCKWAVE"
  | "CARDS";

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
    // Minimal luminous streaks rather than oversized directional arrows.
    return (
      <div className={`result-opening-default ${isWin ? "is-up" : "is-down"}`} aria-hidden="true">
        <div className="default-light-beam" />
        {Array.from({ length: 7 }, (_, index) => (
          <span
            className="default-light-streak"
            key={index}
            style={{
              "--streak-x": `${12 + index * 12}%`,
              "--streak-delay": `${index * 0.095}s`,
              "--streak-height": `${20 + (index % 3) * 10}px`,
            } as CSSProperties}
          />
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

      {selected === "CARDS" && (
        <div className="playing-card-cascade">
          {[
            ["9", "♣"],
            ["K", "♥"],
            ["7", "♦"],
            ["J", "♠"],
            ["Q", "♣"],
            ["10", "♥"],
            ["A", "♦"],
            ["8", "♠"],
            ["K", "♣"],
            ["Q", "♥"],
            ["J", "♦"],
          ].map(([face, suit], index) => (
            <span
              key={index}
              className={`playing-card stream-card ${suit === "♥" || suit === "♦" ? "is-red" : "is-black"}`}
              style={{
                "--deal-delay": `${index * 0.052}s`,
                "--card-y": `${-30 + (index % 5) * 15}px`,
                "--card-rot": `${-15 + (index % 6) * 6}deg`,
              } as CSSProperties}
            >
              <span className="playing-card-face">{face}<small>{suit}</small></span>
              <span className="playing-card-suit">{suit}</span>
            </span>
          ))}
          {isWin && (
            <span className="playing-card hero-ace is-black">
              <span className="playing-card-face">A<small>♠</small></span>
              <span className="playing-card-suit">♠</span>
            </span>
          )}
        </div>
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
