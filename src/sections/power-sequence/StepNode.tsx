import type { SequenceStep } from '../../types/sequence';
import styles from './powerSequence.module.css';

type NodeState = 'visited' | 'active' | 'pending';

interface Props {
  step: SequenceStep;
  state: NodeState;
  onSelect: () => void;
}

/** Un nodo del flujo: número de orden + título, con estado activo/visitado/pendiente. */
export function StepNode({ step, state, onSelect }: Props) {
  return (
    <li className={styles.nodeItem}>
      <button
        type="button"
        className={styles.node}
        data-state={state}
        aria-current={state === 'active' ? 'step' : undefined}
        onClick={onSelect}
      >
        <span className={styles.nodeOrder}>{step.order}</span>
        <span className={styles.nodeTitle}>{step.title}</span>
      </button>
    </li>
  );
}
