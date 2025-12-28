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
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface Version {
  id: string;
  number: string;
  source: 'AI' | 'Upload' | 'Manual';
  isCurrent: boolean;
  date: string;
  path?: string;
  sections?: DocumentSection[];
}

export interface Agreement {
  id: string;
  templateId: string;
  templateName: string;
  versions: Version[];
}

export interface SourceDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  path?: string;
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
  date: string;
  creationDate: string;
  status: DossierStatus;
  documentCount: number;
  agreementCount?: number;
  type: string;
  remarks?: string;
  agreements?: Agreement[];
  timeline: TimelineEvent[];
  documents: SourceDocument[];
}

export interface UserSettings {
  showDeleteConfirmation: boolean;
  showVersionDeleteConfirmation: boolean;
  showAgreementDeleteConfirmation: boolean;
  aiExtractionPrompt?: string;
}

export interface Template {
  id: string;
  name: string;
  title?: string;
  description: string;
  type: 'House' | 'Apartment' | 'Commercial';
  source: 'CIB' | 'Custom';
  isAiSuggested?: boolean;
  isArchived?: boolean;
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
  type?: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string; // Contains placeholders
  isApproved: boolean;
  placeholders: PlaceholderSuggestion[];
}