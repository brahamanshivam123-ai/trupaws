import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// ════════════════════════════════════════════════════════════════════════════
// PALETTE
// ════════════════════════════════════════════════════════════════════════════

const DOG = {
  main:   '#C4956A',  // warm golden coat
  light:  '#E0C090',  // lighter belly/chest
  dark:   '#9A7040',  // darker back/ears
  darker: '#7A5828',  // paw pads, ear edges
  nose:   '#120A04',  // near-black wet nose
  eye:    '#1A0A00',  // dark eye base
  iris:   '#8B4000',  // amber-brown iris
  shine:  '#FFFFFF',
};

const CAT = {
  main:     '#E8D5B0',  // cream coat
  light:    '#F5EDD8',  // near-white belly
  dark:     '#C8B090',  // slightly darker back
  tabby:    '#B0906A',  // tabby tone
  earInner: '#FFB8C0',  // pink inner ear
  nose:     '#FF9898',  // pink nose
  iris:     '#2ECC40',  // vivid green
  pupil:    '#050505',  // black
  shine:    '#FFFFFF',
  whisker:  '#F8F4EC',
};

// ════════════════════════════════════════════════════════════════════════════
// GLSL — FIREFLIES
// ════════════════════════════════════════════════════════════════════════════

const FIREFLY_VERT = `
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
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vAlpha = 0.35 + 0.65 * abs(sin(t * 0.5));
  }
`;
const FIREFLY_FRAG = `
  varying float vAlpha;
  uniform vec3 uColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float s = pow(1.0 - d * 2.0, 2.5);
    gl_FragColor = vec4(uColor, s * vAlpha);
  }
`;

// ════════════════════════════════════════════════════════════════════════════
// GLSL — STARS (blue-white, twinkling)
// ════════════════════════════════════════════════════════════════════════════

const STAR_VERT = `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aOffset;
  attribute vec3  aColor;
  uniform float uTime;
  varying float vAlpha;
  varying vec3  vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (500.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
    vAlpha = 0.6 + 0.4 * sin(uTime * aSpeed + aOffset);
    vColor = aColor;
  }
`;
const STAR_FRAG = `
  varying float vAlpha;
  varying vec3  vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.12, r);
    float glow = 1.0 - smoothstep(0.0, 0.5, r);
    float b = core * 0.85 + glow * 0.35;
    gl_FragColor = vec4(vColor, b * vAlpha);
  }
`;

// ════════════════════════════════════════════════════════════════════════════
// GLSL — AURORA BOREALIS
// ════════════════════════════════════════════════════════════════════════════

const AURORA_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const AURORA_FRAG = `
  uniform float uTime;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float snoise(float x) {
    float i = floor(x); float f = fract(x);
    float u = f*f*(3.0-2.0*f);
    return mix(hash(i), hash(i+1.0), u);
  }

  void main() {
    vec2 uv = vUv;

    // fade at vertical edges and horizontal edges
    float vFade = smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.48, uv.y);
    float hFade = smoothstep(0.0, 0.08, uv.x) * smoothstep(1.0, 0.92, uv.x);

    float aurora = 0.0;
    for (int i = 0; i < 9; i++) {
      float fi = float(i);
      float spd  = 0.055 + fi * 0.022;
      float n1 = snoise(fi * 4.7  + uTime * spd) * 2.0 - 1.0;
      float n2 = snoise(fi * 3.11 + uTime * spd * 0.65 + 10.0) * 2.0 - 1.0;

      float xWave = uv.x * (2.2 + fi * 0.38) + n1 * 2.8 + uTime * 0.13;
      float yBase = 0.28 + fi * 0.045;
      float yWave = sin(xWave) * 0.055 + n2 * 0.025;

      float yRel = uv.y - yBase + yWave + 0.14;
      float band = smoothstep(0.0, 0.28, yRel) * smoothstep(0.58, 0.28, yRel);
      float pulse = 0.18 + 0.17 * sin(uTime * (0.22 + fi * 0.07) + fi * 1.85);
      aurora += band * pulse;
    }

    aurora = clamp(aurora * vFade * hFade, 0.0, 1.0);

    float cy = uv.y + sin(uv.x * 2.0 + uTime * 0.1) * 0.04;
    vec3 col = mix(
      vec3(0.0,  0.62, 0.20),   // bright forest green
      vec3(0.0,  0.52, 0.52),   // deep teal
      smoothstep(0.22, 0.58, cy)
    );
    col = mix(col, vec3(0.32, 0.08, 0.62), smoothstep(0.52, 0.88, cy));
    // Column brightness shimmer
    col *= 0.75 + 0.55 * snoise(uv.x * 5.5 + uTime * 0.28);

    gl_FragColor = vec4(col, aurora * 0.68);
  }
`;

// ════════════════════════════════════════════════════════════════════════════
// GLSL — GROUND MIST
// ════════════════════════════════════════════════════════════════════════════

const MIST_VERT = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const MIST_FRAG = `
  varying vec2 vUv;
  void main() {
    float r = length(vUv - vec2(0.5)) * 1.9;
    float a = (1.0 - smoothstep(0.1, 1.0, r)) * 0.18;
    gl_FragColor = vec4(0.06, 0.11, 0.07, a);
  }
`;

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT — Star Field
// ════════════════════════════════════════════════════════════════════════════

function StarField({ count = 1800 }) {
  const ref = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  const [positions, sizes, speeds, offsets, colors] = useMemo(() => {
    const pos   = new Float32Array(count * 3);
    const sz    = new Float32Array(count);
    const sp    = new Float32Array(count);
    const off   = new Float32Array(count);
    const col   = new Float32Array(count * 3);

    // Blue-white palette
    const palette = [
      [1.00, 1.00, 1.00],   // pure white       40%
      [0.85, 0.92, 1.00],   // blue-white        30%
      [0.90, 0.95, 1.00],   // pale blue         20%
      [0.95, 0.97, 1.00],   // near-white-blue   10%
    ];
    const weights = [0.4, 0.3, 0.2, 0.1];

    for (let i = 0; i < count; i++) {
      // Distribute on back-facing hemisphere + wide spread
      const r     = 36 + Math.random() * 6;
      const phi   = Math.random() * Math.PI * 0.72;           // 0..130° from -z axis
      const theta = Math.random() * Math.PI * 2;
      pos[i*3]   =  r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] =  r * Math.sin(phi) * Math.sin(theta) - 4; // shift down slightly
      pos[i*3+2] = -r * Math.cos(phi) - 8;                   // push behind scene

      // Weighted random size
      const rnd = Math.random();
      if (rnd < 0.6)        sz[i] = 0.8 + Math.random() * 1.0;  // small
      else if (rnd < 0.88)  sz[i] = 1.8 + Math.random() * 1.4;  // medium
      else                  sz[i] = 3.2 + Math.random() * 2.8;  // bright

      sp[i]  = 0.3 + Math.random() * 2.2;
      off[i] = Math.random() * Math.PI * 2;

      // Pick color
      let cum = 0; let ci = 0;
      const cr = Math.random();
      for (let k = 0; k < weights.length; k++) {
        cum += weights[k];
        if (cr < cum) { ci = k; break; }
      }
      col[i*3]   = palette[ci][0];
      col[i*3+1] = palette[ci][1];
      col[i*3+2] = palette[ci][2];
    }
    return [pos, sz, sp, off, col];
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.material.uniforms.uTime.value += delta;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aOffset"  args={[offsets, 1]} />
        <bufferAttribute attach="attributes-aColor"   args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={STAR_VERT}
        fragmentShader={STAR_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT — Aurora Sky
// ════════════════════════════════════════════════════════════════════════════

function AuroraSky() {
  const ref = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.material.uniforms.uTime.value += delta;
  });
  return (
    <mesh ref={ref} position={[0, 1.5, -13]}>
      <planeGeometry args={[42, 12, 1, 1]} />
      <shaderMaterial
        vertexShader={AURORA_VERT}
        fragmentShader={AURORA_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT — Ground Mist
// ════════════════════════════════════════════════════════════════════════════

function GroundMist() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]}>
      <planeGeometry args={[14, 14]} />
      <shaderMaterial
        vertexShader={MIST_VERT}
        fragmentShader={MIST_FRAG}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT — Firefly Particles
// ════════════════════════════════════════════════════════════════════════════

function FireflyParticles({ count = 130 }) {
  const ref = useRef();
  const uniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uColor: { value: new THREE.Color('#D4A853') },
  }), []);

  const [positions, sizes, speeds, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz  = new Float32Array(count);
    const sp  = new Float32Array(count);
    const off = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.random() * 2.8;
      const t = Math.random() * Math.PI * 2;
      const p = (Math.random() - 0.5) * Math.PI;
      pos[i*3]   = r * Math.cos(t) * Math.cos(p);
      pos[i*3+1] = r * Math.sin(p) + (Math.random() - 0.5) * 1.5;
      pos[i*3+2] = r * Math.sin(t) * Math.cos(p);
      sz[i]  = 1.8 + Math.random() * 3.5;
      sp[i]  = 0.25 + Math.random() * 0.65;
      off[i] = Math.random() * Math.PI * 2;
    }
    return [pos, sz, sp, off];
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.material.uniforms.uTime.value += delta;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aOffset"  args={[offsets, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={FIREFLY_VERT}
        fragmentShader={FIREFLY_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT — Realistic Dog (Golden / Lab mix)
// ════════════════════════════════════════════════════════════════════════════

function DogTailWag() {
  const baseRef = useRef();
  const midRef  = useRef();
  useFrame((s) => {
    const wag = Math.sin(s.clock.elapsedTime * 4.6) * 0.48;
    if (baseRef.current) { baseRef.current.rotation.z = wag; }
    if (midRef.current)  { midRef.current.rotation.z  = wag * 0.55; }
  });
  return (
    <group position={[0, 0.08, -0.62]}>
      <group ref={baseRef} rotation={[-0.35, 0, 0]}>
        <mesh position={[0, 0.22, 0]}>
          <capsuleGeometry args={[0.088, 0.30, 8, 12]} />
          <meshPhysicalMaterial color={DOG.main}  roughness={0.88} sheen={0.5} sheenRoughness={0.85} />
        </mesh>
        <group ref={midRef} position={[0, 0.44, 0]} rotation={[0.45, 0, 0]}>
          <mesh position={[0, 0.18, 0]}>
            <capsuleGeometry args={[0.062, 0.25, 6, 10]} />
            <meshPhysicalMaterial color={DOG.light} roughness={0.85} sheen={0.3} sheenRoughness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function DetailedDog({ mousePos }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.28) * 0.32 - 0.15;
    const b = 1 + Math.sin(t * 1.75) * 0.022;
    groupRef.current.scale.set(b, b, b);
    groupRef.current.rotation.x =  mousePos.current.y * 0.14;
    groupRef.current.rotation.z = -mousePos.current.x * 0.08;
  });

  return (
    <group ref={groupRef} position={[-1.55, 0.15, 0]}>

      {/* ── TORSO ── */}
      {/* Main body — elongated oval */}
      <mesh scale={[0.66, 0.54, 0.96]}>
        <sphereGeometry args={[0.72, 32, 24]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.55} sheenRoughness={0.85} />
      </mesh>
      {/* Chest bulge forward */}
      <mesh position={[0, -0.03, 0.52]} scale={[0.58, 0.53, 0.56]}>
        <sphereGeometry args={[0.62, 24, 20]} />
        <meshPhysicalMaterial color={DOG.light} roughness={0.85} sheen={0.4} sheenRoughness={0.88} />
      </mesh>
      {/* Haunches — slightly raised rear */}
      <mesh position={[0, 0.06, -0.50]} scale={[0.62, 0.57, 0.58]}>
        <sphereGeometry args={[0.62, 24, 20]} />
        <meshPhysicalMaterial color={DOG.dark} roughness={0.9} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      {/* Belly underside — lighter */}
      <mesh position={[0, -0.42, 0.04]} scale={[0.46, 0.24, 0.82]}>
        <sphereGeometry args={[0.62, 20, 16]} />
        <meshPhysicalMaterial color={DOG.light} roughness={0.82} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      {/* Left shoulder bulk */}
      <mesh position={[-0.30, 0.1, 0.32]} scale={[0.40, 0.36, 0.44]}>
        <sphereGeometry args={[0.60, 16, 14]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.45} sheenRoughness={0.85} />
      </mesh>
      {/* Right shoulder bulk */}
      <mesh position={[ 0.30, 0.1, 0.32]} scale={[0.40, 0.36, 0.44]}>
        <sphereGeometry args={[0.60, 16, 14]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.45} sheenRoughness={0.85} />
      </mesh>

      {/* ── NECK ── */}
      <mesh position={[0, 0.42, 0.30]} rotation={[-0.52, 0, 0]}>
        <capsuleGeometry args={[0.155, 0.28, 10, 14]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.87} sheen={0.5} sheenRoughness={0.86} />
      </mesh>
      {/* Throat/dewlap */}
      <mesh position={[0, 0.34, 0.44]} scale={[0.62, 0.44, 0.44]}>
        <sphereGeometry args={[0.32, 16, 14]} />
        <meshPhysicalMaterial color={DOG.light} roughness={0.84} sheen={0.3} sheenRoughness={0.9} />
      </mesh>

      {/* ── HEAD ── */}
      {/* Cranium */}
      <mesh position={[0, 0.76, 0.44]}>
        <sphereGeometry args={[0.335, 32, 28]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.87} sheen={0.55} sheenRoughness={0.84} />
      </mesh>
      {/* Forehead dome */}
      <mesh position={[0, 0.87, 0.30]} scale={[0.78, 0.56, 0.56]}>
        <sphereGeometry args={[0.29, 20, 18]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.87} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Occipital bump (back of skull) */}
      <mesh position={[0, 0.88, 0.26]} scale={[0.5, 0.5, 0.45]}>
        <sphereGeometry args={[0.22, 14, 12]} />
        <meshPhysicalMaterial color={DOG.dark} roughness={0.9} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      {/* Stop — brow ridge dip */}
      <mesh position={[0, 0.79, 0.53]} scale={[0.78, 0.52, 0.58]}>
        <sphereGeometry args={[0.14, 14, 12]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.87} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Upper muzzle — rectangular snout */}
      <mesh position={[0, 0.70, 0.72]} scale={[0.70, 0.42, 0.96]}>
        <sphereGeometry args={[0.27, 22, 18]} />
        <meshPhysicalMaterial color={DOG.dark} roughness={0.90} sheen={0.35} sheenRoughness={0.88} />
      </mesh>
      {/* Muzzle tip round */}
      <mesh position={[0, 0.70, 0.90]} scale={[0.6, 0.58, 0.52]}>
        <sphereGeometry args={[0.20, 18, 16]} />
        <meshPhysicalMaterial color={DOG.dark} roughness={0.90} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      {/* Lower jaw */}
      <mesh position={[0, 0.61, 0.70]} scale={[0.64, 0.33, 0.90]}>
        <sphereGeometry args={[0.25, 20, 16]} />
        <meshPhysicalMaterial color={DOG.light} roughness={0.85} sheen={0.35} sheenRoughness={0.9} />
      </mesh>
      {/* Chin */}
      <mesh position={[0, 0.56, 0.80]} scale={[0.55, 0.36, 0.52]}>
        <sphereGeometry args={[0.18, 14, 12]} />
        <meshPhysicalMaterial color={DOG.light} roughness={0.84} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      {/* Left cheek pad */}
      <mesh position={[-0.20, 0.70, 0.60]} scale={[0.64, 0.70, 0.74]}>
        <sphereGeometry args={[0.155, 14, 12]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Right cheek pad */}
      <mesh position={[ 0.20, 0.70, 0.60]} scale={[0.64, 0.70, 0.74]}>
        <sphereGeometry args={[0.155, 14, 12]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.5} sheenRoughness={0.85} />
      </mesh>

      {/* ── NOSE ── */}
      <mesh position={[0, 0.725, 0.945]} scale={[0.78, 0.58, 0.52]}>
        <sphereGeometry args={[0.1, 16, 14]} />
        <meshStandardMaterial color={DOG.nose} roughness={0.25} metalness={0.12} />
      </mesh>
      {/* Left nostril */}
      <mesh position={[-0.042, 0.71, 0.99]}>
        <sphereGeometry args={[0.026, 8, 8]} />
        <meshStandardMaterial color={DOG.nose} roughness={0.2} />
      </mesh>
      {/* Right nostril */}
      <mesh position={[ 0.042, 0.71, 0.99]}>
        <sphereGeometry args={[0.026, 8, 8]} />
        <meshStandardMaterial color={DOG.nose} roughness={0.2} />
      </mesh>

      {/* ── EYES ── */}
      {/* Left eye socket shadow */}
      <mesh position={[-0.158, 0.785, 0.565]} scale={[0.9, 0.9, 0.6]}>
        <sphereGeometry args={[0.082, 16, 14]} />
        <meshPhysicalMaterial color={DOG.darker} roughness={0.9} sheen={0.2} sheenRoughness={0.9} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.155, 0.785, 0.590]}>
        <sphereGeometry args={[0.072, 18, 16]} />
        <meshPhysicalMaterial color={DOG.eye} roughness={0.04} metalness={0.1} clearcoat={1.0} clearcoatRoughness={0.04} />
      </mesh>
      {/* Left iris */}
      <mesh position={[-0.155, 0.785, 0.634]} scale={[0.88, 0.88, 0.5]}>
        <sphereGeometry args={[0.058, 14, 12]} />
        <meshPhysicalMaterial color={DOG.iris} roughness={0.18} clearcoat={0.8} clearcoatRoughness={0.08} />
      </mesh>
      {/* Left highlight */}
      <mesh position={[-0.138, 0.800, 0.648]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshStandardMaterial color={DOG.shine} emissive={DOG.shine} emissiveIntensity={0.9} roughness={0} />
      </mesh>
      {/* Left brow ridge */}
      <mesh position={[-0.16, 0.846, 0.538]} rotation={[0.28, 0.08, 0.22]} scale={[0.85, 0.55, 1.0]}>
        <capsuleGeometry args={[0.025, 0.09, 5, 7]} />
        <meshPhysicalMaterial color={DOG.darker} roughness={0.9} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      {/* Right eye socket shadow */}
      <mesh position={[ 0.158, 0.785, 0.565]} scale={[0.9, 0.9, 0.6]}>
        <sphereGeometry args={[0.082, 16, 14]} />
        <meshPhysicalMaterial color={DOG.darker} roughness={0.9} sheen={0.2} sheenRoughness={0.9} />
      </mesh>
      {/* Right eye */}
      <mesh position={[ 0.155, 0.785, 0.590]}>
        <sphereGeometry args={[0.072, 18, 16]} />
        <meshPhysicalMaterial color={DOG.eye} roughness={0.04} metalness={0.1} clearcoat={1.0} clearcoatRoughness={0.04} />
      </mesh>
      {/* Right iris */}
      <mesh position={[ 0.155, 0.785, 0.634]} scale={[0.88, 0.88, 0.5]}>
        <sphereGeometry args={[0.058, 14, 12]} />
        <meshPhysicalMaterial color={DOG.iris} roughness={0.18} clearcoat={0.8} clearcoatRoughness={0.08} />
      </mesh>
      {/* Right highlight */}
      <mesh position={[ 0.172, 0.800, 0.648]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshStandardMaterial color={DOG.shine} emissive={DOG.shine} emissiveIntensity={0.9} roughness={0} />
      </mesh>
      {/* Right brow ridge */}
      <mesh position={[ 0.16, 0.846, 0.538]} rotation={[0.28, -0.08, -0.22]} scale={[0.85, 0.55, 1.0]}>
        <capsuleGeometry args={[0.025, 0.09, 5, 7]} />
        <meshPhysicalMaterial color={DOG.darker} roughness={0.9} sheen={0.3} sheenRoughness={0.9} />
      </mesh>

      {/* ── EARS (floppy, hanging) ── */}
      {/* Left ear — upper flap */}
      <mesh position={[-0.305, 0.88, 0.34]} scale={[0.44, 0.56, 0.20]} rotation={[0.05, 0.06, 0.18]}>
        <sphereGeometry args={[0.44, 16, 14]} />
        <meshPhysicalMaterial color={DOG.dark} roughness={0.91} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      {/* Left ear — droop lobe */}
      <mesh position={[-0.330, 0.66, 0.28]} scale={[0.36, 0.50, 0.17]} rotation={[0.08, 0.04, 0.22]}>
        <sphereGeometry args={[0.40, 14, 12]} />
        <meshPhysicalMaterial color={DOG.dark} roughness={0.92} sheen={0.25} sheenRoughness={0.9} />
      </mesh>
      {/* Left ear — inner lighter surface */}
      <mesh position={[-0.270, 0.84, 0.38]} scale={[0.30, 0.46, 0.08]} rotation={[0.02, 0.04, 0.16]}>
        <sphereGeometry args={[0.40, 12, 10]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.4} sheenRoughness={0.86} />
      </mesh>
      {/* Right ear — upper flap */}
      <mesh position={[ 0.305, 0.88, 0.34]} scale={[0.44, 0.56, 0.20]} rotation={[0.05, -0.06, -0.18]}>
        <sphereGeometry args={[0.44, 16, 14]} />
        <meshPhysicalMaterial color={DOG.dark} roughness={0.91} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      {/* Right ear — droop lobe */}
      <mesh position={[ 0.330, 0.66, 0.28]} scale={[0.36, 0.50, 0.17]} rotation={[0.08, -0.04, -0.22]}>
        <sphereGeometry args={[0.40, 14, 12]} />
        <meshPhysicalMaterial color={DOG.dark} roughness={0.92} sheen={0.25} sheenRoughness={0.9} />
      </mesh>
      {/* Right ear — inner */}
      <mesh position={[ 0.270, 0.84, 0.38]} scale={[0.30, 0.46, 0.08]} rotation={[0.02, -0.04, -0.16]}>
        <sphereGeometry args={[0.40, 12, 10]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.4} sheenRoughness={0.86} />
      </mesh>

      {/* ── FRONT LEGS (left) ── */}
      {/* Left upper foreleg */}
      <mesh position={[-0.27, -0.24, 0.46]} rotation={[0.12, 0, -0.04]}>
        <capsuleGeometry args={[0.105, 0.36, 8, 12]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Left lower foreleg */}
      <mesh position={[-0.27, -0.62, 0.50]} rotation={[0.06, 0, -0.02]}>
        <capsuleGeometry args={[0.086, 0.32, 7, 10]} />
        <meshPhysicalMaterial color={DOG.light} roughness={0.85} sheen={0.4} sheenRoughness={0.88} />
      </mesh>
      {/* Left front paw */}
      <mesh position={[-0.27, -0.86, 0.52]} scale={[1.18, 0.60, 1.40]}>
        <sphereGeometry args={[0.115, 14, 12]} />
        <meshPhysicalMaterial color={DOG.darker} roughness={0.92} sheen={0.2} sheenRoughness={0.9} />
      </mesh>
      {/* Left paw toes hint */}
      {[-0.06, 0, 0.06].map((xo, idx) => (
        <mesh key={idx} position={[-0.27 + xo, -0.875, 0.575]}>
          <sphereGeometry args={[0.036, 8, 7]} />
          <meshPhysicalMaterial color={DOG.darker} roughness={0.92} />
        </mesh>
      ))}

      {/* ── FRONT LEGS (right) ── */}
      <mesh position={[ 0.27, -0.24, 0.46]} rotation={[0.12, 0, 0.04]}>
        <capsuleGeometry args={[0.105, 0.36, 8, 12]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      <mesh position={[ 0.27, -0.62, 0.50]} rotation={[0.06, 0, 0.02]}>
        <capsuleGeometry args={[0.086, 0.32, 7, 10]} />
        <meshPhysicalMaterial color={DOG.light} roughness={0.85} sheen={0.4} sheenRoughness={0.88} />
      </mesh>
      <mesh position={[ 0.27, -0.86, 0.52]} scale={[1.18, 0.60, 1.40]}>
        <sphereGeometry args={[0.115, 14, 12]} />
        <meshPhysicalMaterial color={DOG.darker} roughness={0.92} sheen={0.2} sheenRoughness={0.9} />
      </mesh>
      {[-0.06, 0, 0.06].map((xo, idx) => (
        <mesh key={idx} position={[0.27 + xo, -0.875, 0.575]}>
          <sphereGeometry args={[0.036, 8, 7]} />
          <meshPhysicalMaterial color={DOG.darker} roughness={0.92} />
        </mesh>
      ))}

      {/* ── BACK LEGS (left) — dog hock anatomy ── */}
      {/* Left thigh */}
      <mesh position={[-0.275, -0.16, -0.44]} rotation={[-0.18, 0, -0.08]}>
        <capsuleGeometry args={[0.130, 0.38, 8, 12]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Left hock — angles forward (reverse knee) */}
      <mesh position={[-0.280, -0.54, -0.30]} rotation={[0.60, 0, -0.05]}>
        <capsuleGeometry args={[0.092, 0.30, 7, 10]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.45} sheenRoughness={0.86} />
      </mesh>
      {/* Left back paw */}
      <mesh position={[-0.280, -0.75, -0.12]} scale={[1.18, 0.58, 1.38]}>
        <sphereGeometry args={[0.108, 12, 10]} />
        <meshPhysicalMaterial color={DOG.darker} roughness={0.92} sheen={0.2} sheenRoughness={0.9} />
      </mesh>

      {/* ── BACK LEGS (right) ── */}
      <mesh position={[ 0.275, -0.16, -0.44]} rotation={[-0.18, 0, 0.08]}>
        <capsuleGeometry args={[0.130, 0.38, 8, 12]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      <mesh position={[ 0.280, -0.54, -0.30]} rotation={[0.60, 0, 0.05]}>
        <capsuleGeometry args={[0.092, 0.30, 7, 10]} />
        <meshPhysicalMaterial color={DOG.main} roughness={0.88} sheen={0.45} sheenRoughness={0.86} />
      </mesh>
      <mesh position={[ 0.280, -0.75, -0.12]} scale={[1.18, 0.58, 1.38]}>
        <sphereGeometry args={[0.108, 12, 10]} />
        <meshPhysicalMaterial color={DOG.darker} roughness={0.92} sheen={0.2} sheenRoughness={0.9} />
      </mesh>

      {/* ── TAIL ── */}
      <DogTailWag />
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT — Realistic Cat (British Shorthair / cream)
// ════════════════════════════════════════════════════════════════════════════

function CatTailRaise() {
  const baseRef = useRef();
  const tipRef  = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (baseRef.current) {
      baseRef.current.rotation.z = Math.sin(t * 1.4) * 0.55 + 0.2;
      baseRef.current.rotation.x = -0.55;
    }
    if (tipRef.current) {
      tipRef.current.rotation.z = Math.sin(t * 1.2 + 0.6) * 0.35;
      tipRef.current.rotation.x = 0.5;
    }
  });
  return (
    <group position={[0.06, -0.08, -0.54]}>
      <group ref={baseRef}>
        <mesh position={[0, 0.28, 0]}>
          <capsuleGeometry args={[0.058, 0.50, 7, 10]} />
          <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.5} sheenRoughness={0.85} />
        </mesh>
        <group ref={tipRef} position={[0, 0.62, 0]}>
          <mesh position={[0, 0.20, 0]}>
            <capsuleGeometry args={[0.038, 0.36, 5, 8]} />
            <meshPhysicalMaterial color={CAT.dark} roughness={0.88} sheen={0.4} sheenRoughness={0.87} />
          </mesh>
          {/* Tail tip */}
          <mesh position={[0, 0.41, 0]}>
            <sphereGeometry args={[0.05, 10, 8]} />
            <meshPhysicalMaterial color={CAT.tabby} roughness={0.9} sheen={0.3} sheenRoughness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function DetailedCat({ mousePos }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.24 + 1.1) * 0.32 + 0.18;
    const b = 1 + Math.sin(t * 1.42) * 0.018;
    groupRef.current.scale.set(b, b, b);
    groupRef.current.rotation.x =  mousePos.current.y * 0.12;
    groupRef.current.rotation.z =  mousePos.current.x * 0.07;
  });

  return (
    <group ref={groupRef} position={[1.55, 0.05, 0]}>

      {/* ── BODY — slim, slightly elongated ── */}
      {/* Main torso */}
      <mesh scale={[0.56, 0.50, 0.90]}>
        <sphereGeometry args={[0.62, 28, 22]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.52} sheenRoughness={0.84} />
      </mesh>
      {/* Chest */}
      <mesh position={[0, -0.02, 0.44]} scale={[0.50, 0.46, 0.50]}>
        <sphereGeometry args={[0.55, 22, 18]} />
        <meshPhysicalMaterial color={CAT.light} roughness={0.84} sheen={0.4} sheenRoughness={0.87} />
      </mesh>
      {/* Haunches — slightly wider rear */}
      <mesh position={[0, 0.04, -0.44]} scale={[0.58, 0.52, 0.54]}>
        <sphereGeometry args={[0.56, 22, 18]} />
        <meshPhysicalMaterial color={CAT.dark} roughness={0.88} sheen={0.35} sheenRoughness={0.88} />
      </mesh>
      {/* Belly — lighter */}
      <mesh position={[0, -0.38, 0.02]} scale={[0.42, 0.22, 0.78]}>
        <sphereGeometry args={[0.55, 18, 14]} />
        <meshPhysicalMaterial color={CAT.light} roughness={0.82} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      {/* Shoulder blades subtle */}
      <mesh position={[-0.24, 0.08, 0.28]} scale={[0.34, 0.30, 0.38]}>
        <sphereGeometry args={[0.52, 14, 12]} />
        <meshPhysicalMaterial color={CAT.dark} roughness={0.88} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      <mesh position={[ 0.24, 0.08, 0.28]} scale={[0.34, 0.30, 0.38]}>
        <sphereGeometry args={[0.52, 14, 12]} />
        <meshPhysicalMaterial color={CAT.dark} roughness={0.88} sheen={0.3} sheenRoughness={0.9} />
      </mesh>

      {/* ── NECK — slim ── */}
      <mesh position={[0, 0.36, 0.26]} rotation={[-0.48, 0, 0]}>
        <capsuleGeometry args={[0.118, 0.22, 8, 12]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.5} sheenRoughness={0.84} />
      </mesh>

      {/* ── HEAD — perfectly round ── */}
      <mesh position={[0, 0.68, 0.36]}>
        <sphereGeometry args={[0.305, 30, 26]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.54} sheenRoughness={0.83} />
      </mesh>
      {/* Forehead */}
      <mesh position={[0, 0.78, 0.24]} scale={[0.80, 0.56, 0.52]}>
        <sphereGeometry args={[0.24, 18, 16]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.5} sheenRoughness={0.84} />
      </mesh>
      {/* Muzzle area — flat round pad */}
      <mesh position={[0, 0.62, 0.56]} scale={[0.78, 0.52, 0.58]}>
        <sphereGeometry args={[0.20, 18, 16]} />
        <meshPhysicalMaterial color={CAT.light} roughness={0.84} sheen={0.35} sheenRoughness={0.88} />
      </mesh>
      {/* Left whisker pad */}
      <mesh position={[-0.12, 0.618, 0.56]} scale={[0.55, 0.60, 0.52]}>
        <sphereGeometry args={[0.14, 14, 12]} />
        <meshPhysicalMaterial color={CAT.light} roughness={0.84} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      {/* Right whisker pad */}
      <mesh position={[ 0.12, 0.618, 0.56]} scale={[0.55, 0.60, 0.52]}>
        <sphereGeometry args={[0.14, 14, 12]} />
        <meshPhysicalMaterial color={CAT.light} roughness={0.84} sheen={0.3} sheenRoughness={0.9} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.645, 0.648]} scale={[0.82, 0.55, 0.50]}>
        <sphereGeometry args={[0.050, 12, 10]} />
        <meshStandardMaterial color={CAT.nose} roughness={0.5} />
      </mesh>
      {/* Mouth line */}
      <mesh position={[0, 0.612, 0.640]} scale={[0.45, 0.22, 0.35]}>
        <sphereGeometry args={[0.060, 10, 8]} />
        <meshPhysicalMaterial color={CAT.tabby} roughness={0.9} />
      </mesh>

      {/* ── EYES — almond-shaped, vivid green ── */}
      {/* Left eye socket */}
      <mesh position={[-0.138, 0.715, 0.470]} scale={[1.35, 0.78, 0.72]}>
        <sphereGeometry args={[0.080, 16, 14]} />
        <meshPhysicalMaterial color={CAT.dark} roughness={0.88} />
      </mesh>
      {/* Left iris — almond */}
      <mesh position={[-0.134, 0.714, 0.498]} scale={[1.30, 0.74, 0.68]}>
        <sphereGeometry args={[0.076, 18, 16]} />
        <meshPhysicalMaterial
          color={CAT.iris} roughness={0.06} metalness={0.0}
          clearcoat={1.0} clearcoatRoughness={0.04}
          emissive="#1A6020" emissiveIntensity={0.45}
        />
      </mesh>
      {/* Left pupil — vertical slit */}
      <mesh position={[-0.134, 0.714, 0.545]} scale={[0.28, 0.84, 0.55]}>
        <sphereGeometry args={[0.070, 12, 10]} />
        <meshStandardMaterial color={CAT.pupil} roughness={0.05} />
      </mesh>
      {/* Left eye shine */}
      <mesh position={[-0.118, 0.730, 0.555]}>
        <sphereGeometry args={[0.015, 6, 5]} />
        <meshStandardMaterial color={CAT.shine} emissive={CAT.shine} emissiveIntensity={1.2} roughness={0} />
      </mesh>
      {/* Right eye socket */}
      <mesh position={[ 0.138, 0.715, 0.470]} scale={[1.35, 0.78, 0.72]}>
        <sphereGeometry args={[0.080, 16, 14]} />
        <meshPhysicalMaterial color={CAT.dark} roughness={0.88} />
      </mesh>
      {/* Right iris */}
      <mesh position={[ 0.134, 0.714, 0.498]} scale={[1.30, 0.74, 0.68]}>
        <sphereGeometry args={[0.076, 18, 16]} />
        <meshPhysicalMaterial
          color={CAT.iris} roughness={0.06} metalness={0.0}
          clearcoat={1.0} clearcoatRoughness={0.04}
          emissive="#1A6020" emissiveIntensity={0.45}
        />
      </mesh>
      {/* Right pupil */}
      <mesh position={[ 0.134, 0.714, 0.545]} scale={[0.28, 0.84, 0.55]}>
        <sphereGeometry args={[0.070, 12, 10]} />
        <meshStandardMaterial color={CAT.pupil} roughness={0.05} />
      </mesh>
      {/* Right shine */}
      <mesh position={[ 0.150, 0.730, 0.555]}>
        <sphereGeometry args={[0.015, 6, 5]} />
        <meshStandardMaterial color={CAT.shine} emissive={CAT.shine} emissiveIntensity={1.2} roughness={0} />
      </mesh>

      {/* ── EARS — pointed, upright ── */}
      {/* Left ear outer cone */}
      <mesh position={[-0.22, 0.93, 0.22]} rotation={[0.08, -0.08, -0.18]}>
        <coneGeometry args={[0.115, 0.28, 10]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Left ear inner pink */}
      <mesh position={[-0.215, 0.91, 0.24]} rotation={[0.06, -0.08, -0.18]} scale={[0.55, 0.68, 0.45]}>
        <coneGeometry args={[0.115, 0.26, 10]} />
        <meshStandardMaterial color={CAT.earInner} roughness={0.7} />
      </mesh>
      {/* Left ear base bulge */}
      <mesh position={[-0.22, 0.82, 0.26]} scale={[0.50, 0.36, 0.36]}>
        <sphereGeometry args={[0.24, 12, 10]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Right ear outer */}
      <mesh position={[ 0.22, 0.93, 0.22]} rotation={[0.08, 0.08,  0.18]}>
        <coneGeometry args={[0.115, 0.28, 10]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Right ear inner */}
      <mesh position={[ 0.215, 0.91, 0.24]} rotation={[0.06, 0.08, 0.18]} scale={[0.55, 0.68, 0.45]}>
        <coneGeometry args={[0.115, 0.26, 10]} />
        <meshStandardMaterial color={CAT.earInner} roughness={0.7} />
      </mesh>
      {/* Right ear base */}
      <mesh position={[ 0.22, 0.82, 0.26]} scale={[0.50, 0.36, 0.36]}>
        <sphereGeometry args={[0.24, 12, 10]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.5} sheenRoughness={0.85} />
      </mesh>

      {/* ── WHISKERS (6 per side) ── */}
      {[-0.04, 0, 0.04].map((yo, i) => (
        <mesh key={`wl${i}`} position={[-0.26, 0.618 + yo, 0.50]} rotation={[0, -0.08, (i - 1) * 0.14]}>
          <capsuleGeometry args={[0.004, 0.30, 3, 4]} />
          <meshStandardMaterial color={CAT.whisker} transparent opacity={0.85} />
        </mesh>
      ))}
      {[-0.04, 0, 0.04].map((yo, i) => (
        <mesh key={`wr${i}`} position={[ 0.26, 0.618 + yo, 0.50]} rotation={[0, 0.08, (i - 1) * -0.14]}>
          <capsuleGeometry args={[0.004, 0.30, 3, 4]} />
          <meshStandardMaterial color={CAT.whisker} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* ── FRONT LEGS — slim, graceful ── */}
      {/* Left front upper */}
      <mesh position={[-0.20, -0.28, 0.40]} rotation={[0.14, 0, -0.04]}>
        <capsuleGeometry args={[0.090, 0.34, 7, 10]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Left front lower */}
      <mesh position={[-0.20, -0.62, 0.44]} rotation={[0.06, 0, -0.02]}>
        <capsuleGeometry args={[0.072, 0.28, 6, 8]} />
        <meshPhysicalMaterial color={CAT.light} roughness={0.84} sheen={0.4} sheenRoughness={0.87} />
      </mesh>
      {/* Left front paw */}
      <mesh position={[-0.20, -0.82, 0.46]} scale={[1.12, 0.55, 1.32]}>
        <sphereGeometry args={[0.095, 12, 10]} />
        <meshPhysicalMaterial color={CAT.dark} roughness={0.90} sheen={0.25} sheenRoughness={0.9} />
      </mesh>
      {/* Right front upper */}
      <mesh position={[ 0.20, -0.28, 0.40]} rotation={[0.14, 0, 0.04]}>
        <capsuleGeometry args={[0.090, 0.34, 7, 10]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Right front lower */}
      <mesh position={[ 0.20, -0.62, 0.44]} rotation={[0.06, 0, 0.02]}>
        <capsuleGeometry args={[0.072, 0.28, 6, 8]} />
        <meshPhysicalMaterial color={CAT.light} roughness={0.84} sheen={0.4} sheenRoughness={0.87} />
      </mesh>
      {/* Right front paw */}
      <mesh position={[ 0.20, -0.82, 0.46]} scale={[1.12, 0.55, 1.32]}>
        <sphereGeometry args={[0.095, 12, 10]} />
        <meshPhysicalMaterial color={CAT.dark} roughness={0.90} sheen={0.25} sheenRoughness={0.9} />
      </mesh>

      {/* ── BACK LEGS ── */}
      {/* Left back thigh */}
      <mesh position={[-0.22, -0.16, -0.40]} rotation={[-0.20, 0, -0.07]}>
        <capsuleGeometry args={[0.110, 0.34, 7, 10]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Left back hock */}
      <mesh position={[-0.23, -0.50, -0.28]} rotation={[0.52, 0, -0.04]}>
        <capsuleGeometry args={[0.078, 0.26, 6, 8]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.45} sheenRoughness={0.86} />
      </mesh>
      {/* Left back paw */}
      <mesh position={[-0.23, -0.70, -0.10]} scale={[1.12, 0.55, 1.35]}>
        <sphereGeometry args={[0.090, 10, 8]} />
        <meshPhysicalMaterial color={CAT.dark} roughness={0.90} sheen={0.25} sheenRoughness={0.9} />
      </mesh>
      {/* Right back thigh */}
      <mesh position={[ 0.22, -0.16, -0.40]} rotation={[-0.20, 0, 0.07]}>
        <capsuleGeometry args={[0.110, 0.34, 7, 10]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.5} sheenRoughness={0.85} />
      </mesh>
      {/* Right back hock */}
      <mesh position={[ 0.23, -0.50, -0.28]} rotation={[0.52, 0, 0.04]}>
        <capsuleGeometry args={[0.078, 0.26, 6, 8]} />
        <meshPhysicalMaterial color={CAT.main} roughness={0.86} sheen={0.45} sheenRoughness={0.86} />
      </mesh>
      {/* Right back paw */}
      <mesh position={[ 0.23, -0.70, -0.10]} scale={[1.12, 0.55, 1.35]}>
        <sphereGeometry args={[0.090, 10, 8]} />
        <meshPhysicalMaterial color={CAT.dark} roughness={0.90} sheen={0.25} sheenRoughness={0.9} />
      </mesh>

      {/* ── TAIL ── */}
      <CatTailRaise />
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT — Camera Rig
// ════════════════════════════════════════════════════════════════════════════

function CameraRig({ mousePos }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mousePos.current.x * 0.38 - camera.position.x) * 0.028;
    camera.position.y += (mousePos.current.y * 0.18 + 0.5 - camera.position.y) * 0.028;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORT — Main Scene
// ════════════════════════════════════════════════════════════════════════════

export default function Scene() {
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth)  * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 5.5], fov: 55 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      dpr={[1, 1.8]}
    >
      {/* ── Sky ── */}
      <color attach="background" args={['#0A0F08']} />
      <fog attach="fog" args={['#0A0F08', 9, 22]} />

      {/* ── Background layers ── */}
      <AuroraSky />
      <StarField count={1800} />

      {/* ── Lighting — cool moonlight + warm fills ── */}
      <ambientLight intensity={0.22} color="#8090A8" />
      {/* Moonlight — cool directional key */}
      <directionalLight position={[-2, 6, 3]} intensity={0.90} color="#C8D8F0" />
      {/* Warm fill from front-low (campfire / porch light) */}
      <pointLight position={[0, -0.5, 3.5]} intensity={1.40} color="#D4A853" distance={9} decay={2} />
      {/* Left aurora rim */}
      <pointLight position={[-4, 2, -2]} intensity={0.45} color="#1A8050" distance={10} decay={2} />
      {/* Right warm accent */}
      <pointLight position={[ 4, 1,  0]} intensity={0.40} color="#8B5E3C" distance={8} decay={2} />
      {/* Top sparkle */}
      <pointLight position={[0, 4, 1]} intensity={0.55} color="#E0ECFF" distance={8} decay={2} />

      <CameraRig mousePos={mousePos} />

      {/* ── Animals ── */}
      <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.38}>
        <DetailedDog mousePos={mousePos} />
      </Float>

      <Float speed={0.95} rotationIntensity={0.10} floatIntensity={0.32} floatingRange={[-0.12, 0.12]}>
        <DetailedCat mousePos={mousePos} />
      </Float>

      {/* ── Atmosphere ── */}
      <FireflyParticles count={130} />
      <GroundMist />
    </Canvas>
  );
}
