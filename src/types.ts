/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  classLevel: string; // e.g. "7ª Classe", "10ª Classe", "Universitário"
  subject: string; // e.g. "Matemática", "Física", "História"
  coverBg: string; // Tailwind bg class or hex
  accentColor: string; // Hex code or tailwind color
  summary: string;
  pages: string[];
  pageImages?: string[]; // Custom JPG pages sent directly by publishers
  format?: 'text' | 'images' | 'pdf' | 'epub'; // format of book: text pages, image pages, pdf, or epub
  pdfUrl?: string; // URL of published PDF file
  epubUrl?: string; // URL of ePUB resource
  isPremium: boolean;
  rating: number;
  downloads: number;
  offlineStatus: 'none' | 'downloading' | 'downloaded';
  isbn: string;
  publisher: string;
  year: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  classLevel: string;
  plan: 'free' | 'basic' | 'secondary' | 'high_school' | 'university';
  subscriptionStatus: 'none' | 'pending' | 'active';
  joinedDate: string;
  avatar: string;
  devices: Device[];
  xp?: number;
  badges?: string[];
  completedBooks?: string[];
}

// Access Control Logic
export function checkBookAccess(book: Book, user: UserProfile): { hasAccess: boolean; reason?: string } {
  // Admins have access to everything
  if (user.email === 'admin@imstud.co.ao' || user.email === 'leoalfredo252@gmail.com' || user.id === 'admin') {
    return { hasAccess: true };
  }
  
  // Non-premium is free for all
  if (!book.isPremium) {
    return { hasAccess: true };
  }
  
  // Requires active subscription
  if (user.subscriptionStatus !== 'active') {
    return { hasAccess: false, reason: 'Exige Subscrição Ativa' };
  }
  
  const plan = user.plan;
  const level = book.classLevel.toLowerCase();
  
  // Free plan has no premium access
  if (plan === 'free') {
    return { hasAccess: false, reason: 'Exige Subscrição Ativa' };
  }
  
  // University plan can read everything
  if (plan === 'university') {
    return { hasAccess: true };
  }
  
  // Protect University books
  if (level.includes('universitário')) {
    return { hasAccess: false, reason: 'Exige Plano Universitário' };
  }
  
  // High School can read everything else
  if (plan === 'high_school') {
    return { hasAccess: true };
  }
  
  // Protect High School books (10ª, 11ª, 12ª)
  if (level.includes('10ª') || level.includes('11ª') || level.includes('12ª')) {
    return { hasAccess: false, reason: 'Exige Plano Ensino Médio' };
  }
  
  // Secondary can read primary and secondary
  if (plan === 'secondary') {
    return { hasAccess: true };
  }
  
  // Protect Secondary books (7ª, 8ª, 9ª)
  if (level.includes('7ª') || level.includes('8ª') || level.includes('9ª')) {
    return { hasAccess: false, reason: 'Exige Plano I Ciclo' };
  }
  
  // Basic plan can read primary books
  if (plan === 'basic') {
    return { hasAccess: true };
  }
  
  return { hasAccess: false, reason: 'Nível incompatível com o plano' };
}

export interface Device {
  id: string;
  name: string;
  type: 'PC' | 'iPhone' | 'Android' | 'Tablet';
  lastActive: string;
  isAuthorized: boolean;
}

export interface PaymentRecord {
  id: string;
  planName: string;
  amount: number;
  date: string;
  method: 'Multicaixa Express' | 'Transferência Bancária' | 'GPO';
  status: 'Pendente' | 'Confirmado' | 'Falhado';
  reference: string;
}

export interface RoadmapItem {
  phase: string;
  timeframe: string;
  title: string;
  objectives: string[];
  capabilities: string[];
  status: 'completed' | 'current' | 'future';
}

export interface DatabaseTable {
  name: string;
  description: string;
  columns: {
    name: string;
    type: string;
    constraints?: string;
    description: string;
  }[];
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'primeiro-passo',
    title: '🚀 Primeiro Passo',
    description: 'Iniciou a sua jornada e perfil no portal IMSTUD.',
    icon: '🚀',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'explorador-matematica',
    title: '📐 Explorador de Matemática',
    description: 'Concluiu a leitura de um manual oficial de Matemática.',
    icon: '📐',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'fisico-aprendiz',
    title: '⚡ Físico Aprendiz',
    description: 'Concluiu a leitura de um manual oficial de Física.',
    icon: '⚡',
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'historiador-junior',
    title: '📜 Historiador Júnior',
    description: 'Concluiu a leitura de um manual oficial de História.',
    icon: '📜',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'quimico-iniciante',
    title: '🧪 Químico Iniciante',
    description: 'Concluiu a leitura de um manual oficial de Química.',
    icon: '🧪',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'geografo',
    title: '🌍 Geógrafo em Acção',
    description: 'Concluiu a leitura de um manual oficial de Geografia.',
    icon: '🌍',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'saber-digital',
    title: '📱 Saber Digital',
    description: 'Completou a leitura de um e-book no formato ePUB fluido.',
    icon: '📱',
    color: 'from-teal-400 to-emerald-500'
  },
  {
    id: 'leitor-offline',
    title: '💾 Leitor Autónomo',
    description: 'Concluiu a leitura de um manual descarregado 100% offline.',
    icon: '💾',
    color: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'rato-biblioteca',
    title: '📚 Rato de Biblioteca',
    description: 'Concluiu 3 ou mais leituras de manuais escolares na biblioteca.',
    icon: '📚',
    color: 'from-red-500 to-pink-600'
  },
  {
    id: 'mestre-saber',
    title: '👑 Mestre do Saber',
    description: 'Alcançou mais de 500 XP de Aprendizagem acumulados.',
    icon: '👑',
    color: 'from-yellow-400 via-amber-500 to-orange-600'
  }
];
