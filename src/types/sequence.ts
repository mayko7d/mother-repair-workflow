/**
 * Modelo de datos del contenido técnico.
 * Todo el contenido de las secuencias (pasos, señales, voltajes) se define con estos tipos
 * en `src/data/*.ts`, de modo que la UI no necesita cambiar para ampliar el temario.
 */

export type Instrument = 'multímetro' | 'osciloscopio';

/** Una medición concreta: qué señal, dónde, qué esperar y qué significa si falta. */
export interface Measurement {
  /** Nombre de la señal/riel. Ej: "+5VSB", "PS_ON#", "VCORE", "SLP_S3#". */
  signal: string;
  /** Punto físico de medición (pin, componente, riel). */
  point: string;
  /** Valor/estado esperado. Ej: "5 V", "0 V al pulsar", "3.3 V". */
  expected: string;
  /** Instrumento recomendado. */
  instrument: Instrument;
  /** Qué indica que esta señal no aparezca o esté fuera de rango. */
  failSymptom: string;
  /**
   * Explicación extensa de qué es esta señal/riel, por qué importa y cómo
   * diagnosticarla. Se muestra en el modal "Ampliar".
   */
  detail: string;
}

/** Un paso de la secuencia de encendido. */
export interface SequenceStep {
  id: string;
  /** Orden 1..n dentro de la secuencia. */
  order: number;
  title: string;
  /** Explicación breve de lo que ocurre en este paso. */
  summary: string;
  measurements: Measurement[];
}

export type SequenceId = 'laptop' | 'desktop';

/** Una secuencia completa de encendido (laptop o desktop). */
export interface PowerSequence {
  id: SequenceId;
  label: string;
  /** Subtítulo / plataforma de referencia. */
  platform: string;
  steps: SequenceStep[];
}
