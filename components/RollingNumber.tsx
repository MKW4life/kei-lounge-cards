"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type RollDirection = "up" | "down";

type RollingNumberProps = {
  value: string | number;
  className?: string;
  style?: CSSProperties;
  digitDelayMs?: number;
  digitDurationMs?: number;
  animateToken?: string | number;
};

const MAX_VISUAL_STEPS = 180;

function isDigit(char: string) {
  return /^[0-9]$/.test(char);
}

function getRollDirection(fromValue: string, toValue: string): RollDirection {
  const fromNumber = Number(fromValue);
  const toNumber = Number(toValue);

  if (!Number.isFinite(fromNumber) || !Number.isFinite(toNumber)) {
    return "up";
  }

  return toNumber < fromNumber ? "down" : "up";
}

function getFirstChangedIndex(fromValue: string, toValue: string) {
  const width = Math.max(fromValue.length, toValue.length, 1);
  const paddedFrom = fromValue.padStart(width, "0");
  const paddedTo = toValue.padStart(width, "0");

  for (let i = 0; i < width; i += 1) {
    if (paddedFrom[i] !== paddedTo[i]) {
      return i;
    }
  }

  return -1;
}

function getTotalTicks(fromValue: string, toValue: string) {
  const fromNumber = Number(fromValue);
  const toNumber = Number(toValue);

  if (!Number.isFinite(fromNumber) || !Number.isFinite(toNumber)) {
    return 0;
  }

  return Math.abs(toNumber - fromNumber);
}

function getTotalAnimationMs(totalTicks: number, baseDuration: number) {
  if (totalTicks <= 1) {
    return Math.max(baseDuration, 520);
  }

  if (totalTicks <= 10) {
    return Math.max(baseDuration, 680);
  }

  if (totalTicks <= 100) {
    return Math.max(baseDuration + 240, 920);
  }

  return Math.max(baseDuration + 420, 1120);
}

function getRawDigitStepCount(fromValue: string, toValue: string, place: number) {
  const fromNumber = Number(fromValue);
  const toNumber = Number(toValue);

  if (!Number.isFinite(fromNumber) || !Number.isFinite(toNumber)) {
    return 0;
  }

  return Math.abs(Math.floor(toNumber / place) - Math.floor(fromNumber / place));
}

function getFirstCarryTick(
  fromValue: string,
  toValue: string,
  place: number,
  direction: RollDirection
) {
  const fromNumber = Number(fromValue);
  const toNumber = Number(toValue);

  if (!Number.isFinite(fromNumber) || !Number.isFinite(toNumber)) {
    return 0;
  }

  const rawStepCount = getRawDigitStepCount(fromValue, toValue, place);

  if (rawStepCount <= 0) {
    return 0;
  }

  const remainder = ((fromNumber % place) + place) % place;

  if (direction === "down") {
    return remainder + 1;
  }

  return remainder === 0 ? place : place - remainder;
}

function normalizeVisualStepCount(
  rawStepCount: number,
  fromChar: string,
  toChar: string,
  direction: RollDirection
) {
  if (rawStepCount <= 0) {
    return 0;
  }

  if (!isDigit(fromChar) || !isDigit(toChar)) {
    return 0;
  }

  const from = Number(fromChar);
  const to = Number(toChar);

  const minimumDistance =
    direction === "down" ? (from - to + 10) % 10 : (to - from + 10) % 10;

  let steps = rawStepCount;

  while (steps > MAX_VISUAL_STEPS) {
    steps -= 10;
  }

  if (steps <= 0) {
    return minimumDistance === 0 ? 10 : minimumDistance;
  }

  if (minimumDistance === 0) {
    while (steps % 10 !== 0) {
      steps += 1;
    }

    return steps;
  }

  while (steps < minimumDistance || (steps - minimumDistance) % 10 !== 0) {
    steps += 1;
  }

  return steps;
}

function buildDigitSequence(
  fromChar: string,
  toChar: string,
  direction: RollDirection,
  stepCount: number
) {
  if (!isDigit(fromChar) || !isDigit(toChar)) {
    return [toChar];
  }

  if (stepCount <= 0) {
    return [toChar];
  }

  const from = Number(fromChar);
  const sequence = [from];
  let current = from;

  for (let i = 0; i < stepCount; i += 1) {
    current = direction === "down" ? (current + 9) % 10 : (current + 1) % 10;
    sequence.push(current);
  }

  return sequence.map(String);
}

function getDigitTiming(args: {
  fromValue: string;
  toValue: string;
  place: number;
  direction: RollDirection;
  totalTicks: number;
  totalAnimationMs: number;
  rawStepCount: number;
}) {
  const {
    fromValue,
    toValue,
    place,
    direction,
    totalTicks,
    totalAnimationMs,
    rawStepCount,
  } = args;

  if (totalTicks <= 0 || rawStepCount <= 0) {
    return {
      delay: 0,
      duration: 0,
    };
  }

  const firstCarryTick = getFirstCarryTick(
    fromValue,
    toValue,
    place,
    direction
  );

  const lastCarryTick = firstCarryTick + (rawStepCount - 1) * place;

  const delay = (firstCarryTick / totalTicks) * totalAnimationMs;

  const duration =
    ((lastCarryTick - firstCarryTick + 1) / totalTicks) * totalAnimationMs;

  return {
    delay: Math.max(0, delay),
    duration: Math.max(80, duration),
  };
}

function getMaxAnimationTime(args: {
  fromValue: string;
  toValue: string;
  direction: RollDirection;
  width: number;
  totalTicks: number;
  totalAnimationMs: number;
}) {
  const { fromValue, toValue, direction, width, totalTicks, totalAnimationMs } =
    args;

  if (totalTicks <= 0) {
    return 0;
  }

  let maxTime = 0;

  for (let index = 0; index < width; index += 1) {
    const rightOrder = width - index - 1;
    const place = 10 ** rightOrder;
    const rawStepCount = getRawDigitStepCount(fromValue, toValue, place);

    if (rawStepCount <= 0) continue;

    const timing = getDigitTiming({
      fromValue,
      toValue,
      place,
      direction,
      totalTicks,
      totalAnimationMs,
      rawStepCount,
    });

    maxTime = Math.max(maxTime, timing.delay + timing.duration);
  }

  return maxTime;
}

export default function RollingNumber({
  value,
  className = "",
  style,
  digitDelayMs = 65,
  digitDurationMs = 650,
  animateToken,
}: RollingNumberProps) {
  const nextValue = String(value ?? "");

  const [fromValue, setFromValue] = useState(nextValue);
  const [toValue, setToValue] = useState(nextValue);
  const [animationKey, setAnimationKey] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [direction, setDirection] = useState<RollDirection>("up");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTokenRef = useRef<string | number | undefined>(animateToken);

  useEffect(() => {
    const tokenChanged = animateToken !== lastTokenRef.current;
    const valueChanged = nextValue !== toValue;

    if (!valueChanged && !tokenChanged) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!tokenChanged || !valueChanged) {
      lastTokenRef.current = animateToken;
      setFromValue(nextValue);
      setToValue(nextValue);
      setIsRolling(false);
      return;
    }

    const startValue = toValue;
    const endValue = nextValue;
    const nextDirection = getRollDirection(startValue, endValue);
    const width = Math.max(startValue.length, endValue.length, 1);
    const totalTicks = getTotalTicks(startValue, endValue);
    const totalAnimationMs = getTotalAnimationMs(totalTicks, digitDurationMs);

    const maxAnimationTime = getMaxAnimationTime({
      fromValue: startValue,
      toValue: endValue,
      direction: nextDirection,
      width,
      totalTicks,
      totalAnimationMs,
    });

    lastTokenRef.current = animateToken;
    setFromValue(startValue);
    setToValue(endValue);
    setDirection(nextDirection);
    setAnimationKey((prev) => prev + 1);
    setIsRolling(true);

    timerRef.current = setTimeout(() => {
      setFromValue(endValue);
      setToValue(endValue);
      setIsRolling(false);
    }, maxAnimationTime + 260);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
   }, [nextValue, toValue, animateToken, digitDelayMs, digitDurationMs]);

  const renderedDigits = useMemo(() => {
    const width = Math.max(fromValue.length, toValue.length, 1);
    const paddedFrom = fromValue.padStart(width, "0");
    const paddedTo = toValue.padStart(width, "0");
    const visibleStart = width - toValue.length;
    const firstChangedIndex = getFirstChangedIndex(fromValue, toValue);
    const totalTicks = getTotalTicks(fromValue, toValue);
    const totalAnimationMs = getTotalAnimationMs(totalTicks, digitDurationMs);

    return Array.from({ length: width }, (_, index) => {
      const isLeadingBlank =
        toValue.length < width && index < visibleStart && !isRolling;

      if (isLeadingBlank) {
        return {
          key: `${animationKey}-${index}-blank`,
          sequence: [""],
          delay: 0,
          duration: 0,
          steps: 0,
          shouldAnimate: false,
          isDigit: false,
        };
      }

      const fromChar = paddedFrom[index] ?? "0";
      const toChar = paddedTo[index] ?? "0";

      const rightOrder = width - index - 1;
      const place = 10 ** rightOrder;

      const isRelatedDigit =
        firstChangedIndex !== -1 && index >= firstChangedIndex;

      const rawStepCount =
        isRelatedDigit && totalTicks > 0
          ? getRawDigitStepCount(fromValue, toValue, place)
          : 0;

      const visualStepCount = normalizeVisualStepCount(
        rawStepCount,
        fromChar,
        toChar,
        direction
      );

      const timing = getDigitTiming({
        fromValue,
        toValue,
        place,
        direction,
        totalTicks,
        totalAnimationMs,
        rawStepCount,
      });

      const sequence = buildDigitSequence(
        fromChar,
        toChar,
        direction,
        visualStepCount
      );

      const steps = Math.max(sequence.length - 1, 0);

      const shouldAnimate =
        animationKey > 0 &&
        isRolling &&
        isRelatedDigit &&
        visualStepCount > 0 &&
        isDigit(fromChar) &&
        isDigit(toChar);

      return {
        key: `${animationKey}-${index}-${fromChar}-${toChar}-${visualStepCount}`,
        sequence,
        delay: timing.delay,
        duration: timing.duration,
        steps,
        shouldAnimate,
        isDigit: isDigit(toChar),
      };
    });
  }, [
    fromValue,
    toValue,
    animationKey,
    isRolling,
    direction,
    digitDurationMs,
  ]);

  const width = Math.max(fromValue.length, toValue.length, 1);
  const totalTicks = getTotalTicks(fromValue, toValue);
  const totalAnimationMs = getTotalAnimationMs(totalTicks, digitDurationMs);
  const settleDelay = getMaxAnimationTime({
    fromValue,
    toValue,
    direction,
    width,
    totalTicks,
    totalAnimationMs,
  });

  return (
    <span
      className={`${className} rolling-number ${
        isRolling ? "rolling-number-settle" : ""
      }`}
      style={
        {
          ...style,
          "--number-settle-delay": `${Math.max(0, settleDelay)}ms`,
        } as CSSProperties
      }
    >
      {renderedDigits.map((digit) => {
        if (!digit.isDigit) {
          return (
            <span className="rolling-static-char" key={digit.key}>
              {digit.sequence[digit.sequence.length - 1]}
            </span>
          );
        }

        return (
          <span
            className="rolling-digit-window"
            key={digit.key}
            style={
              {
                "--digit-delay": `${digit.delay}ms`,
                "--digit-duration": `${digit.duration}ms`,
                "--digit-steps": digit.steps,
              } as CSSProperties
            }
          >
            <span
              className={`rolling-digit-strip ${
                digit.shouldAnimate ? "rolling-digit-animate" : ""
              }`}
              style={
                digit.shouldAnimate
                  ? {
                      animationTimingFunction: `steps(${Math.max(
                        digit.steps,
                        1
                      )}, start)`,
                    }
                  : undefined
              }
            >
              {digit.sequence.map((char, index) => (
                <span className="rolling-digit-item" key={`${char}-${index}`}>
                  {char}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}