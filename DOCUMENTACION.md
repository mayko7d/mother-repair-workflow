# BoardsLab — Documentación del proyecto

Web de **diagramas interactivos para la reparación de motherboards**. Primera sección:
**secuencia de encendido** recorrible paso a paso, indicando en cada paso **qué señal medir,
en qué punto, qué voltaje esperar** y **qué significa si falta**. Cubre **laptops** y
**desktop ATX** (dos recorridos seleccionables).

> Este archivo es la bitácora viva del proyecto: se actualiza a medida que se construye.

---

## 1. Stack y decisiones

| Área | Elección | Motivo |
|------|----------|--------|
| Bundler | **Vite 6** | Dev server rápido, build moderno (ESM). |
| UI | **React 18 + TypeScript** | Tipado del modelo de datos técnico. |
| 3D | **three + @react-three/fiber + @react-three/drei** | Three.js idiomático en React para el fondo/acentos 3D. |
| Estilos | **CSS nativo moderno** (variables, nesting, container queries, `:has()`, `color-mix()`, `clamp()`) | Sin framework UI pesado; alineado con `modern-web-guidance`. |
| Estado | **Hooks locales** | No hace falta librería de estado todavía. |

Decisiones de producto confirmadas con el usuario:
- **Placas:** ambas, laptop y desktop ATX, como dos secuencias independientes.
- **Visual:** flujo 2D nítido (SVG) navegable paso a paso + Three.js como fondo/acento 3D
  (no un modelo 3D de la placa).

### Principios `modern-web-guidance` aplicados
- Features **Baseline** y CSS nativo moderno; tema oscuro con `prefers-color-scheme`.
- **Rendimiento:** canvas 3D diferido (`React.lazy`), `dpr` acotado, animación pausable,
  respeto a `prefers-reduced-motion`.
- **Accesibilidad:** navegación por teclado, foco gestionado, roles/aria, contraste AA.
- **Dependencias mínimas.**

---

## 2. Estructura de carpetas

```
proyecto boards/
├─ index.html
├─ package.json / tsconfig*.json / vite.config.ts
├─ DOCUMENTACION.md          # este archivo (bitácora)
├─ src/
│  ├─ main.tsx               # bootstrap React
│  ├─ App.tsx                # layout: header + sección
│  ├─ styles/                # theme.css + base.css
│  ├─ types/sequence.ts      # tipos del modelo de datos
│  ├─ data/                  # laptop.ts, desktop.ts (contenido técnico)
│  ├─ sections/power-sequence/   # sección 1 (diagrama de encendido)
│  ├─ three/                 # SceneBackground + PcbGrid (R3F)
│  └─ hooks/                 # useStepNavigation
```

---

## 3. Modelo de datos

```ts
type Measurement = {
  signal: string;        // "+5VSB", "PS_ON#", "VCORE", "SLP_S3#"...
  point: string;         // dónde medir (pin / componente / riel)
  expected: string;      // voltaje / estado esperado
  instrument: 'multímetro' | 'osciloscopio';
  failSymptom: string;   // qué significa si no aparece
  detail: string;        // explicación extensa (se muestra en el modal "Ampliar")
};
type SequenceStep = { id; order; title; summary; measurements: Measurement[] };
type PowerSequence = { id: 'laptop' | 'desktop'; label; steps: SequenceStep[] };
```

El contenido técnico vive **100% en datos** (`src/data/*.ts`): añadir pasos o señales no
requiere tocar la UI.

---

## 4. Contenido técnico — Secuencia de encendido

> ⚠️ Valores **genéricos de referencia didáctica**. Varían según fabricante y modelo;
> consultar siempre el esquemático y el boardview de la placa concreta.

### 4.1 Laptop (plataforma Intel genérica)
1. **DC-in / adaptador** — entrada ~19 V en el jack y tras el MOSFET de entrada.
2. **Rieles always-on** — `+3V_ALW` (~3.3 V) y `+5V_ALW` (~5 V) presentes solo con adaptador.
3. **EC/KBC + RTC** — alimentación del Embedded Controller y `VCC_RTC` (~3 V pila CMOS);
   cristal RTC 32.768 kHz oscilando.
4. **Arranque del EC** — reloj y reset del EC OK; el EC queda a la espera del botón.
5. **PWRBTN# / ON_OFF** — al pulsar, la línea cae a 0 V momentáneamente (el EC lo detecta).
6. **RSMRST# → SLP_S5#/S4#/S3#** — se liberan y pasan a nivel alto (habilitan la plataforma).
7. **VRMs principales** — `VCCST`, `VCCIN/VCCSA`, `VDDQ` memoria (~1.1–1.35 V) y `VCORE`.
8. **CLK / PLL** — reloj principal presente.
9. **ALL_SYS_PWRGD / VR_READY** — todas las fuentes "buenas".
10. **PLTRST# / PROCPWRGD** — se libera el reset del CPU.
11. **SPI BIOS** — flash alimentada (1.8 V o 3.3 V) y actividad en el bus → POST.

### 4.2 Desktop ATX
1. **+5VSB (standby)** — pin púrpura del 24-pin; 5 V siempre que haya AC.
2. **PS_ON#** — pin verde; ~5 V en reposo, cae a 0 V al encender (lo fuerza el Super I/O/chipset).
3. **Rieles principales** — la PSU levanta `+12V`, `+5V`, `+3.3V` (medir en el 24-pin).
4. **PWR_OK / Power Good** — pin gris; sube a ~5 V cuando los rieles están estables.
5. **VRM del CPU** — `VCORE` (~1.0–1.4 V), `VCCSA`; rieles de RAM `VDDQ` y `VPP`.
6. **Rieles del chipset (PCH)** — p.ej. 1.05 V / 1.5 V.
7. **Generador de reloj** — reloj base 100 MHz activo.
8. **RESET# / PLTRST#** — se libera el reset.
9. **SPI BIOS/UEFI** — flash alimentada (1.8 V / 3.3 V) → POST.

---

## 5. Decisiones de implementación

- **Flujo 2D en HTML accesible (no SVG):** el "diagrama recorrible" se implementó como una
  riel (`<ol>`) de nodos que son `<button>` reales, conectados con líneas CSS. Es nítido,
  responsive y **accesible** (foco, roles, navegación por teclado) — más alineado con
  `modern-web-guidance` que un SVG con texto. El nombre de los componentes (`FlowDiagram`,
  `StepNode`) se mantiene.
- **Three.js como acento de fondo:** `three/SceneBackground` monta un `<Canvas>` de R3F con
  `PcbGrid` (rejilla de puntos tipo PCB + una luz que "escanea" según el progreso). Va detrás
  de la UI con `pointer-events: none`. Se **carga diferido** (`React.lazy`), se **pausa** con la
  pestaña oculta (`visibilitychange`) y **no se monta** si el usuario pide movimiento reducido
  (se muestra un degradado estático).
- **Navegación:** `useStepNavigation` centraliza el índice del paso y el teclado
  (`←/→`, `Inicio/Fin`). Al cambiar de secuencia, el recorrido vuelve al paso 1.
- **Scroll del riel:** el nodo activo se centra desplazando solo el riel horizontalmente
  (`scrollBy`), nunca la página; no se desplaza en el primer render.
- **Color por secuencia:** laptop = verde (`#35e08a`), desktop = azul (`#4aa8ff`), coherente
  en el tema y en la luz 3D.

## 6. Bitácora de avance

- **[init]** Scaffold manual de Vite + React + TS. Configs: `package.json`, `vite.config.ts`,
  `tsconfig.json`, `index.html`, `.gitignore`. Creada esta documentación.
  - Se eliminó `tsconfig.node.json` (project references daban conflicto `composite`/emit en esta
    versión de TS); se usa un único `tsconfig.json` y el build hace `tsc --noEmit && vite build`.
- **[sección 1]** Implementada la sección "Secuencia de encendido" completa: tipos, datos
  (laptop 11 pasos / desktop 9 pasos), selector, flujo navegable, controles con progreso,
  panel de mediciones y fondo 3D.
- **[verificación]** `tsc --noEmit` sin errores · `vite build` OK (bundle principal ~164 kB;
  Three.js en chunk aparte ~817 kB **cargado de forma diferida**). Probado en el navegador:
  cambio laptop/desktop, recorrido con botones/teclado/click, progreso, y responsive a 375 px
  sin scroll horizontal de página. Sin errores en consola.
- **[modal "Ampliar"]** Cada tarjeta de medición tiene un botón **"Ampliar explicación"** que
  abre un **modal** con una explicación extensa de qué es la señal y cómo diagnosticarla.
  - Nuevo campo `detail` en `Measurement`, rellenado para las 35 mediciones (laptop + desktop).
  - `MeasurementModal.tsx` usa el elemento **nativo `<dialog>`** (Baseline): foco atrapado y
    cierre con `Escape` los gestiona el navegador; se cierra también al hacer clic en el fondo
    o en los botones ✕ / Cerrar. Estilos con `::backdrop` + `backdrop-filter`.
  - Verificado: abre con el botón, muestra chips (Esperado/Instrumento), punto, explicación y
    síntoma; cierra con `Escape`. `tsc` y `vite build` OK.

---

## 7. Cómo ejecutar

```powershell
npm install
npm run dev
```

- `npm run dev` → servidor de desarrollo (Vite).
- `npm run build` → comprobación de tipos + build de producción.
- `npm run preview` → sirve el build.
