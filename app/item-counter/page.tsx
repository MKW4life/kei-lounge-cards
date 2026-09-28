"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./item-counter.module.css";
import {
  DEFAULT_STATE,
  ITEM_BY_ID,
  ITEMS,
  type CounterState,
  type ItemId,
  normalizeState,
} from "./model";
import { SPRITE_DATA_URI } from "./sprite";

type Action =
  | { action: "delta"; id: ItemId; amount: number }
  | { action: "hotkeyIncrement"; index: number }
  | { action: "setCount"; id: ItemId; count: number }
  | { action: "setVisible"; id: ItemId; visible: boolean }
  | { action: "setOrder"; order: ItemId[] }
  | { action: "reset"; id: ItemId }
  | { action: "resetAll" };

function createSecret() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function itemIconStyle(item: (typeof ITEMS)[number]) {
  return {
    backgroundImage: `url("${SPRITE_DATA_URI}")`,
    backgroundSize: "320px 256px",
    backgroundPosition: `-${item.sx}px -${item.sy}px`,
  };
}

export default function ItemCounterPage() {
  const [secret, setSecret] = useState("");
  const [origin, setOrigin] = useState("");
  const [state, setState] = useState<CounterState>(DEFAULT_STATE);
  const [storageError, setStorageError] = useState(false);
  const [statusText, setStatusText] = useState("接続中...");
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    setOrigin(window.location.origin);
    const saved = localStorage.getItem("mkw-item-counter-key");
    if (saved && /^[A-Za-z0-9_-]{24,160}$/.test(saved)) {
      setSecret(saved);
      return;
    }
    const next = createSecret();
    localStorage.setItem("mkw-item-counter-key", next);
    setSecret(next);
  }, []);

  const apiUrl = useMemo(
    () => (secret ? `/api/item-counter?key=${encodeURIComponent(secret)}` : ""),
    [secret]
  );

  const overlayUrl = useMemo(
    () =>
      origin && secret
        ? `${origin}/item-counter/overlay?key=${encodeURIComponent(secret)}`
        : "",
    [origin, secret]
  );

  const loadState = useCallback(async () => {
    if (!apiUrl) return;
    try {
      const response = await fetch(apiUrl, { cache: "no-store" });
      if (response.status === 503) {
        setStorageError(true);
        setStatusText("Vercel Blob が未設定です");
        return;
      }
      if (!response.ok) {
        let detail = "";
        try {
          const body = (await response.json()) as { error?: string };
          detail = body.error ? `: ${body.error}` : "";
        } catch {
          // Ignore malformed error responses.
        }
        setStatusText(`同期エラー (${response.status})${detail}`);
        return;
      }
      setStorageError(false);
      setState(normalizeState(await response.json()));
      setStatusText("クラウド同期中");
    } catch {
      setStatusText("通信できません");
    }
  }, [apiUrl]);

  useEffect(() => {
    if (!apiUrl) return;
    void loadState();
    const timer = window.setInterval(loadState, 450);
    return () => window.clearInterval(timer);
  }, [apiUrl, loadState]);

  const sendAction = useCallback(
    (payload: Action) => {
      if (!apiUrl) return Promise.resolve();

      queueRef.current = queueRef.current
        .then(async () => {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (response.status === 503) {
            setStorageError(true);
            setStatusText("Vercel Blob が未設定です");
            return;
          }

          if (!response.ok) {
            let detail = "";
            try {
              const body = (await response.json()) as { error?: string };
              detail = body.error ? `: ${body.error}` : "";
            } catch {
              // Ignore malformed error responses.
            }
            setStatusText(`更新エラー (${response.status})${detail}`);
            return;
          }

          setStorageError(false);
          setState(normalizeState(await response.json()));
          setStatusText("クラウド同期中");
        })
        .catch(() => {
          setStatusText("更新に失敗しました");
        });

      return queueRef.current;
    },
    [apiUrl]
  );

  const orderedItems = useMemo(
    () => state.order.map((id) => ITEM_BY_ID[id]).filter(Boolean),
    [state.order]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !event.shiftKey ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.repeat
      ) {
        return;
      }

      const match = /^Digit([1-7])$/.exec(event.code);
      if (!match) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, button, [contenteditable='true']"
        )
      ) {
        return;
      }

      const item = orderedItems[Number(match[1]) - 1];
      if (!item) return;

      event.preventDefault();
      event.stopPropagation();
      void sendAction({ action: "delta", id: item.id, amount: 1 });
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [orderedItems, sendAction]);

  const moveItem = (id: ItemId, direction: -1 | 1) => {
    const order = [...state.order];
    const index = order.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    setState((current) => ({ ...current, order }));
    void sendAction({ action: "setOrder", order });
  };

  const copyText = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard can be blocked in some embedded browsers.
    }
  };

  const resetAll = () => {
    if (
      window.confirm(
        "表示中・非表示を含む全アイテムのカウントを0に戻します。よろしいですか？"
      )
    ) {
      void sendAction({ action: "resetAll" });
    }
  };

  return (
    <main className={styles.page}>
      <nav className="project-nav" aria-label="Kei projects">
        <details>
          <summary>Kei Projects</summary>
          <div className="project-nav-menu">
            <a href="/">Kei Lounge Cards</a>
            <a href="/item-counter">MKW Item Counter</a>
            <a
              href="https://kei-brstm-hub.vercel.app/"
              target="_blank"
              rel="noreferrer"
            >
              Kei Music Hub
            </a>
          </div>
        </details>
      </nav>

      <div className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>OBS Browser Source Overlay</p>
            <h1 className={styles.title}>MKW Item Counter</h1>
            <p className={styles.lead}>
              1〜7単独は無効。Shift + 1〜7 だけで対応するカウントを +1 します。
            </p>
          </div>
          <button
            type="button"
            className={`${styles.button} ${styles.danger}`}
            onClick={resetAll}
          >
            すべてリセット
          </button>
        </header>

        <section className={`${styles.panel} ${styles.connectionPanel}`}>
          <div className={styles.connectionRow}>
            <input
              className={styles.urlInput}
              value={overlayUrl}
              readOnly
              aria-label="OBS overlay URL"
            />
            <button
              type="button"
              className={styles.button}
              onClick={() => void copyText(overlayUrl)}
            >
              OBS URLをコピー
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => overlayUrl && window.open(overlayUrl, "_blank")}
            >
              開く
            </button>
          </div>

          <div className={styles.secretBox}>
            <span className={styles.statusText}>接続キー</span>
            <code>{secret || "生成中..."}</code>
            <button
              type="button"
              className={styles.button}
              onClick={() => void copyText(secret)}
            >
              コピー
            </button>
          </div>

          <p className={styles.help}>
            {statusText}。この接続キーは、後でゲーム中の Shift + 1〜7 を拾う
            Windows用グローバルホットキー補助ツールにも使用します。
          </p>

          {storageError && (
            <div className={styles.storageError}>
              Vercel Blob がまだ接続されていません。Vercel の
              「Storage」から Private Blob Store を作成し、
              kei-lounge-cards プロジェクトへ接続するとクラウド同期が有効になります。
            </div>
          )}
        </section>

        <section className={`${styles.panel} ${styles.connectionPanel}`}>
          <div>
            <h2>ゲーム中のグローバルホットキー</h2>
            <p className={styles.help}>
              Mario Kart が最前面でも Shift + 1〜7 でカウントできます。
              ローカルWebサーバーは使わず、Windowsの小さな補助ツールからこのクラウドAPIへ送信します。
            </p>
          </div>
          <div className={styles.connectionRow}>
            <a
              className={styles.button}
              href="/MKW_Item_Counter_Hotkeys.ps1"
              download
            >
              ① Hotkey本体をダウンロード
            </a>
            <a
              className={styles.button}
              href="/start_mkw_hotkeys.bat"
              download
            >
              ② 起動BATをダウンロード
            </a>
          </div>
          <p className={styles.help}>
            2ファイルを同じフォルダに置き、start_mkw_hotkeys.bat を起動してください。
            初回だけ上の「接続キー」を入力します。通常の1〜7とキーボードリセットは登録しません。
          </p>
        </section>

        <div className={styles.workspace}>
          <section className={styles.counterColumn}>
            <div className={styles.sectionHead}>
              <div>
                <h2>アイテムカウンター</h2>
                <p>
                  ▲▼で順番を変更できます。番号は現在の並び順に合わせて変わります。
                </p>
              </div>
              <p className={styles.hotkey}>
                Shift + 1〜7 = +1 ／ 1〜7単独・Rリセット = 無効
              </p>
            </div>

            <div className={styles.itemGrid}>
              {orderedItems.map((item, index) => {
                const itemState = state.items[item.id];
                return (
                  <article
                    className={`${styles.card} ${
                      itemState.visible ? styles.cardVisible : ""
                    }`}
                    key={item.id}
                  >
                    <div className={styles.cardTop}>
                      <span
                        className={styles.itemIcon}
                        style={itemIconStyle(item)}
                        aria-hidden="true"
                      />
                      <div className={styles.meta}>
                        <strong>{item.label}</strong>
                        <span className={styles.keyBadge}>
                          Shift+{index + 1}
                        </span>
                      </div>

                      <div className={styles.orderButtons}>
                        <button
                          type="button"
                          className={styles.smallButton}
                          disabled={index === 0}
                          onClick={() => moveItem(item.id, -1)}
                          aria-label={`${item.label}を上へ`}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className={styles.smallButton}
                          disabled={index === orderedItems.length - 1}
                          onClick={() => moveItem(item.id, 1)}
                          aria-label={`${item.label}を下へ`}
                        >
                          ▼
                        </button>
                      </div>

                      <label className={styles.visibleToggle}>
                        <input
                          type="checkbox"
                          checked={itemState.visible}
                          onChange={(event) =>
                            void sendAction({
                              action: "setVisible",
                              id: item.id,
                              visible: event.target.checked,
                            })
                          }
                        />
                        OBSに表示
                      </label>
                    </div>

                    <div className={styles.controls}>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.stepButton}`}
                        onClick={() =>
                          void sendAction({
                            action: "delta",
                            id: item.id,
                            amount: -1,
                          })
                        }
                      >
                        −
                      </button>
                      <input
                        className={styles.countInput}
                        type="number"
                        min={0}
                        step={1}
                        value={itemState.count}
                        onChange={(event) =>
                          void sendAction({
                            action: "setCount",
                            id: item.id,
                            count: Math.max(
                              0,
                              Math.floor(Number(event.target.value) || 0)
                            ),
                          })
                        }
                        aria-label={`${item.label}のカウント`}
                      />
                      <button
                        type="button"
                        className={`${styles.button} ${styles.stepButton}`}
                        onClick={() =>
                          void sendAction({
                            action: "delta",
                            id: item.id,
                            amount: 1,
                          })
                        }
                      >
                        ＋
                      </button>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.resetOne}`}
                        onClick={() =>
                          void sendAction({ action: "reset", id: item.id })
                        }
                      >
                        0に戻す
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className={styles.previewColumn}>
            <section className={`${styles.panel} ${styles.previewPanel}`}>
              <div className={styles.previewHead}>
                <h2>プレビュー</h2>
                <p>この縦並びがそのままOBSへ反映されます。</p>
              </div>
              <div className={styles.previewStage}>
                {secret && (
                  <iframe
                    title="MKW item counter preview"
                    src={`/item-counter/overlay?key=${encodeURIComponent(
                      secret
                    )}`}
                  />
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
