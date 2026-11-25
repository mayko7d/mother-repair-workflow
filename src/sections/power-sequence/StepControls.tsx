import styles from './powerSequence.module.css';

interface Props {
  index: number;
  count: number;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** Controles de recorrido: anterior/siguiente + barra de progreso. */
export function StepControls({ index, count, isFirst, isLast, onPrev, onNext }: Props) {
  const progress = count > 1 ? (index / (count - 1)) * 100 : 0;

  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.navBtn}
        onClick={onPrev}
        disabled={isFirst}
        aria-label="Paso anterior"
      >
        ← Anterior
      </button>

      <div className={styles.progress}>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={count}
          aria-valuenow={index + 1}
          aria-label="Progreso de la secuencia"
        >
          <div className={styles.progressBar} style={{ inlineSize: `${progress}%` }} />
        </div>
        <span className={styles.progressLabel}>
          Paso <strong>{index + 1}</strong> de {count}
        </span>
      </div>

      <button
        type="button"
        className={styles.navBtn}
        onClick={onNext}
        disabled={isLast}
        aria-label="Paso siguiente"
      >
        Siguiente →
      </button>
    </div>
  );
}
