import { ApprenticeInfo, ScriptSentence, EvidenceChecklist } from '../types';

export const DEFAULT_APPRENTICE_INFO: ApprenticeInfo = {
  name: 'Carlos Mario Gómez',
  id: '1098765432',
  ficha: '2834912',
  instructor: 'Claudia Morales',
  program: 'Análisis y Desarrollo de Software (ADSO)',
  workContext: 'Empresa de desarrollo tecnológico y centro formativo SENA',
};

export const DEFAULT_SCRIPT_SENTENCES: ScriptSentence[] = [
  // PART 1 - PERSONAL INFORMATION
  {
    id: 's-intro-1',
    section: 'part1',
    category: 'intro',
    label: 'Nombre y Saludo',
    text: 'Hello, my name is Carlos Mario Gómez.',
    explanationEs: 'Presentación inicial con tu nombre completo.',
  },
  {
    id: 's-intro-2',
    section: 'part1',
    category: 'intro',
    label: 'Documento de Identidad',
    text: 'My ID number is 1098765432.',
    explanationEs: 'Mención de tu número de cédula o documento.',
  },
  {
    id: 's-intro-3',
    section: 'part1',
    category: 'intro',
    label: 'Programa de Formación',
    text: 'I am enrolled in the Software Analysis and Development program.',
    explanationEs: 'Nombre de tu programa formativo SENA en inglés.',
  },
  {
    id: 's-intro-4',
    section: 'part1',
    category: 'intro',
    label: 'Número de Ficha',
    text: 'I belong to the 2834912 training group.',
    explanationEs: 'Número de tu ficha formativa.',
  },
  {
    id: 's-intro-5',
    section: 'part1',
    category: 'intro',
    label: 'Nombre del Instructor',
    text: 'My instructor is Claudia Morales.',
    explanationEs: 'Nombre de tu instructor de bilingüismo o técnico.',
  },
  {
    id: 's-intro-6',
    section: 'part1',
    category: 'intro',
    label: 'Identificación de la Evidencia',
    text: 'Today I am presenting the evidence GA3-240202501-AA1-EV02.',
    explanationEs: 'Código oficial de la evidencia a sustentar.',
  },

  // PART 2 - ATTITUDES, BELIEFS AND OBLIGATIONS
  {
    id: 's-part2-1',
    section: 'part2',
    category: 'have_to',
    label: 'Obligación Laboral (HAVE TO)',
    text: 'At work, I have to arrive on time and follow the project schedule.',
    explanationEs: 'HAVE TO indica necesidad u obligación impuesta por las normas o el horario laboral.',
  },
  {
    id: 's-part2-2',
    section: 'part2',
    category: 'must',
    label: 'Regla o Principio Fuerte (MUST)',
    text: 'I must respect my coworkers and maintain good teamwork.',
    explanationEs: 'MUST expresa una obligación moral fuerte o regla institucional.',
  },
  {
    id: 's-part2-3',
    section: 'part2',
    category: 'should',
    label: 'Recomendación Positiva (SHOULD)',
    text: 'I should be organized with my daily tasks and communicate clearly.',
    explanationEs: 'SHOULD se usa para dar o expresar un buen consejo o recomendación profesional.',
  },
  {
    id: 's-part2-4',
    section: 'part2',
    category: 'shouldnt',
    label: 'Recomendación Negativa (SHOULDN\'T)',
    text: 'I shouldn\'t leave my assignments until the last minute.',
    explanationEs: 'SHOULDN\'T indica algo que no es recomendable hacer.',
  },
  {
    id: 's-part2-5',
    section: 'part2',
    category: 'dont_have_to',
    label: 'No Obligatorio (DON\'T HAVE TO)',
    text: 'I don\'t have to be perfect, but I have to make a continuous effort to improve.',
    explanationEs: 'DON\'T HAVE TO significa que no es necesario ni obligatorio.',
  },
  {
    id: 's-part2-6',
    section: 'part2',
    category: 'have_to',
    label: 'Obligación Académica (HAVE TO)',
    text: 'In my academic life at SENA, I have to submit all my workshop deliverables on time.',
    explanationEs: 'Obligación académica con la plataforma formativa.',
  },
  {
    id: 's-part2-7',
    section: 'part2',
    category: 'belief',
    label: 'Creencia y Actitud (BELIEF)',
    text: 'I believe that self-discipline and responsibility are key values for professional success.',
    explanationEs: 'Expresión de creencia u opinión sobre tus actitudes y valores.',
  },
];

export const DEFAULT_CHECKLIST: EvidenceChecklist = {
  part1Completed: false,
  part2Completed: false,
  clearIntro: false,
  usesModals: false,
  audibleVoice: false,
  completeRecording: false,
  pronunciationPracticed: false,
  finalRecordingReviewed: false,
};

export const MODAL_RULES_GUIDE = [
  {
    modal: 'HAVE TO',
    meaningEs: 'Obligación / Necesidad',
    structure: 'Subject + have to + verb (base form)',
    example: 'I have to arrive on time at the office.',
    descriptionEs: 'Se utiliza para obligaciones impuestas por reglas externas, horarios o necesidades laborales reales.',
    color: 'emerald',
  },
  {
    modal: 'MUST',
    meaningEs: 'Obligación fuerte / Regla',
    structure: 'Subject + must + verb (base form)',
    example: 'I must respect my coworkers and safety rules.',
    descriptionEs: 'Expresa una regla estricta o un deber moral incuestionable. ¡Ojo: nunca se pone "to" después de must!',
    color: 'blue',
  },
  {
    modal: 'SHOULD',
    meaningEs: 'Recomendación / Consejo',
    structure: 'Subject + should + verb (base form)',
    example: 'I should be organized with my technical documentation.',
    descriptionEs: 'Indica una recomendación positiva o lo que sería una buena práctica profesional.',
    color: 'purple',
  },
  {
    modal: 'SHOULDN\'T',
    meaningEs: 'Recomendación Negativa',
    structure: 'Subject + shouldn\'t + verb (base form)',
    example: 'I shouldn\'t interrupt others during meetings.',
    descriptionEs: 'Indica algo que no se aconseja hacer porque podría generar problemas o mala convivencia.',
    color: 'amber',
  },
  {
    modal: 'DON\'T HAVE TO',
    meaningEs: 'No es necesario / Falta de obligación',
    structure: 'Subject + don\'t have to + verb (base form)',
    example: 'I don\'t have to wear formal clothes every day, but I have to look professional.',
    descriptionEs: 'Significa que algo NO es obligatorio. ¡Cuidado: no significa prohibición, sino que tienes la opción!',
    color: 'cyan',
  },
];

export const PRESET_SENTENCE_IDEAS = [
  {
    category: 'have_to' as const,
    label: 'HAVE TO - Responsabilidad',
    text: 'I have to be responsible with my tasks and commitments.',
  },
  {
    category: 'must' as const,
    label: 'MUST - Entrega de proyectos',
    text: 'I must complete my assignments before the deadline.',
  },
  {
    category: 'should' as const,
    label: 'SHOULD - Comunicación',
    text: 'I should communicate respectfully with all team members.',
  },
  {
    category: 'shouldnt' as const,
    label: 'SHOULDN\'T - Llegar tarde',
    text: 'I shouldn\'t be late to classes or team meetings.',
  },
  {
    category: 'dont_have_to' as const,
    label: 'DON\'T HAVE TO - Trabajo en fines de semana',
    text: 'I don\'t have to work on weekends if I organize my time well.',
  },
  {
    category: 'belief' as const,
    label: 'BELIEF - Importancia del inglés',
    text: 'I think it is very important to learn English for my professional growth.',
  },
];
