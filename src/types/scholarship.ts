export type CategorySlug =
  | 'fully-funded'
  | 'full-tuition'
  | 'half-funded'
  | 'partial-funded'
  | 'merit-based'
  | 'need-based'
  | 'athletic'
  | 'stem'
  | 'arts-humanities'
  | 'minority-diversity'
  | 'first-generation'
  | 'graduate-phd'
  | 'women-in-stem'
  | 'military-veterans';

export type DegreeLevel =
  | 'High School Senior'
  | 'Undergraduate'
  | 'Graduate / PhD'
  | 'Transfer';

export interface ScholarshipCategory {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  swatchClass: string;
  textClass: string;
  borderClass: string;
  surfaceClass: string;
}

export interface ScholarshipFAQ {
  question: string;
  answer: string;
}

export interface Scholarship {
  id: string;
  slug: string;
  title: string;
  universitySlug: string;
  universityName: string;
  state: string;
  stateCode: string;
  category: CategorySlug;
  secondaryCategories?: CategorySlug[];
  degreeLevels: DegreeLevel[];
  fieldsOfStudy: string[];
  amountDisplay: string;
  amountNumeric: number;
  coverageSummary: string;
  coversTuition: boolean;
  coversHousing: boolean;
  coversBooks: boolean;
  includesStipend: boolean;
  renewable: string;
  deadlineISO: string;
  deadlineLabel: string;
  gpaMin: number;
  featured: boolean;
  isSampleData: boolean;
  reviewStatus?: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  lastUpdated: string;
  overview: string;
  eligibility: string[];
  requiredDocuments: string[];
  applicationSteps: string[];
  officialUrl: string;
  faqs: ScholarshipFAQ[];
}

export interface University {
  slug: string;
  name: string;
  shortName: string;
  initials: string;
  city: string;
  state: string;
  stateCode: string;
  institutionType: 'Public Research' | 'Private Research' | 'Liberal Arts';
  acceptanceRate: string;
  avgAidPackage: string;
  undergradEnrollment: string;
  website: string;
  overview: string;
  financialAidPolicy: string;
  isSampleData: boolean;
}

export interface GuideSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  relatedScholarshipSlugs?: string[];
}

export interface GuideArticle {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  categoryLabel: string;
  excerpt: string;
  authorName: string;
  authorRole: string;
  authorBio: string;
  publishedDate: string;
  lastUpdated: string;
  readMinutes: number;
  imageKey: 'graduation' | 'stemLab' | 'readingRoom' | 'counselorEssay';
  sections: GuideSection[];
  faqs: ScholarshipFAQ[];
  reviewStatus?: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  sources?: Array<{ label: string; url: string }>;
  publishAt?: string;
  imageAlt?: string;
}

export type ReviewStatus = 'draft' | 'pending_review' | 'needs_revision' | 'reviewed';
export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  needs_revision: 'Needs Revision',
  reviewed: 'Reviewed',
};

export interface QuizAnswers {
  degreeLevel: DegreeLevel | '';
  minGpa: number;
  fieldOfStudy: string;
  preferredFunding: CategorySlug | 'any';
  backgroundFocus: 'none' | 'first-generation' | 'minority-diversity' | 'women-in-stem' | 'military-veterans' | 'need-based';
  preferredState: string;
}
