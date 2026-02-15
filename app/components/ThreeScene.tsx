'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

interface TouchControls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

interface KeyControls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
}

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerRef = useRef<THREE.Group | null>(null);
  const keyControlsRef = useRef<KeyControls>({
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
  });
  const touchControlsRef = useRef<TouchControls>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const playerVelocityRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isJumpingRef = useRef<boolean>(false);
  const isMobileRef = useRef<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  // Detect if device is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      const hasTouchSupport = () => {
        return (
          navigator.maxTouchPoints > 0 ||
          'ontouchstart' in window
        );
      };

      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || hasTouchSupport();

      isMobileRef.current = isMobileDevice;
      setIsMounted(true);
    };

    checkMobile();
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !isMounted) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 500, 2000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    scene.add(directionalLight);

    // Load models
    const loader = new GLTFLoader();
    let terrain: THREE.Group | null = null;

    // Load terrain
    loader.load(
      '/terrain.glb',
      (gltf) => {
        terrain = gltf.scene;
        terrain.castShadow = true;
        terrain.receiveShadow = true;
        terrain.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(terrain);
      },
      undefined,
      (error) => {
        console.warn('Could not load terrain.glb:', error);
        // Add fallback ground plane
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);
      }
    );

    // Load character
    loader.load(
      '/character.glb',
      (gltf) => {
        const character = gltf.scene;
        const playerGroup = new THREE.Group();
        playerGroup.add(character);
        playerGroup.position.set(0, 2, 0);
        playerGroup.castShadow = true;
        playerGroup.receiveShadow = true;

        character.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(playerGroup);
        playerRef.current = playerGroup;
        playerVelocityRef.current.y = 0;
      },
      undefined,
      (error) => {
        console.warn('Could not load character.glb:', error);
        // Add fallback character
        const characterGeometry = new THREE.BoxGeometry(1, 2, 1);
        const characterMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const characterMesh = new THREE.Mesh(characterGeometry, characterMaterial);
        characterMesh.castShadow = true;

        const playerGroup = new THREE.Group();
        playerGroup.add(characterMesh);
        playerGroup.position.set(0, 3, 0);
        scene.add(playerGroup);
        playerRef.current = playerGroup;
      }
    );

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keyControlsRef.current.up = true;
      if (key === 's' || key === 'arrowdown') keyControlsRef.current.down = true;
      if (key === 'a' || key === 'arrowleft') keyControlsRef.current.left = true;
      if (key === 'd' || key === 'arrowright') keyControlsRef.current.right = true;
      if (key === ' ') {
        keyControlsRef.current.space = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keyControlsRef.current.up = false;
      if (key === 's' || key === 'arrowdown') keyControlsRef.current.down = false;
      if (key === 'a' || key === 'arrowleft') keyControlsRef.current.left = false;
      if (key === 'd' || key === 'arrowright') keyControlsRef.current.right = false;
      if (key === ' ') {
        keyControlsRef.current.space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mobile touch controls
    const createTouchButton = (
      id: string,
      label: string,
      x: number,
      y: number,
      touchKey: keyof TouchControls
    ) => {
      if (!isMobileRef.current) return;

      const button = document.createElement('button');
      button.id = id;
      button.textContent = label;
      button.style.position = 'fixed';
      button.style.width = '60px';
      button.style.height = '60px';
      button.style.fontSize = '24px';
      button.style.bottom = `${y}px`;
      button.style.right = `${x}px`;
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      button.style.border = '2px solid #333';
      button.style.borderRadius = '8px';
      button.style.cursor = 'pointer';
      button.style.zIndex = '1000';
      button.style.userSelect = 'none';

      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControlsRef.current[touchKey] = true;
      });

      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControlsRef.current[touchKey] = false;
      });

      document.body.appendChild(button);
    };

    if (isMobileRef.current) {
      createTouchButton('btn-up', '▲', 70, 150, 'up');
      createTouchButton('btn-down', '▼', 70, 70, 'down');
      createTouchButton('btn-left', '◄', 140, 110, 'left');
      createTouchButton('btn-right', '▶', 10, 110, 'right');

      // Jump button
      const jumpButton = document.createElement('button');
      jumpButton.id = 'btn-jump';
      jumpButton.textContent = 'JUMP';
      jumpButton.style.position = 'fixed';
      jumpButton.style.width = '80px';
      jumpButton.style.height = '80px';
      jumpButton.style.fontSize = '16px';
      jumpButton.style.bottom = '20px';
      jumpButton.style.left = '20px';
      jumpButton.style.backgroundColor = 'rgba(200, 100, 255, 0.7)';
      jumpButton.style.border = '2px solid #333';
      jumpButton.style.borderRadius = '50%';
      jumpButton.style.cursor = 'pointer';
      jumpButton.style.zIndex = '1000';
      jumpButton.style.userSelect = 'none';

      let isJumpPressed = false;
      jumpButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!isJumpPressed) {
          isJumpPressed = true;
          if (!isJumpingRef.current && playerRef.current) {
            playerVelocityRef.current.y = 8;
            isJumpingRef.current = true;
          }
        }
      });

      jumpButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        isJumpPressed = false;
      });

      document.body.appendChild(jumpButton);
    }

    // Raycaster for ground collision detection
    const raycaster = new THREE.Raycaster();
    const downVector = new THREE.Vector3(0, -1, 0);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (!playerRef.current) {
        renderer.render(scene, camera);
        return;
      }

      // Get current controls
      const isUp = keyControlsRef.current.up || touchControlsRef.current.up;
      const isDown = keyControlsRef.current.down || touchControlsRef.current.down;
      const isLeft = keyControlsRef.current.left || touchControlsRef.current.left;
      const isRight = keyControlsRef.current.right || touchControlsRef.current.right;
      const isSpace = keyControlsRef.current.space;

      const speed = 0.3;
      const moveDirection = new THREE.Vector3(0, 0, 0);

      if (isUp) moveDirection.z -= speed;
      if (isDown) moveDirection.z += speed;
      if (isLeft) moveDirection.x -= speed;
      if (isRight) moveDirection.x += speed;

      // Apply movement
      playerVelocityRef.current.x = moveDirection.x;
      playerVelocityRef.current.z = moveDirection.z;

      // Apply gravity
      const gravity = 0.25;
      playerVelocityRef.current.y -= gravity;

      // Update position
      playerRef.current.position.add(playerVelocityRef.current);

      // Ground collision detection
      raycaster.ray.origin.copy(playerRef.current.position);
      raycaster.ray.direction.copy(downVector);

      let isOnGround = false;
      if (terrain) {
        const intersects = raycaster.intersectObject(terrain, true);
        if (intersects.length > 0 && intersects[0].distance < 2) {
          isOnGround = true;
          playerRef.current.position.y = intersects[0].point.y + 1;
          playerVelocityRef.current.y = 0;
          isJumpingRef.current = false;
        }
      } else {
        // Fallback ground collision (y = 0)
        if (playerRef.current.position.y < 1) {
          playerRef.current.position.y = 1;
          playerVelocityRef.current.y = 0;
          isJumpingRef.current = false;
          isOnGround = true;
        }
      }

      // Jump
      if (isSpace && isOnGround && !isJumpingRef.current) {
        playerVelocityRef.current.y = 8;
        isJumpingRef.current = true;
      }

      // Damping for horizontal movement
      playerVelocityRef.current.x *= 0.9;
      playerVelocityRef.current.z *= 0.9;

      // Limit max downward velocity
      if (playerVelocityRef.current.y < -20) {
        playerVelocityRef.current.y = -20;
      }

      // Rotate character to face movement direction
      if (moveDirection.length() > 0) {
        const angle = Math.atan2(moveDirection.x, moveDirection.z);
        playerRef.current.rotation.y = angle;
      }

      // Update camera to follow player
      const cameraOffset = new THREE.Vector3(0, 5, 15);
      cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRef.current.rotation.y);
      camera.position.lerp(
        playerRef.current.position.clone().add(cameraOffset),
        0.1
      );
      camera.lookAt(playerRef.current.position.clone().add(new THREE.Vector3(0, 2, 0)));

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);

      if (isMobileRef.current) {
        const buttons = ['btn-up', 'btn-down', 'btn-left', 'btn-right', 'btn-jump'];
        buttons.forEach((id) => {
          const btn = document.getElementById(id);
          if (btn) btn.remove();
        });
      }

      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [isMounted]);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
}
