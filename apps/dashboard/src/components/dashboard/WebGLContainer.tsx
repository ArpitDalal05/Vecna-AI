"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// --- GPU ACCELERATED PARTICLE SPHERE WITH CUSTOM GLSL SHADERS ---
function ParticleSphere() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // 1. Generate 18,000 points distributed inside a double-layered core-shell sphere
  const positions = useMemo(() => {
    const count = 18000;
    const pos = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      let radius = 0;
      // 35% inner core particles, 65% outer orbit particles
      if (Math.random() < 0.35) {
        radius = Math.random() * 0.55; // Core
      } else {
        radius = 1.35 + Math.random() * 0.9; // Outer shell
      }
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return pos;
  }, []);

  // 2. Setup shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorCore: { value: new THREE.Color("#FF3E9D") }, // Glowing Magenta
    uColorShell: { value: new THREE.Color("#7B3FE4") }, // Neural Purple
    uColorHighlight: { value: new THREE.Color("#5EF9FF") }, // Electric Cyan
  }), []);

  // 3. Frame rendering loops updating shader time uniforms and slow mesh spins
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsed;
    }
    if (pointsRef.current) {
      // Core-wide orbit drift
      pointsRef.current.rotation.y = elapsed * 0.04;
      pointsRef.current.rotation.x = elapsed * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec3 vPosition;
          varying float vDist;
          
          void main() {
            vPosition = position;
            vec3 p = position;
            float dist = length(p);
            vDist = dist;

            // Breathing pulse effect
            if (dist < 0.8) {
              // Core pulses faster
              p += normalize(p) * sin(uTime * 3.5 + dist * 6.0) * 0.05;
            } else {
              // Shell waves
              p += normalize(p) * sin(uTime * 1.5 + dist * 3.0) * 0.12;
            }

            // Differential orbit rotation (internal friction)
            float angle = uTime * (dist < 0.8 ? 0.25 : 0.06);
            float c = cos(angle);
            float s = sin(angle);
            mat2 rot = mat2(c, -s, s, c);
            p.xz = rot * p.xz;

            vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mvPosition;

            // Size attenuation based on distance + pulse
            float sizePulse = 1.0 + sin(uTime * 3.0 + dist * 8.0) * 0.35;
            gl_PointSize = (15.0 / -mvPosition.z) * sizePulse;
          }
        `}
        fragmentShader={`
          uniform vec3 uColorCore;
          uniform vec3 uColorShell;
          uniform vec3 uColorHighlight;
          varying vec3 vPosition;
          varying float vDist;

          void main() {
            // Circular point shapes
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            if (dist > 0.5) discard;

            // Gradient mixing based on core vs shell
            vec3 color = vec3(0.0);
            if (vDist < 0.8) {
              // core: hot magenta white core
              color = mix(uColorCore, vec3(0.97, 0.98, 1.0), vDist / 0.8);
            } else {
              // shell: purple-cyan orbit blend
              float h = normalize(vPosition).y * 0.5 + 0.5;
              color = mix(uColorShell, uColorHighlight, h);
            }

            // High-bloom soft glow edge
            float alpha = smoothstep(0.5, 0.04, dist);
            gl_FragColor = vec4(color, alpha * 0.9);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function WebGLContainer() {
  return (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center relative">
      <Canvas 
        camera={{ position: [0, 0, 4.5], fov: 60 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#050608"]} />
        <ambientLight intensity={0.5} />
        
        <ParticleSphere />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
