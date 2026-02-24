"use client";

import { useRef, useState, useEffect } from "react";

interface ClaudeMascotProps {
  videoEl: HTMLVideoElement | null;
  viewportEl: HTMLDivElement | null;
}

export function ClaudeMascot({ videoEl, viewportEl }: ClaudeMascotProps) {
  const [scared, setScared] = useState(false);
  const [videoTop, setVideoTop] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const mascotRef = useRef<HTMLDivElement>(null);
  const scaredTimeout = useRef<ReturnType<typeof setTimeout>>();
  const posRef = useRef(-220);
  const velocityRef = useRef(0);
  const rafRef = useRef<number>();
  const scaleRef = useRef(1);

  // Calculate where the video content starts
  useEffect(() => {
    if (!videoEl || !viewportEl) return;

    const update = () => {
      const cW = viewportEl.clientWidth;
      const cH = viewportEl.clientHeight;
      const vw = videoEl.videoWidth || 1024;
      const vh = videoEl.videoHeight || 768;
      const aspect = vw / vh;
      const containerAspect = cW / cH;

      let renderedWidth: number;
      if (containerAspect > aspect) {
        renderedWidth = cH * aspect;
        setVideoTop(0);
      } else {
        renderedWidth = cW;
        const renderedHeight = cW / aspect;
        setVideoTop((cH - renderedHeight) / 2);
      }
      // Scale mascot relative to video width (baseline: 1100px)
      const s = Math.max(0.4, Math.min(1, renderedWidth / 1100));
      scaleRef.current = s;
      setScale(s);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewportEl);
    videoEl.addEventListener("loadedmetadata", update);

    return () => {
      observer.disconnect();
      videoEl.removeEventListener("loadedmetadata", update);
    };
  }, [videoEl, viewportEl]);

  // Physics loop — apply velocity with friction
  useEffect(() => {
    if (!viewportEl) return;

    const tick = () => {
      const v = velocityRef.current;
      const maxX = (viewportEl.clientWidth / 2) - 40;

      // Edge repulsion — push away from walls
      const edgeMargin = 30;
      if (posRef.current < -maxX + edgeMargin) {
        velocityRef.current += 0.8;
      } else if (posRef.current > maxX - edgeMargin) {
        velocityRef.current -= 0.8;
      }

      if (Math.abs(v) > 0.3) {
        velocityRef.current *= 0.97; // friction
        posRef.current = Math.max(-maxX, Math.min(maxX, posRef.current + velocityRef.current));

        if (mascotRef.current) {
          mascotRef.current.style.transform = `translateX(${posRef.current}px) translateY(-100%) scale(${scaleRef.current})`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [viewportEl]);

  // Track mouse and apply forces
  useEffect(() => {
    if (!viewportEl) return;

    const PROXIMITY = 75;

    const handleMouseMove = (e: MouseEvent) => {
      const mascot = mascotRef.current;
      if (!mascot) return;

      const mRect = mascot.getBoundingClientRect();
      const mascotCenterX = mRect.left + mRect.width / 2;
      const mascotCenterY = mRect.top + mRect.height / 2;

      const dx = e.clientX - mascotCenterX;
      const dy = e.clientY - mascotCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < PROXIMITY) {
        setScared(true);
        clearTimeout(scaredTimeout.current);

        // Apply force — closer = stronger push
        const intensity = 1 - dist / PROXIMITY;
        const force = intensity * 0.5;
        const dir = dx > 0 ? -1 : 1;
        velocityRef.current += dir * force;

        // Ensure minimum escape speed when very close
        if (Math.abs(velocityRef.current) < 1.5 && dist < PROXIMITY * 0.5) {
          velocityRef.current = dir * 1.5;
        }

        scaredTimeout.current = setTimeout(() => {
          setScared(false);
        }, 800);
      }
    };

    const handleMouseLeave = () => {
      clearTimeout(scaredTimeout.current);
      setTimeout(() => setScared(false), 400);
    };

    viewportEl.addEventListener("mousemove", handleMouseMove);
    viewportEl.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      viewportEl.removeEventListener("mousemove", handleMouseMove);
      viewportEl.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(scaredTimeout.current);
    };
  }, [viewportEl]);

  if (videoTop === null) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-10 flex justify-center"
      style={{ top: videoTop }}
    >
      <div
        ref={mascotRef}
        style={{
          transform: `translateX(${posRef.current}px) translateY(-100%) scale(${scale})`,
          transformOrigin: "bottom center",
        }}
      >
        <svg
          width="66"
          height="52"
          viewBox="0 0 66 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left ear */}
          <rect x="0" y="13" width="6" height="13" fill="var(--primary)" />
          {/* Right ear */}
          <rect x="60" y="13" width="6" height="13" fill="var(--primary)" />
          {/* Legs */}
          <rect
            x="6" y="39" width="6" height="13"
            fill="var(--primary)"
            style={scared ? { animation: "scuttle-leg1 0.3s steps(2) infinite" } : undefined}
          />
          <rect
            x="18" y="39" width="6" height="13"
            fill="var(--primary)"
            style={scared ? { animation: "scuttle-leg2 0.3s steps(2) infinite" } : undefined}
          />
          <rect
            x="42" y="39" width="6" height="13"
            fill="var(--primary)"
            style={scared ? { animation: "scuttle-leg2 0.3s steps(2) infinite" } : undefined}
          />
          <rect
            x="54" y="39" width="6" height="13"
            fill="var(--primary)"
            style={scared ? { animation: "scuttle-leg1 0.3s steps(2) infinite" } : undefined}
          />
          {/* Body */}
          <rect x="6" y="0" width="54" height="39" fill="var(--primary)" />
          {/* Eyes */}
          {scared ? (
            <>
              <path d="M13 14 L17 17 L13 20" stroke="black" strokeWidth="3" fill="none" strokeLinecap="square" />
              <path d="M53 14 L49 17 L53 20" stroke="black" strokeWidth="3" fill="none" strokeLinecap="square" />
            </>
          ) : (
            <>
              <rect x="12" y="13" width="6" height="6.5" fill="black" />
              <rect x="48" y="13" width="6" height="6.5" fill="black" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
