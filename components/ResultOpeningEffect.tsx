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
    // Clear and familiar rate direction cue; shared by editor preview and OBS.
    return (
      <div className={`result-opening-default ${isWin ? "is-up" : "is-down"}`} aria-hidden="true">
        <div className="default-rate-wash" />
        <div className="default-rate-marks">
          {Array.from({ length: 3 }, (_, index) => <span key={index} />)}
        </div>
        <div className="default-rate-lockup">
          <svg
            className="default-rate-arrow"
            viewBox="0 0 78 96"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M39 5L73 44H56V88H22V44H5L39 5Z"
              fill="currentColor"
              stroke="rgba(255,255,255,.76)"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M39 16L60 40H49V77H29V40H18L39 16Z"
              fill="rgba(255,255,255,.13)"
            />
          </svg>
          <span className="default-rate-caption">
            <span>RATE</span>
            <strong>{isWin ? "UP" : "DOWN"}</strong>
          </span>
        </div>
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
