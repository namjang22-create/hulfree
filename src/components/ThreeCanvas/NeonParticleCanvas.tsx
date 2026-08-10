import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { audioSynth } from '../../utils/audioSynth';
import { Sparkles, Trash2, MousePointerClick, RefreshCw } from 'lucide-react';

interface FireworkParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

export const NeonParticleCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [explosionCount, setExplosionCount] = useState<number>(0);
  const [particleColor, setParticleColor] = useState<string>('#38bdf8');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<FireworkParticle[]>([]);
  const pointsMeshRef = useRef<THREE.Points | null>(null);
  const isPointerDownRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.02);
    sceneRef.current = scene;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Particle geometry buffer setup for 3000 max particles
    const maxParticles = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const pointsMesh = new THREE.Points(geometry, material);
    scene.add(pointsMesh);
    pointsMeshRef.current = pointsMesh;

    // Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (pointsMeshRef.current && particlesRef.current.length > 0) {
        const positionsAttr = pointsMeshRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const colorsAttr = pointsMeshRef.current.geometry.attributes.color as THREE.BufferAttribute;

        const posArr = positionsAttr.array as Float32Array;
        const colArr = colorsAttr.array as Float32Array;

        // Clear buffer arrays
        posArr.fill(0);
        colArr.fill(0);

        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.life -= 0.016;

          if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          p.position.add(p.velocity);
          p.velocity.y -= 0.002; // Gravity
          p.velocity.multiplyScalar(0.98); // Drag

          const idx3 = i * 3;
          posArr[idx3] = p.position.x;
          posArr[idx3 + 1] = p.position.y;
          posArr[idx3 + 2] = p.position.z;

          const alpha = p.life / p.maxLife;
          colArr[idx3] = p.color.r * alpha;
          colArr[idx3 + 1] = p.color.g * alpha;
          colArr[idx3 + 2] = p.color.b * alpha;
        }

        positionsAttr.needsUpdate = true;
        colorsAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  const spawnFireworkAt = (x: number, y: number) => {
    if (!cameraRef.current) return;

    // Convert screen click coords to 3D world coords
    const vec = new THREE.Vector3(x, y, 0.5);
    vec.unproject(cameraRef.current);
    const dir = vec.sub(cameraRef.current.position).normalize();
    const distance = -cameraRef.current.position.z / dir.z;
    const pos = cameraRef.current.position.clone().add(dir.multiplyScalar(distance));

    audioSynth.playFirework();

    const particleCount = 120;
    const baseColor = new THREE.Color(particleColor);

    for (let i = 0; i < particleCount; i++) {
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );

      const color = baseColor.clone();
      color.r += (Math.random() - 0.5) * 0.2;
      color.g += (Math.random() - 0.5) * 0.2;
      color.b += (Math.random() - 0.5) * 0.2;

      particlesRef.current.push({
        position: pos.clone(),
        velocity: vel,
        color,
        size: 0.2,
        life: 1.0 + Math.random() * 0.8,
        maxLife: 1.8,
      });
    }

    setExplosionCount((prev) => prev + 1);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!mountRef.current) return;
    isPointerDownRef.current = true;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    spawnFireworkAt(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !mountRef.current) return;
    if (Math.random() < 0.3) {
      const rect = mountRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      spawnFireworkAt(x, y);
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  return (
    <div className="relative w-full h-[calc(100vh-100px)] min-h-[600px] bg-slate-950 overflow-hidden flex flex-col justify-between">
      
      {/* 3D Canvas */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute inset-0 z-0 cursor-crosshair"
      />

      {/* Top Bar */}
      <div className="relative z-10 p-4 max-w-4xl mx-auto w-full flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2 backdrop-blur-md text-xs text-slate-300 flex items-center gap-2 shadow-xl pointer-events-auto">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>터트린 네온 폭죽: <strong className="text-indigo-300 text-sm font-bold ml-1">{explosionCount}회</strong></span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2 backdrop-blur-md text-xs text-slate-400 flex items-center gap-2 shadow-xl pointer-events-auto">
          <MousePointerClick className="w-3.5 h-3.5 text-indigo-400" />
          <span>화면을 클릭하여 3D 네온 폭죽을 쏘아 올리세요</span>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="relative z-10 p-4 max-w-md mx-auto w-full">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">네온 색상:</span>
            {[
              { color: '#38bdf8', label: '🩵' },
              { color: '#f43f5e', label: '🩷' },
              { color: '#f59e0b', label: '💛' },
              { color: '#10b981', label: '💚' },
              { color: '#a855f7', label: '💜' },
            ].map((c) => (
              <button
                key={c.color}
                onClick={() => setParticleColor(c.color)}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center border ${
                  particleColor === c.color ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.color }}
              >
                <span className="text-[10px]">{c.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              particlesRef.current = [];
              setExplosionCount(0);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 transition-colors"
            title="캔버스 초기화"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>
      </div>

    </div>
  );
};
