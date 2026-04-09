import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ── Firefly Particles ──────────────────────────────────────────────────────
const vertexShader = `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aOffset;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    float t = uTime * aSpeed + aOffset;
    pos.x += sin(t * 0.7) * 0.4;
    pos.y += cos(t * 0.5) * 0.3 + sin(uTime * 0.3 + aOffset) * 0.15;
    pos.z += sin(t * 0.9 + 1.5) * 0.25;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = 0.4 + 0.6 * abs(sin(t * 0.5));
  }
`;

const fragmentShader = `
  varying float vAlpha;
  uniform vec3 uColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 2.0);
    gl_FragColor = vec4(uColor, strength * vAlpha);
  }
`;

function FireflyParticles({ count = 120 }) {
  const meshRef = useRef();
  const timeRef = useRef(0);

  const [positions, sizes, speeds, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const sp = new Float32Array(count);
    const off = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      pos[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.sin(phi) + (Math.random() - 0.5) * 2;
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
      sz[i] = 2 + Math.random() * 4;
      sp[i] = 0.3 + Math.random() * 0.7;
      off[i] = Math.random() * Math.PI * 2;
    }
    return [pos, sz, sp, off];
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#D4A853') },
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = timeRef.current;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aOffset" args={[offsets, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ── Procedural Dog ─────────────────────────────────────────────────────────
function DogMesh({ mousePos }) {
  const groupRef = useRef();
  const breathRef = useRef(0);

  useFrame((state) => {
    breathRef.current = state.clock.elapsedTime;
    if (!groupRef.current) return;
    const t = breathRef.current;

    // Slow rotation
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.3;

    // Breathing
    const breath = 1 + Math.sin(t * 1.8) * 0.025;
    groupRef.current.scale.set(breath, breath, breath);

    // Mouse reaction
    groupRef.current.rotation.x = mousePos.current.y * 0.15;
    groupRef.current.rotation.z = -mousePos.current.x * 0.08;
  });

  const mat = <meshStandardMaterial color="#C4956A" roughness={0.7} metalness={0.05} />;
  const darkMat = <meshStandardMaterial color="#8B5E3C" roughness={0.8} metalness={0.0} />;
  const noseMat = <meshStandardMaterial color="#3D2B1F" roughness={0.9} />;
  const eyeMat = <meshStandardMaterial color="#1A1A1A" roughness={0.2} metalness={0.3} />;

  return (
    <group ref={groupRef} position={[-1.4, 0.2, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        {mat}
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.65, 0.15]}>
        <sphereGeometry args={[0.36, 24, 24]} />
        {mat}
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.52, 0.46]}>
        <sphereGeometry args={[0.17, 16, 16]} />
        {darkMat}
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.56, 0.62]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        {noseMat}
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.14, 0.73, 0.29]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        {eyeMat}
      </mesh>
      <mesh position={[0.14, 0.73, 0.29]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        {eyeMat}
      </mesh>
      {/* Ears */}
      <mesh position={[-0.3, 0.88, 0]} rotation={[0, 0, 0.4]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        {darkMat}
      </mesh>
      <mesh position={[0.3, 0.88, 0]} rotation={[0, 0, -0.4]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        {darkMat}
      </mesh>
      {/* Front legs */}
      <mesh position={[-0.22, -0.42, 0.18]} rotation={[0.3, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 8, 12]} />
        {mat}
      </mesh>
      <mesh position={[0.22, -0.42, 0.18]} rotation={[0.3, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 8, 12]} />
        {mat}
      </mesh>
      {/* Back legs */}
      <mesh position={[-0.24, -0.42, -0.2]}>
        <capsuleGeometry args={[0.11, 0.38, 8, 12]} />
        {mat}
      </mesh>
      <mesh position={[0.24, -0.42, -0.2]}>
        <capsuleGeometry args={[0.11, 0.38, 8, 12]} />
        {mat}
      </mesh>
      {/* Tail */}
      <TailWag />
    </group>
  );
}

function TailWag() {
  const tailRef = useRef();
  useFrame((state) => {
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.5;
    }
  });
  return (
    <mesh ref={tailRef} position={[0, 0.05, -0.6]} rotation={[0.8, 0, 0]}>
      <capsuleGeometry args={[0.07, 0.45, 6, 10]} />
      <meshStandardMaterial color="#C4956A" roughness={0.7} />
    </mesh>
  );
}

// ── Procedural Cat ─────────────────────────────────────────────────────────
function CatMesh({ mousePos }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.25 + 1) * 0.3;
    const breath = 1 + Math.sin(t * 1.4) * 0.02;
    groupRef.current.scale.set(breath, breath, breath);
    groupRef.current.rotation.x = mousePos.current.y * 0.12;
    groupRef.current.rotation.z = mousePos.current.x * 0.07;
  });

  const catMat = <meshStandardMaterial color="#E8D5B0" roughness={0.6} metalness={0.05} />;
  const darkCatMat = <meshStandardMaterial color="#C4A882" roughness={0.75} />;
  const noseMat = <meshStandardMaterial color="#E8A0B0" roughness={0.9} />;
  const eyeMat = <meshStandardMaterial color="#4CAF50" roughness={0.1} metalness={0.4} emissive="#2D7A2D" emissiveIntensity={0.3} />;

  return (
    <group ref={groupRef} position={[1.4, 0.1, 0]}>
      {/* Body */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.44, 24, 24]} />
        {catMat}
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.6, 0.1]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        {catMat}
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.5, 0.38]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        {darkCatMat}
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.54, 0.49]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        {noseMat}
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.13, 0.67, 0.25]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        {eyeMat}
      </mesh>
      <mesh position={[0.13, 0.67, 0.25]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        {eyeMat}
      </mesh>
      {/* Pointed Ears */}
      <mesh position={[-0.22, 0.88, 0.05]} rotation={[0.1, 0, -0.2]}>
        <coneGeometry args={[0.1, 0.22, 8]} />
        {catMat}
      </mesh>
      <mesh position={[0.22, 0.88, 0.05]} rotation={[0.1, 0, 0.2]}>
        <coneGeometry args={[0.1, 0.22, 8]} />
        {catMat}
      </mesh>
      {/* Front legs */}
      <mesh position={[-0.18, -0.45, 0.15]} rotation={[0.2, 0, 0]}>
        <capsuleGeometry args={[0.09, 0.36, 8, 12]} />
        {catMat}
      </mesh>
      <mesh position={[0.18, -0.45, 0.15]} rotation={[0.2, 0, 0]}>
        <capsuleGeometry args={[0.09, 0.36, 8, 12]} />
        {catMat}
      </mesh>
      {/* Back legs */}
      <mesh position={[-0.2, -0.45, -0.15]}>
        <capsuleGeometry args={[0.1, 0.34, 8, 12]} />
        {catMat}
      </mesh>
      <mesh position={[0.2, -0.45, -0.15]}>
        <capsuleGeometry args={[0.1, 0.34, 8, 12]} />
        {catMat}
      </mesh>
      {/* Tail */}
      <CatTail />
    </group>
  );
}

function CatTail() {
  const ref = useRef();
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 1.5) * 0.6 + 0.3;
      ref.current.rotation.x = 0.5 + Math.sin(s.clock.elapsedTime * 0.8) * 0.2;
    }
  });
  return (
    <mesh ref={ref} position={[0.1, -0.1, -0.55]} rotation={[0.5, 0, 0.3]}>
      <capsuleGeometry args={[0.055, 0.65, 6, 10]} />
      <meshStandardMaterial color="#E8D5B0" roughness={0.6} />
    </mesh>
  );
}

// ── Ground glow ─────────────────────────────────────────────────────────────
function GroundGlow() {
  const ref = useRef();
  useFrame((s) => {
    if (ref.current) {
      ref.current.material.opacity = 0.12 + Math.sin(s.clock.elapsedTime * 0.6) * 0.04;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial color="#D4A853" transparent opacity={0.12} />
    </mesh>
  );
}

// ── Camera rig following mouse ──────────────────────────────────────────────
function CameraRig({ mousePos }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mousePos.current.x * 0.4 - camera.position.x) * 0.03;
    camera.position.y += (mousePos.current.y * 0.2 + 0.5 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── Main Scene ──────────────────────────────────────────────────────────────
export default function Scene({ scrollProgress }) {
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 5.5], fov: 55 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#0D1B08']} />
      <fog attach="fog" args={['#0D1B08', 8, 20]} />

      <ambientLight intensity={0.4} color="#F5F0E8" />
      <pointLight position={[0, 3, 2]} intensity={1.5} color="#D4A853" distance={10} />
      <pointLight position={[-3, 0, 1]} intensity={0.6} color="#2D5016" distance={8} />
      <pointLight position={[3, 0, 1]} intensity={0.6} color="#8B5E3C" distance={8} />
      <directionalLight position={[0, 5, 5]} intensity={0.8} color="#F5F0E8" />

      <CameraRig mousePos={mousePos} />

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.4}>
        <DogMesh mousePos={mousePos} />
      </Float>

      <Float speed={1.0} rotationIntensity={0.12} floatIntensity={0.35} floatingRange={[-0.15, 0.15]}>
        <CatMesh mousePos={mousePos} />
      </Float>

      <FireflyParticles count={150} />
      <GroundGlow />

      <Stars radius={50} depth={30} count={800} factor={3} fade speed={0.5} />
    </Canvas>
  );
}
