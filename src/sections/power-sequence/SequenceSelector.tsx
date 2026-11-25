import type { PowerSequence, SequenceId } from '../../types/sequence';
import styles from './powerSequence.module.css';

interface Props {
  sequences: PowerSequence[];
  value: SequenceId;
  onChange: (id: SequenceId) => void;
}

/** Tabs para elegir entre las secuencias (Laptop / Desktop ATX). */
export function SequenceSelector({ sequences, value, onChange }: Props) {
  return (
    <div className={styles.selector} role="tablist" aria-label="Tipo de placa">
      {sequences.map((seq) => {
        const selected = seq.id === value;
        return (
          <button
            key={seq.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={styles.tab}
            data-selected={selected}
            onClick={() => onChange(seq.id)}
          >
            {seq.label}
          </button>
        );
      })}
    </div>
  );
}
