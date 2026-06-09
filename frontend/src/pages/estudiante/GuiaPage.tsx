import React, { useState } from 'react';
import {
  Lightbulb, Target, FlaskConical, Building2, Rocket,
  CheckCircle2, ChevronDown, ChevronUp, BookOpen,
  Users, BarChart3, FileText, Upload, MessageSquare,
  CalendarDays, ArrowRight, Star, AlertTriangle,
} from 'lucide-react';

/* ── Datos ──────────────────────────────────────────────────────── */
const ETAPAS = [
  {
    nombre: 'Ideación',
    icon: Lightbulb,
    color: 'bg-violet-100 text-violet-700',
    border: 'border-violet-200',
    ring: 'ring-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    descripcion: 'Define claramente el problema que quieres resolver y tu propuesta de valor inicial.',
    objetivo: 'Validar que existe un problema real que vale la pena resolver.',
    actividades: [
      'Identificar el problema principal que tu proyecto resuelve',
      'Describir a quién va dirigida tu solución (cliente objetivo)',
      'Redactar tu propuesta de valor en una oración clara',
      'Investigar si ya existen soluciones similares en el mercado',
      'Registrar tu proyecto en la plataforma con toda la información',
    ],
    entregables: [
      'Documento de descripción del problema',
      'Perfil del cliente objetivo',
      'Propuesta de valor inicial',
    ],
    consejos: [
      'Sé específico: un problema bien definido es la mitad de la solución',
      'No te enamores de tu idea, enamórate del problema',
      'Habla con al menos 5 personas que tengan el problema que quieres resolver',
    ],
    evitar: [
      'Empezar a construir antes de entender el problema',
      'Asumir que conoces lo que necesita el cliente',
    ],
  },
  {
    nombre: 'Validación',
    icon: Target,
    color: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
    ring: 'ring-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    descripcion: 'Comprueba con usuarios reales que tu solución resuelve el problema de forma efectiva.',
    objetivo: 'Confirmar que hay demanda real antes de invertir en el desarrollo completo.',
    actividades: [
      'Realizar entrevistas con al menos 10 usuarios potenciales',
      'Crear encuestas para medir el interés en tu solución',
      'Construir un prototipo de baja fidelidad (papel, wireframes)',
      'Documentar los hallazgos y ajustar la propuesta de valor',
      'Subir las evidencias de validación como entregas al sistema',
    ],
    entregables: [
      'Resumen de entrevistas realizadas',
      'Encuesta de validación con resultados',
      'Prototipo de baja fidelidad (fotos o PDF)',
    ],
    consejos: [
      'Las entrevistas son más valiosas que las encuestas para entender el "por qué"',
      'Busca patrones en las respuestas de los usuarios, no casos aislados',
      'Si el 80% de los entrevistados no entiende tu solución, simplifica',
    ],
    evitar: [
      'Preguntar "¿usarías mi app?" — pregunta sobre sus hábitos actuales',
      'Ignorar el feedback negativo',
    ],
  },
  {
    nombre: 'Prototipo',
    icon: FlaskConical,
    color: 'bg-amber-100 text-amber-700',
    border: 'border-amber-200',
    ring: 'ring-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    descripcion: 'Construye la versión mínima de tu producto que resuelve el problema central.',
    objetivo: 'Tener un MVP funcional con el que los usuarios puedan interactuar.',
    actividades: [
      'Definir las funcionalidades mínimas del MVP (lo indispensable)',
      'Desarrollar o diseñar el prototipo funcional',
      'Realizar pruebas de usabilidad con usuarios reales',
      'Iterar según el feedback recibido',
      'Documentar el proceso y subir el MVP como entrega',
    ],
    entregables: [
      'MVP funcional o demo del producto',
      'Informe de pruebas de usuario',
      'Lista de mejoras identificadas',
    ],
    consejos: [
      'El MVP debe tener solo las funciones que resuelven el problema principal',
      'Es mejor lanzar imperfecto que no lanzar nunca',
      'Mide cómo usan el producto, no solo lo que dicen de él',
    ],
    evitar: [
      'Agregar funciones "por si acaso" — primero valida lo básico',
      'Perfeccionar el diseño antes de validar la funcionalidad',
    ],
  },
  {
    nombre: 'Incubación',
    icon: Building2,
    color: 'bg-teal-100 text-teal-700',
    border: 'border-teal-200',
    ring: 'ring-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    descripcion: 'Desarrolla y consolida tu modelo de negocio mientras adquieres tus primeros clientes reales.',
    objetivo: 'Demostrar que el negocio es viable y puede generar valor de forma sostenida.',
    actividades: [
      'Completar el Business Model Canvas de tu proyecto',
      'Conseguir tus primeros usuarios o clientes pagadores',
      'Definir métricas clave (KPIs) y comenzar a medirlas',
      'Establecer canales de adquisición de clientes',
      'Asistir a todas las reuniones programadas con tu mentor',
    ],
    entregables: [
      'Business Model Canvas completo',
      'Reporte de primeros clientes / tracción',
      'Dashboard de métricas iniciales',
    ],
    consejos: [
      'Concéntrate en una sola métrica que realmente importe (North Star Metric)',
      'El crecimiento sostenido importa más que el crecimiento rápido e inestable',
      'Aprovecha las asesorías con tu mentor para resolver bloqueos',
    ],
    evitar: [
      'Tratar de crecer demasiado rápido antes de tener tracción comprobada',
      'Ignorar las métricas — los datos guían las decisiones',
    ],
  },
  {
    nombre: 'Escalamiento',
    icon: Rocket,
    color: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
    ring: 'ring-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    descripcion: 'Escala las operaciones de tu startup a nuevos mercados con un modelo de negocio ya probado.',
    objetivo: 'Crecer de forma rentable y sostenible, expandiendo el impacto del proyecto.',
    actividades: [
      'Identificar nuevos mercados o segmentos a los que expandirse',
      'Optimizar los procesos para soportar mayor volumen',
      'Buscar financiamiento o alianzas estratégicas',
      'Consolidar el equipo de trabajo',
      'Presentar resultados finales y plan de crecimiento al mentor',
    ],
    entregables: [
      'Plan de escalamiento con metas a 6 y 12 meses',
      'Informe de resultados del proceso de incubación',
      'Pitch deck para inversores (opcional)',
    ],
    consejos: [
      'Escala solo lo que ya funciona — no escales problemas',
      'Construye sistemas y procesos antes de escalar personas',
      'La cultura del equipo es tan importante como el producto',
    ],
    evitar: [
      'Escalar antes de tener un modelo rentable comprobado',
      'Descuidar a los clientes actuales por perseguir nuevos mercados',
    ],
  },
];

const PROCESO = [
  { icon: FileText,      titulo: 'Registra tu proyecto',   desc: 'Ve a Proyectos → "Nuevo proyecto" y completa toda la información: nombre, descripción, sector, problema y propuesta de valor.' },
  { icon: Users,         titulo: 'Espera la aprobación',    desc: 'El administrador revisará tu proyecto. Una vez aprobado, se asignará un mentor especializado en tu área.' },
  { icon: CalendarDays,  titulo: 'Inicia la mentoría',      desc: 'Tu mentor activará la mentoría. Podrás ver el progreso por etapas desde la sección Mentorías.' },
  { icon: Upload,        titulo: 'Sube tus entregas',       desc: 'En cada etapa debes subir los documentos que evidencien tu avance. Ve a Mentorías → expande tu proyecto → pestaña Entregas.' },
  { icon: MessageSquare, titulo: 'Recibe retroalimentación', desc: 'Tu mentor revisará las entregas y dejará observaciones. Presta atención a estos comentarios para mejorar.' },
  { icon: CalendarDays,  titulo: 'Asiste a las reuniones',  desc: 'Tu mentor programará reuniones virtuales o presenciales. Encuéntralas en Mis Reuniones y no las pierdas.' },
];

const PREGUNTAS = [
  {
    q: '¿Cuánto tiempo dura cada etapa?',
    a: 'El tiempo de cada etapa lo define tu mentor según el avance de tu proyecto. En promedio cada etapa dura entre 2 y 6 semanas. Tu mentor avanzará la etapa cuando considere que has cumplido los objetivos.',
  },
  {
    q: '¿Qué pasa si no subo entregables?',
    a: 'Sin entregables tu mentor no podrá evaluar tu avance ni avanzarte a la siguiente etapa. Es fundamental subir evidencias de cada actividad realizada en la etapa actual.',
  },
  {
    q: '¿Puedo tener más de un proyecto?',
    a: 'Sí, puedes registrar varios proyectos. Cada uno tendrá su propia mentoría y seguimiento independiente.',
  },
  {
    q: '¿Qué formato deben tener mis entregas?',
    a: 'Puedes subir cualquier tipo de archivo: PDF, Word, Excel, imágenes, presentaciones. Lo importante es que el contenido evidencie claramente el trabajo realizado.',
  },
  {
    q: '¿Cómo me comunico con mi mentor fuera de las reuniones?',
    a: 'Puedes usar el enlace o información de contacto que tu mentor comparta en las reuniones. También puedes dejar comentarios en las entregas para facilitar la comunicación.',
  },
];

/* ── Componente principal ───────────────────────────────────────── */
export const GuiaPage: React.FC = () => {
  const [etapaAbierta, setEtapaAbierta] = useState<number | null>(0);
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null);

  return (
    <div className="space-y-10">

      {/* Hero */}
      <div className="bg-[#1A365D] rounded-2xl px-8 py-8 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 opacity-5">
          <BookOpen className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-medium mb-4">
            <Star className="w-3.5 h-3.5 text-yellow-300" /> Guía del Emprendedor
          </div>
          <h1 className="text-xl font-semibold leading-snug mb-2">
            Cómo aprovechar al máximo<br />tu proceso de incubación
          </h1>
          <p className="text-blue-200 text-sm max-w-xl">
            Todo lo que necesitas saber para gestionar tu proyecto, avanzar por cada etapa
            y sacar el máximo provecho de tu mentoría.
          </p>
        </div>
      </div>

      {/* Cómo funciona el proceso */}
      <section>
        <h2 className="text-base font-semibold text-[#1A365D] mb-4">¿Cómo funciona el proceso?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROCESO.map(({ icon: Icon, titulo, desc }, i) => (
            <div key={titulo} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-3">
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#EBF8FF] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#1A365D]" />
                </div>
                <span className="text-[10px] font-bold text-gray-300">{i + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{titulo}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Etapas detalladas */}
      <section>
        <h2 className="text-base font-semibold text-[#1A365D] mb-1">Las 5 etapas de incubación</h2>
        <p className="text-sm text-gray-500 mb-4">Haz clic en cada etapa para ver qué debes hacer y cómo prepararte.</p>

        <div className="space-y-3">
          {ETAPAS.map((etapa, i) => {
            const Icon    = etapa.icon;
            const abierta = etapaAbierta === i;
            return (
              <div key={etapa.nombre} className={`bg-white border rounded-xl overflow-hidden transition-all ${abierta ? etapa.border : 'border-gray-100'}`}>

                {/* Cabecera */}
                <button
                  onClick={() => setEtapaAbierta(abierta ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${etapa.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400">Etapa {i + 1}</span>
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                        <span className="text-sm font-semibold text-gray-800">{etapa.nombre}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{etapa.descripcion}</p>
                    </div>
                  </div>
                  {abierta
                    ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 ml-4" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-4" />}
                </button>

                {/* Detalle */}
                {abierta && (
                  <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-4">

                    {/* Objetivo */}
                    <div className={`rounded-xl px-4 py-3 border ${etapa.border} ${etapa.color.split(' ')[0]}/20`}>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Objetivo de la etapa</p>
                      <p className="text-sm text-gray-700">{etapa.objetivo}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Actividades */}
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Actividades clave
                        </p>
                        <ul className="space-y-1.5">
                          {etapa.actividades.map(a => (
                            <li key={a} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${etapa.color}`}>✓</span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Entregables */}
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-500" /> Entregables esperados
                        </p>
                        <ul className="space-y-1.5">
                          {etapa.entregables.map(e => (
                            <li key={e} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#1A365D] shrink-0" />
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Consejos */}
                      <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                        <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5" /> Consejos
                        </p>
                        <ul className="space-y-1.5">
                          {etapa.consejos.map(c => (
                            <li key={c} className="text-xs text-teal-800 flex items-start gap-1.5">
                              <span className="shrink-0 mt-0.5">•</span>{c}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Qué evitar */}
                      <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Qué evitar
                        </p>
                        <ul className="space-y-1.5">
                          {etapa.evitar.map(e => (
                            <li key={e} className="text-xs text-red-700 flex items-start gap-1.5">
                              <span className="shrink-0 mt-0.5">•</span>{e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Métricas clave */}
      <section>
        <h2 className="text-base font-semibold text-[#1A365D] mb-4">Métricas que debes conocer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: Users,    label: 'Usuarios activos',    desc: 'Cuántas personas usan tu producto de forma regular. Es la métrica más directa de tracción.' },
            { icon: BarChart3, label: 'Tasa de retención',  desc: 'Porcentaje de usuarios que vuelven a usar tu producto. Alta retención = producto que genera valor.' },
            { icon: Target,   label: 'Costo de adquisición', desc: 'Cuánto te cuesta conseguir un nuevo cliente (CAC). Debe ser menor al valor que genera ese cliente.' },
            { icon: Rocket,   label: 'Tasa de crecimiento', desc: 'Cuánto crece tu base de usuarios o ingresos semana a semana. El 5-7% semanal es excelente para una startup.' },
            { icon: MessageSquare, label: 'NPS',            desc: 'Net Promoter Score: mide cuántos clientes recomendarían tu producto. Sobre 50 es muy bueno.' },
            { icon: Building2, label: 'MRR / ARR',          desc: 'Ingresos recurrentes mensuales/anuales. La métrica más importante para startups con modelo SaaS.' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl px-4 py-4 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-[#EBF8FF] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#1A365D]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-base font-semibold text-[#1A365D] mb-4">Preguntas frecuentes</h2>
        <div className="space-y-2">
          {PREGUNTAS.map((p, i) => {
            const abierta = preguntaAbierta === i;
            return (
              <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setPreguntaAbierta(abierta ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <span className="text-sm font-medium text-gray-800">{p.q}</span>
                  {abierta
                    ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 ml-4" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-4" />}
                </button>
                {abierta && (
                  <div className="px-5 pb-4 border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-600 leading-relaxed">{p.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
