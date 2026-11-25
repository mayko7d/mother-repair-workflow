import { useEffect, useRef } from 'react';
import type { Measurement } from '../../types/sequence';
import styles from './powerSequence.module.css';

interface Props {
  measurement: Measurement;
  /** Título del paso al que pertenece (contexto). */
  stepTitle: string;
  onClose: () => void;
}

/**
 * Modal con la explicación extensa de una medición.
 * Usa el elemento nativo <dialog> (Baseline): foco atrapado y cierre con Escape
 * gestionados por el navegador. Se cierra también al hacer clic en el fondo.
 */
export function MeasurementModal({ measurement, stepTitle, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (dlg && !dlg.open) dlg.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      aria-labelledby="measure-modal-title"
      onClose={onClose}
      onClick={(e) => {
        // Clic en el backdrop (el propio <dialog>) cierra.
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <div className={styles.modalInner}>
        <header className={styles.modalHead}>
          <div>
            <p className={styles.modalKicker}>{stepTitle}</p>
            <h3 id="measure-modal-title" className={styles.modalTitle}>
              {measurement.signal}
            </h3>
          </div>
          <button
            type="button"
            className={styles.modalClose}
            aria-label="Cerrar"
            onClick={() => dialogRef.current?.close()}
          >
            ✕
          </button>
        </header>

        <div className={styles.modalChips}>
          <span className={styles.modalChip}>
            <span className={styles.modalChipLabel}>Esperado</span>
            {measurement.expected}
          </span>
          <span className={styles.modalChip}>
            <span className={styles.modalChipLabel}>Instrumento</span>
            {measurement.instrument}
          </span>
        </div>

        <h4 className={styles.modalSectionTitle}>Punto de medición</h4>
        <p className={styles.modalText}>{measurement.point}</p>

        <h4 className={styles.modalSectionTitle}>Qué es y cómo diagnosticarlo</h4>
        <p className={styles.modalText}>{measurement.detail}</p>

        <h4 className={styles.modalSectionTitle}>Si falta o está fuera de rango</h4>
        <p className={styles.modalText}>{measurement.failSymptom}</p>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => dialogRef.current?.close()}
          >
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );
}
