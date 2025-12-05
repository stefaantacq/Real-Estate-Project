export enum Language {
  NL = 'NL',
  FR = 'FR',
  EN = 'EN'
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export enum DossierStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface Dossier {
  id: string;
  name: string;
  address: string;
  date: string;
  documentCount: number;
  status: DossierStatus;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'House' | 'Apartment' | 'Commercial';
  source: 'CIB' | 'Custom';
}

export interface PlaceholderSuggestion {
  id: string;
  label: string;
  value: string;
  sourceDoc: string;
  confidence: 'High' | 'Medium' | 'Low';
  page: number;
}