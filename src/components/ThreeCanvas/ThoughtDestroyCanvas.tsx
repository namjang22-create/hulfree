import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DestroyMethod, DestroyHistoryItem } from '../../types';
import { audioSynth } from '../../utils/audioSynth';
import { recordDestroyedThought } from '../../utils/mindLog';
import { AffirmationModal } from '../AffirmationModal';
import { Flame, Sparkles, RefreshCw, ShieldAlert, Bell, Laugh, Heart } from 'lucide-react';

export const ThoughtDestroyCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState<string>('');
  const [activeMethod, setActiveMethod] = useState<DestroyMethod>('shatter');
  const [isDestroying, setIsDestroying] = useState<boolean>(false);
  const [destroyedCount, setDestroyedCount] = useState<number>(0);
  const [historyItems, setHistoryItems] = useState<DestroyHistoryItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('마음을 괴롭히는 문장이나 고민을 적고 아래 소멸 버튼을 누르세요.');
  const [isAffirmationOpen, setIsAffirmationOpen] = useState<boolean>(false);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectGroupRef = useRef<THREE.Group | null>(null);
  const mainMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const fragmentsRef = useRef<{ mesh: THREE.Mesh; vel: THREE.Vector3; rot: THREE.Vector3 }[]>([]);
  const activeParticlesRef = useRef<{ position: THREE.Vector3; velocity: THREE.Vector3; color: THREE.Color; life: number; size: number }[]>([]);
  const particleSystemMeshRef = useRef<THREE.Points | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Canvas texture generator for text on 3D Monolith
  const createTextTexture = (text: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Dark sleek crystal surface background
    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Glowing border frame
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 984, 472);

    // Render Text
    ctx.fillStyle = text.trim() ? '#f8fafc' : '#94a3b8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = text.trim() ? 25 : 10;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textToDraw = text.trim() || '마음을 비우는 3D 고민판\n(고민을 적어보세요)';
    ctx.font = 'bold 42px sans-serif';

    // Word wrap
    const lines: string[] = textToDraw.split('\n');
    const finalLines: string[] = [];

    lines.forEach((l) => {
      const words = l.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 850 && n > 0) {
          finalLines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      finalLines.push(line);
    });

    const startY = 256 - ((finalLines.length - 1) * 28);
    finalLines.forEach((l, i) => {
      ctx.fillText(l.trim(), 512, startY + i * 56);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.02);
    sceneRef.current = scene;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const isMobile = width < 768;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 11);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 1.8);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x818cf8, 3.5, 25);
    pointLight.position.set(2, 0, 4);
    scene.add(pointLight);

    // Group for objects - Responsive right positioning
    const objectGroup = new THREE.Group();
    objectGroup.position.set(isMobile ? 0 : 2.2, isMobile ? 2.2 : 0, 0);
    scene.add(objectGroup);
    objectGroupRef.current = objectGroup;

    // Create central 3D Monolith mesh with text texture
    const geometry = new THREE.BoxGeometry(4.8, 2.7, 0.5);
    const textTex = createTextTexture(inputText);
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ map: textTex, roughness: 0.1, metalness: 0.2 }), // Front face
      new THREE.MeshStandardMaterial({ map: textTex, roughness: 0.1, metalness: 0.2 }), // Back face
    ];

    const mainMesh = new THREE.Mesh(geometry, materials);
    mainMesh.visible = false; // Hide floating monolith during idle state
    objectGroup.add(mainMesh);
    mainMeshRef.current = mainMesh;

    // Background floating particle stars
    const particleCount = 700;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 40;
      pPos[i + 1] = (Math.random() - 0.5) * 40;
      pPos[i + 2] = (Math.random() - 0.5) * 40;
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);
    particlesMeshRef.current = particles;

    // Dynamic Effect Particles Buffer (Fire, Blackhole swirl, Lantern trail)
    const maxFxParticles = 1200;
    const fxGeom = new THREE.BufferGeometry();
    const fxPos = new Float32Array(maxFxParticles * 3);
    const fxCol = new Float32Array(maxFxParticles * 3);
    fxGeom.setAttribute('position', new THREE.BufferAttribute(fxPos, 3));
    fxGeom.setAttribute('color', new THREE.BufferAttribute(fxCol, 3));

    const fxMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const fxPoints = new THREE.Points(fxGeom, fxMat);
    scene.add(fxPoints);
    particleSystemMeshRef.current = fxPoints;

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Idle float & rotation
      if (mainMeshRef.current && mainMeshRef.current.visible && !isDestroying) {
        mainMeshRef.current.rotation.y = Math.sin(elapsedTime * 0.5) * 0.12;
        mainMeshRef.current.position.y = Math.sin(elapsedTime * 1.2) * 0.15;
      }

      if (particlesMeshRef.current) {
        particlesMeshRef.current.rotation.y = elapsedTime * 0.03;
      }

      // Animate explosion fragments
      if (fragmentsRef.current.length > 0) {
        fragmentsRef.current.forEach((frag) => {
          frag.mesh.position.add(frag.vel);
          frag.mesh.rotation.x += frag.rot.x;
          frag.mesh.rotation.y += frag.rot.y;
          frag.vel.multiplyScalar(0.97); // drag
          const mat = frag.mesh.material as THREE.MeshStandardMaterial;
          mat.opacity *= 0.97;
        });
      }

      // Animate FX Particles
      if (particleSystemMeshRef.current && activeParticlesRef.current.length > 0) {
        const posAttr = particleSystemMeshRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const colAttr = particleSystemMeshRef.current.geometry.attributes.color as THREE.BufferAttribute;
        const pArr = posAttr.array as Float32Array;
        const cArr = colAttr.array as Float32Array;

        pArr.fill(0);
        cArr.fill(0);

        for (let i = activeParticlesRef.current.length - 1; i >= 0; i--) {
          const p = activeParticlesRef.current[i];
          p.life -= 0.025;
          if (p.life <= 0) {
            activeParticlesRef.current.splice(i, 1);
            continue;
          }

          p.position.add(p.velocity);

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

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      const mob = w < 768;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);

      if (objectGroupRef.current) {
        objectGroupRef.current.position.set(mob ? 0 : 2.2, mob ? 2.2 : 0, 0);
      }
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

  // Update texture when input text changes
  useEffect(() => {
    if (!mainMeshRef.current) return;
    const textTex = createTextTexture(inputText);
    const materials = mainMeshRef.current.material as THREE.MeshStandardMaterial[];
    materials[4].map = textTex;
    materials[4].needsUpdate = true;
    materials[5].map = textTex;
    materials[5].needsUpdate = true;
  }, [inputText]);

  // Helper to build 3D Bell Mesh
  const createBellMesh = () => {
    const group = new THREE.Group();

    // Bell body
    const bodyGeom = new THREE.CylinderGeometry(0.4, 1.8, 2.4, 32, 1, true);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x78350f,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
    });
    const body = new THREE.Mesh(bodyGeom, goldMat);
    group.add(body);

    // Bottom lip rim
    const rimGeom = new THREE.TorusGeometry(1.8, 0.15, 16, 32);
    const rim = new THREE.Mesh(rimGeom, goldMat);
    rim.position.y = -1.2;
    rim.rotation.x = Math.PI / 2;
    group.add(rim);

    // Top loop handle
    const handleGeom = new THREE.TorusGeometry(0.35, 0.08, 16, 24);
    const handle = new THREE.Mesh(handleGeom, goldMat);
    handle.position.y = 1.35;
    group.add(handle);

    // Inner Clapper ball
    const clapperGeom = new THREE.SphereGeometry(0.3, 16, 16);
    const clapperMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.8, roughness: 0.3 });
    const clapper = new THREE.Mesh(clapperGeom, clapperMat);
    clapper.position.y = -0.9;
    group.add(clapper);

    return group;
  };

  // Helper to build 3D Bowling Set Mesh (Bowling Ball & 10 Pins)
  const createBowlingMesh = () => {
    const group = new THREE.Group();

    // Metallic shiny Bowling Ball
    const ballGeom = new THREE.SphereGeometry(1.0, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Glossy Cyan/Blue
      roughness: 0.1,
      metalness: 0.8,
    });
    const ball = new THREE.Mesh(ballGeom, ballMat);
    ball.position.set(0, -0.2, 5.5);
    ball.name = 'bowlingBall';
    group.add(ball);

    // Finger holes on ball
    const holeGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    [-0.2, 0.2].forEach((xOffset) => {
      const hole = new THREE.Mesh(holeGeom, holeMat);
      hole.position.set(xOffset, 0.4, 6.3);
      group.add(hole);
    });

    // 10 Bowling Pins arranged in triangular rack
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.1,
    });
    const redStripeMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.2,
    });

    const pinPositions = [
      // Row 1
      { x: 0, z: 0 },
      // Row 2
      { x: -0.7, z: -0.9 }, { x: 0.7, z: -0.9 },
      // Row 3
      { x: -1.4, z: -1.8 }, { x: 0, z: -1.8 }, { x: 1.4, z: -1.8 },
      // Row 4
      { x: -2.1, z: -2.7 }, { x: -0.7, z: -2.7 }, { x: 0.7, z: -2.7 }, { x: 2.1, z: -2.7 }
    ];

    const pinsGroup = new THREE.Group();
    pinsGroup.name = 'pinsGroup';

    pinPositions.forEach((pos, idx) => {
      const singlePin = new THREE.Group();
      singlePin.name = `pin_${idx}`;

      // Pin body
      const pinBodyGeom = new THREE.CylinderGeometry(0.28, 0.45, 1.6, 16);
      const pinBody = new THREE.Mesh(pinBodyGeom, pinMat);
      singlePin.add(pinBody);

      // Pin head
      const headGeom = new THREE.SphereGeometry(0.3, 16, 16);
      const head = new THREE.Mesh(headGeom, pinMat);
      head.position.y = 1.0;
      singlePin.add(head);

      // Red neck ring
      const ringGeom = new THREE.CylinderGeometry(0.26, 0.28, 0.2, 16);
      const ring = new THREE.Mesh(ringGeom, redStripeMat);
      ring.position.y = 0.6;
      singlePin.add(ring);

      singlePin.position.set(pos.x, 0, pos.z);
      pinsGroup.add(singlePin);
    });

    group.add(pinsGroup);

    return group;
  };

  // Helper to build 3D Fart Cloud Mesh
  const createFartMesh = () => {
    const group = new THREE.Group();

    // Soft Greenish Yellow Gas Cloud Spheres
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0x84cc16,
      emissive: 0x4d7c0f,
      roughness: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    const spherePositions = [
      [0, 0, 0, 1.2],
      [-0.9, 0.3, 0.2, 0.9],
      [0.9, -0.2, -0.3, 1.0],
      [0.3, 0.8, -0.1, 0.8],
      [-0.4, -0.6, 0.4, 0.75],
    ];

    spherePositions.forEach(([x, y, z, r]) => {
      const geom = new THREE.SphereGeometry(r, 16, 16);
      const mesh = new THREE.Mesh(geom, cloudMat);
      mesh.position.set(x, y, z);
      group.add(mesh);
    });

    // Floating text banner: "💨 뿡! 뿡! 뿡! 뿌-웅~!"
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 512, 128);
      ctx.fillStyle = '#a3e635';
      ctx.shadowColor = '#65a30d';
      ctx.shadowBlur = 16;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('💨 뿡! 뿡! 뿡! 뿌-웅~!', 256, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 2.2;
    sprite.scale.set(4.8, 1.2, 1);
    group.add(sprite);

    return group;
  };

  // Helper to build 3D Ocean Ship Foghorn Mesh
  const createFoghornMesh = () => {
    const group = new THREE.Group();

    // Ship Hull Body
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.6,
    });

    const hullGeom = new THREE.CylinderGeometry(1.6, 1.1, 1.2, 24);
    const hull = new THREE.Mesh(hullGeom, hullMat);
    hull.position.y = -0.4;
    group.add(hull);

    // Red Bottom Stripe
    const bottomMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
    const bottomGeom = new THREE.CylinderGeometry(1.05, 0.7, 0.4, 24);
    const bottom = new THREE.Mesh(bottomGeom, bottomMat);
    bottom.position.y = -1.1;
    group.add(bottom);

    // White Cabin Bridge
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const cabinGeom = new THREE.BoxGeometry(1.4, 0.8, 1.4);
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.position.y = 0.5;
    group.add(cabin);

    // Red Funnel / Smokestack (Horn Pipe)
    const funnelMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const funnelGeom = new THREE.CylinderGeometry(0.3, 0.35, 1.0, 16);
    const funnel = new THREE.Mesh(funnelGeom, funnelMat);
    funnel.position.set(0, 1.2, 0);
    group.add(funnel);

    // Funnel Black Top Ring
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const ringGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 16);
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.set(0, 1.7, 0);
    group.add(ring);

    // Floating text banner: "🚢 부우우웅-! (뱃고동 소리)"
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 512, 128);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 16;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText('🚢 부우우웅-! (뱃고동 소리)', 256, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 2.4;
    sprite.scale.set(4.8, 1.2, 1);
    group.add(sprite);

    return group;
  };

  // Execute Destruction
  const handleDestroy = () => {
    if (isDestroying || !sceneRef.current || !objectGroupRef.current) return;

    const currentText = inputText.trim() || '이름 없는 마음에 가득 찬 고민';
    setIsDestroying(true);

    const originPos = objectGroupRef.current.position.clone();

    if (activeMethod === 'shatter') {
      // School Bell Method (학교 종소리 소멸)
      setStatusMessage('🔔 황금 종이 크게 울리며 7연속 맑은 학교 종소리와 함께 고민이 깔끔하게 소멸합니다!');
      audioSynth.playSchoolBell();

      if (mainMeshRef.current) mainMeshRef.current.visible = false;

      const bellGroup = createBellMesh();
      objectGroupRef.current.add(bellGroup);

      let step = 0;
      const bellInterval = setInterval(() => {
        step++;
        // Bell swinging animation
        bellGroup.rotation.z = Math.sin(step * 0.4) * 0.4;

        // Spawn expanding glowing soundwave rings
        if (step % 4 === 0) {
          const waveGeom = new THREE.TorusGeometry(1.8 + (step % 8) * 0.2, 0.04, 16, 32);
          const waveMat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            transparent: true,
            opacity: 0.8,
          });
          const wave = new THREE.Mesh(waveGeom, waveMat);
          wave.rotation.x = Math.PI / 2;
          objectGroupRef.current?.add(wave);

          // Expand & fade out wave
          let opacity = 0.8;
          const expandWave = setInterval(() => {
            wave.scale.addScalar(0.08);
            opacity -= 0.08;
            waveMat.opacity = Math.max(0, opacity);
            if (opacity <= 0) {
              clearInterval(expandWave);
              objectGroupRef.current?.remove(wave);
            }
          }, 40);
        }

        // Bell sparkles
        for (let k = 0; k < 6; k++) {
          activeParticlesRef.current.push({
            position: originPos.clone().add(new THREE.Vector3(
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 1
            )),
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1),
            color: new THREE.Color(0xfbcfe8),
            life: 1.0,
            size: 0.15,
          });
        }

        if (step > 32) {
          clearInterval(bellInterval);
          objectGroupRef.current?.remove(bellGroup);

          // Shatter bell into golden dust
          const fragmentCount = 180;
          const fragGeom = new THREE.IcosahedronGeometry(0.12, 0);
          const fragMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xd97706,
            metalness: 0.9,
            roughness: 0.2,
            transparent: true,
            opacity: 1,
          });

          for (let i = 0; i < fragmentCount; i++) {
            const shard = new THREE.Mesh(fragGeom, fragMat.clone());
            shard.position.set(
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 1
            );
            const vel = new THREE.Vector3(
              (Math.random() - 0.5) * 0.35,
              (Math.random() - 0.5) * 0.35,
              (Math.random() - 0.5) * 0.35
            );
            const rot = new THREE.Vector3(Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2);
            objectGroupRef.current?.add(shard);
            fragmentsRef.current.push({ mesh: shard, vel, rot });
          }

          finishDestruction(currentText, 'shatter');
        }
      }, 70);

    } else if (activeMethod === 'fart' || activeMethod === 'burn') {
      // Funny Fart Method (방귀소리 뿡뿡뿡뿡뿡뿡뿌웅)
      setStatusMessage('💨 뿡! 뿡! 뿡! 뿡! 뿡! 뿡! 뿌-웅~! 7연속 속 시원한 방귀 소리와 함께 답답함이 유쾌하게 소멸합니다!');
      audioSynth.playFart();

      if (mainMeshRef.current) mainMeshRef.current.visible = false;

      const fartMesh = createFartMesh();
      objectGroupRef.current.add(fartMesh);

      let step = 0;
      const fartInterval = setInterval(() => {
        step++;

        // Gas puff expansion & wobble
        fartMesh.scale.addScalar(0.015);
        fartMesh.position.y = Math.sin(step * 0.3) * 0.3;
        fartMesh.rotation.z = Math.sin(step * 0.4) * 0.15;

        // Lime & Cyan Gas Particles
        const gasColors = [0x84cc16, 0xa3e635, 0x4ade80, 0x22c55e, 0x10b981];
        for (let k = 0; k < 12; k++) {
          const colorHex = gasColors[Math.floor(Math.random() * gasColors.length)];
          activeParticlesRef.current.push({
            position: originPos.clone().add(new THREE.Vector3(
              (Math.random() - 0.5) * 3.5,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 1.5
            )),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.3,
              Math.random() * 0.25 + 0.1,
              (Math.random() - 0.5) * 0.3
            ),
            color: new THREE.Color(colorHex),
            life: 1.1,
            size: 0.32,
          });
        }

        if (step > 40) {
          clearInterval(fartInterval);
          objectGroupRef.current?.remove(fartMesh);
          finishDestruction(currentText, activeMethod);
        }
      }, 65);

    } else if (activeMethod === 'foghorn' || activeMethod === 'janggu' || activeMethod === 'laugh') {
      // Deep Ocean Ship Foghorn Method (뱃고동 소리 부우우웅 7연속)
      setStatusMessage('🚢 웅장한 뱃고동 소리 7연속 "부우우웅-!"과 함께 스트레스와 걱정이 저 먼 바다로 소멸합니다!');
      audioSynth.playFoghorn();

      if (mainMeshRef.current) mainMeshRef.current.visible = false;

      const foghornMesh = createFoghornMesh();
      objectGroupRef.current.add(foghornMesh);

      let step = 0;
      const foghornInterval = setInterval(() => {
        step++;

        // Gentle ship ocean sway & swell
        foghornMesh.rotation.z = Math.sin(step * 0.2) * 0.12;
        foghornMesh.rotation.x = Math.cos(step * 0.18) * 0.08;
        foghornMesh.position.y = Math.sin(step * 0.25) * 0.25;

        // Expanding white steam rings
        if (step % 5 === 0) {
          const steamGeom = new THREE.TorusGeometry(0.4 + (step % 10) * 0.15, 0.05, 12, 24);
          const steamMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.7 });
          const steam = new THREE.Mesh(steamGeom, steamMat);
          steam.position.set(0, 1.8, 0);
          steam.rotation.x = Math.PI / 2;
          objectGroupRef.current?.add(steam);

          let op = 0.7;
          const expandSteam = setInterval(() => {
            steam.scale.addScalar(0.08);
            steam.position.y += 0.05;
            op -= 0.07;
            steamMat.opacity = Math.max(0, op);
            if (op <= 0) {
              clearInterval(expandSteam);
              objectGroupRef.current?.remove(steam);
            }
          }, 45);
        }

        // Ocean Blue Sparkles
        const oceanColors = [0x38bdf8, 0x0284c7, 0x60a5fa, 0x93c5fd, 0x38bdf8];
        for (let k = 0; k < 10; k++) {
          const colorHex = oceanColors[Math.floor(Math.random() * oceanColors.length)];
          activeParticlesRef.current.push({
            position: originPos.clone().add(new THREE.Vector3(
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 1.5
            )),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.25,
              Math.random() * 0.2 + 0.08,
              (Math.random() - 0.5) * 0.25
            ),
            color: new THREE.Color(colorHex),
            life: 1.0,
            size: 0.25,
          });
        }

        if (step > 42) {
          clearInterval(foghornInterval);
          objectGroupRef.current?.remove(foghornMesh);
          finishDestruction(currentText, activeMethod);
        }
      }, 65);

    } else if (activeMethod === 'bowling' || activeMethod === 'lantern') {
      // Realistic Bowling Strike Method (3D 볼링 스트라이크 7연속 타격)
      setStatusMessage('🎳 묵직한 볼링공이 쾌속 돌진하며 10개의 고민 핀을 7연속 강렬한 스트라이크로 박살냅니다!');
      audioSynth.playBowling();

      if (mainMeshRef.current) mainMeshRef.current.visible = false;

      const bowlingGroup = createBowlingMesh();
      objectGroupRef.current.add(bowlingGroup);

      const ball = bowlingGroup.getObjectByName('bowlingBall');
      const pinsGroup = bowlingGroup.getObjectByName('pinsGroup');

      let step = 0;
      const bowlingInterval = setInterval(() => {
        step++;

        if (ball) {
          // Ball rolls fast forward towards pins
          ball.position.z -= 0.35;
          ball.rotation.x -= 0.45;
        }

        // When ball hits pins (~step 14)
        if (step > 13 && pinsGroup) {
          // Scatter pins in all directions
          pinsGroup.children.forEach((pin, i) => {
            pin.position.x += (Math.sin(i * 1.5 + step * 0.25) * 0.4);
            pin.position.y += Math.max(0, 0.25 - step * 0.006);
            pin.position.z -= 0.35;
            pin.rotation.x += 0.35;
            pin.rotation.y += 0.45;
            pin.rotation.z += 0.25;
          });

          // Explosive strike sparkles & pin fragments
          for (let k = 0; k < 12; k++) {
            activeParticlesRef.current.push({
              position: originPos.clone().add(new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 3
              )),
              velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.45,
                Math.random() * 0.35 + 0.15,
                (Math.random() - 0.5) * 0.45
              ),
              color: Math.random() > 0.4 ? new THREE.Color(0x38bdf8) : new THREE.Color(0xf43f5e),
              life: 1.0,
              size: 0.28,
            });
          }
        }

        if (step > 35) {
          clearInterval(bowlingInterval);
          objectGroupRef.current?.remove(bowlingGroup);
          finishDestruction(currentText, activeMethod);
        }
      }, 60);
    }
  };

  const finishDestruction = (textSnippet: string, method: DestroyMethod) => {
    // Record to local storage mind log
    recordDestroyedThought(textSnippet, method);

    // Clean fragments
    if (objectGroupRef.current) {
      fragmentsRef.current.forEach((frag) => {
        objectGroupRef.current?.remove(frag.mesh);
      });
      fragmentsRef.current = [];
    }

    if (mainMeshRef.current) {
      mainMeshRef.current.visible = false;
    }

    setDestroyedCount((prev) => prev + 1);
    setInputText('');
    setStatusMessage('✨ 고민이 흔적 없이 소멸되었습니다. 마음이 한결 가벼워졌기를 기대합니다.');

    setTimeout(() => {
      setIsDestroying(false);
      setIsAffirmationOpen(true);
    }, 600);
  };

  return (
    <div className="relative w-full h-[calc(100vh-100px)] min-h-[600px] bg-slate-950 overflow-hidden flex flex-col justify-between">
      
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Top Floating Info Bar */}
      <div className="relative z-10 p-4 max-w-7xl mx-auto w-full flex items-center justify-end pointer-events-none">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2 backdrop-blur-md text-xs text-slate-300 flex items-center gap-2 shadow-xl pointer-events-auto">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% 비저장 익명 소멸</span>
        </div>
      </div>

      {/* Left Overlay Side Panel for Input & Controls */}
      <div className="absolute left-4 sm:left-6 top-12 bottom-4 z-10 w-full max-w-sm sm:max-w-md pointer-events-none flex flex-col justify-center overflow-y-auto">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4 pointer-events-auto my-auto">
          
          {/* Header & Status Banner */}
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>답답한 마음, 지금 말하고 털어 버리세요</span>
            </h2>
            <p className="text-xs text-cyan-200 font-medium animate-in fade-in duration-300">
              {statusMessage}
            </p>
          </div>

          {/* Text Input */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isDestroying}
              placeholder="마음을 무겁게 만드는 스트레스, 불안, 억울함, 야근 스트레스를 자유롭게 적어보세요..."
              className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl p-4 text-slate-100 text-sm placeholder-slate-500 resize-none h-28 focus:outline-none transition-all"
            />
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 text-xs p-1 rounded-md bg-slate-800"
              >
                지우기
              </button>
            )}
          </div>

          {/* Method Selection & Execute Button */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              소멸 연출 방식 선택
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'shatter', label: '🔔 학교 종소리', desc: '황금 종 진동 소멸' },
                { id: 'bowling', label: '🎳 볼링 스트라이크', desc: '5연속 와르르 소멸' },
                { id: 'fart', label: '💨 방귀소리', desc: '뿡! 뿡! 뿡! 뿌웅~' },
                { id: 'foghorn', label: '🚢 뱃고동소리', desc: '부우우웅~! 깊은 울림' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMethod(m.id as DestroyMethod)}
                  disabled={isDestroying}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-50 ${
                    activeMethod === m.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold shadow-md'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold">{m.label}</div>
                  <div className="text-[10px] text-slate-500">{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Execute Button */}
            <button
              onClick={handleDestroy}
              disabled={isDestroying || !inputText.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {isDestroying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>소멸 연출 진행 중...</span>
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5" />
                  <span>소멸시키기 (우측 연출 관람)</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      <AffirmationModal
        isOpen={isAffirmationOpen}
        onClose={() => setIsAffirmationOpen(false)}
        onRestart={() => setInputText('')}
      />
    </div>
  );
};
