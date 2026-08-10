import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { audioSynth } from '../../utils/audioSynth';
import { recordPoppedBubble } from '../../utils/mindLog';
import { AffirmationModal } from '../AffirmationModal';
import { CircleDot, RefreshCw, Sparkles, Zap, Flame, Volume2, Sliders, Type } from 'lucide-react';

interface PopParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  scale: number;
  life: number;
  maxLife: number;
  isRing?: boolean;
}

interface BubbleData {
  mesh: THREE.Mesh;
  textSprite?: THREE.Sprite;
  vel: THREE.Vector3;
  baseRadius: number;
  originalScale: THREE.Vector3;
  color: THREE.Color;
  word?: string;
  isPopping?: boolean;
  popProgress?: number;
}

const STRESS_WORDS = [
  '야근', '피로', '불안', '걱정', '후회', '비교', '스트레스',
  '카드값', '시험', '압박감', '상사', '오류', '번아웃', '외로움'
];

export const SquishyBubblesCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [poppedCount, setPoppedCount] = useState<number>(0);
  const [remainingCount, setRemainingCount] = useState<number>(30);
  const [comboCount, setComboCount] = useState<number>(0);
  const [feverText, setFeverText] = useState<string | null>(null);
  const [isAllClear, setIsAllClear] = useState<boolean>(false);

  // Settings
  const [bubbleTheme, setBubbleTheme] = useState<'neon' | 'pastel' | 'sunset'>('neon');
  const [useGravity, setUseGravity] = useState<boolean>(false);
  const [showWords, setShowWords] = useState<boolean>(true);
  const [autoRespawn, setAutoRespawn] = useState<boolean>(true);
  const [bubbleDensity, setBubbleDensity] = useState<number>(30);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isAffirmationOpen, setIsAffirmationOpen] = useState<boolean>(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bubblesRef = useRef<BubbleData[]>([]);
  const popParticlesRef = useRef<PopParticle[]>([]);
  const popPointsMeshRef = useRef<THREE.Points | null>(null);

  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(-999, -999));
  const animationFrameRef = useRef<number | null>(null);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getThemeColors = (theme: 'neon' | 'pastel' | 'sunset') => {
    if (theme === 'pastel') {
      return [0xfbcfe8, 0xbae6fd, 0xc7d2fe, 0xa7f3d0, 0xfef08a, 0xfde68a, 0xddd6fe];
    } else if (theme === 'sunset') {
      return [0xf43f5e, 0xf97316, 0xeab308, 0xa855f7, 0xec4899, 0xff0055, 0xfb923c];
    }
    // 14 Vivid Rainbow Cyberpunk Neon Colors!
    return [
      0x00f3ff, // Neon Cyan
      0xff007f, // Neon Hot Pink
      0x00ff66, // Neon Lime Green
      0xffee00, // Neon Yellow
      0x9d4edd, // Neon Electric Purple
      0xff5500, // Neon Fire Orange
      0x0066ff, // Neon Deep Blue
      0xc77dff, // Neon Violet
      0x00ffaa, // Neon Emerald
      0xff0055, // Neon Bright Rose
      0x00e5ff, // Neon Aqua
      0xffd700, // Neon Gold
      0x7b2cbf, // Neon Ultra Violet
      0xff1493  // Neon Flamingo
    ];
  };

  // Helper to spawn a new bubble with material, color & word sprite
  const spawnNewBubbleData = (
    scene: THREE.Scene,
    colors: number[],
    showWords: boolean,
    useGravity: boolean,
    theme: string
  ): BubbleData => {
    const radius = 0.5 + Math.random() * 0.7;
    const hexColor = colors[Math.floor(Math.random() * colors.length)];
    const color = new THREE.Color(hexColor);

    const material = new THREE.MeshPhysicalMaterial({
      color,
      emissive: color,
      emissiveIntensity: theme === 'neon' ? 0.45 : 0.05,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      thickness: 0.5,
      ior: 1.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const geometry = new THREE.IcosahedronGeometry(1, 4);
    const mesh = new THREE.Mesh(geometry, material);

    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 14,
      useGravity ? 5 + Math.random() * 3 : (Math.random() - 0.5) * 9,
      (Math.random() - 0.5) * 4
    );
    mesh.position.copy(pos);
    mesh.scale.set(radius, radius, radius);

    let textSprite: THREE.Sprite | undefined;
    let word: string | undefined;

    if (showWords) {
      word = STRESS_WORDS[Math.floor(Math.random() * STRESS_WORDS.length)];
      const sprite = createTextSprite(word);
      if (sprite) {
        mesh.add(sprite);
        textSprite = sprite;
      }
    }

    scene.add(mesh);

    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 0.03,
      (Math.random() - 0.5) * 0.03,
      (Math.random() - 0.5) * 0.02
    );

    return {
      mesh,
      textSprite,
      vel,
      baseRadius: radius,
      originalScale: new THREE.Vector3(radius, radius, radius),
      color,
      word,
    };
  };

  // Helper to create 3D text label sprite for word bubbles
  const createTextSprite = (text: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 256, 128);
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.fillText(text, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.5, 0.75, 1);
    return sprite;
  };

  // Spawn particle splash when popping (시원하게 터지는 크고 화려한 파티클 폭발)
  const spawnPopSplash = (pos: THREE.Vector3, color: THREE.Color) => {
    const splashCount = 48; // Boosted particle count for explosive pops!
    for (let i = 0; i < splashCount; i++) {
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.55,
        (Math.random() - 0.5) * 0.55,
        (Math.random() - 0.5) * 0.55
      );
      popParticlesRef.current.push({
        position: pos.clone(),
        velocity: vel,
        color: color.clone(),
        scale: 0.25 + Math.random() * 0.15,
        life: 1.0,
      });
    }

    // Camera shake impulse for high-impact force feedback!
    if (cameraRef.current) {
      cameraRef.current.position.x = (Math.random() - 0.5) * 0.4;
      cameraRef.current.position.y = (Math.random() - 0.5) * 0.4;
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.02);
    sceneRef.current = scene;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight1.position.set(10, 10, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 2.0);
    dirLight2.position.set(-10, -10, 5);
    scene.add(dirLight2);

    // Pop Particle System Geometry Buffer
    const maxPopParticles = 1000;
    const popGeom = new THREE.BufferGeometry();
    const popPos = new Float32Array(maxPopParticles * 3);
    const popCol = new Float32Array(maxPopParticles * 3);
    popGeom.setAttribute('position', new THREE.BufferAttribute(popPos, 3));
    popGeom.setAttribute('color', new THREE.BufferAttribute(popCol, 3));

    const popMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });

    const popPoints = new THREE.Points(popGeom, popMat);
    scene.add(popPoints);
    popPointsMeshRef.current = popPoints;

    // Spawn initial bubbles based on bubbleDensity setting
    const colors = getThemeColors(bubbleTheme);

    for (let i = 0; i < bubbleDensity; i++) {
      const bubble = spawnNewBubbleData(scene, colors, showWords, useGravity, bubbleTheme);
      bubblesRef.current.push(bubble);
    }

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth camera back to original position after shake impulse
      if (cameraRef.current) {
        cameraRef.current.position.x += (0 - cameraRef.current.position.x) * 0.15;
        cameraRef.current.position.y += (0 - cameraRef.current.position.y) * 0.15;
      }

      // Mouse position in 3D world space approximation
      const mouse3D = new THREE.Vector3(
        (mouseRef.current.x * 7),
        (mouseRef.current.y * 4.5),
        0
      );

      // Animate Pop Particles
      if (popPointsMeshRef.current && popParticlesRef.current.length > 0) {
        const posAttr = popPointsMeshRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const colAttr = popPointsMeshRef.current.geometry.attributes.color as THREE.BufferAttribute;
        const pArr = posAttr.array as Float32Array;
        const cArr = colAttr.array as Float32Array;

        pArr.fill(0);
        cArr.fill(0);

        for (let i = popParticlesRef.current.length - 1; i >= 0; i--) {
          const p = popParticlesRef.current[i];
          p.life -= 0.03;
          if (p.life <= 0) {
            popParticlesRef.current.splice(i, 1);
            continue;
          }

          p.position.add(p.velocity);
          p.velocity.multiplyScalar(0.96);

          const i3 = i * 3;
          pArr[i3] = p.position.x;
          pArr[i3 + 1] = p.position.y;
          pArr[i3 + 2] = p.position.z;

          cArr[i3] = p.color.r * p.life;
          cArr[i3 + 1] = p.color.g * p.life;
          cArr[i3 + 2] = p.color.b * p.life;
        }

        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
      }

      // Animate Bubbles
      bubblesRef.current.forEach((b) => {
        if (useGravity) {
          // Gravity physics mode
          b.vel.y -= 0.001;
          b.mesh.position.add(b.vel);

          if (b.mesh.position.y < -4.5) {
            b.mesh.position.y = -4.5;
            b.vel.y *= -0.8; // Bounce
            audioSynth.playPop(0.8);
          }
          if (Math.abs(b.mesh.position.x) > 7.5) b.vel.x *= -0.8;
        } else {
          // Normal zero-gravity floating
          b.mesh.position.add(b.vel);

          if (Math.abs(b.mesh.position.x) > 7.5) b.vel.x *= -1;
          if (Math.abs(b.mesh.position.y) > 5) b.vel.y *= -1;
          if (Math.abs(b.mesh.position.z) > 3) b.vel.z *= -1;
        }

        // Squishy mouse repulsion & deformation
        const distToMouse = b.mesh.position.distanceTo(mouse3D);
        if (distToMouse < 2.5) {
          const pushForce = (2.5 - distToMouse) * 0.018;
          const dir = b.mesh.position.clone().sub(mouse3D).normalize();
          b.mesh.position.add(dir.multiplyScalar(pushForce));

          const squish = 1 + Math.sin(time * 15) * 0.18;
          b.mesh.scale.set(
            b.baseRadius * squish,
            b.baseRadius * (2 - squish),
            b.baseRadius
          );
        } else {
          b.mesh.scale.lerp(b.originalScale, 0.1);
        }

        b.mesh.position.y += Math.sin(time * 2 + b.mesh.position.x) * 0.003;
      });

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
  }, [bubbleTheme, useGravity, showWords, bubbleDensity]);

  // Pointer Movement
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  // Refill all bubbles
  const refillAllBubbles = () => {
    if (!sceneRef.current) return;

    // Remove remaining meshes
    bubblesRef.current.forEach((b) => {
      sceneRef.current?.remove(b.mesh);
    });
    bubblesRef.current = [];

    const colors = getThemeColors(bubbleTheme);
    for (let i = 0; i < bubbleDensity; i++) {
      const bubble = spawnNewBubbleData(sceneRef.current, colors, showWords, useGravity, bubbleTheme);
      bubblesRef.current.push(bubble);
    }

    setRemainingCount(bubbleDensity);
    setIsAllClear(false);
    setFeverText('🎈 새로운 버블이 생성되었습니다!');
    setTimeout(() => setFeverText(null), 1500);
  };

  // Trigger Bubble Pop
  const handlePopBubble = (index: number, shouldRespawn: boolean = true) => {
    if (!sceneRef.current || index < 0 || index >= bubblesRef.current.length) return;

    const bubble = bubblesRef.current[index];

    // Spawn splash particles
    spawnPopSplash(bubble.mesh.position, bubble.color);

    // Audio SFX
    audioSynth.playPop(1.0 + Math.random() * 0.5);

    // Combo system
    setComboCount((c) => {
      const nextCombo = c + 1;
      if (nextCombo >= 10 && nextCombo % 5 === 0) {
        setFeverText(`🔥 FEVER ${nextCombo}x COMBO! 스트레스 대방출!`);
        audioSynth.playFirework();
        setTimeout(() => setFeverText(null), 1800);
      }
      return nextCombo;
    });

    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setComboCount(0);
    }, 2000);

    // Completely remove bubble mesh from scene!
    sceneRef.current.remove(bubble.mesh);
    bubblesRef.current.splice(index, 1);

    recordPoppedBubble(1);
    setPoppedCount((prev) => prev + 1);
    const updatedCount = bubblesRef.current.length;
    setRemainingCount(updatedCount);

    if (updatedCount === 0) {
      setIsAllClear(true);
      audioSynth.playFirework();
      setFeverText('🎉 ALL CLEAR! 모든 스트레스 단어가 완벽하게 소멸되었습니다!');
      setTimeout(() => setIsAffirmationOpen(true), 1200);
      return;
    }

    // Auto-Respawn one bubble if enabled
    if (shouldRespawn && autoRespawn) {
      setTimeout(() => {
        if (!sceneRef.current) return;
        const colors = getThemeColors(bubbleTheme);
        const newBubble = spawnNewBubbleData(sceneRef.current, colors, showWords, useGravity, bubbleTheme);
        bubblesRef.current.push(newBubble);
        setRemainingCount(bubblesRef.current.length);
        setIsAllClear(false);
      }, 1500);
    }
  };

  // Pointer Click
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

    handlePointerMove(e);

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const meshes = bubblesRef.current.map((b) => b.mesh);
    const intersects = raycasterRef.current.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const index = bubblesRef.current.findIndex((b) => b.mesh === hitMesh);
      if (index !== -1) {
        handlePopBubble(index, true);
      }
    }
  };

  // Super Pop (All-Kill): Chain reaction popping all bubbles until 0!
  const handleSuperPop = () => {
    audioSynth.playFirework();
    setFeverText('💥 SUPER POP! 모든 스트레스 단어 연쇄 소멸 중...');

    const chainPop = () => {
      if (bubblesRef.current.length > 0) {
        // Pop the first remaining bubble (index 0) without auto-respawn
        handlePopBubble(0, false);
        setTimeout(chainPop, 40);
      } else {
        setIsAllClear(true);
      }
    };

    chainPop();
  };

  return (
    <div className="relative w-full h-[calc(100vh-100px)] min-h-[600px] bg-slate-950 overflow-hidden flex flex-col justify-between">
      
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className="absolute inset-0 z-0 cursor-pointer"
      />

      {/* Fever Banner Overlay */}
      {feverText && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in zoom-in-75 duration-300">
          <div className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 border border-amber-300 text-white font-extrabold text-sm sm:text-base shadow-2xl shadow-rose-900/60 flex items-center gap-2">
            <Flame className="w-5 h-5 text-yellow-300 animate-bounce" />
            <span>{feverText}</span>
          </div>
        </div>
      )}

      {/* All Clear Victory Overlay */}
      {isAllClear && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl shadow-cyan-950/80">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-8 h-8 text-white animate-spin" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-300 to-amber-300">
                🎉 ALL CLEAR! 완벽 소멸!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                모든 스트레스와 고민 단어 버블이 완전히 터져 날아갔습니다.
                마음이 한결 가벼워지셨길 바랍니다!
              </p>
            </div>

            <button
              onClick={refillAllBubbles}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-900/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>🎈 버블 새로 채우기</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Info Bar */}
      <div className="relative z-10 p-4 max-w-4xl mx-auto w-full flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2 backdrop-blur-md text-xs text-slate-300 flex items-center gap-2 shadow-xl pointer-events-auto">
            <CircleDot className="w-4 h-4 text-cyan-400" />
            <span>남은 버블: <strong className="text-amber-300 text-sm font-bold ml-1">{remainingCount}개</strong></span>
            <span className="text-slate-600 mx-1">|</span>
            <span>터트림: <strong className="text-cyan-300 text-sm font-bold ml-1">{poppedCount}개</strong></span>
          </div>

          {comboCount > 1 && (
            <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl px-3 py-1.5 backdrop-blur-md text-xs font-bold text-amber-300 flex items-center gap-1 shadow-lg animate-pulse pointer-events-auto">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{comboCount} COMBO!</span>
            </div>
          )}
        </div>

        {/* Super Pop & Settings Toggle Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={refillAllBubbles}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            title="버블 새로 채우기"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">버블 채우기</span>
          </button>

          <button
            onClick={handleSuperPop}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>💥 올킬 연쇄 폭발</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all cursor-pointer ${
              showSettings
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Settings Modal Drawer */}
      {showSettings && (
        <div className="relative z-20 p-4 max-w-md mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-slate-900/95 border border-slate-700 rounded-3xl p-4 backdrop-blur-2xl shadow-2xl space-y-3 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 버블 옵션 & 물리 모드 설정
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Word Toggle */}
              <button
                onClick={() => setShowWords(!showWords)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  showWords
                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-semibold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <Type className="w-4 h-4" />
                <span className="text-[11px]">고민 단어</span>
                <span className="text-[9px] opacity-75">{showWords ? 'ON' : 'OFF'}</span>
              </button>

              {/* Auto Respawn Toggle */}
              <button
                onClick={() => setAutoRespawn(!autoRespawn)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  autoRespawn
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-[11px]">자동 리젠</span>
                <span className="text-[9px] opacity-75">{autoRespawn ? 'ON' : 'OFF'}</span>
              </button>

              {/* Bouncy Gravity Physics Mode Toggle */}
              <button
                onClick={() => setUseGravity(!useGravity)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  useGravity
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px]">지구 중력</span>
                <span className="text-[9px] opacity-75">{useGravity ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Density Slider */}
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-300">기본 버블 개수: {bubbleDensity}개</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                step="5"
                value={bubbleDensity}
                onChange={(e) => setBubbleDensity(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div className="relative z-10 p-4 max-w-md mx-auto w-full">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1">컬러 테마:</span>
            {[
              { id: 'neon', label: '🩵 네온' },
              { id: 'pastel', label: '🌸 파스텔' },
              { id: 'sunset', label: '🌅 노을' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setBubbleTheme(t.id as 'neon' | 'pastel' | 'sunset')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  bubbleTheme === t.id
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                    : 'bg-slate-800/60 border border-slate-700/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setPoppedCount(0);
              setComboCount(0);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            title="카운터 리셋"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>
      </div>

      <AffirmationModal
        isOpen={isAffirmationOpen}
        onClose={() => setIsAffirmationOpen(false)}
        onRestart={refillAllBubbles}
      />
    </div>
  );
};

