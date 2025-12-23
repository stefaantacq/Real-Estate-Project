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

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  user: string;
}

export interface Dossier {
  id: string;
  name: string;
  address: string;
  date: string; // Last modified
  creationDate: string;
  documentCount: number;
  status: DossierStatus;
  timeline: TimelineEvent[];
  type: 'House' | 'Apartment' | 'Commercial';
}

export interface UserSettings {
  showDeleteConfirmation: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'House' | 'Apartment' | 'Commercial';
  source: 'CIB' | 'Custom';
  isAiSuggested?: boolean;
  sections?: DocumentSection[];
}

export interface PlaceholderSuggestion {
  id: string;
  label: string; // The variable name e.g., "Naam verkoper"
  currentValue: string;
  sourceDoc: string; // Filename
  sourcePage: number;
  confidence: 'High' | 'Medium' | 'Low';
  isApproved: boolean;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string; // Contains placeholders
  isApproved: boolean;
  placeholders: PlaceholderSuggestion[];
}