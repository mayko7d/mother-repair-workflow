import type { PowerSequence } from '../types/sequence';

/**
 * Secuencia de encendido de una placa de escritorio (estándar ATX).
 * Valores de referencia didáctica: varían según placa/fabricante. Consultar el
 * esquemático concreto.
 */
export const desktopSequence: PowerSequence = {
  id: 'desktop',
  label: 'Desktop ATX',
  platform: 'Placa de escritorio (estándar ATX)',
  steps: [
    {
      id: 'standby',
      order: 1,
      title: '+5VSB (standby)',
      summary:
        'Con la fuente conectada a la red, el riel de standby está siempre presente y alimenta la lógica que espera el encendido.',
      measurements: [
        {
          signal: '+5VSB',
          point: 'Pin 9 del conector 24 pines (cable púrpura)',
          expected: '5 V con AC conectada',
          instrument: 'multímetro',
          failSymptom: 'Sin 5VSB: sección standby de la PSU o la propia PSU dañada.',
          detail:
            'Riel de standby de 5 V que la fuente entrega siempre que esté conectada a la red, aunque el equipo esté "apagado". Alimenta la lógica que espera el encendido (Super I/O, Wake-on-LAN, el circuito del botón). Sin +5VSB no hay forma de encender. Mídelo en el pin 9 (púrpura) del 24 pines; si falta, el problema está en la sección standby de la PSU o en la placa si hay un corto que lo hunde.',
        },
      ],
    },
    {
      id: 'ps-on',
      order: 2,
      title: 'PS_ON#',
      summary:
        'El Super I/O/chipset mantiene PS_ON# en alto en reposo y lo fuerza a 0 V al encender, ordenando a la fuente que arranque.',
      measurements: [
        {
          signal: 'PS_ON#',
          point: 'Pin 16 del 24 pines (cable verde)',
          expected: '≈ 5 V en reposo; 0 V al encender',
          instrument: 'multímetro',
          failSymptom:
            'Si no cae a 0 V: botón/Super I/O. Si cae a 0 V y la PSU no arranca: fuente.',
          detail:
            'Es la orden de encendido hacia la fuente, activa en bajo. En reposo la placa la mantiene en ~5 V mediante un pull-up a +5VSB; al encender, el Super I/O la fuerza a 0 V y la PSU arranca. Si no cae a 0 V al pulsar, el fallo está en el botón o el Super I/O; si cae a 0 V pero la fuente no arranca, el fallo está en la PSU.',
        },
      ],
    },
    {
      id: 'main-rails',
      order: 3,
      title: 'Rieles principales',
      summary:
        'Al recibir PS_ON#, la fuente levanta los rieles principales que alimentan toda la placa.',
      measurements: [
        {
          signal: '+3.3V',
          point: 'Conector 24 pines (cable naranja)',
          expected: '3.3 V',
          instrument: 'multímetro',
          failSymptom: 'Fuera de rango: fuente o carga en corto en ese riel.',
          detail:
            'Uno de los rieles principales que la fuente levanta al recibir PS_ON#. Alimenta memoria, chipset y periféricos. Mídelo en el conector de 24 pines (naranja); debe estar dentro de ±5%. Fuera de rango o ausente apunta a la fuente o a un corto en la placa que lo carga.',
        },
        {
          signal: '+5V',
          point: 'Conector 24 pines (cable rojo)',
          expected: '5 V',
          instrument: 'multímetro',
          failSymptom: 'Fuera de rango: fuente o carga en corto en ese riel.',
          detail:
            'Riel principal de 5 V para unidades, USB y parte de la lógica. Se mide en el 24 pines (rojo). Igual que el 3.3 V, su ausencia tras un PS_ON# correcto sugiere fuente o un corto en placa que lo hunde.',
        },
        {
          signal: '+12V',
          point: '24 pines (amarillo) y EPS 4/8 pines del CPU',
          expected: '12 V',
          instrument: 'multímetro',
          failSymptom: 'Sin 12 V (sobre todo EPS): el VRM del CPU se queda sin entrada.',
          detail:
            'Riel de mayor potencia: alimenta el VRM del CPU (vía conector EPS de 4/8 pines), la GPU y los motores de las unidades. Mídelo en el 24 pines (amarillo) y, sobre todo, en el EPS. Si falta el EPS de 12 V, el VRM del CPU no tiene de dónde generar VCORE y no habrá POST aunque el resto esté bien.',
        },
      ],
    },
    {
      id: 'pwr-ok',
      order: 4,
      title: 'PWR_OK / Power Good',
      summary:
        'Cuando los rieles son estables, la fuente sube la señal Power Good para avisar a la placa de que puede continuar.',
      measurements: [
        {
          signal: 'PWR_OK / PG',
          point: 'Pin 8 del 24 pines (cable gris)',
          expected: 'Sube a ≈ 5 V cuando los rieles están estables',
          instrument: 'multímetro',
          failSymptom: 'Si no sube: algún riel fuera de rango o la PSU no genera PG.',
          detail:
            'Power Good: la fuente la sube a ~5 V solo cuando todos sus rieles están dentro de rango y estables, tras un breve retardo. Es el "permiso" para que la placa continúe. Si no sube, algún riel de la fuente está mal o la propia PSU no genera la señal; una placa que no arranca con PWR_OK ausente casi siempre apunta a la fuente.',
        },
      ],
    },
    {
      id: 'cpu-ram-vrm',
      order: 5,
      title: 'VRM de CPU y memoria',
      summary:
        'A partir del 12 V, el VRM genera VCORE para el CPU, y otros reguladores alimentan la memoria y el system agent.',
      measurements: [
        {
          signal: 'VCORE',
          point: 'Bobinas del VRM del CPU',
          expected: '≈ 1.0–1.4 V (según PWM/SVID)',
          instrument: 'multímetro',
          failSymptom: 'Sin VCORE: PWM, enable, drivers/MOSFETs del VRM o falta el EPS 12 V.',
          detail:
            'Voltaje del núcleo del CPU (~1.0–1.4 V, alta corriente), generado por el VRM multifase de la placa a partir del 12 V del EPS, con el valor fijado por SVID. Es de lo último que aparece. Sin VCORE revisa: presencia del EPS 12 V, el controlador PWM y su enable, los drivers y los MOSFETs de las fases.',
        },
        {
          signal: 'VCCSA / VCCIO',
          point: 'VRM del system agent / I/O',
          expected: '≈ 0.9–1.05 V',
          instrument: 'multímetro',
          failSymptom: 'Fuera de rango: regulador del system agent.',
          detail:
            'Rieles del System Agent y de la E/S del procesador (~0.9–1.05 V), necesarios para el controlador de memoria y los buses internos. Fuera de rango pueden impedir el POST o causar inestabilidad de memoria. Se generan en reguladores dedicados cerca del socket.',
        },
        {
          signal: 'VDDQ (DRAM)',
          point: 'VRM de memoria',
          expected: '1.2 V (DDR4) · 1.1 V (DDR5) · 1.35 V (DDR3)',
          instrument: 'multímetro',
          failSymptom: 'Sin VDDQ: no hay memoria y no habrá POST.',
          detail:
            'Alimentación de la RAM (1.2 V en DDR4, 1.1 V en DDR5, 1.35 V en DDR3). Imprescindible para el POST. Mídela en el VRM de memoria, junto a los slots. Un corto aquí (condensadores) tumba el riel y suele dar "no POST" con la placa en corto de consumo.',
        },
        {
          signal: 'VPP (DRAM)',
          point: 'Riel VPP de memoria',
          expected: '2.5 V',
          instrument: 'multímetro',
          failSymptom: 'Sin VPP: la RAM no inicializa correctamente.',
          detail:
            'Riel auxiliar de 2.5 V que la DDR necesita para la activación interna de sus celdas (wordlines). Aunque es menos conocido, su ausencia impide que la memoria inicialice. Se genera en el VRM de memoria junto al VDDQ.',
        },
      ],
    },
    {
      id: 'pch-rails',
      order: 6,
      title: 'Rieles del chipset (PCH)',
      summary:
        'El chipset necesita sus propios rieles para gestionar el arranque, los buses y las señales de reset.',
      measurements: [
        {
          signal: 'Rieles del PCH',
          point: 'VRM del chipset',
          expected: 'p.ej. 1.05 V / 1.5 V (según plataforma)',
          instrument: 'multímetro',
          failSymptom: 'Sin alimentación del PCH: no gestiona el arranque.',
          detail:
            'El chipset (PCH) tiene sus propios reguladores (por ejemplo 1.05 V y 1.5 V según plataforma) para su lógica interna, sus relojes y la gestión del arranque. Sin estos rieles el PCH no puede secuenciar el encendido ni liberar los resets. Localízalos en los pequeños VRM cercanos al chipset.',
        },
      ],
    },
    {
      id: 'clk',
      order: 7,
      title: 'Generador de reloj (BCLK)',
      summary:
        'El clock generator produce el reloj base de 100 MHz a partir de un cristal de 25 MHz; es imprescindible para el POST.',
      measurements: [
        {
          signal: 'BCLK 100 MHz',
          point: 'Clock generator y cristal de 25 MHz',
          expected: '25 MHz en el cristal; 100 MHz en las salidas',
          instrument: 'osciloscopio',
          failSymptom: 'Sin reloj base: no hay sincronismo, no habrá POST.',
          detail:
            'El generador de reloj crea el reloj base de 100 MHz a partir de un cristal de 25 MHz; de él derivan los relojes de CPU, memoria y buses. Sin reloj no hay POST. Verifica el cristal de 25 MHz con osciloscopio y la alimentación del clock generator. Un cristal muerto o un clock generator sin tensión detienen el arranque.',
        },
      ],
    },
    {
      id: 'reset-release',
      order: 8,
      title: 'RESET# / PLTRST#',
      summary:
        'Con Power Good y reloj presentes, el chipset libera el reset del CPU y de la plataforma.',
      measurements: [
        {
          signal: 'PLTRST# / CPU RESET#',
          point: 'Pin del PCH / CPU',
          expected: 'Pasa a alto después de PWR_OK',
          instrument: 'multímetro',
          failSymptom: 'Si sigue bajo: Power Good, reloj o el propio PCH.',
          detail:
            'Platform/CPU Reset: mantienen el procesador y los buses en reinicio hasta que hay Power Good y reloj estables; al liberarse (pasar a alto) el CPU empieza a ejecutar. Si no sube, la causa está aguas arriba (PWR_OK, reloj o el PCH), no en el CPU.',
        },
      ],
    },
    {
      id: 'spi-bios',
      order: 9,
      title: 'SPI BIOS/UEFI → POST',
      summary:
        'El sistema lee el firmware desde el chip SPI; debe estar alimentado y mostrar actividad al encender.',
      measurements: [
        {
          signal: 'VCC del SPI flash',
          point: 'Pin 8 del chip SPI de la BIOS (serie 25xx)',
          expected: '1.8 V o 3.3 V (según chip)',
          instrument: 'multímetro',
          failSymptom: 'Flash sin alimentar: no se puede leer la BIOS.',
          detail:
            'Alimentación del chip SPI de la BIOS/UEFI (pin 8 del 25xx), a 1.8 V o 3.3 V. Sin ella el sistema no puede leer el firmware. Si falta, revisa su regulador; un chip muy caliente puede estar en corto.',
        },
        {
          signal: 'Actividad SPI',
          point: 'Pines CLK y DO del chip SPI',
          expected: 'Ráfagas de actividad al encender',
          instrument: 'osciloscopio',
          failSymptom: 'Sin lectura: el PCH no accede a la BIOS o la BIOS está corrupta.',
          detail:
            'Las líneas CLK y DO del chip SPI muestran ráfagas de actividad cuando el chipset lee la BIOS al encender. Con osciloscopio confirmas que el firmware se está leyendo. Alimentación presente pero sin actividad indica que el chipset aún no pide datos (fallo antes en la secuencia) o una BIOS corrupta.',
        },
      ],
    },
  ],
};
