# BoardsLab · Diagramas de reparación de motherboards

Web interactiva para aprender y diagnosticar la **reparación de motherboards** mediante
diagramas modernos. La primera sección es un **diagrama de la secuencia de encendido** que se
recorre paso a paso e indica, en cada paso, **qué señal medir, en qué punto, qué voltaje
esperar** y **qué significa si falta**. Cubre **laptops** y **placas de escritorio (ATX)**.

## Características

- 🔌 **Secuencia de encendido** recorrible paso a paso (botones, teclado `←/→` · `Inicio/Fin`, o clic en un nodo).
- 💻🖥️ **Dos recorridos** seleccionables: Laptop (11 pasos) y Desktop ATX (9 pasos).
- 📏 **Panel de mediciones** por paso: señal, punto, voltaje esperado, instrumento (multímetro/osciloscopio) y síntoma si falta.
- 🔎 **Modal "Ampliar explicación"** en cada medición con una descripción extensa de qué es la señal y cómo diagnosticarla.
- ✨ **Fondo 3D** (Three.js) tipo PCB con una luz que sigue el progreso, cargado de forma diferida y respetuoso con `prefers-reduced-motion`.

> ⚠️ Los voltajes y señales son **valores genéricos de referencia didáctica**; varían según
> fabricante y modelo. Consulta siempre el esquemático y el boardview de la placa concreta.

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Three.js](https://threejs.org/) vía [react-three-fiber](https://r3f.docs.pmnd.rs/) + [drei](https://github.com/pmndrs/drei)
- CSS nativo moderno (variables, nesting, container queries, `:has()`, `color-mix()`), elemento `<dialog>` nativo.

## Puesta en marcha

```bash
npm install
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # comprobación de tipos + build de producción
npm run preview  # sirve el build
```

## Estructura

```
src/
├─ types/sequence.ts        # modelo de datos (señales, pasos, secuencias)
├─ data/                    # contenido técnico: laptop.ts, desktop.ts
├─ sections/power-sequence/ # sección 1: flujo, panel, controles, modal
├─ three/                   # fondo 3D (react-three-fiber)
└─ hooks/                   # navegación por pasos, prefers-reduced-motion
```

Más detalles de diseño y del contenido técnico en [`DOCUMENTACION.md`](./DOCUMENTACION.md).
