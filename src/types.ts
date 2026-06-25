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
