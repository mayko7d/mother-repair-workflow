import { useState } from 'react';
import type { Measurement, SequenceStep } from '../../types/sequence';
import { MeasurementModal } from './MeasurementModal';
import styles from './powerSequence.module.css';

interface Props {
  step: SequenceStep;
  total: number;
}

/** Panel de detalle del paso activo: resumen + tarjetas de medición. */
export function StepDetailPanel({ step, total }: Props) {
  const [selected, setSelected] = useState<Measurement | null>(null);

  return (
    <article className={styles.detail} aria-live="polite">
      <header className={styles.detailHead}>
        <span className={styles.detailOrder}>
          {step.order}
          <span className={styles.detailOrderTotal}>/{total}</span>
        </span>
        <div>
          <h3 className={styles.detailTitle}>{step.title}</h3>
          <p className={styles.detailSummary}>{step.summary}</p>
        </div>
      </header>

      <h4 className={styles.measuresHeading}>Qué medir en este paso</h4>
      <ul className={styles.measures}>
        {step.measurements.map((m) => (
          <li key={m.signal} className={styles.measure}>
            <div className={styles.measureTop}>
              <span className={styles.signal}>{m.signal}</span>
              <span className={styles.expected}>{m.expected}</span>
            </div>
            <dl className={styles.measureMeta}>
              <div>
                <dt>Punto</dt>
                <dd>{m.point}</dd>
              </div>
              <div>
                <dt>Instrumento</dt>
                <dd>
                  <span className={styles.instrument} data-kind={m.instrument}>
                    {m.instrument}
                  </span>
                </dd>
              </div>
            </dl>
            <p className={styles.failSymptom}>
              <span className={styles.failBadge}>Si falta</span> {m.failSymptom}
            </p>
            <button
              type="button"
              className={styles.expandBtn}
              onClick={() => setSelected(m)}
              aria-haspopup="dialog"
            >
              Ampliar explicación
              <span aria-hidden="true">↗</span>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <MeasurementModal
          measurement={selected}
          stepTitle={step.title}
          onClose={() => setSelected(null)}
        />
      )}
    </article>
  );
}
