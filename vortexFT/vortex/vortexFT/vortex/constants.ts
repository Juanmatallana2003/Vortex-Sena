import { Column, Status, Card, Tag } from './types';

// Mock Data for available options in the edit modal
export const ALL_USERS = [
    { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=a' },
    { name: 'Maria Garcia', avatar: 'https://i.pravatar.cc/150?u=b' },
    { name: 'James Smith', avatar: 'https://i.pravatar.cc/150?u=c' },
    { name: 'Patricia Williams', avatar: 'https://i.pravatar.cc/150?u=d' },
    { name: 'Robert Brown', avatar: 'https://i.pravatar.cc/150?u=e' },
    { name: 'Michael Miller', avatar: 'https://i.pravatar.cc/150?u=f' },
    { name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?u=g' },
    { name: 'David Moore', avatar: 'https://i.pravatar.cc/150?u=h' },
];

export const ALL_TAGS: Tag[] = [
    { label: 'finance', color: 'blue' },
    { label: 'enhancement', color: 'green' },
    { label: 'feature', color: 'purple' },
    { label: 'marketing', color: 'orange' },
    { label: 'bug', color: 'red' },
    { label: 'documentation', color: 'blue' },
    { label: 'design', color: 'pink' },
    { label: 'video', color: 'red' },
    { label: 'Marketing spring', color: 'gray', icon: 'fa-solid fa-pencil' },
    { label: 'Crush bugs sprint', color: 'gray', icon: 'fa-solid fa-bug', iconColor: 'text-red-400' },
    { label: '#23', color: 'gray', icon: 'fa-solid fa-code-pull-request' },
];

const CARDS: Record<Status, Card[]> = {
  [Status.Todo]: [
    { id: 'card-1', number: 5, title: '2022 KPI report', tags: [{ label: 'finance', color: 'blue' }], description: 'Análisis detallado de los Indicadores Clave de Desempeño para el año fiscal 2022. Este informe debe cubrir desde el primer al cuarto trimestre e incluir un análisis comparativo con 2021.' },
    { id: 'card-2', number: 40, title: 'Improve Lighthouse score', tags: [{ label: 'enhancement', color: 'green' }], description: 'La puntuación actual de Lighthouse para el rendimiento es de 75. El objetivo es aumentarla a al menos 90 optimizando imágenes, reduciendo el tiempo de ejecución de JavaScript y aprovechando el almacenamiento en caché del navegador.' },
    { id: 'card-3', number: 33, title: 'Send email when user subscribes', tags: [{ label: 'feature', color: 'purple' }, { label: 'Marketing spring', color: 'gray', icon: 'fa-solid fa-pencil' }] },
    { id: 'card-4', number: 36, title: 'Update landing page sponsors & testimonials', tags: [{ label: 'enhancement', color: 'green' }] },
  ],
  [Status.InProgress]: [
    { id: 'card-5', number: 6, title: 'Write 2023 roadmap', tags: [], description: 'Elaborar la hoja de ruta del producto para 2023, destacando las características clave, los plazos y la asignación de recursos. Debe alinearse con los objetivos estratégicos de la empresa.' },
    { id: 'card-6', number: 10, title: 'January 2023 Newsletter', tags: [{ label: 'marketing', color: 'orange' }, { label: 'Marketing spring', color: 'gray', icon: 'fa-solid fa-pencil' }], dueDate: '2023-03-31', assignees: ['https://i.pravatar.cc/150?u=a'] },
    { id: 'card-7', number: 41, title: 'Blog article on how we designed our website', tags: [{ label: 'marketing', color: 'orange' }, { label: 'Marketing spring', color: 'gray', icon: 'fa-solid fa-pencil' }], assignees: ['https://i.pravatar.cc/150?u=b'] },
    { id: 'card-8', number: 26, title: 'chore: code improvement', tags: [{ label: 'enhancement', color: 'green' }, { label: 'Crush bugs sprint', color: 'gray', icon: 'fa-solid fa-bug', iconColor: 'text-red-400' }], assignees: ['https://i.pravatar.cc/150?u=c'] },
  ],
  [Status.InReview]: [
    { id: 'card-9', number: 2, title: 'Video storyboard', tags: [{ label: 'video', color: 'red' }, { label: 'Marketing spring', color: 'gray', icon: 'fa-solid fa-pencil' }], dueDate: '2023-01-17', assignees: ['https://i.pravatar.cc/150?u=d'] },
    { id: 'card-10', number: 9, title: 'Responsive menu has too much padding', tags: [{ label: '#23', color: 'gray', icon: 'fa-solid fa-code-pull-request' }, { label: 'bug', color: 'red' }, { label: 'Crush bugs sprint', color: 'gray', icon: 'fa-solid fa-bug', iconColor: 'text-red-400' }], assignees: ['https://i.pravatar.cc/150?u=e'] },
    { id: 'card-11', number: 13, title: "Improve 'Button' component", tags: [{ label: '#28', color: 'gray', icon: 'fa-solid fa-code-pull-request' }, { label: 'enhancement', color: 'green' }], assignees: ['https://i.pravatar.cc/150?u=f'] },
  ],
  [Status.Done]: [
    { id: 'card-12', number: 14, title: 'Video for VueJs Amsterdam', tags: [{ label: 'video', color: 'red' },], dueDate: '2023-02-09', assignees: ['https://i.pravatar.cc/150?u=g'] },
    { id: 'card-13', number: 38, title: 'Improve documentation', tags: [{ label: 'documentation', color: 'blue' }], assignees: ['https://i.pravatar.cc/150?u=e'] },
    { id: 'card-14', number: 20, title: 'Update icons library', tags: [{ label: 'design', color: 'pink' }], assignees: ['https://i.pravatar.cc/150?u=h'] },
    { id: 'card-15', number: 18, title: 'Update GitHub readme', tags: [{ label: 'marketing', color: 'orange' }], assignees: ['https://i.pravatar.cc/150?u=c'] },
    { id: 'card-16', number: 39, title: 'Release new website', tags: [{ label: 'feature', color: 'purple' }], assignees: ['https://i.pravatar.cc/150?u=b'] },
    { id: 'card-17', number: 19, title: 'Create design system', tags: [{ label: 'design', color: 'pink' }], assignees: ['https://i.pravatar.cc/150?u=d'] },
  ],
};

export const KANBAN_COLUMNS: Column[] = [
  { 
    id: Status.Todo, 
    title: 'To Do', 
    keyword: 'todo',
    color: 'bg-neutral-500', 
    cards: CARDS[Status.Todo] 
  },
  { 
    id: Status.InProgress, 
    title: 'In Progress', 
    keyword: 'wip',
    color: 'bg-blue-400', 
    cards: CARDS[Status.InProgress] 
  },
  { 
    id: Status.InReview, 
    title: 'In Review', 
    keyword: 'review',
    color: 'bg-yellow-400', 
    cards: CARDS[Status.InReview] 
  },
  { 
    id: Status.Done, 
    title: 'Done', 
    keyword: 'finished',
    color: 'bg-purple-400', 
    isDoneColumn: true,
    cards: CARDS[Status.Done] 
  },
];