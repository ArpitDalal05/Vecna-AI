"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Overview", href: "#overview" },
    { label: "Architecture", href: "#architecture" },
    { label: "Intelligence", href: "#intelligence" },
    { label: "Hive Network", href: "#hive-network" },
    { label: "Vision", href: "#vision" },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b border-transparent"
      style={{
        backgroundColor: isScrolled
          ? "rgba(4, 4, 4, 0.85)"
          : "rgba(4, 4, 4, 0.0)",
        backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
        borderBottomColor: isScrolled
          ? "rgba(123, 44, 191, 0.12)"
          : "rgba(4, 4, 4, 0.0)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo with Custom Vector Emblem */}
        <a href="#" className="flex items-center gap-3 group">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="text-crimson transition-transform duration-500 group-hover:rotate-180"
          >
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="6" />
            <path d="M50 25C68 20 82 30 82 45C82 58 68 62 50 68" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 25C32 20 18 30 18 45C18 58 32 62 50 68" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path d="M50 48C72 45 85 55 85 68C85 78 72 82 50 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 48C28 45 15 55 15 68C15 78 28 82 50 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M35 15L50 5L65 15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-sans text-xs font-bold tracking-[0.35em] text-white uppercase transition-colors duration-300">
            V E C N A <span className="text-crimson">- A I</span>
          </span>
        </a>

        {/* Spaced Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-sans text-[10px] font-medium tracking-[0.2em] text-zinc-400 hover:text-white uppercase transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA styled exactly like reference button */}
        <div>
          <a
            href="/signin"
            className="inline-flex items-center gap-3 pl-5 pr-1.5 py-1 rounded-full font-sans text-[10px] font-bold tracking-[0.2em] text-zinc-200 uppercase bg-[#09070A]/50 border border-zinc-800 backdrop-blur-md transition-all duration-300 hover:border-crimson hover:shadow-[0_0_20px_rgba(153,0,17,0.2)] hover:text-white group"
          >
            <span>ACCESS HIVE</span>
            <span className="w-7 h-7 rounded-full bg-crimson/10 border border-crimson/30 flex items-center justify-center text-crimson group-hover:bg-crimson/25 transition-all duration-300">
              <svg width="12" height="12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
                <line x1="50" y1="15" x2="50" y2="85" />
                <path d="M50 25C65 20 80 30 80 45M50 25C35 20 20 30 20 45" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </motion.header>
  );
}
