import { PowerSequenceSection } from './sections/power-sequence/PowerSequenceSection';
import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            ⎓
          </span>
          <div>
            <p className={styles.kicker}>BoardsLab</p>
            <h1 className={styles.title}>Diagramas de reparación de motherboards</h1>
          </div>
        </div>
        <p className={styles.lead}>
          Recorre la <strong>secuencia de encendido</strong> paso a paso y aprende{' '}
          <strong>qué señal medir</strong>, <strong>en qué punto</strong> y{' '}
          <strong>qué voltaje esperar</strong> para diagnosticar la mayoría de placas.
        </p>
      </header>

      <main className={styles.main}>
        <PowerSequenceSection />
      </main>

      <footer className={styles.footer}>
        <p>
          Valores de referencia didáctica · varían según fabricante y modelo. Consulta siempre el
          esquemático y el boardview de la placa concreta.
        </p>
      </footer>
    </div>
  );
}
