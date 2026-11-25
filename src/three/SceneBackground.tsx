import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { SequenceId } from '../types/sequence';
import { PcbGrid } from './PcbGrid';

interface Props {
  progress: number;
  sequenceId: SequenceId;
}

// Acento por secuencia (coincide con el tema).
const ACCENT: Record<SequenceId, string> = {
  laptop: '#35e08a',
  desktop: '#4aa8ff',
};

/**
 * Capa 3D de fondo (react-three-fiber). No captura el puntero (la UI va encima).
 * Se pausa cuando la pestaña no está visible para ahorrar recursos.
 */
export function SceneBackground({ progress, sequenceId }: Props) {
  const [visible, setVisible] = useState(
    typeof document === 'undefined' ? true : !document.hidden,
  );

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 3, 7], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={visible ? 'always' : 'never'}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.25} />
      <PcbGrid progress={progress} accent={ACCENT[sequenceId]} />
    </Canvas>
  );
}
