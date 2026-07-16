"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll } from "framer-motion";
import Navbar from "../components/Navbar";
import ScrollCanvas from "../components/ScrollCanvas";
import StoryOverlay from "../components/StoryOverlay";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track the scroll progress of the 400vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    // Listen to scroll changes and update state for non-motion components (Canvas context)
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrollProgress(latest);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div className="relative bg-[#040404] min-h-screen">
      {/* Apple-style Navigation */}
      <Navbar />

      {/* 400vh Pinned Scroll Container */}
      <div ref={containerRef} className="relative h-[400vh] w-full">
        {/* Sticky Viewport Wrapper */}
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
          {/* Fullscreen HTML5 Canvas Image-Sequence Player */}
          <ScrollCanvas scrollProgress={scrollProgress} />

          {/* Text Panels and HUD Elements Overlay */}
          <StoryOverlay scrollProgress={scrollProgress} />
        </div>
      </div>
    </div>
  );
}