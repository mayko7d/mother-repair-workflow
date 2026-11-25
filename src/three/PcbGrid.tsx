import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  /** 0..1, progreso del recorrido; mueve la "luz de escaneo". */
  progress: number;
  accent: string;
}

const COLS = 26;
const ROWS = 14;
const SPACING = 0.6;

/**
 * Malla tipo PCB: una rejilla de puntos emisivos sobre un plano, con una luz que
 * se desplaza lateralmente según el progreso del recorrido (efecto "escaneo").
 */
export function PcbGrid({ progress, accent }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(COLS * ROWS * 3);
    let i = 0;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        arr[i++] = (c - (COLS - 1) / 2) * SPACING;
        arr[i++] = 0;
        arr[i++] = (r - (ROWS - 1) / 2) * SPACING;
      }
    }
    return arr;
  }, []);

  const halfWidth = ((COLS - 1) * SPACING) / 2;

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
    if (lightRef.current) {
      // Mapear progreso [0..1] -> posición X [-halfWidth..halfWidth], con suavizado.
      const targetX = -halfWidth + progress * halfWidth * 2;
      lightRef.current.position.x = THREE.MathUtils.damp(
        lightRef.current.position.x,
        targetX,
        3,
        delta,
      );
      lightRef.current.position.z =
        Math.sin(state.clock.elapsedTime * 0.6) * 1.5;
    }
  });

  return (
    <group ref={groupRef} rotation={[-Math.PI / 3.2, 0, 0]} position={[0, -0.5, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.11}
          sizeAttenuation
          color={accent}
          transparent
          opacity={0.8}
        />
      </points>

      <pointLight ref={lightRef} color={accent} intensity={26} distance={7} decay={2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[COLS * SPACING, ROWS * SPACING]} />
        <meshStandardMaterial
          color="#0a0e14"
          metalness={0.2}
          roughness={0.9}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}
