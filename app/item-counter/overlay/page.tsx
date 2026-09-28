"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DIGIT_SPRITES,
  ITEM_BY_ID,
  type CounterState,
  normalizeState,
} from "../model";
import { SPRITE_DATA_URI } from "../sprite";

const CELL = 64;

function getSecret() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("key") ?? "";
}

export default function ItemCounterOverlayPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spriteRef = useRef<HTMLImageElement | null>(null);
  const stateRef = useRef<CounterState | null>(null);
  const [secret, setSecret] = useState("");

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const sprite = spriteRef.current;
    const state = stateRef.current;
    if (!canvas || !sprite || !state || !sprite.complete) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);

    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;

    const visible = state.order
      .filter((id) => state.items[id]?.visible)
      .map((id) => ({
        id,
        count: Math.max(0, Math.floor(state.items[id]?.count ?? 0)),
      }));

    if (!visible.length) return;

    const pad = 2;
    const rowGap = 2;
    const availableHeight =
      height - pad * 2 - rowGap * Math.max(0, visible.length - 1);
    let rowHeight = Math.min(
      64,
      Math.max(14, Math.floor(availableHeight / visible.length))
    );

    const measureWidth = (candidateHeight: number) => {
      const digitHeight = Math.max(10, Math.round(candidateHeight * 0.82));
      const iconGap = Math.max(2, Math.round(candidateHeight * 0.08));
      let maximum = 0;

      for (const entry of visible) {
        let digitsWidth = 0;
        for (const digit of String(entry.count)) {
          const source = DIGIT_SPRITES[digit];
          if (!source) continue;
          digitsWidth += Math.round(
            source.sw * (digitHeight / source.sh)
          );
        }
        maximum = Math.max(
          maximum,
          pad * 2 + candidateHeight + iconGap + digitsWidth
        );
      }
      return maximum;
    };

    while (rowHeight > 14 && measureWidth(rowHeight) > width) {
      rowHeight -= 1;
    }

    let y = pad;
    for (const entry of visible) {
      const item = ITEM_BY_ID[entry.id];
      if (!item) continue;

      ctx.drawImage(
        sprite,
        item.sx,
        item.sy,
        CELL,
        CELL,
        pad,
        y,
        rowHeight,
        rowHeight
      );

      const digitHeight = Math.max(10, Math.round(rowHeight * 0.82));
      const digitY = y + (rowHeight - digitHeight) / 2;
      let digitX =
        pad + rowHeight + Math.max(2, Math.round(rowHeight * 0.08));

      for (const digit of String(entry.count)) {
        const source = DIGIT_SPRITES[digit];
        if (!source) continue;
        const drawWidth = Math.round(
          source.sw * (digitHeight / source.sh)
        );

        ctx.drawImage(
          sprite,
          source.sx,
          source.sy,
          source.sw,
          source.sh,
          digitX,
          digitY,
          drawWidth,
          digitHeight
        );
        digitX += drawWidth;
      }

      y += rowHeight + rowGap;
    }
  }, []);

  useEffect(() => {
    setSecret(getSecret());

    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlBackground: html.style.background,
      bodyBackground: body.style.background,
      bodyMargin: body.style.margin,
      bodyOverflow: body.style.overflow,
    };

    html.style.background = "transparent";
    body.style.background = "transparent";
    body.style.margin = "0";
    body.style.overflow = "hidden";

    return () => {
      html.style.background = previous.htmlBackground;
      body.style.background = previous.bodyBackground;
      body.style.margin = previous.bodyMargin;
      body.style.overflow = previous.bodyOverflow;
    };
  }, []);

  useEffect(() => {
    const image = new Image();
    image.src = SPRITE_DATA_URI;
    image.decoding = "sync";
    spriteRef.current = image;

    const drawWhenReady = () => render();
    image.addEventListener("load", drawWhenReady);
    return () => image.removeEventListener("load", drawWhenReady);
  }, [render]);

  useEffect(() => {
    if (!secret || !/^[A-Za-z0-9_-]{24,160}$/.test(secret)) return;

    let stopped = false;
    const refresh = async () => {
      try {
        const response = await fetch(
          `/api/item-counter?key=${encodeURIComponent(secret)}`,
          { cache: "no-store" }
        );
        if (!response.ok || stopped) return;
        stateRef.current = normalizeState(await response.json());
        render();
      } catch {
        // Keep the last successfully rendered state in OBS.
      }
    };

    void refresh();
    const timer = window.setInterval(refresh, 300);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [render, secret]);

  useEffect(() => {
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        display: "block",
        width: "100vw",
        height: "100vh",
        background: "transparent",
      }}
    />
  );
}
