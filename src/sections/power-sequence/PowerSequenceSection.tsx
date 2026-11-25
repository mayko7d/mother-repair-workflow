import { Suspense, lazy, useState } from 'react';
import type { SequenceId } from '../../types/sequence';
import { sequenceList, sequences } from '../../data';
import { useStepNavigation } from '../../hooks/useStepNavigation';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { SequenceSelector } from './SequenceSelector';
import { FlowDiagram } from './FlowDiagram';
import { StepControls } from './StepControls';
import { StepDetailPanel } from './StepDetailPanel';
import styles from './powerSequence.module.css';

// El canvas 3D se carga de forma diferida (code-splitting): no bloquea el primer render.
const SceneBackground = lazy(() =>
  import('../../three/SceneBackground').then((m) => ({ default: m.SceneBackground })),
);

export function PowerSequenceSection() {
  const [sequenceId, setSequenceId] = useState<SequenceId>('laptop');
  const sequence = sequences[sequenceId];
  const steps = sequence.steps;

  const { index, isFirst, isLast, next, prev, goTo } = useStepNavigation(steps.length);
  const reducedMotion = usePrefersReducedMotion();

  const progress = steps.length > 1 ? index / (steps.length - 1) : 0;

  return (
    <section className={styles.section} aria-labelledby="power-seq-title">
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.sectionKicker}>Sección 1</p>
          <h2 id="power-seq-title" className={styles.sectionTitle}>
            Secuencia de encendido
          </h2>
          <p className={styles.sectionPlatform}>{sequence.platform}</p>
        </div>
        <SequenceSelector sequences={sequenceList} value={sequenceId} onChange={setSequenceId} />
      </div>

      <div className={styles.stage}>
        <div className={styles.stageBg} aria-hidden="true">
          {reducedMotion ? (
            <div className={styles.stageBgStatic} />
          ) : (
            <Suspense fallback={<div className={styles.stageBgStatic} />}>
              <SceneBackground progress={progress} sequenceId={sequenceId} />
            </Suspense>
          )}
        </div>

        <div className={styles.stageContent}>
          <FlowDiagram steps={steps} activeIndex={index} onSelect={goTo} />
          <StepControls
            index={index}
            count={steps.length}
            isFirst={isFirst}
            isLast={isLast}
            onPrev={prev}
            onNext={next}
          />
        </div>
      </div>

      <p className={styles.hint}>
        Navega con <kbd>←</kbd> <kbd>→</kbd>, <kbd>Inicio</kbd> / <kbd>Fin</kbd>, o toca un nodo.
      </p>

      <StepDetailPanel step={steps[index]} total={steps.length} />
    </section>
  );
}
