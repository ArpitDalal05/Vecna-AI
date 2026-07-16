"use client";

import { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 202;

const getFramePath = (index: number) => {
  const padded = String(index).padStart(3, "0");
  return `/sequence/ezgif-frame-${padded}.jpg`;
};

interface ScrollCanvasProps {
  scrollProgress: number;
}

export default function ScrollCanvas({ scrollProgress }: ScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);

  // 1. Preload all images
  useEffect(() => {
    let active = true;
    const preloadImages = async () => {
      const loadPromises = Array.from({ length: TOTAL_FRAMES }).map((_, i) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = getFramePath(i + 1);
          img.onload = () => {
            if (active) {
              setLoadedCount((prev) => {
                const next = prev + 1;
                if (i === 0) setFirstFrameLoaded(true);
                return next;
              });
              resolve(img);
            }
          };
          img.onerror = () => {
            console.error(`Failed to load frame ${i + 1}`);
            // Resolve anyway to prevent blocking the UI
            resolve(img);
          };
          imagesRef.current[i] = img;
        });
      });

      await Promise.all(loadPromises);
      if (active) {
        setIsPreloaded(true);
      }
    };

    preloadImages();

    return () => {
      active = false;
    };
  }, []);

  // 2. Draw current frame on canvas based on scrollProgress
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Determine current frame index based on scrollProgress (0 to 1)
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(scrollProgress * TOTAL_FRAMES))
    );

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete) {
      // If requested image isn't loaded yet, try to find the nearest loaded image
      let fallbackImg: HTMLImageElement | null = null;
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const nextImg = imagesRef.current[frameIndex + offset];
        const prevImg = imagesRef.current[frameIndex - offset];
        if (nextImg && nextImg.complete) {
          fallbackImg = nextImg;
          break;
        }
        if (prevImg && prevImg.complete) {
          fallbackImg = prevImg;
          break;
        }
      }
      if (fallbackImg) {
        drawFrame(canvas, ctx, fallbackImg);
      }
      return;
    }

    drawFrame(canvas, ctx, img);
  }, [scrollProgress, firstFrameLoaded, isPreloaded]);

  // 3. Keep canvas dimensions synchronized with window size and device pixel ratio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      // Redraw current frame immediately on resize
      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(scrollProgress * TOTAL_FRAMES))
      );
      const img = imagesRef.current[frameIndex];
      if (img && img.complete) {
        drawFrame(canvas, ctx, img);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial sizing

    return () => window.removeEventListener("resize", handleResize);
  }, [scrollProgress, firstFrameLoaded, isPreloaded]);

  // Object-fit: cover implementation for Canvas drawing
  const drawFrame = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement
  ) => {
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    if (canvasWidth === 0 || canvasHeight === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Fallback if image isn't valid size yet
    const imgWidth = img.naturalWidth || 1920;
    const imgHeight = img.naturalHeight || 1080;

    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image
      drawHeight = canvasWidth / imgRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      // Canvas is taller than image
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    }

    // Draw the image onto the canvas (supporting smooth scaling)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  const loadingPercentage = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#040404] overflow-hidden">
      {/* Pinned Canvas */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Luxury Loading Screen Overlay */}
      {!isPreloaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#040404] z-40 transition-opacity duration-1000">
          <div className="relative flex items-center justify-center w-32 h-32">
            {/* Spinning gradient ring */}
            <div className="absolute inset-0 rounded-full border border-zinc-900"></div>
            <div
              className="absolute inset-0 rounded-full border-t-2 border-r border-crimson animate-spin"
              style={{ animationDuration: "1.5s" }}
            ></div>
            <div
              className="absolute inset-2 rounded-full border-b-2 border-l border-violet animate-spin"
              style={{ animationDuration: "2.5s", animationDirection: "reverse" }}
            ></div>

            {/* Inner Percentage Text */}
            <div className="flex flex-col items-center justify-center font-sans">
              <span className="text-xl font-bold tracking-tight text-white">
                {loadingPercentage}%
              </span>
              <span className="text-[9px] tracking-[0.2em] text-zinc-500 uppercase mt-1 font-semibold">
                Converging
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <h2 className="font-sans text-xs font-semibold tracking-[0.3em] text-zinc-400 uppercase">
              Initializing Hive Consciousness
            </h2>
            <p className="font-sans text-[10px] tracking-[0.1em] text-zinc-600 uppercase mt-2">
              Syncing Neural Core {loadedCount}/{TOTAL_FRAMES}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
