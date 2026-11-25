import type { PowerSequence } from '../types/sequence';

/**
 * Secuencia de encendido de una laptop (plataforma Intel genérica).
 * Valores de referencia didáctica: varían según fabricante/modelo. Consultar el
 * esquemático y el boardview de la placa concreta.
 */
export const laptopSequence: PowerSequence = {
  id: 'laptop',
  label: 'Laptop',
  platform: 'Plataforma Intel genérica (notebook)',
  steps: [
    {
      id: 'dc-in',
      order: 1,
      title: 'Adaptador / DC-in',
      summary:
        'Con el cargador conectado debe llegar el voltaje de entrada hasta el MOSFET de carga. Es la primera condición: sin entrada, nada arranca.',
      measurements: [
        {
          signal: 'DC_IN / ADAPTER',
          point: 'Jack de entrada y drenaje del MOSFET de carga',
          expected: '≈ 19 V (según adaptador)',
          instrument: 'multímetro',
          failSymptom:
            'Sin voltaje: revisar fusible de entrada, jack DC, cable/adaptador y el MOSFET de entrada.',
          detail:
            'Es el voltaje crudo del cargador (típicamente 19–20 V) que entra por el jack y pasa por un fusible y un MOSFET de protección/selección antes de alimentar al cargador (charger IC). Es el punto de partida absoluto: si aquí no hay voltaje estable, ningún convertidor posterior puede trabajar. Mide en el jack y en el drenaje del MOSFET de entrada; si llega al jack pero no sale del MOSFET, sospecha del propio MOSFET, de su señal de gate o del fusible/bobina en serie.',
        },
      ],
    },
    {
      id: 'always-on',
      order: 2,
      title: 'Rieles always-on',
      summary:
        'Un convertidor "siempre encendido" genera los rieles de servicio presentes solo con el adaptador, antes de pulsar el botón.',
      measurements: [
        {
          signal: '+3V_ALW (3VPCU / +3VSUS)',
          point: 'Bobina/condensador de salida del buck always-on de 3.3 V',
          expected: '3.3 V',
          instrument: 'multímetro',
          failSymptom: 'Sin 3.3 V ALW: controlador/buck always-on o su enable. Nada arranca.',
          detail:
            'Riel de servicio "siempre encendido" de 3.3 V que un convertidor buck genera en cuanto hay adaptador, aún sin pulsar el botón. Alimenta la lógica mínima: el EC, parte del chipset y la detección del botón. Sin este riel la placa está "muerta" aunque el cargador funcione. Verifica primero su señal de enable y la tensión de entrada del convertidor; un corto en este riel (consumo que calienta una bobina o un condensador) también lo tumba.',
        },
        {
          signal: '+5V_ALW (+5VSUS)',
          point: 'Salida del buck always-on de 5 V',
          expected: '5 V',
          instrument: 'multímetro',
          failSymptom: 'Sin 5 V ALW: mismo convertidor/controlador always-on.',
          detail:
            'Gemelo de 5 V del riel always-on, usado por puertos y lógica que requieren 5 V en reposo (por ejemplo USB de carga o algunos sensores). Suele salir del mismo controlador always-on que el de 3.3 V. Si falta solo el de 5 V y el de 3.3 V está bien, el problema está en esa rama concreta: su bobina, su MOSFET o la rama correspondiente del controlador.',
        },
      ],
    },
    {
      id: 'ec-rtc',
      order: 3,
      title: 'EC / KBC + RTC',
      summary:
        'El Embedded Controller (EC) recibe alimentación y necesita el reloj de tiempo real (RTC) oscilando para poder gestionar el encendido.',
      measurements: [
        {
          signal: 'VCC del EC (VCCKBC / +3VSUS)',
          point: 'Pin de alimentación del EC',
          expected: '3.3 V',
          instrument: 'multímetro',
          failSymptom: 'EC sin alimentación: no gestiona el botón ni habilita la plataforma.',
          detail:
            'El Embedded Controller (EC/KBC) es el "cerebro" que orquesta el encendido: lee el botón, habilita los rieles en orden y vigila temperaturas. Necesita su propia alimentación de 3.3 V derivada del riel always-on. Sin VCC del EC, nada responde al botón. Mídela en el pin de alimentación del EC y confirma que es estable y no intermitente.',
        },
        {
          signal: 'VCC_RTC / pila CMOS',
          point: 'Pin RTC del PCH / pila CMOS',
          expected: '≈ 3 V',
          instrument: 'multímetro',
          failSymptom: 'Pila agotada: no retiene hora/ajustes, arranque errático.',
          detail:
            'Alimentación del reloj de tiempo real, respaldada por la pila CMOS (~3 V) cuando no hay adaptador. Mantiene la hora y la configuración y es condición para que el chipset salga de reset (RTCRST#). Una pila agotada provoca arranques erráticos, pérdida de hora o que no encienda. Mide en la pila y en el pin RTC del chipset.',
        },
        {
          signal: '32.768 kHz',
          point: 'Patas del cristal RTC',
          expected: 'Oscilación ≈ 0.5–1 Vpp a 32.768 kHz',
          instrument: 'osciloscopio',
          failSymptom: 'Sin oscilación: cristal RTC o sus condensadores; el EC no arranca su lógica.',
          detail:
            'Es el cristal del RTC que genera el "tic" de referencia a 32.768 kHz. Si no oscila, el chipset no completa su inicialización y la placa no arranca. Obsérvalo con osciloscopio en las patas del cristal (onda senoidal de ~0.5–1 Vpp). Un cristal partido o un condensador de carga abierto detienen la oscilación.',
        },
      ],
    },
    {
      id: 'ec-boot',
      order: 4,
      title: 'Arranque del EC',
      summary:
        'Con alimentación y reloj, el EC sale de reset y ejecuta su firmware, quedando a la espera de la pulsación del botón.',
      measurements: [
        {
          signal: 'EC_RST# (reset del EC)',
          point: 'Pin de reset del EC',
          expected: 'Nivel alto (3.3 V) estable',
          instrument: 'multímetro',
          failSymptom: 'Reset retenido: alimentación/reloj del EC o el propio EC defectuoso.',
          detail:
            'Señal activa en bajo que mantiene al EC en reinicio hasta que su alimentación y su reloj son correctos. Debe quedar en alto (3.3 V) de forma estable para que el EC ejecute su firmware. Si se queda en bajo, revisa la fuente del reset (un supervisor de voltaje o el riel always-on) antes de culpar al EC. Un reset que oscila indica alimentación inestable.',
        },
      ],
    },
    {
      id: 'pwrbtn',
      order: 5,
      title: 'Botón de encendido (PWRBTN#)',
      summary:
        'Al pulsar el botón, la línea cae momentáneamente a 0 V. El EC detecta ese flanco e inicia la secuencia.',
      measurements: [
        {
          signal: 'PWRBTN# / ON_OFF',
          point: 'Pin del botón en el EC',
          expected: '3.3 V en reposo; cae a 0 V al pulsar',
          instrument: 'osciloscopio',
          failSymptom: 'Sin pulso: botón, pista rota o el EC no recibe la señal.',
          detail:
            'Línea del botón de encendido: en reposo está en alto (3.3 V) y cae a 0 V mientras lo pulsas. El EC detecta ese flanco descendente para iniciar la secuencia. Con osciloscopio verás un pulso limpio al pulsar; si no aparece, el fallo está en el botón, su pista o el pull-up. Si el pulso llega pero no ocurre nada, el problema es el EC o su firmware.',
        },
      ],
    },
    {
      id: 'slp',
      order: 6,
      title: 'RSMRST# → SLP_S5#/S4#/S3#',
      summary:
        'El PCH libera RSMRST# y va levantando las señales de "sleep" hasta SLP_S3#, que habilita los rieles de funcionamiento (run).',
      measurements: [
        {
          signal: 'RSMRST#',
          point: 'Pin RSMRST# del PCH',
          expected: 'Pasa a alto tras rieles ALW estables',
          instrument: 'multímetro',
          failSymptom: 'Si sigue bajo: RTC/ALW o la lógica de reset de plataforma.',
          detail:
            'Resume Reset: mantiene al chipset (PCH) en reset hasta que los rieles always-on son estables. Al liberarse (pasar a alto) autoriza al PCH a arrancar la secuencia. Si sigue en bajo, el origen suele ser el RTC, el riel always-on o el supervisor que genera esta señal, no el PCH en sí.',
        },
        {
          signal: 'SLP_S4# / SLP_S5#',
          point: 'Pines del PCH',
          expected: 'Pasan a nivel alto',
          instrument: 'multímetro',
          failSymptom: 'La plataforma no sale de los estados de bajo consumo S4/S5.',
          detail:
            'Señales de "sleep" que indican en qué estado de bajo consumo está la plataforma (S5 = apagado, S4 = hibernación). Al encender deben ir pasando a nivel alto. Son banderas de avance: ver cuál no sube te dice en qué punto se atasca la secuencia del chipset.',
        },
        {
          signal: 'SLP_S3#',
          point: 'Pin SLP_S3# del PCH',
          expected: 'Pasa a alto (habilita rieles de run)',
          instrument: 'multímetro',
          failSymptom: 'Sin SLP_S3#: no se habilitan los VRM principales.',
          detail:
            'Sleep S3: cuando pasa a alto autoriza encender los rieles de "run" (los VRM principales de CPU y memoria). Es un hito clave: con SLP_S3# en alto deberías empezar a ver VCORE y VDDQ. Si SLP_S3# no sube, no busques VCORE todavía: el problema está antes, en el chipset o en las condiciones que lo habilitan.',
        },
      ],
    },
    {
      id: 'vrms',
      order: 7,
      title: 'VRMs principales',
      summary:
        'Con SLP_S3# activo se habilitan los reguladores: memoria, system agent, VCCIN y finalmente VCORE del CPU.',
      measurements: [
        {
          signal: 'VDDQ (memoria)',
          point: 'Bobinas del VRM de RAM',
          expected: '1.2 V (DDR4) · 1.1 V (DDR5) · 1.35 V (DDR3L)',
          instrument: 'multímetro',
          failSymptom: 'Sin VDDQ: no hay memoria y no habrá POST.',
          detail:
            'Alimentación de la memoria RAM (1.2 V en DDR4, 1.1 V en DDR5, 1.35 V en DDR3L). Es imprescindible para el POST: sin RAM alimentada no hay arranque. Mídela en las bobinas del VRM de memoria. Un corto aquí (muy común por condensadores dañados) tumba el riel y puede impedir que suban otros.',
        },
        {
          signal: 'VCCIN (entrada FIVR) / VCCSA',
          point: 'Bobina del VRM VCCIN',
          expected: '≈ 1.8 V (varía por plataforma)',
          instrument: 'multímetro',
          failSymptom: 'Sin VCCIN: el regulador integrado (FIVR) del CPU no tiene entrada.',
          detail:
            'Es la tensión de entrada al regulador integrado del procesador (FIVR), típicamente ~1.8 V, de la que el CPU deriva internamente sus voltajes. Si falta VCCIN, el CPU no puede generar sus dominios internos y no arranca. Verifica su controlador PWM y su enable; suele habilitarse tras SLP_S3#.',
        },
        {
          signal: 'VCORE',
          point: 'Bobinas del VRM del CPU',
          expected: '≈ 0.7–1.1 V (controlado por SVID)',
          instrument: 'multímetro',
          failSymptom: 'Sin VCORE: controlador PWM/enable, drivers o MOSFETs del VRM.',
          detail:
            'El voltaje del núcleo del CPU, bajo y de alta corriente (~0.7–1.1 V), ordenado dinámicamente por SVID entre el CPU y el controlador del VRM. Aparece al final de la secuencia de alimentación. Si todo lo anterior está bien pero no hay VCORE, sospecha del controlador PWM, los drivers, los MOSFETs o la señal de enable/VR_ON del VRM del CPU.',
        },
      ],
    },
    {
      id: 'clk',
      order: 8,
      title: 'Reloj principal (CLK / PLL)',
      summary:
        'El generador de reloj entrega la referencia a partir del cristal de 25 MHz del PCH; sin reloj nada se sincroniza.',
      measurements: [
        {
          signal: 'Cristal 25 MHz / BCLK 100 MHz',
          point: 'Cristal del PCH y salidas del clock generator',
          expected: '25 MHz en el cristal; 100 MHz diferencial en las salidas',
          instrument: 'osciloscopio',
          failSymptom: 'Sin reloj: no hay sincronismo, no habrá POST.',
          detail:
            'El generador de reloj produce el reloj base (BCLK, 100 MHz) a partir de un cristal de 25 MHz del chipset; de él derivan todos los relojes del sistema. Sin reloj no hay sincronismo y no hay POST. Observa el cristal de 25 MHz con osciloscopio y, si tienes acceso, las salidas diferenciales de 100 MHz. Un clock generator sin alimentación o un cristal muerto detienen todo.',
        },
      ],
    },
    {
      id: 'pwrgd',
      order: 9,
      title: 'ALL_SYS_PWRGD / VR_READY',
      summary:
        'Cuando todos los reguladores reportan "power good", se activa la señal global que confirma que la alimentación está lista.',
      measurements: [
        {
          signal: 'ALL_SYS_PWRGD / VR_READY',
          point: 'Pin del PCH / salidas PGOOD de los VRM',
          expected: 'Pasa a alto cuando todos los rieles están OK',
          instrument: 'multímetro',
          failSymptom: 'Si no sube: falta algún riel → localizar qué PGOOD individual no llega.',
          detail:
            'Señal "global de buenas": se activa cuando todos los reguladores reportan su propio Power Good (PGOOD). Es la confirmación de que la alimentación está completa y estable. Si no sube, falta algún PGOOD: ve riel por riel comprobando cuál no está presente o está fuera de rango; ese es tu culpable.',
        },
      ],
    },
    {
      id: 'reset-release',
      order: 10,
      title: 'PLTRST# / PROCPWRGD',
      summary:
        'Con la alimentación lista se libera el reset del CPU y de la plataforma, permitiendo que el procesador empiece a ejecutar.',
      measurements: [
        {
          signal: 'PROCPWRGD',
          point: 'Pin del CPU/PCH',
          expected: 'Nivel alto',
          instrument: 'multímetro',
          failSymptom: 'Bajo: el CPU permanece en reset.',
          detail:
            'Processor Power Good: le indica al CPU que su alimentación es válida. Debe estar en alto para que el procesador salga de reset. Si está en bajo con los rieles aparentemente correctos, revisa la cadena de PGOOD que la genera.',
        },
        {
          signal: 'PLTRST#',
          point: 'Pin PLTRST# del PCH',
          expected: 'Pasa a alto (libera los buses)',
          instrument: 'multímetro',
          failSymptom: 'Si sigue bajo: la plataforma no arranca la BIOS.',
          detail:
            'Platform Reset: mantiene en reset los buses y dispositivos de la plataforma; al liberarse (pasar a alto) el sistema empieza a ejecutar la BIOS. Es uno de los últimos hitos. Si PLTRST# no sube, la causa está aguas arriba (PWRGD, reloj, VCORE), no en los buses.',
        },
      ],
    },
    {
      id: 'spi-bios',
      order: 11,
      title: 'SPI BIOS → POST',
      summary:
        'El CPU/PCH lee el firmware del chip SPI. Debe haber alimentación del flash y actividad en el bus al encender.',
      measurements: [
        {
          signal: 'VCC del SPI flash',
          point: 'Pin 8 del chip SPI (serie 25xx)',
          expected: '1.8 V o 3.3 V (según chip)',
          instrument: 'multímetro',
          failSymptom: 'Flash sin alimentar: no se puede leer la BIOS.',
          detail:
            'Alimentación del chip de memoria SPI donde vive la BIOS/UEFI (pin 8 del encapsulado 25xx), a 1.8 V o 3.3 V según el chip. Sin ella el chipset no puede leer el firmware. Si falta, revisa el regulador que alimenta ese pin; si el chip se calienta mucho, puede estar en corto.',
        },
        {
          signal: 'CLK / DI / DO del SPI',
          point: 'Pines CLK, MOSI y MISO del chip SPI',
          expected: 'Ráfagas de actividad al pulsar encendido',
          instrument: 'osciloscopio',
          failSymptom: 'Sin actividad: el PCH no lee la BIOS o la BIOS está corrupta/ausente.',
          detail:
            'Son las líneas del bus SPI (reloj, datos de entrada MOSI y salida MISO) por las que el chipset lee la BIOS al encender. Con osciloscopio verás ráfagas de actividad en el momento del arranque. Si hay alimentación pero no actividad, el chipset no está pidiendo datos (problema antes en la secuencia) o la BIOS está corrupta; actividad sin llegar a arrancar sugiere contenido de BIOS dañado.',
        },
      ],
    },
  ],
};
