'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function Home() {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (buttonRef.current) {
      animate(buttonRef.current, {
        scale: [0.7, 1],
        opacity: [0, 1],
        duration: 1100,
        ease: 'out(3)',
      });

      animate(buttonRef.current, {
        translateY: [-5, 5],
        rotateX: [10, -10],
        duration: 2400,
        ease: 'inOut(sine)',
        direction: 'alternate',
        loop: true,
      });

      const handleDown = () => {
        animate(buttonRef.current as HTMLAnchorElement, {
          scale: 0.92,
          translateY: 2,
          duration: 120,
          ease: 'out(2)',
        });
      };

      const handleUp = () => {
        animate(buttonRef.current as HTMLAnchorElement, {
          scale: 1,
          translateY: 0,
          duration: 180,
          ease: 'out(2)',
        });
      };

      const handleEnter = () => {
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
      };

      const handleLeave = () => {
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      };

      buttonRef.current.addEventListener('pointerdown', handleDown);
      buttonRef.current.addEventListener('pointerup', handleUp);
      buttonRef.current.addEventListener('pointerleave', handleUp);
      buttonRef.current.addEventListener('pointerenter', handleEnter);
      buttonRef.current.addEventListener('pointerleave', handleLeave);

      return () => {
        buttonRef.current?.removeEventListener('pointerdown', handleDown);
        buttonRef.current?.removeEventListener('pointerup', handleUp);
        buttonRef.current?.removeEventListener('pointerleave', handleUp);
        buttonRef.current?.removeEventListener('pointerenter', handleEnter);
        buttonRef.current?.removeEventListener('pointerleave', handleLeave);
      };
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.4, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minDistance = 1.8;
    controls.maxDistance = 7;
    controls.target.set(0, 0.6, 0);
    controlsRef.current = controls;

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const loader = new GLTFLoader();
    const mixerRef: { current: THREE.AnimationMixer | null } = { current: null };
    let dancer: THREE.Group | null = null;

    loader.load('/assets/dancingchar.glb', (gltf) => {
      dancer = gltf.scene;
      dancer.position.set(0, -1.2, 0);
      dancer.scale.set(1.15, 1.15, 1.15);
      scene.add(dancer);

      if (gltf.animations.length > 0) {
        mixerRef.current = new THREE.AnimationMixer(dancer);
        const action = mixerRef.current.clipAction(gltf.animations[0]);
        action.play();
      }
    });

    const clock = new THREE.Clock();

    const animateFrame = () => {
      requestAnimationFrame(animateFrame);
      const delta = clock.getDelta();
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      if (dancer) {
        dancer.rotation.y += 0.002;
      }
      controls.update();
      renderer.render(scene, camera);
    };

    animateFrame();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      controlsRef.current = null;
      renderer.dispose();
      canvasRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      <div ref={canvasRef} className="absolute inset-0" />

      <Link
        ref={buttonRef}
        href="/scene"
        aria-label="Enter scene"
        className="relative z-10 flex h-14 w-28 items-center justify-center rounded-xl border border-white/60 bg-white/10 text-white shadow-[0_10px_24px_rgba(255,255,255,0.2)] transition"
        style={{ opacity: 0 }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14" />
          <path d="M13 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
